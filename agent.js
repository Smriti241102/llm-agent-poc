import { getChatCompletion } from "./test.js";

// const AIPIPE_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6IjI0ZjIwMDc5NjNAZHMuc3R1ZHkuaWl0bS5hYy5pbiJ9.OGdLJaI1rTxuOObABnswuQHbD4BIfwBhHkbyhVPlhWQ";
// const API_URL = "https://aipipe.org/openai/v1/chat/completions"; 
// agent.js
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const alertBox = document.getElementById("alert-box");

// Now we call our backend proxy, not AIPipe directly
const GOOGLE_API_KEY = "AIzaSyAe1QkPrUwbkQShtSeoKxivD0xCGSijbs0";
const GOOGLE_CX = "e12de3ecfb3f94ba1";

const conversation = [
  { role: "system", content: "You are a helpful assistant.  "  + 
"- If you call a tool, respond with a JSON object describing the tool call.  "  + 
"- Otherwise, just respond in plain text." }
];

const tools = {
  search: async ({ query }) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.items && data.items.length > 0) {
      // Return top 3 results
      return data.items.slice(0, 3).map(item => {
        return `${item.title}: ${item.link}`;
      }).join("\n");
    } else {
      return "No results found.";
    }
  },

  runCode: async ({ code }) => {
    try {
      return String(eval(code));
    } catch (e) {
      return "Error running code: " + e.message;
    }
  }
};

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

  addMessage(message, "user");
  userInput.value = "";
  conversation.push({ role: "user", content: message });

  try {
    const reply = await getChatCompletion(conversation);
    console.log("LLM raw reply:", reply);

    if (reply.tool_calls) {
      for (const call of reply.tool_calls) {
        const { name, arguments: args } = call.function;

        if (tools[name]) {
          const parsedArgs = JSON.parse(args);   // 🔹 parse JSON string
          const toolResult = await tools[name](parsedArgs);

          addMessage(`[Tool: ${name}] → ${toolResult}`, "tool");

          conversation.push({
            role: "user", // tie result back
            content: 'Use this result to answer in plain text. STRICTLY NO tool calls:' + toolResult
          });
          console.log(conversation)
          // Now continue chat
          const followUp = await getChatCompletion(conversation);
          console.log(followUp)
          addMessage(followUp.content, "assistant");
          conversation.push(followUp);
        }
      }
    } else {
      addMessage(reply.content, "assistant");
      conversation.push(reply);
    }
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
