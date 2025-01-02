import sys
from g4f.client import Client

takeinptt = sys.argv[1]

client = Client()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": takeinptt}],
    web_search=False
)

print(response.choices[0].message.content)