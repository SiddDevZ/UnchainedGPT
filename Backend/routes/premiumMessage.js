import { Hono } from 'hono';
import fetch from 'node-fetch';
import { chatModel } from '../models/chats.js';
import { userModel } from '../models/user.js';

const router = new Hono();

const conversationHistories = new Map();

const PREMIUM_MODELS = {
  'google/gemini-3-flash-preview': { name: 'Gemini 3 Flash', provider: 'Google' },
  'google/gemini-3-pro-preview': { name: 'Gemini 3 Pro', provider: 'Google' },
  'anthropic/claude-sonnet-4.5': { name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
  'openai/gpt-5.2': { name: 'GPT-5.2', provider: 'OpenAI' },
  'x-ai/grok-4-fast': { name: 'Grok 4 Fast', provider: 'xAI' },
};

const verifyUserAuth = async (authHeader, userId) => {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const user = await userModel.findOne({ _id: userId, token: token });
  return user;
};

router.post('/', async (c) => {
  const { message, model, chatId, username, userId } = await c.req.json();

  if (!message || !chatId || !userId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  if (!PREMIUM_MODELS[model]) {
    return c.json({ error: 'Invalid premium model' }, 400);
  }

  const authHeader = c.req.header('Authorization');
  const user = await verifyUserAuth(authHeader, userId);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.subscription?.plan !== 'premium') {
    return c.json({ error: 'Premium subscription required' }, 403);
  }

  const remainingCredits = (user.subscription.premiumCredits || 0) - (user.subscription.premiumCreditsUsed || 0);
  if (remainingCredits <= 0) {
    return c.json({ error: 'No premium credits remaining', remainingCredits: 0 }, 403);
  }

  try {
    let history;
    if (!conversationHistories.has(chatId)) {
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

    history.push({ role: 'user', content: message });

    const fullResponse = await generatePremiumResponse(history, model);
    
    if (!fullResponse) {
      return c.json({ error: 'Failed to generate response' }, 500);
    }

    await userModel.findByIdAndUpdate(userId, {
      $inc: { 'subscription.premiumCreditsUsed': 1 }
    });

    history.push({ role: 'assistant', content: fullResponse });
    conversationHistories.set(chatId, history);
    
    const newRemainingCredits = remainingCredits - 1;

    return c.json({ 
      type: 'text',
      content: fullResponse,
      provider: PREMIUM_MODELS[model].provider,
      model: model,
      premiumCreditsRemaining: newRemainingCredits
    });

  } catch (error) {
    console.error('Error in premiumMessage:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

async function generatePremiumResponse(history, model) {
  try {
    const payload = {
      model: model,
      messages: history,
    };

    const apiKey = process.env.OPENROUTER_PAID_API_KEY;
    
    if (!apiKey) {
      console.error("OPENROUTER_PAID_API_KEY is not set");
      return null;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://zenos-ai.com',
        'X-Title': 'Zenos AI',
      },
      body: JSON.stringify(payload),
      timeout: 120000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Premium API response not OK:', response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating premium response:', error);
    return null;
  }
}

router.get('/models', async (c) => {
  const models = Object.entries(PREMIUM_MODELS).map(([id, info]) => ({
    id,
    name: info.name,
    provider: info.provider,
    premium: true
  }));
  
  return c.json({ models });
});

export default router;
