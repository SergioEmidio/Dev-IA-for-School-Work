/**
 * SPEC.IA 2.5 - SENTINEL CORE (DevSecOps Optimized)
 * Architecture: Senior Modular Pattern with System Injector
 */

const SpecIANexus = (() => {
  // --- Configurações de Engenharia ---
  const CONFIG = {
    API_URL: "https://spec-ia.onrender.com/api/chat/send",
    MODES: {
      GENERAL: "GENERAL",
      DEBUG: "DEVSECOPS", // Ativa o DNA de Auditoria
    },
    ALLOWED_FILES: [
      "application/pdf",
      "text/plain",
      "application/vnd.google-apps.document",
    ],
    MAX_FILE_SIZE: 10 * 1024 * 1024,
  };

  // --- Estado Reativo ---
  let state = {
    history: [],
    attachments: [],
    isProcessing: false,
    activeMode: CONFIG.MODES.GENERAL,
    currentSessionId: "00000000-0000-0000-0000-000000000000",
  };

  // --- DOM Cache (Performance Focused) ---
  const DOM = {
    chatBox: document.getElementById("chatMessages"),
    input: document.getElementById("messageInput"),
    sendBtn: document.getElementById("sendBtn"),
    plusBtn: document.querySelector(".tool-btn i.fa-plus")?.parentElement,
    viewport: document.querySelector(".chat-viewport"),
    welcomeScreen: () => document.querySelector(".welcome-screen"),
  };

  /**
   * DNA DEVSECOPS: Instruções de Sistema
   * Define como a IA deve "pensar" em cada modo
   */
  const getSystemInstructions = () => {
    if (state.activeMode === CONFIG.MODES.DEBUG) {
      return `VOCÊ É O SPEC.IA DEVSECOPS AGENT.
            - FOCO: Auditoria de Segurança (OWASP Top 10), Performance em Java (JVM) e Infraestrutura.
            - COMPORTAMENTO: Se receber código, analise vulnerabilidades ANTES de sugerir correções.
            - LINGUAGENS: Domínio Sênior em Java, Python, C#, Go e DevSecOps pipelines.
            - SEGURANÇA: Identifique credenciais expostas e sugira Secrets Management.`;
    }
    return "Você é o Spec.IA, um assistente inteligente, criativo e prestativo para tarefas gerais.";
  };

  const init = () => {
    setupEventListeners();
    setupAttachmentSystem();
    detectModeFromUI(); // Inteligência de interface
    console.log(
      `%c Spec.IA Sentinel 2.5 Online | Mode: ${state.activeMode}`,
      "color: #00ff41; font-weight: bold;"
    );
  };

  /**
   * Inteligência de Interface: Detecta se o usuário clicou em "Debug Code"
   */
  const detectModeFromUI = () => {
    // Observa mudanças na sidebar para trocar o modo automaticamente
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".history-item");
      if (item) {
        const isDebug = item.innerText.toLowerCase().includes("debug");
        state.activeMode = isDebug ? CONFIG.MODES.DEBUG : CONFIG.MODES.GENERAL;
        updateVisualTheme();
      }
    });
  };

  const updateVisualTheme = () => {
    const isDebug = state.activeMode === CONFIG.MODES.DEBUG;
    document.body.classList.toggle("debug-mode-active", isDebug);
    console.log(`Switching Context: ${state.activeMode}`);
  };

  /**
   * Sistema de Anexos (Suporte Docs/PDF/Drive)
   */
  const setupAttachmentSystem = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    if (DOM.plusBtn) {
      DOM.plusBtn.onclick = () => {
        const action = confirm(
          "📎 Spec.IA Nexus:\n[OK] Anexar Arquivo Local\n[Cancelar] Vincular Google Docs/Drive"
        );
        action ? fileInput.click() : handleLinkAttachment();
      };
    }

    fileInput.onchange = (e) => {
      Array.from(e.target.files).forEach((file) => {
        addAttachmentRecord({ name: file.name, type: "file", raw: file });
      });
    };
  };

  const handleLinkAttachment = () => {
    const link = prompt("Cole o link (Google Docs, Drive ou PDF Público):");
    if (link?.match(/docs\.google\.com|drive\.google\.com/)) {
      addAttachmentRecord({ name: "Cloud Document", type: "link", url: link });
    } else if (link) {
      alert("⚠️ Link inválido ou não suportado.");
    }
  };

  const addAttachmentRecord = (item) => {
    state.attachments.push(item);
    const notify = document.createElement("div");
    notify.className = "message system-message fade-in-up";
    notify.innerHTML = `<i class="fa-solid fa-link"></i> Ativo vinculado: <strong>${item.name}</strong>`;
    DOM.chatBox.appendChild(notify);
    scrollToBottom();
  };

  /**
   * Orquestrador de Envio (Enterprise Level)
   */
  const handleSubmission = async () => {
    const text = DOM.input.value.trim();
    if ((!text && state.attachments.length === 0) || state.isProcessing) return;

    state.isProcessing = true;
    setUILock(true);

    // Remove welcome screen na primeira interação
    if (DOM.welcomeScreen()) DOM.welcomeScreen().remove();

    renderMessage("user", text);
    const loading = showLoading();

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: state.history,
          sessionId: state.currentSessionId,
          systemInstruction: getSystemInstructions(), // O segredo da inteligência
          attachments: state.attachments.map((a) => ({
            name: a.name,
            url: a.url || "local_blob",
          })),
          context: state.activeMode,
        }),
      });

      const data = await response.json();
      loading.remove();

      if (response.ok) {
        renderMessage("bot", data.response);
        state.history.push(
          { role: "user", content: text },
          { role: "model", content: data.response }
        );
        state.attachments = [];
      }
    } catch (error) {
      loading.remove();
      renderMessage(
        "bot",
        "❌ [SENTINEL ERROR]: Falha de comunicação com o Core. Verifique o cluster Render."
      );
    } finally {
      state.isProcessing = false;
      setUILock(false);
    }
  };

  // --- Helpers de UI ---
  const renderMessage = (role, text) => {
    const div = document.createElement("div");
    div.className = `message ${role}-message fade-in-up ${state.activeMode === CONFIG.MODES.DEBUG ? "code-font" : ""}`;

    // Markdown parser de alta eficiência
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    div.innerHTML = `
            <div class="content">${formatted}</div>
            ${state.attachments.length > 0 && role === "user" ? `<div class="attached-meta">📎 Analisando ${state.attachments.length} anexo(s)</div>` : ""}
        `;
    DOM.chatBox.appendChild(div);
    scrollToBottom();
  };

  const showLoading = () => {
    const div = document.createElement("div");
    div.className = "message bot-message typing";
    div.innerHTML = `<span></span><span></span><span></span>`;
    DOM.chatBox.appendChild(div);
    scrollToBottom();
    return div;
  };

  const setUILock = (lock) => {
    DOM.input.disabled = lock;
    DOM.sendBtn.disabled = lock;
    if (!lock) {
      DOM.input.value = "";
      DOM.input.focus();
    }
  };

  const scrollToBottom = () => {
    DOM.viewport.scrollTo({
      top: DOM.viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  const setupEventListeners = () => {
    DOM.sendBtn.onclick = handleSubmission;
    DOM.input.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmission();
      }
    };
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", SpecIANexus.init);
