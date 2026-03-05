// Alterado de window.location.origin para a URL fixa do Render
const API_BASE = "https://spec-ia.onrender.com";

export async function sendMessage(message) {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API ERROR ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API ERROR:", error);

    return {
      response: "⚠️ Erro ao conectar com o servidor.",
    };
  }
}
