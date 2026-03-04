import pool from "../config/database.js"; // Ajustado para o nome do arquivo que configuramos antes

export class MemoryService {
  /**
   * Salva a conversa no banco de dados (Docker Porta 5433)
   */
  static async saveConversation(sessionId, userMessage, aiResponse, model = 'gemini-pro', tokens = 0) {
    try {
      // Ajustado para bater com as colunas da sua tabela 'conversations'
      const query = `
        INSERT INTO conversations 
        (user_message, ai_response, model_version, tokens_used) 
        VALUES ($1, $2, $3, $4)
      `;
      
      await pool.query(query, [userMessage, aiResponse, model, tokens]);
      console.log("💾 Conversa salva no banco de dados.");
    } catch (err) {
      console.error("❌ Erro ao salvar memória no banco:", err.message);
    }
  }

  /**
   * Busca o contexto recente para a IA não ficar "desmemoriada"
   */
  static async getRecentContext(limit = 5) {
    try {
      const { rows } = await pool.query(
        "SELECT user_message, ai_response FROM conversations ORDER BY created_at DESC LIMIT $1",
        [limit]
      );
      // Inverte para que a conversa fique na ordem cronológica correta para a IA
      return rows.reverse();
    } catch (err) {
      console.error("❌ Erro ao buscar contexto:", err.message);
      return []; // Retorna lista vazia para não travar o chat se o banco falhar
    }
  }

  /**
   * Futuro: Aqui entrará a busca por similaridade (pgvector)
   * SELECT * FROM memory_vectors ORDER BY embedding <-> $1 LIMIT 5
   */
}
