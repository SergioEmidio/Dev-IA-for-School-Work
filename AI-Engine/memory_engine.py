import os
import faiss
import numpy as np
import logging
# Em vez de: import google.generativeai as genai
from google import generativeai as genai
from typing import List, Any
from dotenv import load_dotenv

# Configuração de Log para manter a robustez
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Memory-Engine")

load_dotenv()

class VectorMemoryEngine:
    def __init__(self) -> None:
        """Inicializa o motor de busca vetorial FAISS com 768 dimensões."""
        self.dimension: int = 768
        # Usamos 'Any' para o VS Code parar de marcar vermelho no index
        self.index: Any = faiss.IndexFlatL2(self.dimension) 
        self.memory: List[str] = []
        
        api_key = os.getenv("GEMINI_API_KEY")
      # Adicione o ignore no final da linha para o vermelho sumir
        genai.configure(api_key=api_key) # type: ignore
        else:
         # Adicione o ignore no final da linha para o vermelho sumir
            logger.error("GEMINI_API_KEY não encontrada no ambiente.") # type: ignore

    def embed(self, text: str) -> np.ndarray:
        """Gera o embedding e garante o formato float32 (1, 768)."""
        try:
            response = genai.embed_content( # type: ignore
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            # O FAISS EXIGE float32 e uma matriz (reshape)
            vector = np.array(response["embedding"], dtype="float32").reshape(1, -1)
            return vector
        except Exception as e:
            logger.error(f"Erro ao gerar embedding: {e}")
            return np.zeros((1, self.dimension), dtype="float32")

    def add(self, text: str) -> None:
        """Adiciona um novo texto à memória vetorial."""
        if not text.strip():
            return
            
        vector = self.embed(text)
        # O 'type: ignore' é para o editor não reclamar de algo que funciona
        self.index.add(vector) # type: ignore
        self.memory.append(text)
        logger.info(f"Nova memória adicionada. Total: {len(self.memory)}")

    def retrieve(self, query: str, k: int = 5) -> List[str]:
        """Recupera os contextos mais relevantes baseados na query."""
        if self.index.ntotal == 0:
            return []

        vector = self.embed(query)
        try:
            # Busca os k vizinhos mais próximos
            D, I = self.index.search(vector, min(k, self.index.ntotal)) # type: ignore
            
            # Filtra índices válidos e reconstrói a lista de textos
            return [self.memory[i] for i in I[0] if i != -1 and i < len(self.memory)]
        except Exception as e:
            logger.error(f"Erro na recuperação de memória: {e}")
            return []