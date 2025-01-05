from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
from g4f import Provider
import g4f
import asyncio
import json

app = Flask(__name__)
CORS(app)

class ChatBot:
    def __init__(self):
        self.conversation_history = []
        self.default_model = "gpt-3.5-turbo"
        self.providers = [Provider.Blackbox, Provider.DarkAI, Provider.PollinationsAI]

    async def get_response(self, prompt: str):
        messages = self.conversation_history + [{"role": "user", "content": prompt}]
        
        for provider in self.providers:
            try:
                yield json.dumps({"event": "provider", "data": provider.__name__}) + "\n\n"
                
                response = await g4f.ChatCompletion.create_async(
                    model=self.default_model,
                    messages=messages,
                    provider=provider,
                    stream=True
                )
                
                async for chunk in response:
                    content = chunk['content'] if isinstance(chunk, dict) and 'content' in chunk else chunk
                    yield json.dumps({"event": "content", "data": content}) + "\n\n"
                
                self.conversation_history.extend([
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": content}
                ])
                break
            except Exception as e:
                print(f"Error with provider {provider.__name__}: {str(e)}")
                continue
        
        yield json.dumps({"event": "done", "data": ""}) + "\n\n"

chatbot = ChatBot()

@app.route('/chat', methods=['POST'])
def chat():
    prompt = request.json.get('prompt')
    if not prompt:
        return {"error": "No prompt provided"}, 400

    print(f"Received prompt: {prompt}")  # Debug log

    async def generate():
        async for chunk in chatbot.get_response(prompt):
            print(f"Yielding chunk: {chunk}")  # Debug log
            yield chunk

    return Response(stream_with_context(generate()), content_type='text/event-stream')

if __name__ == "__main__":
    app.run(debug=True)