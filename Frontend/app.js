// Configurações e Seletores - AJUSTADOS PARA SEU HTML
const API_URL = "https://spec-ia.onrender.com";
const chatContainer = document.getElementById("chatMessages"); // Ajustado (era chatMessages no HTML)
const userInput = document.getElementById("messageInput"); // Ajustado (era messageInput no HTML)
const sendButton = document.getElementById("sendBtn"); // Ajustado (era sendBtn no HTML)

// Histórico para a IA ter memória
let chatHistory = [];

// Função para adicionar mensagens na tela
function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}-message`;
  msgDiv.innerText = text;
  chatContainer.appendChild(msgDiv);

  // Scroll automático para o final
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Função Principal de Envio
async function handleSubmit() {
  const message = userInput.value.trim();
  if (!message) return;

  // 1. Limpa o input e desativa o botão
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
    const response = await fetch(`${API_URL}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        history: chatHistory,
      }),
    });

    const data = await response.json();

    if (typingIndicator.parentNode) chatContainer.removeChild(typingIndicator);

    if (response.ok) {
      appendMessage("bot", data.response);
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "model", content: data.response });
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
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// --- LOGICA DO BOTÃO E ENTER ---

// 1. Clique no botão de enviar
sendButton.addEventListener("click", () => {
  handleSubmit();
});

// 2. Enviar com Enter (sem pular linha)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Impede o pulo de linha
    handleSubmit(); // Chama a função de envio
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
      `${API_URL}/api/chat/sessions/00000000-0000-0000-0000-000000000000`
    );
    const data = await response.json();

    if (data.success && data.sessions) {
      historyList.innerHTML = "";
      data.sessions.forEach((session) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `<i class="fa-regular fa-message"></i> ${session.title}`;
        item.onclick = () => loadChatMessages(session.id);
        historyList.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar histórico lateral:", error);
  }
}

async function loadChatMessages(sessionId) {
  try {
    const response = await fetch(`${API_URL}/api/chat/messages/${sessionId}`);
    const data = await response.json();

    if (data.success) {
      chatContainer.innerHTML = "";
      chatHistory = [];
      data.messages.forEach((msg) => {
        const role = msg.role === "user" ? "user" : "bot";
        appendMessage(role, msg.content);
        chatHistory.push({ role: msg.role, content: msg.content });
      });
    }
  } catch (error) {
    console.error("Erro ao carregar mensagens da sessão:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadSidebarSessions);
