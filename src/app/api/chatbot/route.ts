/** 
 * This is the API endpoint for our chatbot
 * - The user prompt is wrapped within a template to satsfiy the acceptance criteria for iteration 1.
 * - The pages of the site are provided as a resource for the chatbot to use when answering questions.
 * - Has retry and fallback logic for resilience
*/

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

// Initialise Gemini client
const chatbot = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Initialise Prisma client
const prisma = new PrismaClient();

// Pages for chatbot to suggest
const PAGE_MAPPINGS = [
  { keyword: "home", page: "/", description: "Landing Page." },
  { keyword: "camping", page: "/camp", description: "Camping Sites"},
  { keyword: "guide", page: "/guide", description: "Eco-friendly Tips." },
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
    // Extract user message and conversation history
    const { message, history } = await req.json();

    // Format history into plain text
    const historyText =
      history
        ?.map((m: any) => `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`)
        .join("\n") ?? "";

    // Detect state from user question
    const stateRegex =
      /(Johor|Kedah|Kelantan|Melaka|Malacca|Negeri Sembilan|Pahang|Perak|Perlis|Pulau Pinang|Penang|Selangor|Terengganu)/i;
    const stateMatch = message.match(stateRegex);
    let state = stateMatch ? stateMatch[1] : null;

    // Normalise aliases
    if (state) {
      const lower = state.toLowerCase();
      if (lower === "malacca") state = "Melaka";
      if (lower === "penang") state = "Pulau Pinang";
    }

    // Query campsites from database
    const campsites = await prisma.campSite.findMany({
      where: state
        ? { state: { equals: state, mode: "insensitive" } }
        : {},
      take: 3,
    });

    // Format detailed campsite info
const campsiteList =
  campsites.length > 0
    ? campsites
        .map(
          (c) => `
          Name: ${c.name}
          State: ${c.state}
          Type: ${c.type}
          Attractions: ${c.tags}
          Address: ${c.address}
          Phone: ${c.phone}
          Opening Hours: ${c.openingTime}
          Fees: ${c.fees}
          Forest Type: ${c.forestType}
          Contact: ${c.contact}
          Link: /camp/${c.id}
        `)
        .join("\n\n")
    : "No campsites found.";

    // Prompt for Gemini
    const prompt = `
    ${historyText}

    Context: You are MYEcoLens Assistant, a friendly chatbot that helps users with eco-friendly camping in Malaysia. 
        
    Guidelines:
    - Answer in simple, clear English, avoid jargons.
    - Keep responses concise (under 300 characters).
    - Use emojis sparingly to make responses friendly and engaging.
    - Use Markdown-style clickable links for pages, e.g., [Camping Sites](/camp)
    - When suggesting links, list each one on a new line, include an emoji before the link.
    - If the question is about the platform, suggest the most relevant page from this list:
    ${PAGE_MAPPINGS.map(p => `${p.keyword} → ${p.page} (${p.description})`).join("\n")}
    - For camping queries: suggest up to 3 campsites from the list below:
    ${campsiteList}
    - When camp site details are asked, use the exact details below. Do not say "not sure" if the field is provided.
    ${campsiteList}
    - Always include a link to the campsite's detail page when mentioning it.  
    - If the user asks about weather, explain that you cannot provide real-time forecasts. Instead, suggest checking [MetMalaysia](https://www.met.gov.my/) for accurate weather updates.

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
