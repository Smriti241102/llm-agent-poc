// aipipeClient.js

const API_URL = "https://aipipe.org/openai/v1/chat/completions";

// ⚠️ Replace with your actual API key if required
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6IjI0ZjIwMDc5NjNAZHMuc3R1ZHkuaWl0bS5hYy5pbiJ9.OGdLJaI1rTxuOObABnswuQHbD4BIfwBhHkbyhVPlhWQ";

/**
 * Calls AIPipe's Chat Completion endpoint
 * @param {string} prompt - The user input prompt
 * @returns {Promise<string>} - The assistant's reply
 */
export async function getChatCompletion(messages) {
  const response = await fetch("https://aipipe.org/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "search",
            description: "Search the internet for information",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "runCode",
            description: "Execute JavaScript code and return the result",
            parameters: {
              type: "object",
              properties: {
                code: { type: "string", description: "JavaScript code to run" }
              },
              required: ["code"]
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  const msg = data?.choices?.[0]?.message;

  return msg; // returns {role, content} or {role, tool_calls}
}