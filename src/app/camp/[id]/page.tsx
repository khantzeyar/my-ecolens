"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WeatherCard from "@/app/components/WeatherCard";
import InsightsPanel from "@/app/components/InsightsPanel";
import dynamic from "next/dynamic";
import { transformForestDataByState } from "@/app/utils/transformForestData";
import statePredictions from "@/app/data/state_tree_loss_predictions.json";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const forestData = transformForestDataByState();
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

interface WeatherData {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

interface WeatherApiItem {
  dt: number;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

interface StatePrediction {
  state: string;
  year: number;
  tc_loss_pred: number;
}

type TabType = "detail" | "insight";

const fakeCrowdPrediction = ["Low", "Medium", "High"];
const fakeEnvRisk = ["Low Risk ✅", "Medium Risk ⚠️", "High Risk ❌"];

export default function CampDetail({ params }: CampDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("detail");
  const [camp, setCamp] = useState<CampSite | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const campRes = await fetch(`/api/campsites/${id}`);
        const campData: CampSite = await campRes.json();
        setCamp(campData);

        if (campData.latitude && campData.longitude) {
          const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY;
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${campData.latitude}&lon=${campData.longitude}&appid=${API_KEY}&units=metric`
          );
          const weatherApiData: { list?: WeatherApiItem[] } =
            await weatherRes.json();

          if (weatherApiData.list) {
            const processedWeatherData: WeatherData[] = weatherApiData.list
              .filter((_, idx: number) => idx % 8 === 0)
              .slice(0, 5)
              .map((d: WeatherApiItem) => {
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

  // 合并历史和预测数据
  const mergedYearlyLoss: Record<number, number> = {
    ...(forestData[camp.state]?.yearly_loss || {}),
    ...Object.fromEntries(
      (statePredictions as StatePrediction[])
        .filter((p) => p.state === camp.state)
        .map((p) => [p.year, p.tc_loss_pred])
    ),
  };

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/camping.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/camp"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6 bg-white/90 px-4 py-2 rounded-lg shadow-md"
        >
          ← Back to Camp Sites
        </Link>

        {/* Tab switch */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex w-fit mx-auto">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-8 py-3 rounded-full font-medium ${
                activeTab === "detail"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Detail Information
            </button>
            <button
              onClick={() => setActiveTab("insight")}
              className={`px-8 py-3 rounded-full font-medium ${
                activeTab === "insight"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Forest Insight
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/95 rounded-2xl p-8 shadow-xl">
          {activeTab === "detail" ? (
            // ✅ 详情页
            <div className="space-y-8">
              {/* 标题 */}
              <div className="flex flex-col lg:flex-row justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{camp.name}</h1>
                  <p className="text-gray-600">{camp.type}</p>
                </div>
                {camp.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {camp.tags.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left */}
                <div className="space-y-8">
                  <Image
                    src={camp.imageUrl || "https://via.placeholder.com/800x400"}
                    alt={camp.name}
                    width={800}
                    height={400}
                    className="rounded-xl shadow-lg object-cover w-full h-72"
                  />

                  {/* Location */}
                  <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Location</h2>
                    <p className="font-medium">{camp.state}</p>
                    <p className="text-gray-500">{camp.address}</p>
                    <p className="mt-3 text-sm">
                      🌱 Environmental Sensitivity:{" "}
                      <span className="font-medium text-red-600">
                        {fakeEnvRisk[Math.floor(Math.random() * 3)]}
                      </span>
                    </p>
                  </div>

                  {/* Entry Fee */}
                  <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Entry Fee</h2>
                    {camp.fees ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        {camp.fees
                          .split(/[,|]/)
                          .map((fee) => fee.trim())
                          .filter(Boolean)
                          .map((fee, idx) => (
                            <li key={idx}>{fee}</li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Free / Not specified</p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-8">
                  {/* Plan your visit */}
                  <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold">Plan Your Visit</h3>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Select a date"
                      className="border p-2 rounded-md w-full"
                    />
                    {selectedDate && (
                      <p className="text-sm">
                        👥 Crowd Prediction:{" "}
                        <span className="font-medium">
                          {fakeCrowdPrediction[Math.floor(Math.random() * 3)]}
                        </span>
                      </p>
                    )}
                    {weatherData.length > 0 ? (
                      <WeatherCard weather={weatherData} />
                    ) : (
                      <p className="text-gray-400 text-sm">Weather not available</p>
                    )}
                  </div>

                  <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Opening Hours</h2>
                    <p>{camp.openingTime || "Not available"}</p>
                  </div>

                  <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Contact</h2>
                    <p>{camp.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4 text-center">Location Map</h3>
                <div className="h-[320px] bg-gray-100 rounded-xl overflow-hidden">
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
                      enableInteraction={true}
                      allowPageScroll={true}
                    />
                  ) : (
                    <p className="text-center text-gray-500 pt-12">Map not available</p>
                  )}
                </div>

                {/* ✅ 推荐按钮 */}
                <div className="mt-6 text-center">
                  <Link
                    href="/recommend"
                    className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Go to Recommendations →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // ✅ 精简版 Forest Insight
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Forest Insight – {camp.state}
              </h2>
              <p className="text-gray-600">
                Over the past 20 years, forest loss in {camp.state} reached{" "}
                <span className="font-semibold text-red-600">
                  {forestData[camp.state]?.cumulative_loss_percent?.toFixed(1) || 0}%
                </span>{" "}
                of its total forest area.
              </p>

              {/* 微型趋势图 */}
              <div className="max-w-lg mx-auto">
                <InsightsPanel
                  mode="mini"
                  data={{
                    name: camp.state,
                    yearly_loss: mergedYearlyLoss,
                    cumulative_loss_percent: forestData[camp.state]?.cumulative_loss_percent, // ✅ 传递
                  }}
                />
              </div>

              {/* CTA 按钮 */}
              <div className="mt-6 text-center">
                <Link
                  href="/insights"
                  className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  View Full Forest Insights →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
