import { Hono } from 'hono'
import { userModel } from '../models/user.js'

const router = new Hono()

router.post('/', async (c) => {
  const { token } = await c.req.json()
  if (!token) return c.json({ valid: false }, 400)

  const user = await userModel.findOne({ token })
  return c.json({ valid: !!user }, 200)
})

export default router