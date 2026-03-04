import time
from typing import Dict
import google.generativeai as genai
from memory_engine import VectorMemoryEngine
from prompt_engine import PromptEngine
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class AISystem:
    def __init__(self) -> None:
        self.memory = VectorMemoryEngine()
        self.prompt_engine = PromptEngine()
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def process(self, user_input: str) -> Dict:

        if not user_input.strip():
            return {"error": "Empty input"}

        if self.prompt_engine.detect_prompt_injection(user_input):
            return {"error": "Prompt injection detected"}

        start = time.perf_counter()

        context = self.memory.retrieve(user_input)

        prompt = self.prompt_engine.optimize_prompt(user_input, context)

        response = self.model.generate_content(prompt)

        final_text = response.text

        self.memory.add(user_input)
        self.memory.add(final_text)

        latency = round((time.perf_counter() - start) * 1000, 2)

        return {
            "response": final_text,
            "latency_ms": latency
        }


if __name__ == "__main__":
    ai = AISystem()

    while True:
        user = input("\nYou: ")
        result = ai.process(user)

        if "error" in result:
            print("⚠️", result["error"])
        else:
            print("\nAI:", result["response"])
            print("Latency:", result["latency_ms"], "ms")