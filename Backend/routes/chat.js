import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'
import fetch from 'node-fetch'

const router = new Hono()

export default (io) => {
  router.post('/', async (c) => {
    const { prompt, user_id } = await c.req.json()

    if (!prompt || !user_id) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    try {
      // Create a new chat with a default title
      const newChat = new chatModel({
        _id: new Date().getTime().toString(),
        title: "New Chat",
        user_id,
        messages: [],
      })

      await newChat.save()

      generateAndUpdateTitle(newChat._id, prompt, io).catch(console.error)

      return c.json({ chat_id: newChat._id }, 201)
    } catch (error) {
      console.error('Error creating chat:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  return router
}

async function generateAndUpdateTitle(chatId, prompt, io) {
  const defaultModel = "gpt-4o";
  const providers = ['Blackbox', 'DarkAI', 'PollinationsAI'];
  let generatedTitle = "New Chat";

  const providerPromises = providers.map(async (provider) => {
    try {
      const response = await fetch('https://chat-api-rp7a.onrender.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: defaultModel,
          messages: [
            { role: "system", content: "Generate a short, concise title for a chat based on the following prompt. The title should be no more than 30 characters, also don't include any quotes." },
            { role: "user", content: prompt }
          ],
          provider: provider,
          stream: false
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      return null;
    }
  });

  const results = await Promise.all(providerPromises);
  const validTitle = results.find(title => title !== null);

  if (validTitle) {
    generatedTitle = validTitle;
  }

  try {
    await chatModel.findByIdAndUpdate(chatId, { title: generatedTitle });

    io.emit('chatTitleUpdated',);
  } catch (error) {
    console.error('Error updating title in database:', error);
  }

  return generatedTitle;
}