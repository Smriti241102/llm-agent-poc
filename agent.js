// agent.js
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const modelPicker = document.getElementById("model-picker");
const alertBox = document.getElementById("alert-box");

const AIPIPE_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6IjI0ZjIwMDc5NjNAZHMuc3R1ZHkuaWl0bS5hYy5pbiJ9.OGdLJaI1rTxuOObABnswuQHbD4BIfwBhHkbyhVPlhWQ";
const API_URL = "https://aipipe.org/v1/chat/completions"; // adjust if different

// Utility: add chat bubble
function addMessage(text, sender = "assistant") {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  bubble.classList.add(
    sender === "user" ? "chat-user" : sender === "tool" ? "chat-tool" : "chat-assistant"
  );
  bubble.innerText = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight; // auto-scroll
}

// Handle send
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user bubble
  addMessage(message, "user");
  userInput.value = "";

  try {
    const model = modelPicker.value;

    // Call AIPipe API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIPIPE_TOKEN}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are a helpful assistant. Given the previous conversation, provide an answer." },
          { role: "user", content: message },
        ],
      }),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "(no response)";
    addMessage(reply, "assistant");
  } catch (err) {
    console.error(err);
    alertBox.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
