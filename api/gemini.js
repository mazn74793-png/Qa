import { GoogleGenerativeAI } from "@google/genai";

// Basic in-memory rate limiting (per Vercel instance)
const rateLimit = new Map();
const LIMIT = 10;
const WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  // 1. Rate Limiting check
  const ip = req.headers["x-forwarded-for"] || "anonymous";
  const now = Date.now();
  const userData = rateLimit.get(ip) || { count: 0, start: now };

  if (now - userData.start > WINDOW) {
    userData.count = 1;
    userData.start = now;
  } else {
    userData.count++;
  }
  rateLimit.set(ip, userData);

  if (userData.count > LIMIT) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  // 2. Auth check (Optionally check for a session or specific header if needed)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ error: "AI service configuration error" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to generate content from AI" });
  }
}
