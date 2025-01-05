import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.post('/', async (c) => {
  const { title, user_id } = await c.req.json()
  const initial_message = "Hello World! I'm a new chat!"

  if (!title || !user_id || !initial_message) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  try {
    const newChat = new chatModel({
      _id: new Date().getTime().toString(),
      title,
      user_id,
      messages: [{
        message_id: new Date().getTime().toString(),
        role: 'user',
        content: initial_message,
      }],
    })

    await newChat.save()

    return c.json({ message: 'Chat created successfully', chat: newChat }, 201)
  } catch (error) {
    console.error('Error creating chat:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default router