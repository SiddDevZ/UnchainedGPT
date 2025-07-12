# 🚀 UnchainedGPT

<div align="center">
  <img src="https://i.imgur.com/OmNuaFU.png" alt="UnchainedGPT" width="600"/>
  
  **The Ultimate AI Platform - All Models in One Place**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()
</div>

## 📖 Overview

UnchainedGPT is a cutting-edge, open-source AI platform that brings together the world's most powerful AI models in one seamless interface. From text generation to image creation, our platform offers **free access** to premium AI models including GPT-4o, Claude 3.5, MidJourney, Flux Pro, and many more.

### ✨ Key Features

- 🤖 **Multiple AI Models**: Access to GPT-4o, Claude 3.5, LLaMA 3.3, Deepseek r1, and more
- 🎨 **Image Generation**: Create stunning visuals with Flux Pro, MidJourney, and DALL-E
- 💬 **Real-time Chat**: Lightning-fast responses with WebSocket technology
- 🔐 **Secure Authentication**: Google OAuth and Discord integration
- 📱 **Responsive Design**: Perfect experience across all devices
- 🌙 **Dark Mode**: Beautiful dark theme optimized for extended use
- 💾 **Chat History**: Save and organize your conversations
- 🚀 **Auto Provider Selection**: Intelligent fallback system for maximum uptime
- 📊 **Performance Metrics**: Real-time response time tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SiddDevZ/UnchainedGPT.git
   cd unchainedgpt
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
   
   Create `.env` in the Backend directory:
   ```env
   DATABASE_URL=your_mongodb_connection_string
   PORT=3001
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   ```

5. **Start the development servers**
   
   Frontend (Terminal 1):
   ```bash
   npm run dev
   ```
   
   Backend (Terminal 2):
   ```bash
   cd Backend
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15.1.3 with App Router
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **Real-time**: Socket.io-client
- **Markdown**: React Markdown with syntax highlighting
- **Animations**: Framer Motion & GSAP

### Backend Stack
- **Runtime**: Node.js with Hono framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io server
- **Authentication**: JWT tokens with OAuth integration
- **Rate Limiting**: Built-in protection

### Project Structure
```
unchainedgpt/
├── app/                    # Next.js app directory
│   ├── chat/              # Main chat interface
│   ├── login/             # Authentication pages
│   ├── register/          # User registration
│   └── ...
├── Backend/               # Node.js backend
│   ├── routes/           # API endpoints
│   ├── models/           # Database schemas
│   └── server.js         # Main server file
├── components/           # Reusable React components
│   ├── Input/           # Chat input component
│   ├── ui/              # UI primitives
│   └── ...
└── public/              # Static assets
```

## 🤖 Supported Models

### Text Generation
- **GPT-4o** - OpenAI's flagship model
- **Claude 3.5** - Anthropic's advanced reasoning model
- **LLaMA 3.3 70B** - Meta's open-source powerhouse
- **Deepseek r1** - Cutting-edge reasoning model
- **Gemini 2.5 Thinking** - Google's latest model
- **Grok-3** - X's AI model

### Image Generation
- **Flux Pro** - High-quality image synthesis
- **MidJourney** - Artistic image generation
- **DALL-E** - OpenAI's image model

### Provider System
Each model supports multiple providers with automatic fallback:
- **Auto**: Intelligent provider selection
- **Pollinations AI**: High-speed generation
- **Blackbox AI**: Reliable performance
- **DeepInfra**: Scalable infrastructure
- **LambdaChat**: Optimized responses

## 💻 Usage

### Basic Chat
1. Sign up or log in to your account
2. Select your preferred AI model
3. Choose a provider (or use Auto for best results)
4. Start chatting!

### Image Generation
1. Select an image model (Flux Pro, MidJourney, etc.)
2. Describe your desired image in detail
3. Wait for the AI to generate your image
4. Download and share your creation

### Advanced Features
- **Chat History**: All conversations are automatically saved
- **Model Switching**: Change models mid-conversation
- **Copy Responses**: One-click copying of AI responses
- **Real-time Typing**: See responses as they're generated

## 🔧 Configuration

### Model Configuration
Models are configured in `app/chat/models.js`. You can:
- Add new models
- Configure providers
- Set display names
- Enable/disable models

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | Optional |
| `DISCORD_CLIENT_SECRET` | Discord OAuth secret | Optional |
| `PORT` | Backend server port | No (default: 3001) |

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render (Backend)
1. Connect your repository
2. Set the start command to `cd Backend && npm start`
3. Configure environment variables
4. Deploy

### Docker
```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install
COPY Backend/ .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🛠️ Development

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow React/Next.js best practices
- Write descriptive commit messages
- Add comments for complex logic

### Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd Backend && npm test
```

## 📱 Features in Detail

### Real-time Communication
- WebSocket-based chat for instant responses
- Typing indicators and status updates
- Connection management and reconnection

### User Experience
- Responsive design for all screen sizes
- Dark mode optimized for extended use
- Smooth animations and transitions
- Intuitive model selection

### Performance
- Response time tracking
- Automatic provider fallback
- Efficient message streaming
- Optimized bundle size

### Security
- JWT-based authentication
- Rate limiting protection
- Input sanitization
- Secure OAuth integration

## 🔍 API Documentation

### Chat Endpoints
- `POST /api/chat` - Create new chat
- `POST /api/message/:chatId` - Send message
- `GET /api/fetchchats/:userId` - Get user chats
- `GET /api/fetchchat/:chatId` - Get specific chat

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/verify` - Token verification
- `POST /api/googleauth` - Google OAuth

---

<div align="center">
  ⭐ Star me on GitHub if you find this project helpful!
</div>


