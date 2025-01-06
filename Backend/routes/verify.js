import { Hono } from 'hono'
import { userModel } from '../models/user.js'

const router = new Hono()

router.post('/', async (c) => {
  const { token } = await c.req.json()
  if (!token) return c.json({ valid: false, userId: null }, 400)

  try {
    const user = await userModel.findOneAndUpdate(
      { token },
      { $set: { lastLogin: new Date() } },
      { new: true }
    )

    if (user) {
      return c.json({
        valid: true,
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }, 200)
    } else {
      return c.json({ valid: false, userId: null }, 200)
    }
  } catch (error) {
    console.error('Error verifying user:', error)
    return c.json({ valid: false, userId: null, error: 'Internal server error' }, 500)
  }
})

export default router