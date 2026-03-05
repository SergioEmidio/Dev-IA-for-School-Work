// Configurações e Seletores
const chatContainer = document.getElementById("chat-container"); // Onde as mensagens aparecem
const chatForm = document.getElementById("chat-form"); // O formulário de envio
const userInput = document.getElementById("user-input"); // A caixa de texto
const sendButton = document.getElementById("send-btn"); // O botão de enviar

// Histórico para a IA ter memória (opcional, dependendo da sua rota de chat)
let chatHistory = [];

// Função para adicionar mensagens na tela
function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}-message`; // Define estilos diferentes para user e bot
  msgDiv.innerText = text;
  chatContainer.appendChild(msgDiv);

  // Scroll automático para o final
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Função Principal de Envio
async function handleSubmit(e) {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // 1. Limpa o input e desativa o botão para evitar cliques duplos
  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

  // 2. Mostra a mensagem do usuário na tela
  appendMessage("user", message);

  // 3. Cria um indicador de "Pensando..."
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message bot-message typing";
  typingIndicator.innerText = "Spec.AI está pensando...";
  chatContainer.appendChild(typingIndicator);

  try {
    // 4. Chamada para a API (URL alterada para /api/chat/send)
    const response = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        history: chatHistory, // Envia o histórico se sua API suportar
      }),
    });

    const data = await response.json();

    // Remove indicador de carregamento
    chatContainer.removeChild(typingIndicator);

    if (response.ok) {
      // 5. Mostra a resposta da IA
      appendMessage("bot", data.response);

      // Atualiza o histórico local
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "model", content: data.response });

      // Opcional: Recarregar a sidebar após nova mensagem para atualizar títulos
      loadSidebarSessions();
    } else {
      throw new Error(data.message || "Erro na resposta da IA");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    if (typingIndicator.parentNode) chatContainer.removeChild(typingIndicator);
    appendMessage(
      "bot",
      "❌ Ops! Tive um problema ao me conectar. Tente novamente em instantes."
    );
  } finally {
    // 6. Reativa os controles
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// Ouvinte de Eventos
chatForm.addEventListener("submit", handleSubmit);

// Atalho: Enviar com Enter (sem precisar clicar no botão)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// ==========================================
// FUNÇÕES DE GESTÃO DO HISTÓRICO (SIDEBAR)
// ==========================================

async function loadSidebarSessions() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  try {
    const response = await fetch(
      "/api/chat/sessions/00000000-0000-0000-0000-000000000000"
    );
    const data = await response.json();

    if (data.success && data.sessions) {
      historyList.innerHTML = "";

      data.sessions.forEach((session) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `<i class="fa-regular fa-message"></i> ${session.title}`;

        // --- AQUI ESTÁ A MÁGICA: ---
        item.onclick = () => loadChatMessages(session.id);

        historyList.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar histórico lateral:", error);
  }
}

// Função para buscar mensagens de uma sessão e exibir na tela
async function loadChatMessages(sessionId) {
  try {
    const response = await fetch(`/api/chat/messages/${sessionId}`);
    const data = await response.json();

    if (data.success) {
      // 1. Limpa o container de chat atual
      chatContainer.innerHTML = "";

      // 2. Reseta o histórico local da memória da IA
      chatHistory = [];

      // 3. Adiciona as mensagens do banco na tela
      data.messages.forEach((msg) => {
        const role = msg.role === "user" ? "user" : "bot";
        appendMessage(role, msg.content);

        // Alimenta o histórico local para a IA continuar sabendo do que vcs falaram
        chatHistory.push({ role: msg.role, content: msg.content });
      });

      console.log(`Chat ${sessionId} carregado.`);
    }
  } catch (error) {
    console.error("Erro ao carregar mensagens da sessão:", error);
    alert("Não foi possível carregar as mensagens desta conversa.");
  }
}

// Inicialização
window.addEventListener("DOMContentLoaded", loadSidebarSessions);
