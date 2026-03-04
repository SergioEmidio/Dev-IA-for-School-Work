import pkg from "pg";
import dotenv from "dotenv";
import path from "path"; // Import necessário para achar o caminho

// Ajuste para ler o .env que está na pasta RAIZ (um nível acima de backend)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5433, // Garante que seja um número
  
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão (Mantendo sua lógica de log)
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error("❌ Erro ao conectar no Docker (Porta 5433):", err.message);
    console.log("Dica: Verifique se o Docker Desktop está aberto e o container rodando.");
  } else {
    console.log("✅ Conectado ao Postgres no Docker com sucesso!");
  }
});

pool.on("error", (err) => {
  console.error("Unexpected DB Error:", err);
});

export default pool;
