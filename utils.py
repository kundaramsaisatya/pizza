import google.generativeai as genai
from config import API_KEY
import re
import json
import sys

def extract_json_text(text):
    pattern = r'```(.*?)```'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        json_text = match.group(1).strip().replace('\n', '')
        return json_text
    return None

def parse_json_text(json_text):
    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

if __name__ == "__main__":
    genai.configure(api_key=API_KEY)

    prompt = '''Extract the order from the below text and format in this way 
                {"size": "regular",
                "type": "Veg",
                "veg": "yes",
                "item": "pizza",
                "extras": ["extra cheese"],
                "quantity": 2} : '''

    user_input = sys.argv[1]

    if not user_input:
        print('No input provided\n Try again!!')
    else:
        response = genai.chat(messages=prompt + user_input)
        order = extract_json_text(response.last)
        order = parse_json_text(order)
        print(order)
