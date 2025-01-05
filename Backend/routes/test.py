from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
from g4f import Provider
import g4f
import asyncio
import queue
import threading

app = Flask(__name__)
CORS(app)

class ChatBot:
    def __init__(self):
        self.conversation_history = []
        self.default_model = "gpt-4"
        self.providers = [Provider.Blackbox, Provider.DarkAI, Provider.PollinationsAI]

    async def get_response(self, prompt: str):
        messages = self.conversation_history + [{"role": "user", "content": prompt}]
        response_queue = asyncio.Queue()
        stop_event = asyncio.Event()
        chosen_provider = [None]
        full_response = ""

        async def provider_task(provider):
            try:
                response = await g4f.ChatCompletion.create_async(
                    model=self.default_model,
                    messages=messages,
                    provider=provider,
                    stream=True
                )
                
                first_chunk = True
                async for chunk in response:
                    if stop_event.is_set() and provider != chosen_provider[0]:
                        return
                    
                    content = chunk['content'] if isinstance(chunk, dict) and 'content' in chunk else chunk
                    if first_chunk and not chosen_provider[0]:
                        chosen_provider[0] = provider
                        await response_queue.put(("provider", provider.__name__))
                        stop_event.set()
                        first_chunk = False
                    
                    if provider == chosen_provider[0]:
                        await response_queue.put(("content", content))
                
                if provider == chosen_provider[0]:
                    await response_queue.put(("done", None))
                
            except Exception as e:
                if provider == chosen_provider[0]:
                    await response_queue.put(("done", None))

        tasks = [asyncio.create_task(provider_task(provider)) for provider in self.providers]

        while True:
            try:
                msg_type, content = await asyncio.wait_for(response_queue.get(), timeout=0.1)
                if msg_type == "done":
                    break
                yield f"event: {msg_type}\ndata: {content}\n\n"
                if msg_type == "content":
                    full_response += content
            except asyncio.TimeoutError:
                if all(task.done() for task in tasks):
                    break

        for task in tasks:
            task.cancel()

        await asyncio.gather(*tasks, return_exceptions=True)

        self.conversation_history.extend([
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": full_response}
        ])

chatbot = ChatBot()

@app.route('/chat', methods=['POST'])
def chat():
    prompt = request.json.get('prompt')
    if not prompt:
        return {"error": "No prompt provided"}, 400

    async def generate():
        async for chunk in chatbot.get_response(prompt):
            yield chunk

    def run_async():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(generate().__anext__())

    def stream_response():
        while True:
            try:
                yield run_async()
            except StopAsyncIteration:
                break

    return Response(stream_with_context(stream_response()), content_type='text/event-stream')

if __name__ == "__main__":
    app.run(debug=True)