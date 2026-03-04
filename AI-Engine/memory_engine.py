import os
import faiss
import numpy as np
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not found.")

genai.configure(api_key=API_KEY)


class VectorMemoryEngine:
    def __init__(self) -> None:
        self.dimension: int = 768
        self.index = faiss.IndexFlatL2(self.dimension)
        self.memory: List[str] = []

    def embed(self, text: str) -> np.ndarray:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text
        )
        vector = np.array(response["embedding"], dtype="float32")
        return vector

    def add(self, text: str) -> None:
        vector = self.embed(text)
        self.index.add(np.array([vector]))
        self.memory.append(text)

    def retrieve(self, query: str, k: int = 5) -> List[str]:
        if self.index.ntotal == 0:
            return []

        vector = self.embed(query)
        _, indices = self.index.search(np.array([vector]), min(k, self.index.ntotal))

        return [self.memory[i] for i in indices[0] if i < len(self.memory)]