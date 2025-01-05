import readline from 'readline';
import fetch from 'node-fetch';

// Create readline interface for terminal input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function streamResponse(response) {
    const reader = response.body.getReader();
    let buffer = '';
    
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        // Process each line
        for (const line of chunk.split('\n')) {
            if (!line) continue;
            
            try {
                const data = JSON.parse(buffer + line);
                if (data.type === 'content') {
                    // Print just the content chunk
                    process.stdout.write(data.content);
                }
                buffer = '';
            } catch {
                buffer += line;
            }
        }
    }
    console.log('\n'); // New line after response completes
}

async function chat() {
    while (true) {
        const message = await new Promise(resolve => {
            rl.question('You: ', resolve);
        });

        if (message.toLowerCase() === 'exit') {
            rl.close();
            break;
        }

        try {
            const response = await fetch('http://0.0.0.0:1337/backend-api/v2/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    conversation_id: 'terminal-chat',
                    id: Date.now().toString()
                })
            });

            process.stdout.write('Assistant: ');
            await streamResponse(response);

        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

console.log('Chat started (type "exit" to quit)');
chat();