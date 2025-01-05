import { Hono } from 'hono'
import { chatModel } from '../models/chats.js'

const router = new Hono()

router.get('/:chatId', async (c) => {
  const chatId = c.req.param('chatId')

  try {
    const chat = await chatModel.findById(chatId).lean()

    if (!chat) {
      return c.json({ error: "Chat not found" }, 404)
    }

    const totalMessages = chat.messages.length
    const messages = chat.messages

    const formattedMessages = []
    const metaData = []
    const timeData = []

    messages.forEach((message, index) => {
      formattedMessages.push({
        index: index,
        role: message.role,
        content: message.content
      })

      metaData.push({
        model: message.model,
        provider: message.provider
      })

      timeData.push(message.timeItTook || null)
    })

    return c.json({
      messages: formattedMessages,
      metaData: metaData,
      timeData: timeData,
      totalMessages: totalMessages
    }, 200)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return c.json({ error: "An error occurred while fetching messages" }, 500)
  }
})

export default router