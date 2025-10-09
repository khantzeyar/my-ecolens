import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

// === Type Definitions ===
interface RecommendationRequest {
  states: string[];
  attractions: string[];
  visitDate: string;
}

interface WeatherData {
  date: string;
  state: string;
  temperature_2m_mean: string | number;
  weather_desc: string;
}

interface Recommendation {
  campsite: {
    id: number;
    name: string;
    state: string;
    address: string;
    activities: string;
    tags: string;
    imageUrl: string;
    fees: string;
  };
  weather: {
    temperature: number;
    description: string;
  };
  matchScore: number;
  isPartialMatch: boolean;
}

// === Helper Functions ===

// Load weather data and filter by date
async function loadWeatherData(targetDate: string): Promise<Map<string, WeatherData>> {
  const jsonPath = path.join(process.cwd(), "public", "data", "weather_predictions.json");
  const weatherMap = new Map<string, WeatherData>();

  try {
    const fileContent = await fs.readFile(jsonPath, "utf-8");
    const jsonArray: WeatherData[] = JSON.parse(fileContent);

    for (const row of jsonArray) {
      if (row.date === targetDate) {
        weatherMap.set(row.state, row);
      }
    }
  } catch (error) {
    console.error("Error loading weather data:", error);
  }

  return weatherMap;
}

// Calculate match score
function calculateMatchScore(campsite: { tags: string | null }, userAttractions: string[]): number {
  const campsiteTags = (campsite.tags || "").toLowerCase();

  let matches = 0;
  for (const attraction of userAttractions) {
    if (campsiteTags.includes(attraction.toLowerCase())) {
      matches++;
    }
  }

  if (userAttractions.length === 0) return 0;
  return Math.round((matches / userAttractions.length) * 100);
}

// === Main Handler ===
export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { states, attractions, visitDate } = body;

    if (!states?.length || !attractions?.length || !visitDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Load weather data for the specified visit date
    const weatherMap = await loadWeatherData(visitDate);

    // 1. Try campsites in the selected states first
    const campsitesInSelected = await prisma.campSite.findMany({
      where: { state: { in: states } },
    });

    const scoredSelected = campsitesInSelected.map((c) => ({
      campsite: c,
      matchScore: calculateMatchScore(c, attractions),
    }));

    let candidates = scoredSelected
      .filter((s) => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // 2. If no candidates found, expand search to ALL states
    if (candidates.length === 0) {
      const allCampsites = await prisma.campSite.findMany();
      const scoredAll = allCampsites.map((c) => ({
        campsite: c,
        matchScore: calculateMatchScore(c, attractions),
      }));

      const scoredAllPos = scoredAll.filter((s) => s.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

      if (scoredAllPos.length > 0) {
        candidates = scoredAllPos;
      } else {
        const scoredAllAll = scoredAll.sort((a, b) => b.matchScore - a.matchScore);
        candidates = scoredAllAll.slice(0, 50);
      }
    }

    const goodWeatherRecs: Recommendation[] = [];
    const partialMatchRecs: Recommendation[] = [];

    const isInSelectedState = (stateName: string) => !!states.find((s) => s === stateName);

    // Evaluate each candidate
    for (const item of candidates) {
      const weather = weatherMap.get(item.campsite.state);

      const weatherDesc = weather?.weather_desc ?? undefined;
      const tempRaw = weather?.temperature_2m_mean;
      const temp = tempRaw === undefined || tempRaw === null ? null : Number(tempRaw);

      const isLowAttractionMatch = item.matchScore < 50;
      const isOutsideSelectedStates = !isInSelectedState(item.campsite.state);
      const isPartialMatch = isLowAttractionMatch || isOutsideSelectedStates;

      const rec: Recommendation = {
        campsite: {
          id: item.campsite.id,
          name: item.campsite.name,
          state: item.campsite.state,
          address: item.campsite.address,
          activities: item.campsite.activities || "", 
          tags: item.campsite.tags || "",
          imageUrl: item.campsite.imageUrl || "",
          fees: item.campsite.fees || "",
        },
        weather: {
          temperature: temp ?? 0,
          description: weatherDesc ?? "Unknown",
        },
        matchScore: item.matchScore,
        isPartialMatch,
      };

      if (!isPartialMatch) {
        goodWeatherRecs.push(rec);
      } else {
        partialMatchRecs.push(rec);
      }

      if (goodWeatherRecs.length >= 3) break;
    }

    // Select top 3 recommendations
    let finalRecommendations = goodWeatherRecs.slice(0, 3);
    if (finalRecommendations.length === 0) {
      finalRecommendations = partialMatchRecs.slice(0, 3);
    }
    if (finalRecommendations.length === 0) {
      finalRecommendations = candidates.slice(0, 3).map((item) => ({
        campsite: {
          id: item.campsite.id,
          name: item.campsite.name,
          state: item.campsite.state,
          address: item.campsite.address,
          activities: item.campsite.activities || "",
          tags: item.campsite.tags || "",
          imageUrl: item.campsite.imageUrl || "",
          fees: item.campsite.fees || "",
        },
        weather: {
          temperature: 0,
          description: "Unknown",
        },
        matchScore: item.matchScore,
        isPartialMatch: true,
      }));
    }

    // 3. Return the recommendation
    return NextResponse.json({ recommendations: finalRecommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
