import { Hono } from 'hono'
import { userModel } from '../models/user.js'
import { rateLimiter } from 'hono-rate-limiter'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

router.post('/', limiter, async (c) => {
  try {
    const { email, password } = await c.req.json()

    const user = await userModel.findOne({ email })
    if (!user) {
      return c.json({ error: "Email not found" }, 404)
    }

    if (user.password !== password) {
      return c.json({ error: "Incorrect password" }, 401)
    }

    user.lastLogin = new Date()
    await user.save()

    return c.json({ token: user.token }, 200)
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof SyntaxError) {
      return c.json({ error: "Invalid JSON in request body" }, 400)
    }
    if (error.name === 'ValidationError') {
      return c.json({ error: "Invalid input data" }, 400)
    }
    return c.json({ error: "Internal server error" }, 500)
  }
})

export default router