import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Configuração do dotenv partindo do diretório atual
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

console.log("\n--- [1] Core Middlewares OK ---");

try {
  // =========================
  // SECURITY
  // =========================
  const secMod = await import("./middlewares/security.middleware.js");
  const secFn = secMod.securityMiddleware || secMod.default;

  if (typeof secFn === "function") {
    secFn(app);
    console.log("--- [2] Security Middleware OK ---");
  }

  // =========================
  // CHAT ROUTES
  // =========================
  const chatMod = await import("./routes/chat.routes.js");
  const chatRouter = chatMod.default || chatMod.router || chatMod;

  if (chatRouter) {
    app.use("/api/chat", chatRouter);
    console.log("--- [3] Chat Routes OK ---");
  }

  // =========================
  // HEALTH CHECK
  // =========================
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      service: "Spec.AI",
      timestamp: new Date(),
    });
  });

  // =========================
  // FRONTEND STATIC - LÓGICA CORRIGIDA (Frontend com F maiúsculo)
  // =========================
  // Usamos process.cwd() para pegar a raiz do Render (/opt/render/project/src)
  // E apontamos para 'Frontend' exatamente como está no seu explorador de arquivos
  const rootPath = process.cwd();
  const frontendPath = path.join(rootPath, "Frontend");

  app.use(express.static(frontendPath));

  // SPA fallback com tratamento de erro e log de diagnóstico
  app.get("*", (req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        // Se falhar, este JSON detalhado nos dirá onde o Linux tentou ler
        res.status(404).json({
          success: false,
          status: 404,
          message: "Arquivo index.html não encontrado no caminho: " + indexPath,
          diagnostico: {
            raiz_detectada: rootPath,
            pasta_frontend: frontendPath,
            arquivos_na_raiz: fs.existsSync(rootPath) ? fs.readdirSync(rootPath) : "raiz não acessível"
          }
        });
      }
    });
  });

  console.log("--- [4] Frontend Static OK ---");

  // =========================
  // ERROR HANDLER
  // =========================
  const errMod = await import("./middlewares/error.middleware.js");
  const errFn = errMod.errorMiddleware || errMod.default;

  if (typeof errFn === "function") {
    app.use(errFn);
    console.log("--- [5] Error Middleware OK ---");
  }
} catch (err) {
  console.error("❌ ERRO CRÍTICO:", err);
}

const PORT = process.env.PORT || 3100;

app.listen(PORT, () => {
  console.log(`
🚀 SPEC.AI ONLINE
http://localhost:${PORT}
`);
});