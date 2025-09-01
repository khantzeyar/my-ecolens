/** 
 * This is the API endpoint for our chatbot
 * - The user prompt is wrapped within a template to satsfiy the acceptance criteria for iteration 1.
 * - The pages of the site are provided as a resource for the chatbot to use when answering questions.
 * - Has retry and fallback logic for resilience
*/

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialise Gemini client
const chatbot = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Pages for chatbot to suggest
const PAGE_MAPPINGS = [
  { keyword: "home", page: "/", description: "Landing page." },
  { keyword: "camping", page: "/camp", description: "Camping sites." },
  { keyword: "guide", page: "/guide", description: "Eco-friendly camping tips." },
];

// Hardcoded fallback responses (Used if Gemini fails)
function getFallbackResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  // Simple keyword matches
  if (input.includes("camp")) {
    return "🏕️ : [Camping Sites](/camp)";
  }
  if (input.includes("guide")) {
    return "🌱 : [Eco-friendly Tips](/guide)";
  }
  // General suggestion if no keywords matched
  return `⚠️ Sorry, I am temporarily unavailable to answer fully. Meanwhile, you can explore:
  - 🏕️ : [Camping Sites](/camp)
  - 🌱 : [Eco-friendly Tips](/guide)
  `;
}

// Retry logic for Gemini API
async function generateWithRetry(prompt: string, retries = 2, baseDelay = 1000): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await chatbot.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = response.text ?? '';
      return text.trim();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Gemini attempt ${attempt + 1} failed:`, err.message);
      } else {
        console.error(`Gemini attempt ${attempt + 1} failed:`, err);
      }
      // Retry with exponential backoff and jitter
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("All retry attempts failed");
}

// Main POST handler for Gemini API
export async function POST(req: Request) {
  try {
    // Extract user message
    const { message } = await req.json();

    // Prompt for Gemini
    const prompt = `
    Context: You are MYEcoLens Assistant, a friendly chatbot that helps users with eco-friendly camping in Malaysia. 
    
    Guidelines:
    - Answer in simple, clear English, avoid jargons.
    - Keep responses concise (under 300 characters).
    - If the question is about the platform, suggest the most relevant page from this list:
    ${PAGE_MAPPINGS.map(p => `${p.keyword} → ${p.page} (${p.description})`).join("\n")}
    - Use Markdown-style clickable links for pages, e.g., [Camping Sites](/camp)
    - When suggesting links, list each one on a new line, include an emoji before the link.
    - Use emojis sparingly to make responses friendly and engaging.

    User question: ${message}
    `;

    let reply = "";
    try {
      // Call Gemini with retry logic
      reply = await generateWithRetry(prompt);
      // If Gemini gives nothing, fallback to hardcoded response
      if (!reply.trim()) {
        reply = getFallbackResponse(message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Gemini API Error:", err.message);
      else console.error("Gemini API Error:", err);
      reply = getFallbackResponse(message);
    }
    // Return final chatbot answer
    return NextResponse.json({ answer: reply });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("Unexpected Error Occurred:", error.message);
    else console.error("Unexpected Error Occurred:", error);
    return NextResponse.json(
      { answer: "⚠️ Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
