import { Hono } from 'hono'
import { rateLimiter } from "hono-rate-limiter"
import fetch from 'node-fetch'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 10 * 60 * 1000,  // 10 minutes in milliseconds
  limit: 150,                // 150 requests per 10 minutes
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

export class ChatBot {
    constructor() {
        // this.conversationHistories = new Map();
        this.defaultModel = "gpt-4o";
        this.providers = ['Blackbox', 'DarkAI', 'PollinationsAI'];
    }

    async getResponse(socket, model, provider, history) {
        const selectedModel = model || this.defaultModel;
        const selectedProviders = provider && provider.length > 0 ? provider : this.providers;
    
        console.log(selectedModel);
        console.log(selectedProviders);
    
        let fullResponse = "";
    
        const providerPromises = selectedProviders.map(async (provider) => {
            try {
                const response = await fetch('https://chat-api-rp7a.onrender.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: history,
                        provider: provider,
                        stream: false
                    })
                });
    
                if (!response.ok) return null;
    
                const data = await response.json();
                return data.choices[0]?.message?.content || null;
            } catch (error) {
                console.error(`Error with ${provider}:`, error);
                return null;
            }
        });
    
        const results = await Promise.all(providerPromises);
        
        for (let i = 0; i < results.length; i++) {
            if (results[i]) {
                fullResponse = results[i];
                socket.emit('prov', selectedProviders[i]);
                break;
            }
        }
    
        console.log("fullResponse: ", fullResponse);
        
        if (fullResponse) {
            console.log("eeee: ", fullResponse);
            socket.emit('chunk', fullResponse);
            socket.emit('done', fullResponse);
            return fullResponse;
        } else {
            socket.emit('error', 'No provider returned a valid response');
        }
        socket.emit('done');
    }
}

router.post('/', limiter, async (c) => {
    return c.json({ message: "Please connect via WebSocket for real-time communication" });
})

export default router