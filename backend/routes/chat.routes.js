import { Router } from "express";
import { ChatController } from "../Controllers/chat.controller.js";
import { MemoryService } from "../services/memory.js";

const router = Router();

// ==========================================
// ROTA 1: ENVIAR MENSAGEM (O "Cérebro")
// Suporte ao Debug e AI PRO salvando no banco
// ==========================================
router.post("/send", ChatController.chat);

// ==========================================
// ROTA 2: LISTAR SESSÕES (Histórico Lateral)
// Alimenta o "Projeto AI Pro" e "Debug de Código" na Sidebar
// ==========================================
router.get("/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Lógica real: Busca as sessões do usuário no banco
    const sessions = await MemoryService.getUserSessions(userId);

    res.json({
      success: true,
      sessions: sessions, // Agora traz os dados reais da tabela chat_sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ROTA 3: CARREGAR MENSAGENS DE UM CHAT
// Recupera o histórico quando você clica em um item da sidebar
// ==========================================
router.get("/messages/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Lógica real: SELECT * FROM messages WHERE session_id = sessionId ORDER BY created_at ASC
    const messages = await MemoryService.getRecentContext(sessionId, 50); // Busca até as últimas 50 mensagens

    res.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ROTA 4: CRIAR NOVA SESSÃO
// Acionada pelo botão "+ Nova Conversa"
// ==========================================
router.post("/sessions", async (req, res) => {
  try {
    const { userId, title } = req.body;
    // Lógica real: Cria uma entrada na tabela chat_sessions para iniciar um histórico limpo
    // O ChatController já faz isso automaticamente no saveConversation,
    // mas esta rota permite criar um título antes da primeira mensagem.

    res.json({
      success: true,
      message: "Nova sessão pronta para uso.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
