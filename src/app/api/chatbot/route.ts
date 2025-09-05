/** 
 * API endpoint for MYEcoLens chatbot
 * - Handles camping, weather, and platform queries
 * - Uses Google Gemini API with retry & fallback
 * - Specific campsite details are served directly from database
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
  { keyword: "camping", page: "/camp", description: "Camping Sites" },
  { keyword: "guide", page: "/guide", description: "Eco-friendly Tips." },
];

// Fallback responses if Gemini fails
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
      return response.text?.trim() ?? "";
    } catch (err: unknown) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, err);
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("All retry attempts failed");
}

// Type definitions for request body
interface ChatHistoryItem {
  sender: "user" | "bot";
  text: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
}

// Main POST handler
export async function POST(req: Request) {
  try {
    const { message, history } = (await req.json()) as ChatRequestBody;

    const historyText =
      history
        ?.map((m: ChatHistoryItem) => `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`)
        .join("\n") ?? "";

    // Check if the user is asking about a specific campsite by name
    const campsite = await prisma.campSite.findFirst({
      where: { name: { equals: message, mode: "insensitive" } },
    });

    if (campsite) {
      const details = `
        🏕️ [${campsite.name}](/camp/${campsite.id})
        🌲 Forest Type: ${campsite.forestType}
        📸 Attractions: ${campsite.tags}
        🕗 Opening Hours: ${campsite.openingTime}
        💲 Fees: ${campsite.fees}
      `;
      return NextResponse.json({ answer: details.trim() });
    }

    // If not asking about a specific campsite, detect state to give suggestions
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

    // Query up to 3 campsites for suggestions
    const campsites = await prisma.campSite.findMany({
      where: state ? { state: { equals: state, mode: "insensitive" } } : {},
      take: 3,
    });

    const campsiteList =
      campsites.length > 0
        ? campsites
            .map(
              (c) => `${c.name} → /camp/${c.id}`
            )
            .join("\n")
        : "No campsites found.";

    // Prepare prompt for Gemini
    const prompt = `
    ${historyText}

    Context: You are MYEcoLens Assistant, a friendly chatbot that helps users with eco-friendly camping in Malaysia.

    Guidelines:
    - Answer in simple, clear English, avoid jargons.
    - Keep responses concise (under 300 characters).
    - Use emojis sparingly to make responses friendly and engaging.
    - Use Markdown-style clickable links for pages, e.g., [Camping Sites](/camp)
    - When suggesting links, list each one on a new line, include an emoji before the link.
    - Suggest up to 3 campsites from the list below:
    ${campsiteList}
    - For platform queries, suggest the most relevant page:
    ${PAGE_MAPPINGS.map((p) => `${p.keyword} → ${p.page} (${p.description})`).join("\n")}
    - Always include a link to the campsite's detail page when mentioning it.
    - If the user asks about weather, suggest checking [MetMalaysia](https://www.met.gov.my/).

    User question: ${message}
    `;

    // Generate Gemini response
    let reply: string = "";
    try {
      reply = await generateWithRetry(prompt);
      if (!reply.trim()) reply = getFallbackResponse(message);
    } catch (err) {
      console.error("Gemini API Error:", err);
      reply = getFallbackResponse(message);
    }

    return NextResponse.json({ answer: reply });
  } catch (error) {
    console.error("Unexpected Error Occurred:", error);
    return NextResponse.json(
      { answer: "⚠️ Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
