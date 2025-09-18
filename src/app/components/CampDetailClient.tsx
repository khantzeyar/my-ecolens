"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import WeatherCard from "@/app/components/WeatherCard";

// ✅ 动态导入 Map 组件（避免 SSR 报错）
const Map = dynamic(() => import("@/app/components/Map"), { ssr: false });

type TabType = "detail" | "insight";

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
  tags?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface CampDetailClientProps {
  camp: CampSite;
  weatherData: {
    date: string;
    temp: number;
    description: string;
    icon: string;
  }[];
}

export default function CampDetailClient({ camp, weatherData }: CampDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("detail");

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 返回按钮 */}
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

        {/* Tab 选择 */}
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

        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8">
          {activeTab === "detail" ? (
            <div className="space-y-8">
              {/* 标题 + 标签 */}
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
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 图片 + 信息 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 图片 */}
                <div className="w-full">
                  {camp.imageUrl ? (
                    <Image
                      src={camp.imageUrl}
                      alt={camp.name}
                      width={800}
                      height={400}
                      className="rounded-2xl shadow-xl w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* 右边详情 */}
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-white">
                    <h2 className="text-xl font-semibold mb-2">Location</h2>
                    <p className="text-gray-900">{camp.state}</p>
                    <p className="text-gray-500">{camp.address}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <h2 className="text-xl font-semibold mb-2">Contact</h2>
                    <p className="text-gray-700">Tel: {camp.phone || "N/A"}</p>
                    {camp.website && (
                      <a
                        href={camp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <h2 className="text-xl font-semibold mb-2">Entry Fee</h2>
                    <p className="text-gray-700">{camp.fees || "Free / Not specified"}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <h2 className="text-xl font-semibold mb-2">Opening Hours</h2>
                    <p className="text-gray-700">{camp.openingTime || "Not available"}</p>
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Weather Forecast</h3>
                {weatherData.length > 0 ? (
                  <WeatherCard weather={weatherData} />
                ) : (
                  <p className="text-gray-500">Weather data not available</p>
                )}
              </div>

              {/* 地图 */}
              {camp.latitude && camp.longitude && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold mb-8 text-gray-800 text-center">
                    Location Map
                  </h3>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200/60 max-w-3xl mx-auto">
                    <div className="h-[320px] w-full relative">
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
                    </div>
                  </div>
                </div>
              )}

              {/* 按钮 */}
              <div className="mt-12 text-center">
                <Link
                  href="/guide"
                  className="inline-block px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-green-700"
                >
                  Go to Camping Guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-4">Forest Insight</h3>
              <p className="text-gray-500">Forest data and insights will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
