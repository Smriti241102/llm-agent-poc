import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors({
  origin: "*"   // or "https://automatic-chainsaw-g94g9xg6wwcwpx7-40597.app.github.dev"
}));

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch("http://aipipe.org/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy request failed" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
