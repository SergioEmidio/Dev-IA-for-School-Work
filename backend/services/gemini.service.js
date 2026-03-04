import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export class GeminiService {
  /**
   * Gera uma resposta usando o modelo Gemini 1.5 Flash
   * @param {string} prompt - O comando/pergunta enviado para a IA
   */
  static async generateResponse(prompt) {
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Detalhes do erro Google API:", errorData);
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        console.warn("⚠️ O Gemini retornou uma resposta vazia ou bloqueada.");
        return "Desculpe, não consegui processar sua resposta agora. Tente perguntar de outra forma.";
      }

      return aiText;

    } catch (error) {
      console.error("❌ Falha crítica no Gemini Service:", error.message);
      throw new Error("A geração de IA falhou. Verifique sua chave de API e conexão.");
    }
  }
}
