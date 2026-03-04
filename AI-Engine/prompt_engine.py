import os
from datetime import datetime

class PromptEngine:
    def __init__(self):
        self.system_identity = """
        You are an advanced AI system.
        You reason step-by-step internally.
        You provide precise, structured and highly intelligent responses.
        You never hallucinate data.
        You are secure, robust and optimized for reliability.
        """

    def build_prompt(self, user_message, memory_context):
        timestamp = datetime.utcnow().isoformat()

        context_block = "\n".join(memory_context) if memory_context else "No previous memory."

        final_prompt = f"""
        SYSTEM:
        {self.system_identity}

        TIMESTAMP:
        {timestamp}

        MEMORY CONTEXT:
        {context_block}

        USER MESSAGE:
        {user_message}

        INSTRUCTIONS:
        - Respond clearly
        - Be technical when needed
        - Avoid redundancy
        - Provide deep reasoning
        """

        return final_prompt.strip()