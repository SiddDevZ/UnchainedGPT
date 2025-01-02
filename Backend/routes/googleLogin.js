import { Hono } from 'hono'
import { userModel } from '../models/user.js'
import { rateLimiter } from 'hono-rate-limiter'
import crypto from 'crypto'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

// Function to generate a random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

router.post('/', limiter, async (c) => {
  try {
    const { email, name, picture } = await c.req.json()
    
    let user = await userModel.findOne({ email })

    if (user) {
      user.lastLogin = new Date()
      await user.save()
      return c.json({ token: user.token }, 200)
    } else {
      const userId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      const newToken = generateToken()
      
      const newUser = new userModel({
        _id: userId,
        username: name,
        email,
        token: newToken,
        avatar: picture,
        lastLogin: new Date()
      })

      await newUser.save()

      return c.json({ token: newToken }, 201)
    }
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

export default router