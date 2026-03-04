import { GeminiService } from '../services/gemini.service.js';
import { MemoryService } from '../services/memory.js';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  static async chat(req, res, next) {
    try {
      const { message, sessionId } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: 'Mensagem é obrigatória.' });
      }

      const activeSession = sessionId || uuidv4();

      const context = await MemoryService.getRecentContext(activeSession);

      const formattedContext = context
        .map((c) => `User: ${c.user_message}\nAI: ${c.ai_response}`)
        .join('\n');

      const prompt = `
Você é o AI-System-Pro, um assistente inteligente e prestativo.

Contexto das mensagens anteriores:
${formattedContext || "Nenhum histórico anterior."}

Pergunta atual do Usuário:
${message}

Responda de forma inteligente, estruturada e em Português.
`;

      const response = await GeminiService.generateResponse(prompt);

      await MemoryService.saveConversation(
        activeSession,
        message,
        response,
        "gemini-pro",
        0
      );

      res.json({
        success: true,
        sessionId: activeSession,
        response: response
      });

    } catch (error) {
      console.error("❌ Erro no ChatController:", error.message);
      next(error);
    }
  }
}
