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
        this.providers = ['DarkAI', 'PollinationsAI'];
    }

    async getResponse(socket, model, provider, history) {
        const selectedModel = model || this.defaultModel;
        const selectedProviders = provider && provider.length > 0 ? provider : this.providers;
    
        // console.log(selectedModel);
        // console.log(selectedProviders);
    
        let fullResponse = "";
        let isStreamingStarted = false;
        let activeProvider = null;
        let completedProviders = 0;
        let providerStreams = new Map();
    
        return new Promise((resolve, reject) => {
            let hasResolved = false;
            
            selectedProviders.forEach(async (currentProvider) => {
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
                            provider: currentProvider,
                            stream: true
                        })
                    });

                    if (!response.ok) {
                        // console.error(`Provider ${currentProvider} failed with status:`, response.status);
                        completedProviders++;

                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            // console.log("All providers failed");
                            socket.emit('error', 'No provider returned a valid response');
                            socket.emit('done');
                            resolve(null);
                        }
                        return;
                    }

                    providerStreams.set(currentProvider, response.body);

                    let buffer = '';
                    let hasStartedStreaming = false;
                    let streamError = false;

                    response.body.on('data', (chunk) => {
                        try {
                            if (isStreamingStarted && activeProvider !== currentProvider) {
                                return;
                            }

                            buffer += chunk.toString();
                            const lines = buffer.split('\n');

                            buffer = lines.pop() || '';
                            
                            let hasValidContent = false;
                            
                            for (const line of lines) {
                                if (line.trim() === '') continue;
                                if (line.startsWith('data: ')) {
                                    const data = line.slice(6);
                                    
                                    if (data === '[DONE]') {
                                        if (activeProvider === currentProvider && !hasResolved) {
                                            hasResolved = true;

                                            providerStreams.forEach((stream, provider) => {
                                                if (provider !== currentProvider) {
                                                    try {
                                                        stream.destroy();
                                                    } catch (e) {
                                                        console.error(`Error destroying stream for ${provider}:`, e);
                                                    }
                                                }
                                            });
                                            
                                            socket.emit('done', fullResponse);
                                            resolve(fullResponse);
                                        }
                                        return;
                                    }
                                    
                                    try {
                                        const parsed = JSON.parse(data);
                                        const content = parsed.choices?.[0]?.delta?.content;
                                        
                                        if (content) {
                                            hasValidContent = true;

                                            if (!isStreamingStarted) {
                                                isStreamingStarted = true;
                                                activeProvider = currentProvider;
                                                hasStartedStreaming = true;

                                                socket.emit('prov', currentProvider);
                                                
                                                // console.log(`Provider ${currentProvider} started streaming first`);
                                            }

                                            if (activeProvider === currentProvider) {
                                                fullResponse += content;
                                                socket.emit('chunk', content);
                                            }
                                        }
                                    } catch (parseError) {
                                        console.error(`Error parsing streaming data from ${currentProvider}:`, parseError);
                                    }
                                }
                            }
                            
                        } catch (error) {
                            console.error(`Error processing chunk from ${currentProvider}:`, error);
                            streamError = true;
                        }
                    });

                    response.body.on('end', () => {
                        completedProviders++;
                        
                        if (activeProvider === currentProvider && !hasResolved) {
                            if (buffer.trim()) {
                                try {
                                    if (buffer.startsWith('data: ')) {
                                        const data = buffer.slice(6);
                                        if (data !== '[DONE]') {
                                            const parsed = JSON.parse(data);
                                            const content = parsed.choices?.[0]?.delta?.content;
                                            if (content) {
                                                fullResponse += content;
                                                socket.emit('chunk', content);
                                            }
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error processing final buffer:', error);
                                }
                            }
                            
                            if (!hasResolved) {
                                hasResolved = true;

                                providerStreams.forEach((stream, provider) => {
                                    if (provider !== currentProvider) {
                                        try {
                                            stream.destroy();
                                        } catch (e) {
                                            console.error(`Error destroying stream for ${provider}:`, e);
                                        }
                                    }
                                });
                                
                                socket.emit('done', fullResponse);
                                resolve(fullResponse);
                            }
                        }
                        
                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            // console.log("All providers completed but none provided valid streaming content");
                            socket.emit('error', 'No provider returned a valid response');
                            socket.emit('done');
                            resolve(null);
                        }
                    });

                    response.body.on('error', (error) => {
                        console.error(`Streaming error with ${currentProvider}:`, error);
                        completedProviders++;
                        streamError = true;
                        
                        if (activeProvider === currentProvider && !hasResolved) {
                            isStreamingStarted = false;
                            activeProvider = null;
                            fullResponse = "";
                            
                            // console.log(`Active provider ${currentProvider} failed, allowing others to take over`);
                        }

                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            // console.log("All providers failed or had errors");
                            socket.emit('error', 'No provider returned a valid response');
                            socket.emit('done');
                            resolve(null);
                        }
                    });

                } catch (error) {
                    console.error(`Error with ${currentProvider}:`, error);
                    completedProviders++;

                    if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                        hasResolved = true;
                        // console.log("All providers failed");
                        socket.emit('error', 'No provider returned a valid response');
                        socket.emit('done');
                        resolve(null);
                    }
                }
            });

            setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    // console.log("All providers timed out");

                    providerStreams.forEach((stream, provider) => {
                        try {
                            stream.destroy();
                        } catch (e) {
                            console.error(`Error destroying stream for ${provider}:`, e);
                        }
                    });
                    
                    socket.emit('error', 'Request timed out - no provider responded in time');
                    socket.emit('done');
                    resolve(null);
                }
            }, 60000);
        });
    }
}

router.post('/', limiter, async (c) => {
    return c.json({ message: "Please connect via WebSocket for real-time communication" });
})

export default router