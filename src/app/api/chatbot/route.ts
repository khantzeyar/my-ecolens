import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient, Prisma } from "@prisma/client";

// Initialise Gemini client
const chatbot = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Initialise Prisma client
const prisma = new PrismaClient();

// Pages for chatbot to suggest
const PAGE_MAPPINGS = [
  { keyword: "home", page: "/", description: "Landing Page." },
  { keyword: ["eco camping", "irresponsible camping"], page: "/why", description: "Impact of irresponsible camping and importance of eco camping" },
  { keyword: "campsites", page: "/camp", description: "All Camping Sites" },
  { keyword: "recommender", page: "/recommender", description: "Campsite Recommender" },
  { keyword: ["visit history", "favourited campsite"], page: "/footprints", description: "Favorited Campsites, Campsite Visit History" },
  { keyword: ["responsible camping", "what to pack", "packing checklist"], page: "/guide", description: "Eco-friendly Tips, Packing Checklist, Responsible Camping Guide" },
  { keyword: "plant identifier", page: "/plant", description: "Plant Identifier" },
  { keyword: ["insights", "forest loss trends"], page: "/insights", description: "Forest Loss Trends and Insights" },
];

// Helper: fallback responses if Gemini fails
function getFallbackResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  if (input.includes("camp")) return "🏕️ : [Camping Sites](/camp)";
  if (input.includes("tips")) return "🌱 : [Eco-friendly Tips](/guide)";
  if (input.includes("forest insights")) return "🌱 : [Forest Insights](/insights)";
  return `⚠️ Sorry, I am temporarily unavailable. Meanwhile, you can explore:
  - 🏕️ : [Camping Sites](/camp)
  - 🌍 : [Importance of Eco Camping](/why)
  - 🌱 : [Eco-friendly Tips](/guide)
  - 📊 : [Forest Insights](/insights)
  `;
}

// Retry logic for Gemini API
async function generateWithRetry(
  prompt: string,
  retries = 2,
  baseDelay = 1000
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await chatbot.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text?.trim() ?? "";
    } catch (err: unknown) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, err);
      if (attempt < retries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else throw err;
    }
  }
  throw new Error("All retry attempts failed");
}

// Helper: Fetch 5-day forecast from OpenWeatherMap API by coordinates
async function fetchWeatherForecastByCoords(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY;
    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_OPENWEATHERMAP_KEY");
      return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Forecast API failed:", await res.text());
      return null;
    }
    const data = await res.json();

    // Group forecast data by date
    const daily: Record<string, { temps: number[]; desc: string[] }> = {};
    data.list.forEach((entry: ForecastEntry) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!daily[date]) daily[date] = { temps: [], desc: [] };
      daily[date].temps.push(entry.main.temp);
      daily[date].desc.push(entry.weather[0].main);
    });

    // Prepare human-readable 5-day forecast
    const forecast = Object.keys(daily)
      .slice(0, 5)
      .map((date) => {
        const temps = daily[date].temps;
        const avgTemp = Math.round(
          temps.reduce((a, b) => a + b, 0) / temps.length
        );
        const descCounts = daily[date].desc.reduce(
          (acc: Record<string, number>, d: string) => {
            acc[d] = (acc[d] || 0) + 1;
            return acc;
          },
          {}
        );
        const mostCommonDesc = Object.entries(descCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];
        return `📅 ${date}: ${avgTemp}°C, ${mostCommonDesc}`;
      })
      .join("\n");

    return `🌤️ 5-day Weather Forecast:\n${forecast}`;
  } catch (err) {
    console.error("Forecast fetch error:", err);
    return null;
  }
}

// Chat history item type
interface ChatHistoryItem {
  sender: "user" | "bot";
  text: string;
}
// Request body type
interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
}
// Weather forecast entry type
interface ForecastEntry {
  dt_txt: string;
  main: { temp: number };
  weather: { main: string }[];
}

// Detect states
function detectStates(message: string): string[] {
  const stateRegex =
    /(Johor|Kedah|Kelantan|Melaka|Malacca|Negeri Sembilan|Pahang|Perak|Perlis|Pulau Pinang|Penang|Selangor|Terengganu)/gi;
  const matches = message.match(stateRegex);
  if (!matches) return [];

  return matches.map((s) => {
    const lower = s.toLowerCase();
    if (lower === "malacca") return "Melaka";
    if (lower === "penang") return "Pulau Pinang";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  });
}

// Detect attractions
function detectAttractions(message: string): string[] {
  const attractionKeywords = [
    "wildlife",
    "beach",
    "river",
    "lake",
    "waterfall",
    "cave",
  ];
  return attractionKeywords.filter((a) =>
    message.toLowerCase().includes(a.toLowerCase())
  );
}

// Determine AND/OR filter for attractions
function AndOrFilter(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes(" or ")) return false; // explicit OR
  if (lower.includes(" and ") || lower.includes("all")) return true; // explicit AND
  return false; // default OR
}

// Detect free/paid intent
function detectFeeFilter(message: string): "free" | "paid" | null {
  const lower = message.toLowerCase();
  if (lower.includes("free")) return "free";
  if (lower.includes("paid")) return "paid";
  return null;
}

// Main API handler
export async function POST(req: Request) {
  try {
    const { message, history } = (await req.json()) as ChatRequestBody;
    const lowerMsg = message.toLowerCase();

    // Format chat history for Gemini prompt
    const historyText =
      history
        ?.map(
          (m: ChatHistoryItem) =>
            `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`
        )
        .join("\n") ?? "";

    // Load all campsites from database
    const allCampsites = await prisma.campSite.findMany();

    // Check if user mentioned a specific campsite
    const campsite = allCampsites.find((c) =>
      message.toLowerCase().includes(c.name.toLowerCase())
    );

    // If user asks about a specific campsite, return details and weather
    if (campsite) {
      let weather: string | null = null;
      if (campsite.latitude && campsite.longitude) {
        weather = await fetchWeatherForecastByCoords(
          campsite.latitude,
          campsite.longitude
        );
      }

      const details = `
      🏕️ [${campsite.name}](/camp/${campsite.id})
      🌲 Forest Type: ${campsite.forestType}
      📸 Attractions: ${campsite.tags}
      🕗 Opening Hours: ${campsite.openingTime}
      💲 Fees: ${campsite.fees}

      ${weather ?? ""}
      `;
      return NextResponse.json({ answer: details.trim() });
    }

    // If user asks about weather but no campsite, prompt for campsite
    if (lowerMsg.includes("weather")) {
      return NextResponse.json({
        answer:
          "🌦️ Please tell me which campsite you want the weather forecast for.",
      });
    }

    // Detect states, attractions, fee filters
    const attractions = detectAttractions(message);
    const states = detectStates(message);
    const feeFilter = detectFeeFilter(message);

    // If multiple states mentioned, redirect to camping sites page
    if (states.length > 1) {
      return NextResponse.json({
        answer:
          "For multi-state filtering, please explore here: 🏕️ [Camping Sites](/camp)",
      });
    }

    // If user asks for paid campsites → redirect
    if (feeFilter === "paid") {
      return NextResponse.json({
        answer:
          "For paid campsites, please explore here: 🏕️ [Camping Sites](/camp)",
      });
    }

    // Determine AND/OR filter for attractions
    const andFilter = AndOrFilter(message);

    let attractionsFilter: Prisma.CampSiteWhereInput = {};
    if (attractions.length > 0) {
      if (andFilter) {
        attractionsFilter = {
          AND: attractions.map((attr) => ({
            tags: { contains: attr, mode: Prisma.QueryMode.insensitive },
          })),
        };
      } else {
        attractionsFilter = {
          OR: attractions.map((attr) => ({
            tags: { contains: attr, mode: Prisma.QueryMode.insensitive },
          })),
        };
      }
    }

    // Single state filter
    const stateFilter: Prisma.CampSiteWhereInput =
      states.length === 1
        ? {
            state: {
              equals: states[0],
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {};

    // Fee filter for free campsites
    const feeCondition: Prisma.CampSiteWhereInput =
      feeFilter === "free"
        ? {
            fees: {
              contains: "free admission",
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {};

    // Query campsites based on detected states, attractions, and fees
    const campsitesResult = await prisma.campSite.findMany({
      where: {
        AND: [stateFilter, attractionsFilter, feeCondition],
      },
      take: 5,
    });

    // If no campsites found
    if (campsitesResult.length === 0) {
      return NextResponse.json({
        answer:
          "⚠️ Sorry, no campsites match your criteria. You can explore all the camp sites at: 🏕️ [Camping Sites](/camp)",
      });
    }

    // Prepare list of campsites for Gemini
    const campsiteList = campsitesResult
      .map((c) => `🏕️ [${c.name}](/camp/${c.id})`)
      .join("\n");

    // Gemini prompt with context and rules
    const prompt = `
    ${historyText}

    Context: You are Campeco Assistant, a friendly chatbot that helps users with eco-friendly camping in Malaysia.

    Guidelines:
    - Answer in simple, clear English, avoid jargon.
    - Keep responses concise (under 300 characters).
    - Use emojis sparingly to make responses friendly and engaging.
    - Use Markdown links, e.g., [Camping Sites](/camp).
    - When suggesting links, list each one on a new line with an emoji.
    - Suggest up to 3 campsites from the list below:
    ${campsiteList}
    - For platform queries, suggest relevant page:
    ${PAGE_MAPPINGS.map((p) => `${p.keyword} → ${p.page} (${p.description})`).join("\n")}
    - Only provide weather info if linked to a specific campsite.
    - Do not provide generic state-level forecasts.

      User question: ${message}
    `;

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
