import g4f
from g4f import Provider
import asyncio
import json
import threading
import queue

class ChatBot:
    def __init__(self):
        self.conversation_history = []
        self.default_model = "gpt-4o"
        self.providers = [Provider.Blackbox, Provider.DarkAI, Provider.PollinationsAI]

    async def get_response(self, prompt: str) -> str:
        messages = self.conversation_history + [{"role": "user", "content": prompt}]
        response_queue = queue.Queue()
        stop_event = threading.Event()
        chosen_provider = [None]
        full_response = ""
        response_complete = False

        def provider_thread(provider):
            try:
                response = g4f.ChatCompletion.create(
                    model=self.default_model,
                    messages=messages,
                    provider=provider,
                    stream=True
                )
                
                first_chunk = True
                for chunk in response:
                    if stop_event.is_set() and provider != chosen_provider[0]:
                        return
                    
                    content = chunk['content'] if isinstance(chunk, dict) and 'content' in chunk else chunk
                    if first_chunk and not chosen_provider[0]:
                        chosen_provider[0] = provider
                        print(json.dumps({"type": "provider", "name": provider.__name__}), flush=True)
                        stop_event.set()
                        first_chunk = False
                    
                    if provider == chosen_provider[0]:
                        print(json.dumps({"type": "content", "text": content}), flush=True)
                
                if provider == chosen_provider[0]:
                    print(json.dumps({"type": "done"}), flush=True)
                
            except Exception as e:
                if provider == chosen_provider[0]:
                    print(json.dumps({"type": "error", "message": str(e)}), flush=True)

        threads = []
        for provider in self.providers:
            thread = threading.Thread(target=provider_thread, args=(provider,))
            thread.start()
            threads.append(thread)

        for thread in threads:
            thread.join()

        self.conversation_history.extend([
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": full_response}
        ])
        
        return full_response

async def main():
    chatbot = ChatBot()
    while True:
        user_input = input()
        if user_input.lower() == 'quit':
            break
        await chatbot.get_response(user_input)

if __name__ == "__main__":
    asyncio.run(main())