import pool from "../config/database.js";

// ID Temporário para contornar a falta de login e manter a integridade do banco (UUID fixo)
const TEMP_USER_ID = "00000000-0000-0000-0000-000000000000";

export class MemoryService {
  /**
   * Salva a conversa de forma robusta nas tabelas 'chat_sessions' e 'messages'
   * Implementa transação para garantir que usuário e IA sejam salvos juntos.
   */
  static async saveConversation({
    sessionId,
    userId,
    message,
    response,
    model = "gemini-pro",
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN"); // Inicia transação

      // 1. Garante que a sessão existe (ou cria uma nova)
      // Usamos TEMP_USER_ID se o userId não for fornecido
      const sessionCheckQuery = `
        INSERT INTO chat_sessions (id, user_id, title, model_name) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (id) DO NOTHING
      `;
      await client.query(sessionCheckQuery, [
        sessionId,
        userId || TEMP_USER_ID,
        message.substring(0, 50), // Título automático baseado no início da mensagem
        model,
      ]);

      // 2. Salva a mensagem do USUÁRIO
      await client.query(
        "INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)",
        [sessionId, "user", message]
      );

      // 3. Salva a resposta da IA (assistant)
      await client.query(
        "INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)",
        [sessionId, "assistant", response]
      );

      await client.query("COMMIT");
      console.log(`💾 Sessão ${sessionId} salva/atualizada com sucesso.`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Erro ao salvar memória no banco:", err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Busca o contexto real da tabela 'messages' para alimentar o Gemini.
   * Isso dá suporte para as conversas "AI PRO" e "Debug" terem memória.
   */
  static async getRecentContext(sessionId, limit = 10) {
    try {
      const query = `
        SELECT role, content 
        FROM messages 
        WHERE session_id = $1 
        ORDER BY created_at ASC 
        LIMIT $2
      `;
      const { rows } = await pool.query(query, [sessionId, limit]);
      return rows; // Retorna array de { role: '...', content: '...' }
    } catch (err) {
      console.error("❌ Erro ao buscar contexto do banco:", err.message);
      return [];
    }
  }

  /**
   * Recupera todas as sessões para carregar na Sidebar do Frontend.
   * Enquanto não há login, buscamos pelo TEMP_USER_ID.
   */
  static async getUserSessions(userId) {
    try {
      const targetUser = userId || TEMP_USER_ID;
      const query = `
        SELECT id, title, created_at 
        FROM chat_sessions 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query, [targetUser]);
      return rows;
    } catch (err) {
      console.error("❌ Erro ao buscar sessões:", err.message);
      return [];
    }
  }
}
