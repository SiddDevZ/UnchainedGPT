import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'
import fetch from 'node-fetch'

const router = new Hono()

router.post('/', async (c) => {
  const { prompt, user_id } = await c.req.json()

  if (!prompt || !user_id) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  try {
    // Create a new chat with a default title
    const newChat = new chatModel({
      _id: new Date().getTime().toString(),
      title: 'New Chat',
      user_id,
      messages: []
    })

    await newChat.save()

    // fire title generation in background
    generateAndUpdateTitle(newChat._id, prompt).catch(console.error)

    return c.json({ chat_id: newChat._id }, 201)
  } catch (error) {
    console.error('Error creating chat:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

async function generateAndUpdateTitle(chatId, prompt) {
  const models = [
    'openai/gpt-oss-20b:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-7b-instruct:free'
  ]
  let generatedTitle = 'New Chat'

  for (const model of models) {
    try {
      const payload = {
        model: model,
        messages: [
          {
            role: 'system',
            content:
              "Generate a short, concise title for a chat based on the following prompt. The title should be no more than 30 characters, also don't include any quotes."
          },
          { role: 'user', content: prompt }
        ]
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://zenosai.com',
          'X-Title': 'Zenos AI'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error(`Model ${model} failed with status ${response.status}`)
        continue
      }

      const data = await response.json()
      const title = data.choices[0]?.message?.content?.trim()
      
      if (title && title.length > 0) {
        generatedTitle = title.substring(0, 50) // Limit to 50 chars
        break // Success, exit loop
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error)
      continue // Try next model
    }
  }

  try {
    await chatModel.findByIdAndUpdate(chatId, { title: generatedTitle })
  } catch (error) {
    console.error('Error updating title in database:', error)
  }

  return generatedTitle
}

export default router