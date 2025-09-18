"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import WeatherCard from "@/app/components/WeatherCard";
import InsightsPanel from "@/app/components/InsightsPanel";
import dynamic from "next/dynamic";
import { transformForestDataByState } from "@/app/utils/transformForestData";

// ✅ state-level forest data
const forestData = transformForestDataByState();

// ✅ dynamic import Map component
const Map = dynamic(() => import("@/app/components/Map"), { ssr: false });

interface CampSite {
  id: number;
  name: string;
  type?: string;
  state: string;
  address?: string;
  phone?: string;
  website?: string;
  openingTime?: string;
  fees?: string;
  forestType?: string;
  tags?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface CampDetailProps {
  params: Promise<{ id: string }>;
}

type TabType = "detail" | "insight";

export default function CampDetail({ params }: CampDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("detail");
  const [camp, setCamp] = useState<CampSite | null>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        // ✅ fetch campsite data
        const campRes = await fetch(`/api/campsites/${id}`);
        const campData = await campRes.json();
        setCamp(campData);

        // ✅ fetch weather data
        if (campData.latitude && campData.longitude) {
          const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY;
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${campData.latitude}&lon=${campData.longitude}&appid=${API_KEY}&units=metric`
          );
          const weatherApiData = await weatherRes.json();

          if (weatherApiData.list) {
            const processedWeatherData = weatherApiData.list
              .filter((_: any, idx: number) => idx % 8 === 0)
              .slice(0, 5)
              .map((d: any) => {
                const rawDate = new Date(d.dt * 1000);
                const formattedDate = rawDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "numeric",
                });
                const description =
                  d.weather[0].description.charAt(0).toUpperCase() +
                  d.weather[0].description.slice(1);

                return {
                  date: formattedDate,
                  temp: d.main.temp,
                  description,
                  icon: d.weather[0].icon,
                };
              });
            setWeatherData(processedWeatherData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Camp not found</h1>
          <Link href="/camp" className="text-green-600 underline">
            Back to Camp Sites
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back button */}
        <Link
          href="/camp"
          className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors mb-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Camp Sites
        </Link>

        {/* Tab switch */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex w-fit mx-auto">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === "detail"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Detail Information
            </button>
            <button
              onClick={() => setActiveTab("insight")}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === "insight"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Forest Insight
            </button>
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8">
          {activeTab === "detail" ? (
            <div className="space-y-8">
              {/* Title and tags */}
              <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{camp.name}</h1>
                  <p className="text-lg text-gray-600">{camp.type}</p>
                </div>
                {camp.tags && (
                  <div className="flex flex-wrap gap-2 lg:mt-2">
                    {camp.tags.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full whitespace-nowrap"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left side: Image + Weather */}
                <div className="space-y-8">
                  <div className="w-full">
                    {camp.imageUrl ? (
                      <img
                        src={camp.imageUrl}
                        alt={camp.name}
                        className="rounded-2xl shadow-xl w-full h-72 object-cover ring-1 ring-gray-200/50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 ring-1 ring-gray-200">
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Location</h2>
                    <p className="text-gray-900 font-medium text-lg">{camp.state}</p>
                    <p className="text-gray-500 mt-2 leading-relaxed">{camp.address}</p>
                  </div>

                  {/* Weather */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Weather Forecast</h3>
                    {weatherData.length > 0 ? (
                      <WeatherCard weather={weatherData} />
                    ) : (
                      <p className="text-gray-400 text-sm">Weather data not available</p>
                    )}
                  </div>
                </div>

                {/* Right side: Fees + Hours + Contact */}
                <div className="space-y-8">
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Entry Fee</h2>
                    {camp.fees ? (
                      <div className="space-y-3 text-gray-700">
                        {camp.fees
                          .split(/[,|]/)
                          .map((fee) => fee.trim())
                          .filter(Boolean)
                          .map((fee, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              {fee}
                            </p>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Free / Not specified</p>
                    )}
                  </div>

                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Opening Hours</h2>
                    <p className="text-gray-700">{camp.openingTime || "Not available"}</p>
                  </div>

                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Contact</h2>
                    <p className="text-gray-700">Tel: {camp.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-800 text-center">Location Map</h3>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200/60 max-w-3xl mx-auto">
                  <div className="h-[320px] w-full relative">
                    {camp.latitude && camp.longitude ? (
                      <Map
                        selectedStates={[camp.state]}
                        searchTerm={camp.name}
                        priceFilter="all"
                        selectedAttractions={[]}
                        singleCampMode={true}
                        centerLat={camp.latitude}
                        centerLng={camp.longitude}
                        defaultZoom={10}
                        focusOnSingleLocation={true}
                        enableInteraction={true}
                        allowPageScroll={true}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        <p className="text-sm text-gray-500">Map not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-16 text-center">
                <Link
                  href="/guide"
                  className="inline-block px-10 py-4 bg-gray-900 text-white text-lg font-medium rounded-2xl shadow-lg hover:bg-gray-800"
                >
                  Go to Camping Guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ✅ Embedded InsightsPanel */}
              <InsightsPanel
                mode="embed"
                data={{
                  name: camp.state,
                  yearly_loss: forestData[camp.state]?.yearly_loss || {},
                  cumulative_loss_percent:
                    forestData[camp.state]?.cumulative_loss_percent || 0,
                  rank: forestData[camp.state]?.rank,
                  totalRegions: forestData[camp.state]?.totalRegions,
                }}
              />

              {/* ✅ Go to Forest 按钮 */}
              <div className="mt-12 text-center">
                <Link
                  href="/forest"
                  className="inline-block px-10 py-4 bg-green-700 text-white text-lg font-medium rounded-2xl shadow-lg hover:bg-green-800 transition"
                >
                  Go to Forest
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
