import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { Server } from 'socket.io'
import http from 'http'
import mongoose from 'mongoose'
import { config } from 'dotenv'

config()

import responseRoute, { ChatBot } from './routes/response.js'
import googleLoginRoute from './routes/googleLogin.js'
import verifyRoute from './routes/verify.js'
import discordLoginRoute from './routes/discordLogin.js'
import registerRoute from './routes/register.js'
import loginRoute from './routes/login.js'

const app = new Hono()
const onlineUsers = new Set()

app.use('*', cors())

const dbUrl = process.env.DATABASE_URL
mongoose.connect(dbUrl);

app.get('/', (c) => c.text('Hello World!'))
app.route('/api/response', responseRoute)
app.route('/api/google-login', googleLoginRoute)
app.route('/api/verify', verifyRoute)
app.route('/api/discord-login', discordLoginRoute)
app.route('/api/register', registerRoute)
app.route('/api/login', loginRoute)

const port = process.env.PORT || 3001

const server = http.createServer(app.fetch)

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const chatbot = new ChatBot();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', async ({ message, model, provider }) => {
        try {
            // Use the model and provider sent by the user
            await chatbot.getResponse(message, socket, model, provider);
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('error', 'An error occurred while processing your message');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

export { server }