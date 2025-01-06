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

export class ImageBot {
    constructor() {
        this.defaultModel = "flux";
        this.providers = ['Blackbox', 'DarkAI', 'PollinationsAI'];
    }

    async generateImage(socket, message, model, provider) {
        const selectedModel = model || this.defaultModel;
        const selectedProviders = provider && provider.length > 0 ? provider : this.providers;

        console.log(selectedModel)
        console.log(selectedProviders)

        let chosenProvider = null;
        let imageUrl = null;
        const abortControllers = new Map();

        const providerPromises = selectedProviders.map(provider => {
            const controller = new AbortController();
            abortControllers.set(provider, controller);

            return (async () => {
                try {
                    const response = await fetch('https://chat-api-rp7a.onrender.com/v1/images/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                        body: JSON.stringify({
                            prompt: message,
                            model: selectedModel,
                            provider: provider,
                            response_format: "url"
                        })
                    });

                    if (!response.ok) return null;

                    const data = await response.json();
                    if (data.data && data.data[0] && data.data[0].url) {
                        if (!chosenProvider) {
                            chosenProvider = provider;
                            imageUrl = data.data[0].url;
                            socket.emit('prov', provider);
                            for (const [otherProvider, ctrl] of abortControllers) {
                                if (otherProvider !== provider) {
                                    ctrl.abort();
                                }
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
        
        if (imageUrl) {
            socket.emit('done', imageUrl);
            console.log(imageUrl)
            return imageUrl;
        } else {
            socket.emit('error', 'No provider returned a valid image URL');
        }
        socket.emit('done');
    }
}

router.post('/generate', limiter, async (c) => {
    const { prompt, model, provider } = await c.req.json();
    const imageBot = new ImageBot();
    const socket = {
        emit: (event, data) => {
            console.log(`Emitted ${event}:`, data);
        }
    };
    
    const imageUrl = await imageBot.generateImage(socket, prompt, model, provider);
    
    if (imageUrl) {
        return c.json({ url: imageUrl });
    } else {
        return c.json({ error: 'Failed to generate image' }, 500);
    }
});

export default router