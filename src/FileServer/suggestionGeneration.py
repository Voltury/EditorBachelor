from openai import OpenAI
import concurrent.futures

client = OpenAI(api_key='')


def suggestion_generation(prompt, suggestion_count, kwargs):
    response = client.chat.completions.create(**(
                {
                    'model': 'gpt-3.5-turbo-0125',
                    'messages': prompt,
                } | kwargs))
    return [completion.message.content for completion in response.choices]
