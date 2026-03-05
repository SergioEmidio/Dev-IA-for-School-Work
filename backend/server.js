import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

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
  // FRONTEND STATIC
  // =========================
  const frontendPath = path.resolve(process.cwd(), "../frontend");

  app.use(express.static(frontendPath));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
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
