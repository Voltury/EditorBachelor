import time

from openai import OpenAI
import concurrent.futures

client = OpenAI(api_key='sk-proj-XAvumDNFY8LVfVBmXpiaT3BlbkFJIB9HCxi8iOLwZ0iOPijX')


def suggestion_generation(last_x_symbols, task, suggestion_count, kwargs):
    def get_completion():
        completion = client.chat.completions.create(**({
            'model':'gpt-3.5-turbo-0125',
            'messages':[{"role": "system",
                       "content": f"You are a smart text completion tool that helps the user to write a blogpost about "
                                  f"the following topic: '{task}' Try to mimic the users style and try to generate"},
                      {"role": "user", "content": f"Continue the text: ${last_x_symbols}"}]
        } | kwargs)
        )
        return completion.choices[0].message.content

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(get_completion) for _ in range(suggestion_count)]

    temp = [future.result() for future in concurrent.futures.as_completed(futures)]
    return temp