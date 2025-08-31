/** 
 * This is the API endpoint for our chatbot
 * - The user prompt is wrapped within a template to satsfiy the acceptance criteria for iteration 1.
 * - The pages of the site are provided as a resource for the chatbot to use when answering questions.
*/

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const chatbot = new GoogleGenAI({});

// Pages we want the bot to suggest
const PAGE_MAPPINGS = [
  { keyword: "camping", page: "/camp", description: "Details on available camping sites and locations." },
  { keyword: "guide", page: "/guide", description: "Information on eco-friendly tips the camper can follow to be environmentally friendly." },
  { keyword: "home", page: "/", description: "The landing page for the website." },
];

// Post request to send the user's messages to the chatbot
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = 
    `You are a helpful website assistant.
    - Always answer in simple, easy-to-understand language.
    - Avoid technical jargon or overly complex terms.
    - If the question is about the website, suggest the most relevant page from this list:
    ${PAGE_MAPPINGS.map(p => `${p.keyword} → ${p.page} (${p.description})`).join("\n")}
    Question: ${message}`;

    const response = await chatbot.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text;

    return NextResponse.json({ answer: text });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
    )
  }
}