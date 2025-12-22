import { Hono } from 'hono';
import fetch from 'node-fetch';
import { chatModel } from '../models/chats.js';
import { auth } from './utils/dummy/test/analytics.js';

const router = new Hono();

const conversationHistories = new Map();

router.post('/', async (c) => {
  const { message, model, provider, chatId, username } = await c.req.json();

  console.log('Received request:', { message: message?.substring(0, 50), model, provider, chatId, username });

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

    const selectedModel = model || 'google/gemini-2.0-flash-lite-preview-02-05:free';
    
    // console.log('Using model:', selectedModel);
    
    // Handle text generation - wait for complete response
    // console.log('Calling generateTextResponse...');
    const fullResponse = await generateTextResponse(history, selectedModel);
    
    // console.log('generateTextResponse returned:', fullResponse ? `${fullResponse.length} chars` : 'null');
    
    if (!fullResponse) {
      console.error('Text generation returned null or empty response');
      return c.json({ error: 'Failed to generate response' }, 500);
    }

    history.push({ role: 'assistant', content: fullResponse });
    conversationHistories.set(chatId, history);
    
    // Note: Messages are saved via /message endpoint from frontend with proper metadata
    
    console.log('Returning successful response');
    return c.json({ 
      type: 'text',
      content: fullResponse,
      provider: 'OpenRouter',
      model: selectedModel
    });

  } catch (error) {
    console.error('Error in streamMessage:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

async function generateTextResponse(history, model) {
  try {
    // console.log('generateTextResponse called with:', { model, historyLength: history.length });
    
    const payload = {
      model: model,
      messages: history,
    };

    const apiKeys = (process.env.OPENROUTER_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);
    
    if (apiKeys.length === 0) {
        console.error("OPENROUTER_API_KEY is not set");
        return null;
    }

    // Shuffle keys
    for (let i = apiKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [apiKeys[i], apiKeys[j]] = [apiKeys[j], apiKeys[i]];
    }

    for (const apiKey of apiKeys) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://zenos-ai.com', // Replace with your site URL
                    'X-Title': 'Zenos AI', // Replace with your site name
                },
                body: JSON.stringify(payload),
                timeout: 120000 // 2 minute timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 429 && errorText.includes("Rate limit exceeded: free-models-per-day")) {
                    console.warn(`Key rate limited, trying next key...`);
                    continue;
                }
                console.error('API response not OK:', response.status, response.statusText, errorText);
                return null;
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating text response:', error);
            return null;
        }
    }
    
    return null;

  } catch (error) {
    console.error('Error generating text response:', error);
    return null;
  }
}

export default router;
