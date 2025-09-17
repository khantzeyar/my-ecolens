"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import WeatherCard from "@/app/components/WeatherCard";
import dynamic from "next/dynamic";

// 动态导入 Map 组件
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

        const campRes = await fetch(`/api/campsites/${id}`);
        const campData = await campRes.json();
        setCamp(campData);

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
        <Link 
          href="/camp" 
          className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors mb-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Camp Sites
        </Link>

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
              {/* Header Section */}
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

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Image */}
                  <div className="w-full">
                    {camp.imageUrl ? (
                      <img
                        src={camp.imageUrl}
                        alt={camp.name}
                        className="rounded-2xl shadow-xl w-full h-72 object-cover ring-1 ring-gray-200/50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 ring-1 ring-gray-200">
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Location
                    </h2>
                    <p className="text-gray-900 font-medium text-lg">{camp.state}</p>
                    <p className="text-gray-500 mt-2 leading-relaxed">{camp.address}</p>
                  </div>

                  {/* Weather */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      Weather Forecast
                    </h3>
                    {weatherData.length > 0 ? (
                      <WeatherCard weather={weatherData} />
                    ) : (
                      <p className="text-gray-400 text-sm">Weather data not available</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Entry Fee */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-fit">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      Entry Fee
                    </h2>
                    {camp.fees ? (
                      <div className="space-y-3 text-gray-700">
                        {camp.fees
                          .split(/[,|]/)
                          .map((fee) => fee.trim())
                          .filter(Boolean)
                          .map((fee, idx) => {
                            const isHeader = /(citizen|admission)/i.test(fee);
                            return (
                              <p
                                key={idx}
                                className={
                                  isHeader
                                    ? "text-base font-semibold text-gray-900 mt-4 first:mt-0 pb-1 border-b border-gray-100"
                                    : "pl-6 text-sm text-gray-600 relative before:content-['•'] before:absolute before:left-2 before:text-gray-400"
                                }
                              >
                                {fee}
                              </p>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-gray-500">Free / Not specified</p>
                    )}
                  </div>

                  {/* Opening Hours */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-fit">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Opening Hours
                    </h2>
                    <p className="text-gray-700 text-base leading-relaxed">{camp.openingTime || "Not available"}</p>
                  </div>

                  {/* Contact */}
                  <div className="p-8 bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-fit">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      Contact
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-gray-500 font-medium w-20 flex-shrink-0">Phone:</span>
                        <span className="text-gray-700">{camp.phone || "N/A"}</span>
                      </div>
                      {camp.website && (
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium w-20 flex-shrink-0">Website:</span>
                          <a 
                            href={camp.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-600 transition-colors break-all"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Map - Centered */}
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
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Map not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50/80">
                    <div className="flex items-center justify-between">
                      <div>
                        {camp.latitude && camp.longitude ? (
                          <>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Coordinates:</span> {camp.latitude?.toFixed(4)}, {camp.longitude?.toFixed(4)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {camp.state}, Malaysia
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Location coordinates not available</p>
                        )}
                      </div>
                      {camp.latitude && camp.longitude && (
                        <Link
                          href={`https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center shadow-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open in Maps
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 text-center">
                <Link
                  href="/guide"
                  className="inline-block px-10 py-4 bg-gray-900 text-white text-lg font-medium rounded-2xl shadow-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go to Camping Guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Forest Insight</h3>
                <p className="text-gray-500">Forest data and insights will be displayed here.</p>
                <p className="text-sm text-gray-400 mt-2">Connect to your forest data source to view analytics.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}