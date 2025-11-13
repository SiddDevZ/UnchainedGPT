import { Hono } from 'hono';
import fetch from 'node-fetch';
import { chatModel } from '../models/chats.js';
import { auth } from './utils/dummy/test/analytics.js';

const router = new Hono();

const conversationHistories = new Map();

router.post('/', async (c) => {
  const { message, model, provider, chatId, username } = await c.req.json();

  if (!message || !chatId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  
  try {
    // Get or initialize conversation history
    let history;
    if (!conversationHistories.has(chatId)) {
      // Fetch from database
      const chat = await chatModel.findById(chatId);
      if (chat && chat.messages && chat.messages.length > 0) {
        history = chat.messages.map(msg => ({ role: msg.role, content: msg.content }));
      } else {
        history = [];
      }
      conversationHistories.set(chatId, history);
    } else {
      history = conversationHistories.get(chatId);
    }

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Log analytics
    if (username) {
      try {
        auth(username, message, model, provider);
      } catch (err) {
        console.error('Analytics error:', err);
      }
    }

    const selectedModel = model || 'gpt-4o';
    const selectedProvider = provider || 'PollinationsAI';
    const imageModels = ['flux', 'flux-pro', 'midjourney', 'flux-dev'];

    // Handle image generation
    if (imageModels.includes(selectedModel)) {
      const imageUrl = await generateImage(message, selectedModel, selectedProvider);
      
      if (!imageUrl) {
        return c.json({ error: 'Failed to generate image' }, 500);
      }

      history.push({ role: 'assistant', content: imageUrl });
      conversationHistories.set(chatId, history);
      
      // Save to database
      await saveMessagesToChat(chatId, history, selectedModel, selectedProvider);
      
      return c.json({ 
        type: 'image',
        content: imageUrl,
        provider: selectedProvider,
        model: selectedModel
      });
    }

    // Handle text generation - wait for complete response
    const fullResponse = await generateTextResponse(history, selectedModel, selectedProvider);
    
    if (!fullResponse) {
      return c.json({ error: 'Failed to generate response' }, 500);
    }

    history.push({ role: 'assistant', content: fullResponse });
    conversationHistories.set(chatId, history);
    
    // Save to database
    await saveMessagesToChat(chatId, history, selectedModel, selectedProvider);
    
    return c.json({ 
      type: 'text',
      content: fullResponse,
      provider: selectedProvider,
      model: selectedModel
    });

  } catch (error) {
    console.error('Error in streamMessage:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

async function generateTextResponse(history, model, provider) {
  try {
    const payload = {
      model: model,
      messages: history,
      provider: provider,
      stream: true
    };

    if (provider === 'PollinationsAI') {
      payload.api_key = 'q05DlCSgPBK2uvJZ';
    }

    const response = await fetch('https://api.siddz.com/chatapi/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 120000 // 2 minute timeout
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      return null;
    }

    let fullResponse = '';
    let buffer = '';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 120000);

      response.body.on('data', (chunk) => {
        try {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            const data = line.slice(6);
            if (data === '[DONE]') {
              clearTimeout(timeout);
              resolve(fullResponse || null);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        } catch (error) {
          console.error('Chunk processing error:', error);
        }
      });

      response.body.on('end', () => {
        clearTimeout(timeout);
        resolve(fullResponse || null);
      });

      response.body.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Stream error:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('Error generating text response:', error);
    return null;
  }
}

async function saveMessagesToChat(chatId, history, model, provider) {
  try {
    const messageObjects = history.map((msg, index) => ({
      message_id: `${chatId}_${index}`,
      role: msg.role,
      model: model,
      provider: provider,
      content: msg.content,
      timestamp: new Date()
    }));

    await chatModel.findByIdAndUpdate(chatId, {
      messages: messageObjects,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving messages to chat:', error);
  }
}

async function generateImage(prompt, model, provider) {
  try {
    const payload = {
      model: model,
      prompt: prompt,
      provider: provider
    };

    if (provider === 'PollinationsAI') {
      payload.api_key = 'q05DlCSgPBK2uvJZ';
    }

    const response = await fetch('https://api.siddz.com/chatapi/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 60000 // 1 minute timeout for images
    });

    if (!response.ok) {
      console.error('Image generation failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

export default router;
