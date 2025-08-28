// Tool: Google/DuckDuckGo search
export async function searchTool(query) {
  try {
    let res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    let data = await res.json();
    return data?.RelatedTopics?.slice(0, 3).map(r => r.Text).join("<br>") || "No results";
  } catch (e) {
    return "❌ Search failed: " + e.message;
  }
}

// Tool: AI Pipe proxy
export async function aiPipeTool(flow) {
  try {
    let res = await fetch("https://aipipe.sanand.workers.dev/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow })
    });
    return JSON.stringify(await res.json());
  } catch (e) {
    return "❌ AI Pipe failed: " + e.message;
  }
}

// Tool: JS execution (sandboxed)
export async function jsExecTool(code) {
  return new Promise(resolve => {
    try {
      const iframe = document.createElement("iframe");
      iframe.sandbox = "allow-scripts";
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const script = iframe.contentDocument.createElement("script");
      script.type = "text/javascript";
      script.textContent = `
        try {
          let result = eval(${JSON.stringify(code)});
          parent.postMessage({result: result}, "*");
        } catch (err) {
          parent.postMessage({error: err.toString()}, "*");
        }
      `;
      window.addEventListener("message", function handler(ev) {
        window.removeEventListener("message", handler);
        iframe.remove();
        if (ev.data.error) resolve("❌ JS Error: " + ev.data.error);
        else resolve("✅ JS Result: " + JSON.stringify(ev.data.result));
      });
      iframe.contentDocument.body.appendChild(script);
    } catch (e) {
      resolve("❌ Sandbox failed: " + e.message);
    }
  });
}
