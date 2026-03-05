/**
 * SPEC.IA API ADAPTER 5.0 - THE SENTINEL BRIDGE
 * Design: Singleton Orchestrator with Resilience Patterns
 * Security: Sanitization & Metadata Verification
 */

const SpecIA_API = (() => {
  "use strict";

  // Configurações de Infraestrutura
  const CONFIG = Object.freeze({
    BASE_URL: "https://spec-ia.onrender.com/api/chat",
    TIMEOUT_MS: 45000, // Aumentado para 45s para dar tempo ao 'cold start' do Render
    HEADERS: {
      "Content-Type": "application/json",
      "X-App-Engine": "SpecIA-Omni-5.0",
      "X-Security-Level": "DevSecOps-Enhanced",
    },
  });

  /**
   * Sanitização Profunda (Evita Injeção de Scripts no DOM)
   */
  const _purify = (text) => {
    if (!text) return "";
    return text.replace(/[<>]/g, (b) => ({ "<": "&lt;", ">": "&gt;" })[b]);
  };

  /**
   * Gerenciador de Diagnóstico: Identifica a causa real da falha
   */
  const _handleFailure = (error) => {
    if (error.name === "AbortError") {
      return "TIMEOUT_REACHED: O servidor Render está demorando a acordar (Cold Start).";
    }
    if (!navigator.onLine) {
      return "OFFLINE_ERROR: Verifique sua conexão com a internet.";
    }
    return `API_ERROR: ${error.message}`;
  };

  /**
   * O MOTOR DE CHAMADAS (The Heart of Nexus)
   */
  async function execute(endpoint, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
      console.groupCollapsed(
        `%c[Nexus-Bridge] Request to ${endpoint}`,
        "color: #00ff41; font-weight: bold;"
      );
      console.log("Payload:", payload);

      const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          ...CONFIG.HEADERS,
          "X-Timestamp": new Date().getTime(),
          "X-Request-ID": crypto.randomUUID(),
        },
        body: JSON.stringify({
          ...payload,
          message: _purify(payload.message),
          device_info: {
            platform: navigator.platform,
            agent: navigator.userAgent.substring(0, 50),
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      console.groupEnd();

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.details || `Server responded with ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      const diagnostic = _handleFailure(error);
      console.error(
        `%c[Bridge-Failure] ${diagnostic}`,
        "color: #ff4b4b; font-weight: bold;"
      );
      console.groupEnd();
      throw new Error(diagnostic);
    }
  }

  /**
   * API PÚBLICA (Enterprise Interface)
   */
  return {
    /**
     * Envia mensagem com suporte a contexto Scholar/Sentinel
     */
    sendMessage: async (
      message,
      history,
      mode,
      instructions,
      attachments = []
    ) => {
      return await execute("/send", {
        message,
        history,
        mode,
        systemInstruction: instructions,
        attachments: attachments.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.raw?.size || 0,
        })),
      });
    },

    /**
     * Sincroniza histórico de sessões anteriores
     */
    syncHistory: async (sessionId) => {
      return await execute("/history", { sessionId });
    },

    /**
     * Health Check: Verifica se o backend está vivo
     */
    checkCoreHealth: async () => {
      try {
        const start = performance.now();
        const res = await fetch(`${CONFIG.BASE_URL}/status`);
        const end = performance.now();
        console.log(
          `%c[Health] Core latency: ${(end - start).toFixed(2)}ms`,
          "color: #7b61ff"
        );
        return res.ok;
      } catch {
        return false;
      }
    },
  };
})();

// Compatibilidade global
window.SpecIA_API = SpecIA_API;
