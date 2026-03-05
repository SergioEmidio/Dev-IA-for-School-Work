import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Carrega as variáveis do .env na raiz do projeto
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

console.log("\n--- [1] Core Middlewares OK ---");

try {
  // SECURITY MIDDLEWARE
  const secMod = await import("./middlewares/security.middleware.js");
  const secFn = secMod.securityMiddleware || secMod.default;
  if (typeof secFn === "function") {
    secFn(app);
    console.log("--- [2] Security Middleware OK ---");
  }

  // CHAT ROUTES
  const chatMod = await import("./routes/chat.routes.js");
  const chatRouter = chatMod.default || chatMod.router || chatMod;
  if (chatRouter) {
    app.use("/api/chat", chatRouter);
    console.log("--- [3] Chat Routes OK ---");
  }

  // HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", service: "Spec.AI" });
  });

  // ==========================================
  // NOVA LÓGICA ESTRUTURAL: FRONTEND STATIC
  // ==========================================
  // Em vez de usar ../ (que estava dando erro), pegamos a raiz do projeto no Render
  const rootPath = process.cwd(); 
  const frontendPath = path.join(rootPath, "frontend");

  console.log(`--- Buscando frontend em: ${frontendPath} ---`);

  app.use(express.static(frontendPath));

  // SPA fallback para garantir que o index.html seja entregue
  app.get("*", (req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        // Se ainda assim não achar, o erro JSON vai nos dizer exatamente onde ele buscou
        res.status(404).json({
          success: false,
          error: "Frontend não encontrado na estrutura do Render",
          caminho_tentado: indexPath,
          raiz_detectada: rootPath
        });
      }
    });
  });

  console.log("--- [4] Frontend Static Configurado ---");

  // ERROR HANDLER
  const errMod = await import("./middlewares/error.middleware.js");
  const errFn = errMod.errorMiddleware || errMod.default;
  if (typeof errFn === "function") {
    app.use(errFn);
    console.log("--- [5] Error Middleware OK ---");
  }
} catch (err) {
  console.error("❌ ERRO CRÍTICO NO BACKEND:", err);
}

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`🚀 SPEC.AI ONLINE: Porta ${PORT}`);
});