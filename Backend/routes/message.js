import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.post('/:chatId', async (c) => {
  const chatId = c.req.param('chatId')
  const { messages } = await c.req.json()

  if (!Array.isArray(messages) || messages.length !== 2) {
    return c.json({ error: 'Invalid messages format. Expected an array with two messages.' }, 400)
  }

  const [userMessage, aiMessage] = messages

  if (!userMessage.role || !userMessage.content || !aiMessage.role || !aiMessage.content ||
      typeof userMessage.index !== 'number' || typeof aiMessage.index !== 'number') {
    return c.json({ error: 'Missing required fields in messages' }, 400)
  }

  try {
    const chat = await chatModel.findById(chatId)

    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404)
    }

    const newUserMessage = {
      message_id: userMessage.index,
      role: userMessage.role,
      content: userMessage.content,
    }

    const newAIMessage = {
      message_id: aiMessage.index,
      role: aiMessage.role,
      content: aiMessage.content,
      model: aiMessage.model,
      provider: aiMessage.provider,
      timeItTook: aiMessage.timeItTook,
    }

    chat.messages.push(newUserMessage, newAIMessage)
    chat.updatedAt = new Date()

    await chat.save()

    return c.json({ message: 'Messages added successfully', newMessages: [newUserMessage, newAIMessage] }, 200)
  } catch (error) {
    console.error('Error adding messages:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default router