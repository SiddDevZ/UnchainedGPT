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

        console.log(selectedModel)
        console.log(selectedProviders)

        let chosenProvider = null;
        let fullResponse = "";
        const abortControllers = new Map();
        let providerEmitted = false;

        const providerPromises = selectedProviders.map(provider => {
            const controller = new AbortController();
            abortControllers.set(provider, controller);

            return (async () => {
                try {
                    const response = await fetch('https://chat-api-rp7a.onrender.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream'
                        },
                        signal: controller.signal,
                        body: JSON.stringify({
                            model: this.defaultModel,
                            messages: history,
                            provider: provider,
                            stream: true
                        })
                    });

                    if (!response.ok) return null;

                    let isFirstChunk = true;
                    for await (const chunk of response.body) {
                        if (chosenProvider && chosenProvider !== provider) {
                            controller.abort();
                            return null;
                        }

                        const text = new TextDecoder().decode(chunk);
                        const lines = text.split('\n');

                        for (const line of lines) {
                            if (!line.trim() || line === 'data: [DONE]') continue;

                            try {
                                const jsonStr = line.replace(/^data: /, '');
                                const parsed = JSON.parse(jsonStr);
                                const content = parsed.choices?.[0]?.delta?.content;

                                if (content) {
                                    if (isFirstChunk) {
                                        isFirstChunk = false;
                                        if (!chosenProvider) {
                                            chosenProvider = provider;
                                            if (!providerEmitted) {
                                                socket.emit('prov', provider);
                                                providerEmitted = true;
                                            }
                                            for (const [otherProvider, ctrl] of abortControllers) {
                                                if (otherProvider !== provider) {
                                                    ctrl.abort();
                                                }
                                            }
                                        }
                                    }

                                    if (provider === chosenProvider) {
                                        socket.emit('chunk', content);
                                        fullResponse += content;
                                    }
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                    return provider;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        return null;
                    }
                    console.error(`Error with ${provider}:`, error);
                    return null;
                }
            })();
        });

        await Promise.allSettled(providerPromises);
        
        if (fullResponse) {
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