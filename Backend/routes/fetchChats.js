import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.get('/:userId', async (c) => {
  const userId = c.req.param('userId')

  try {
    const chats = await chatModel.find({ user_id: userId })
      .sort({ updatedAt: -1 })
      .lean()

    const now = new Date()
    const categorizedChats = [
      { category: "Recent", chats: [] },
      { category: "Previous 7 days", chats: [] },
      { category: "Previous 30 days", chats: [] },
      { category: "Previous Years", chats: [] },
    ]

    chats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt)
      const daysDiff = (now - chatDate) / (1000 * 60 * 60 * 24)

      if (daysDiff < 1) {
        categorizedChats[0].chats.push({ id: chat._id, title: chat.title })
      } else if (daysDiff < 7) {
        categorizedChats[1].chats.push({ id: chat._id, title: chat.title })
      } else if (daysDiff < 30) {
        categorizedChats[2].chats.push({ id: chat._id, title: chat.title })
      } else {
        categorizedChats[3].chats.push({ id: chat._id, title: chat.title })
      }
    })

    const filteredChatData = categorizedChats.filter(category => category.chats.length > 0)

    return c.json({
      chats: filteredChatData,
      totalChats: chats.length
    }, 200)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return c.json({ error: "An error occurred while fetching chats" }, 500)
  }
})

export default router