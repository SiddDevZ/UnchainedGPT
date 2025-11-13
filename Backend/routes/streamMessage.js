import { Hono } from 'hono';
import { stream } from 'hono/streaming';
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
      auth(username, message, model, provider);
    }

    const selectedModel = model || 'gpt-4o';
    const selectedProvider = provider || 'PollinationsAI';
    const imageModels = ['flux', 'flux-pro', 'midjourney', 'flux-dev'];

    // Handle image generation
    if (imageModels.includes(selectedModel)) {
      const imageUrl = await generateImage(message, selectedModel, selectedProvider);
      
      if (imageUrl) {
        history.push({ role: 'assistant', content: imageUrl });
        conversationHistories.set(chatId, history);
        
        // Save to database
        await saveMessagesToChat(chatId, history, selectedModel, selectedProvider, username);
        
        return c.json({ 
          type: 'image',
          content: imageUrl,
          provider: selectedProvider,
          done: true 
        });
      } else {
        return c.json({ error: 'Failed to generate image' }, 500);
      }
    }

    // Handle text generation with streaming
    return stream(c, async (stream) => {
      try {
        const payload = {
          model: selectedModel,
          messages: history,
          provider: selectedProvider,
          stream: true
        };

        if (selectedProvider === 'PollinationsAI') {
          payload.api_key = 'q05DlCSgPBK2uvJZ';
        }

        const response = await fetch('https://api.siddz.com/chatapi/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          await stream.write(JSON.stringify({ 
            type: 'error', 
            content: 'Provider failed to respond' 
          }) + '\n');
          return;
        }

        // Send provider info
        await stream.write(JSON.stringify({ 
          type: 'provider', 
          content: selectedProvider 
        }) + '\n');

        let fullResponse = '';
        let buffer = '';

        response.body.on('data', async (chunk) => {
          try {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '' || !line.startsWith('data: ')) continue;
              
              const data = line.slice(6);
              if (data === '[DONE]') {
                history.push({ role: 'assistant', content: fullResponse });
                conversationHistories.set(chatId, history);
                
                // Save to database
                await saveMessagesToChat(chatId, history, selectedModel, selectedProvider, username);
                
                await stream.write(JSON.stringify({ 
                  type: 'done', 
                  content: fullResponse 
                }) + '\n');
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  fullResponse += content;
                  await stream.write(JSON.stringify({ 
                    type: 'chunk', 
                    content: content 
                  }) + '\n');
                }
              } catch (parseError) {
                console.error('Parse error:', parseError);
              }
            }
          } catch (error) {
            console.error('Chunk processing error:', error);
          }
        });

        response.body.on('end', async () => {
          if (fullResponse) {
            history.push({ role: 'assistant', content: fullResponse });
            conversationHistories.set(chatId, history);
            
            // Save to database
            await saveMessagesToChat(chatId, history, selectedModel, selectedProvider, username);
          }
          await stream.write(JSON.stringify({ 
            type: 'done', 
            content: fullResponse 
          }) + '\n');
        });

        response.body.on('error', async (error) => {
          console.error('Stream error:', error);
          await stream.write(JSON.stringify({ 
            type: 'error', 
            content: 'Stream error occurred' 
          }) + '\n');
        });

      } catch (error) {
        console.error('Error in stream handler:', error);
        await stream.write(JSON.stringify({ 
          type: 'error', 
          content: error.message 
        }) + '\n');
      }
    });

  } catch (error) {
    console.error('Error in streamMessage:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

async function saveMessagesToChat(chatId, history, model, provider, username) {
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
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
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
