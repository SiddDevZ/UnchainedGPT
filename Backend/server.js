import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import mongoose from 'mongoose'

config()

import responseRoute from './routes/response.js'
import googleLoginRoute from './routes/googleLogin.js'
import verifyRoute from './routes/verify.js'
import discordLoginRoute from './routes/discordLogin.js'

const app = new Hono()
app.use('*', cors())

const dbUrl = process.env.DATABASE_URL
mongoose.connect(dbUrl);

app.get('/', (c) => c.text('Hello World!'))
app.route('/api/response', responseRoute)
app.route('/api/googleauth', googleLoginRoute)
app.route('/api/discordauth', discordLoginRoute)

app.route('/api/verify', verifyRoute)

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})