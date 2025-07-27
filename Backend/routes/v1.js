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

class OpenAICompatibleChatBot {
    constructor() {
        this.defaultModel = "gpt-4o";
        this.providers = ['Blackbox', 'PollinationsAI'];
    }

    async getResponse(model, provider, history, stream = false) {
        // Always use gpt-4o regardless of the requested model
        const selectedModel = "gpt-4o";
        const selectedProviders = provider && provider.length > 0 ? provider : this.providers;
    
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
                        completedProviders++;
                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            reject(new Error('No provider returned a valid response'));
                        }
                        return;
                    }

                    providerStreams.set(currentProvider, response.body);

                    let buffer = '';
                    let streamError = false;

                    response.body.on('data', (chunk) => {
                        try {
                            if (isStreamingStarted && activeProvider !== currentProvider) {
                                return;
                            }

                            buffer += chunk.toString();
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';
                            
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
                                            resolve(fullResponse);
                                        }
                                        return;
                                    }
                                    
                                    try {
                                        const parsed = JSON.parse(data);
                                        const content = parsed.choices?.[0]?.delta?.content;
                                        
                                        if (content) {
                                            if (!isStreamingStarted) {
                                                isStreamingStarted = true;
                                                activeProvider = currentProvider;
                                            }

                                            if (activeProvider === currentProvider) {
                                                fullResponse += content;
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
                                resolve(fullResponse);
                            }
                        }
                        
                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            reject(new Error('No provider returned a valid response'));
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
                        }

                        if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                            hasResolved = true;
                            reject(new Error('No provider returned a valid response'));
                        }
                    });

                } catch (error) {
                    console.error(`Error with ${currentProvider}:`, error);
                    completedProviders++;

                    if (completedProviders >= selectedProviders.length && !isStreamingStarted && !hasResolved) {
                        hasResolved = true;
                        reject(new Error('No provider returned a valid response'));
                    }
                }
            });

            setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    providerStreams.forEach((stream, provider) => {
                        try {
                            stream.destroy();
                        } catch (e) {
                            console.error(`Error destroying stream for ${provider}:`, e);
                        }
                    });
                    reject(new Error('Request timed out - no provider responded in time'));
                }
            }, 60000);
        });
    }
}

const chatbot = new OpenAICompatibleChatBot();

// OpenAI-compatible chat completions endpoint
router.post('/chat/completions', limiter, async (c) => {
    try {
        const body = await c.req.json();
        const { messages, model, stream = false } = body;

        if (!messages || !Array.isArray(messages)) {
            return c.json({
                error: {
                    message: "Invalid request: 'messages' field is required and must be an array",
                    type: "invalid_request_error",
                    code: "invalid_request"
                }
            }, 400);
        }

        // Validate message format
        for (const message of messages) {
            if (!message.role || !message.content) {
                return c.json({
                    error: {
                        message: "Invalid request: each message must have 'role' and 'content' fields",
                        type: "invalid_request_error",
                        code: "invalid_request"
                    }
                }, 400);
            }
        }

        try {
            const response = await chatbot.getResponse(model, null, messages, stream);
            
            // Return OpenAI-compatible response format
            return c.json({
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: "gpt-4oo",
                choices: [
                    {
                        index: 0,
                        message: {
                            role: "assistant",
                            content: response
                        },
                        finish_reason: "stop"
                    }
                ],
                usage: {
                    prompt_tokens: messages.reduce((acc, msg) => acc + msg.content.length / 4, 0),
                    completion_tokens: response.length / 4,
                    total_tokens: (messages.reduce((acc, msg) => acc + msg.content.length, 0) + response.length) / 4
                }
            });

        } catch (error) {
            console.error('Chat completion error:', error);
            return c.json({
                error: {
                    message: error.message || "Internal server error",
                    type: "api_error",
                    code: "api_error"
                }
            }, 500);
        }

    } catch (error) {
        console.error('Request parsing error:', error);
        return c.json({
            error: {
                message: "Invalid JSON in request body",
                type: "invalid_request_error",
                code: "invalid_request"
            }
        }, 400);
    }
});

// OpenAI models endpoint for compatibility
router.get('/models', (c) => {
    return c.json({
        object: "list",
        data: [
            {
                id: "gpt-4o",
                object: "model",
                created: 1677610602,
                owned_by: "zenos-ai"
            },
            {
                id: "gpt-4oo",
                object: "model",
                created: 1674610602,
                owned_by: "zenos-ai"
            },
            {
                id: "gpt-4",
                object: "model",
                created: 1677610602,
                owned_by: "zenos-ai"
            },
            {
                id: "gpt-3.5-turbo",
                object: "model",
                created: 1677610602,
                owned_by: "zenos-ai"
            }
        ]
    });
});

export default router