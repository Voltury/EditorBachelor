from openai import OpenAI
import concurrent.futures

client = OpenAI(api_key='sk-proj-XAvumDNFY8LVfVBmXpiaT3BlbkFJIB9HCxi8iOLwZ0iOPijX')


def suggestion_generation(prompt, suggestion_count, kwargs):
    response = client.chat.completions.create(**(
            {
                'model': 'gpt-3.5-turbo-0125',
                'messages': prompt,
            } | kwargs))

    return [completion["text"] for completion in response['choices']]


x = suggestion_generation(["Hello, how are you?"], 1, {'temperature': 0.7, 'top_p': 0.8, 'max_tokens': 10, 'n': 1})
print(x)
