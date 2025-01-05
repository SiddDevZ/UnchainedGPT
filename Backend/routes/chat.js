import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.post('/', async (c) => {
  const { title, user_id } = await c.req.json()
  const initial_message = "Hello Siddharth! How can I assist you today?"

  if (!title || !user_id) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  try {
    const newChat = new chatModel({
      _id: new Date().getTime().toString(),
      title,
      user_id,
      messages: [],
    })

    await newChat.save()

    return c.json({ chat_id: newChat._id }, 201)
  } catch (error) {
    console.error('Error creating chat:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default router