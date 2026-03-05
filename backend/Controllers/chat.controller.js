import { GeminiService } from '../services/gemini.service.js';
import { MemoryService } from '../services/memory.js';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  static async chat(req, res, next) {
    try {
      // 1. EXTRAÇÃO E VALIDAÇÃO ROBUSTA
      // Adicionamos userId para vincular a conversa ao dono no banco
      const { message, sessionId, userId } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ 
          success: false, 
          error: 'A mensagem não pode estar vazia.' 
        });
      }

      // 2. GESTÃO DE SESSÃO
      // Se não houver sessionId, é uma "Nova Conversa" (como AI PRO ou Debug)
      const activeSession = sessionId || uuidv4();

      // 3. RECUPERAÇÃO DE CONTEXTO (Suporte ao Debug/AI PRO)
      // O MemoryService deve buscar as últimas mensagens da tabela 'messages'
      const context = await MemoryService.getRecentContext(activeSession);

      const formattedContext = context
        .map((c) => `${c.role === 'user' ? 'Usuário' : 'AI'}: ${c.content}`)
        .join('\n');

      // 4. PROMPT ESTRUTURADO PARA ALTA PERFORMANCE
      const prompt = `
Você é o Spec.IA (AI-System-Pro), um assistente de nível sênior.
Se o contexto sugerir um problema técnico, aja como um Especialista em Debug.
Se sugerir planejamento, aja como um Gerente de Projetos Pro.

--- CONTEXTO DA SESSÃO ---
${formattedContext || "Início de uma nova conversa profissional."}

--- PERGUNTA ATUAL ---
Usuário: ${message}

Responda com clareza, usando Markdown se necessário, em Português.
`;

      // 5. GERAÇÃO DE RESPOSTA
      const response = await GeminiService.generateResponse(prompt);

      // 6. PERSISTÊNCIA NO BANCO DE DADOS (Onde a mágica acontece)
      // Agora passamos os dados exatos para as tabelas 'chat_sessions' e 'messages'
      await MemoryService.saveConversation({
        sessionId: activeSession,
        userId: userId, // Importante para o WHERE user_id do seu SQL
        message: message,
        response: response,
        model: "gemini-pro"
      });

      // 7. RESPOSTA DE SUCESSO
      res.json({
        success: true,
        sessionId: activeSession,
        response: response,
        timestamp: new Date()
      });

    } catch (error) {
      console.error("❌ Erro Crítico no ChatController:", error.message);
      // O 'next(error)' envia o erro para o seu Middleware de erro global
      next(error);
    }
  }
}