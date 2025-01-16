import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.post('/:chatId', async (c) => {
  const chatId = c.req.param('chatId')
  const { message } = await c.req.json()

  if (!message || !message.content || typeof message !== 'object') {
    return c.json({ error: 'Invalid message format. Expected a single message object.' }, 400)
  }

  if (!message.role || typeof message.index !== 'number') {
    return c.json({ error: 'Missing required fields in message' }, 400)
  }
  
  if (message.content) {
    message.content = message.content.trimEnd();
  }

  try {
    const chat = await chatModel.findById(chatId)

    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404)
    }

    let conentMessage = message.content;
    if (conentMessage == undefined){
        conentMessage = "error: No content provided in the message"
    }

    const newMessage = {
      message_id: message.index,
      role: message.role,
      content: conentMessage || "",
    }

    // Add additional fields for AI messages
    if (message.role === 'assistant') {
      newMessage.model = message.model
      newMessage.provider = message.provider
      newMessage.timeItTook = message.timeItTook
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