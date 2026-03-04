import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

console.log("\n--- [1] Imports Base OK ---");

try {
  // Security
  const secMod = await import("./middlewares/security.middleware.js");
  const secFn = secMod.securityMiddleware || secMod.default;
  if (typeof secFn === "function") {
    secFn(app);
    console.log("--- [2] Security OK ---");
  }

  // Chat Routes - Ajuste para pegar qualquer tipo de export
  // Diz ao Express para servir os arquivos da pasta 'frontend' (ou o nome da sua pasta)
  app.use(express.static(path.resolve(process.cwd(), "../frontend")));

  const chatMod = await import("./routes/chat.routes.js");
  const chatRouter = chatMod.default || chatMod.router || chatMod;

  if (chatRouter && (typeof chatRouter === "function" || chatRouter.stack)) {
    app.use("/api/chat", chatRouter);
    console.log("--- [3] Rotas de Chat OK ---");
  } else {
    throw new Error(
      'Verifique se existe "export default router" no chat.routes.js'
    );
  }

  // Error Middleware
  const errMod = await import("./middlewares/error.middleware.js");
  const errFn = errMod.errorMiddleware || errMod.default;
  if (typeof errFn === "function") {
    app.use(errFn);
    console.log("--- [4] Error Middleware OK ---");
  }
} catch (err) {
  console.error("❌ ERRO:", err.message);
}

const PORT = process.env.PORT || 3100; // Mudei para 3040 para fugir dos processos travados

app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR ONLINE: http://localhost:${PORT}\n`);
});
