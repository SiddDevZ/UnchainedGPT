import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.post('/:chatId', async (c) => {
  const chatId = c.req.param('chatId')
  const { role, content, model, provider, timeItTook } = await c.req.json()

  if (!role || !content) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  try {
    const chat = await chatModel.findById(chatId)

    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404)
    }

    const newMessage = {
      message_id: new Date().getTime().toString(),
      role,
      content,
      model,
      provider,
      timeItTook,
    }

    chat.messages.push(newMessage)
    chat.updatedAt = new Date()

    await chat.save()

    return c.json({ message: 'Message added successfully', newMessage }, 200)
  } catch (error) {
    console.error('Error adding message:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default router