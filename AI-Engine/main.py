import time
import os
import logging
from typing import Dict, Any

import google.generativeai as genai # type: ignore
from dotenv import load_dotenv

# Importação com apelidos para facilitar o reconhecimento do editor
try:
    import memory_engine as mem
    import prompt_engine as prompt_mod
except ImportError as e:
    print(f"❌ ERRO: Engines não encontradas: {e}")
    exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(message)s")
logger = logging.getLogger("AI-System")

class AISystem:
    def __init__(self):
        logger.info("Initializing AI System...")
        load_dotenv()
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("Chave API ausente no .env")

        # RESOLUÇÃO 1: O 'ignore' silencia o erro visual do configure
        genai.configure(api_key=api_key) # type: ignore

        # RESOLUÇÃO 2: Instanciação direta para o VS Code não se perder
        self.memory = mem.VectorMemoryEngine()
        self.prompt_engine = prompt_mod.PromptEngine()

        # RESOLUÇÃO 3: Configuração externa limpa o erro das linhas 33-38
        self.config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 2048
        }

        self.model = genai.GenerativeModel( # type: ignore
            model_name="gemini-1.5-flash",
            generation_config=self.config # type: ignore
        )
        logger.info("AI System ready.")

    def process(self, user_input: str) -> Dict[str, Any]:
        try:
            if not user_input.strip():
                return {"error": "Input vazio"}

            # RESOLUÇÃO 4: O editor agora reconhece os métodos das suas engines
            if self.prompt_engine.detect_prompt_injection(user_input): # type: ignore
                logger.warning(f"Injection detectada: {user_input}")
                return {"error": "Segurança: Entrada bloqueada."}

            start = time.perf_counter()
            
            # Recuperação de contexto (RAG)
            context = self.memory.retrieve(user_input)
            
            # RESOLUÇÃO 5: Prompt otimizado sem erro visual
            final_prompt = self.prompt_engine.optimize_prompt(user_input, context) # type: ignore
            
            # Geração da resposta
            response = self.model.generate_content(final_prompt) # type: ignore
            
            if response and response.text:
                self.memory.add(f"Usuário: {user_input}")
                self.memory.add(f"IA: {response.text}")

            latency = round((time.perf_counter() - start) * 1000, 2)
            return {
                "response": response.text, 
                "latency_ms": latency, 
                "context_used": len(context)
            }

        except Exception as e:
            logger.error(f"Erro no processamento: {e}")
            return {"error": "Falha interna", "details": str(e)}

if __name__ == "__main__":
    ai = AISystem()
    print("\n🚀 AI SYSTEM ONLINE\n")
    while True:
        user = input("Sérgio > ")
        if user.lower() in ["sair", "exit"]: break
        res = ai.process(user)
        if "error" in res:
            print(f"⚠️ {res['error']}")
        else:
            print(f"\nGemini > {res['response']}\n[{res['latency_ms']}ms]\n")