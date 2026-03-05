/**
 * SPEC.IA 5.5 - OMNI-NEXUS CORE (INTEGRATED EDITION)
 * Orquestrador de Contexto com Camada de Transporte Blindada
 */

const SpecIAOmni = (() => {
  "use strict";

  // --- ENGENHARIA DE PROMPTS DEEP-LEVEL ---
  const KNOWLEDGE_BASE = {
    SENTINEL_DEVSECOPS: `
            VOCÊ É O SENTINEL OMNI. Especialista Sênior em DevSecOps.
            FOCO: Java (JVM), C#, Node.js, Python, C++, SQL/NoSQL, e Kernel (Win/Linux).
            MISSÃO: SAST/DAST dinâmico. Identifique vulnerabilidades e falhas de performance.
            RESPONDA como um Arquiteto de Software da Google.`,

    SCHOLAR_ENEM: `
            VOCÊ É O MENTOR SCHOLAR 5.0. PhD em Educação e Matriz do INEP.
            FOCO: ENEM (2009-2025) e Redação Nota 1000.
            MISSÃO: Análise das 5 competências. Critique clichês e sugira repertório cultural denso.
            ÉTICA: Se não houver dado verificado, use [DADO_NAO_VERIFICADO].`,
  };

  const CONFIG = Object.freeze({
    MAX_HISTORY: 20,
  });

  // --- ESTADO DO SISTEMA ---
  let _state = {
    mode: "SCHOLAR",
    history: [],
    sessionID: `nexus-${crypto.randomUUID()}`,
    isBusy: false,
  };

  const UI = {
    chat: document.getElementById("chatMessages"),
    input: document.getElementById("messageInput"),
    send: document.getElementById("sendBtn"),
    view: document.querySelector(".chat-viewport"),
  };

  /**
   * INICIALIZAÇÃO DO NUCLEO
   */
  const init = () => {
    _listenToContextSwitches();
    _bindInputs();
    _checkSystemHealth();
    console.log(
      "%c[Spec.IA 5.5] Omni-Nexus: Online e Integrado.",
      "color: #7b61ff; font-weight: bold;"
    );
  };

  /**
   * VERIFICAÇÃO DE SAÚDE (DevSecOps Tool)
   */
  const _checkSystemHealth = async () => {
    const isAlive = await SpecIA_API.checkCoreHealth();
    if (!isAlive) console.warn("[Nexus] Servidor Render em Cold Start...");
  };

  /**
   * ROTEADOR DE CONTEXTO
   */
  const _listenToContextSwitches = () => {
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".history-item");
      if (!item) return;

      const label = item.textContent.toLowerCase();
      _state.mode =
        label.includes("debug") || label.includes("code")
          ? "SENTINEL"
          : "SCHOLAR";
      _syncInterface();
    });
  };

  const _syncInterface = () => {
    document.body.dataset.context = _state.mode;
    UI.chat.innerHTML = `<div class="sys-msg">ENGINE_ACTIVE: ${_state.mode}</div>`;
    _state.history = [];
  };

  /**
   * ORQUESTRADOR DE FLUXO (O GRANDE TRY/CATCH)
   */
  const handleFlow = async () => {
    const content = UI.input.value.trim();
    if (!content || _state.isBusy) return;

    // Início do Processo
    _state.isBusy = true;
    _uiLock(true);
    _render("user", content);

    const thinking = _renderIndicator();

    try {
      // Definição da instrução com base no modo
      const promptAtivo =
        _state.mode === "SENTINEL"
          ? KNOWLEDGE_BASE.SENTINEL_DEVSECOPS
          : KNOWLEDGE_BASE.SCHOLAR_ENEM;

      // CHAMADA INTEGRADA COM API.JS
      const response = await SpecIA_API.sendMessage(
        content,
        _state.history.slice(-CONFIG.MAX_HISTORY),
        _state.mode,
        promptAtivo,
        [] // Espaço para anexos futuro
      );

      thinking.remove();

      if (response && response.response) {
        _render("bot", response.response);
        _state.history.push(
          { role: "user", content },
          { role: "model", content: response.response }
        );
      }
    } catch (error) {
      thinking.remove();
      // Erro Inteligente: Verifica se foi timeout ou rede
      const errorMsg = error.message.includes("TIMEOUT")
        ? "🚨 [COLD_START]: O servidor está acordando. Tente enviar novamente em 5 segundos."
        : `🚨 [API_ERROR]: ${error.message}`;

      _render("bot", errorMsg);
      console.error("[Omni-Nexus Error]", error);
    } finally {
      _state.isBusy = false;
      _uiLock(false);
    }
  };

  /**
   * RENDERIZAÇÃO DE UI
   */
  const _render = (role, text) => {
    const msg = document.createElement("div");
    msg.className = `message ${role}-message flow-in`;

    // Parser de Markdown Profundo
    const html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    msg.innerHTML = `<div class="msg-content">${html}</div>`;
    UI.chat.appendChild(msg);
    _scroll();
  };

  const _renderIndicator = () => {
    const el = document.createElement("div");
    el.className = "thinking";
    el.innerHTML = `<div class="pulse"></div><span>Nexus orquestrando ${_state.mode}...</span>`;
    UI.chat.appendChild(el);
    _scroll();
    return el;
  };

  const _uiLock = (state) => {
    UI.input.disabled = state;
    UI.send.disabled = state;
    if (!state) {
      UI.input.value = "";
      UI.input.focus();
    }
  };

  const _scroll = () =>
    UI.view.scrollTo({ top: UI.view.scrollHeight, behavior: "smooth" });

  const _bindInputs = () => {
    UI.send.onclick = handleFlow;
    UI.input.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFlow();
      }
    };
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", SpecIAOmni.init);
