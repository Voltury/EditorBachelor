from openai import OpenAI
import concurrent.futures

client = OpenAI(api_key='sk-proj-XAvumDNFY8LVfVBmXpiaT3BlbkFJIB9HCxi8iOLwZ0iOPijX')


def suggestion_generation(prompt, suggestion_count, kwargs):
    return [f"suggestion{i}" for i in range(suggestion_count)]

    def get_completion():
        completion = client.chat.completions.create(**({
            'model': 'gpt-3.5-turbo-0125',
            'messages': prompt,
        } | kwargs)
        )
        return completion.choices[0].message.content

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(get_completion) for _ in range(suggestion_count)]

    temp = [future.result() for future in concurrent.futures.as_completed(futures)]
    return temp