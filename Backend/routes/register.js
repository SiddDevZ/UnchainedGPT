import { Hono } from 'hono'
import { userModel } from '../models/user.js'
import { rateLimiter } from 'hono-rate-limiter'
import crypto from 'crypto'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

router.post('/', limiter, async (c) => {
  try {
    const { username, email, password } = await c.req.json()

    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400)
    }

    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    const newToken = generateToken()

    const MAX_USERNAME_LENGTH = 18
    const truncatedUsername = username.slice(0, MAX_USERNAME_LENGTH)

    const newUser = new userModel({
      _id: userId,
      username: truncatedUsername,
      email: email,
      password: password,
      token: newToken,
      lastLogin: new Date()
    })

    await newUser.save()

    return c.json({ token: newToken }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

export default router