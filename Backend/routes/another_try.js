import readline from 'readline';
import fetch from 'node-fetch';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class ChatBot {
    constructor() {
        this.conversationHistory = [];
        this.defaultModel = "gpt-4o";
        this.providers = ['Blackbox', 'DarkAI', 'PollinationsAI'];
    }

    async getResponse(prompt) {
        const messages = [...this.conversationHistory, { role: "user", content: prompt }];
        let chosenProvider = null;
        let fullResponse = "";
        const abortControllers = new Map();

        // Create a promise for each provider
        const providerPromises = this.providers.map(provider => {
            const controller = new AbortController();
            abortControllers.set(provider, controller);

            return (async () => {
                try {
                    const response = await fetch('http://localhost:1337/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream'
                        },
                        signal: controller.signal,
                        body: JSON.stringify({
                            model: this.defaultModel,
                            messages: messages,
                            provider: provider,
                            stream: true
                        })
                    });

                    if (!response.ok) return null;

                    let isFirstChunk = true;
                    for await (const chunk of response.body) {
                        // If another provider was chosen, abort this one right away
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

                                // Once we see the first chunk from any provider, choose it,
                                // then abort all other providers
                                if (content) {
                                    if (isFirstChunk) {
                                        isFirstChunk = false;
                                        if (!chosenProvider) {
                                            chosenProvider = provider;
                                            console.log(`\nUsing: ${provider}`);
                                            // Abort all other providers
                                            for (const [otherProvider, ctrl] of abortControllers) {
                                                if (otherProvider !== provider) {
                                                    ctrl.abort();
                                                }
                                            }
                                        }
                                    }

                                    // Only stream from the chosen provider
                                    if (provider === chosenProvider) {
                                        process.stdout.write(content);
                                        fullResponse += content;
                                    }
                                }
                            } catch (e) {
                                // Ignore parsing errors on partial or invalid lines
                                continue;
                            }
                        }
                    }
                    return provider;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        // This provider was aborted because another provider was chosen
                        return null;
                    }
                    console.error(`Error with ${provider}:`, error);
                    return null;
                }
            })();
        });

        // Instead of racing, wait for all requests to settle so the chosen one can stream fully
        await Promise.allSettled(providerPromises);

        if (fullResponse) {
            this.conversationHistory.push(
                { role: "user", content: prompt },
                { role: "assistant", content: fullResponse }
            );
        } else {
            console.log('\nNo provider returned a valid response');
            return 'Sorry, I am unable to respond at the moment.';
        }

        return fullResponse;
    }
}

async function main() {
    const chatbot = new ChatBot();
    console.log("Chat initialized! Type 'quit' to exit");

    while (true) {
        const userInput = await new Promise(resolve => {
            rl.question('\nYou: ', resolve);
        });

        if (userInput.toLowerCase() === 'quit') {
            break;
        }

        await chatbot.getResponse(userInput);
        console.log('\n');
    }

    rl.close();
}

main().catch(error => {
    console.error('Main error:', error);
    process.exit(1);
});