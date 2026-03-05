import { sendMessage } from "./api.js";

const chatMessages = document.getElementById("chatMessages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, type) {
  const div = document.createElement("div");

  div.classList.add("message", type);

  div.innerText = text;

  chatMessages.appendChild(div);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoading() {
  const div = document.createElement("div");

  div.classList.add("message", "ai");

  div.id = "loading";

  div.innerText = "Spec.IA está pensando...";

  chatMessages.appendChild(div);
}

function removeLoading() {
  const loading = document.getElementById("loading");

  if (loading) loading.remove();
}

async function handleSend() {
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");

  input.value = "";

  addLoading();

  try {
    const data = await sendMessage(message);

    removeLoading();

    addMessage(data.response, "ai");
  } catch {
    removeLoading();

    addMessage("Erro ao gerar resposta.", "ai");
  }
}

sendBtn.addEventListener("click", handleSend);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    handleSend();
  }
});
