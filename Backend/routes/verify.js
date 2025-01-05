import { Hono } from 'hono'
import { userModel } from '../models/user.js'

const router = new Hono()

router.post('/', async (c) => {
  const { token } = await c.req.json()
  if (!token) return c.json({ valid: false, userId: null }, 400)

  const user = await userModel.findOne({ token })
  if (user) {
    return c.json({ valid: true, userId: user._id }, 200)
  } else {
    return c.json({ valid: false, userId: null }, 200)
  }
})

export default router