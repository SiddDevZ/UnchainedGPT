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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const yearAgo = new Date(today)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)

    const categorizedChats = [
      { category: "Recent", chats: [] },
      { category: "Yesterday", chats: [] },
      { category: "This Week", chats: [] },
      { category: "This Month", chats: [] },
      { category: "This Year", chats: [] },
      { category: "Previous Years", chats: [] },
    ]

    chats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt)

      if (chatDate >= today) {
        categorizedChats[0].chats.push({ id: chat._id, title: chat.title })
      } else if (chatDate >= yesterday) {
        categorizedChats[1].chats.push({ id: chat._id, title: chat.title })
      } else if (chatDate >= weekAgo) {
        categorizedChats[2].chats.push({ id: chat._id, title: chat.title })
      } else if (chatDate >= monthAgo) {
        categorizedChats[3].chats.push({ id: chat._id, title: chat.title })
      } else if (chatDate >= yearAgo) {
        categorizedChats[4].chats.push({ id: chat._id, title: chat.title })
      } else {
        categorizedChats[5].chats.push({ id: chat._id, title: chat.title })
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