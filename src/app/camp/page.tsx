"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

interface CampSite {
  id: string;
  name: string;
  tags?: string;
  state: string;
  type?: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  fees?: string;
  forestType?: string;
  contact?: string;
}

interface CampPageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string>>;
}

type PriceFilter = "all" | "low" | "medium" | "high";

type WeatherDay = {
  date: string;
  temp: number;
  description: string;
  icon: string;
};

const CampPage: React.FC<CampPageProps> = ({ params, searchParams }) => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);

  const states: string[] = [
    "Johor","Kedah","Kelantan","Melaka","Negeri Sembilan",
    "Pahang","Perak","Perlis","Pulau Pinang","Selangor","Terengganu",
  ];

  const fetchCampsites = async (): Promise<CampSite[]> => {
    const res = await fetch("/api/campsites");
    if (!res.ok) throw new Error("Failed to fetch campsites");
    return (await res.json()) as CampSite[];
  };

  useEffect(() => {
    fetchCampsites()
      .then((data) => {
        const allTags: string[] = Array.from(
          new Set(
            data.flatMap((site) =>
              site.tags ? site.tags.split(",").map((t) => t.trim()) : []
            )
          )
        );
        setAttractions(allTags);
      })
      .catch((err) => console.error("Error fetching attractions:", err));
  }, []);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const toggleAttraction = (attr: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  const resetFilters = () => {
    setSelectedStates([]);
    setSearchTerm("");
    setPriceFilter("all");
    setSelectedAttractions([]);
  };

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Banner */}
      <section className="h-[350px] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-green-700 drop-shadow-md mb-2">
          Discover Camping Sites
        </h1>
        <p className="text-lg text-green-800 drop-shadow-sm">
          Find, explore, and enjoy sustainable camping locations across
          Malaysia&apos;s pristine forests
        </p>
      </section>

      {/* Filter + Weather Side by Side */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6 -mt-2">
        {/* Filter Panel */}
        <div className="bg-white/70 shadow-md rounded-lg p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-700">Search</h3>
              <input
                type="text"
                placeholder="Search by camp name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-700">Price</h3>
              <select
                value={priceFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFilter(e.target.value as PriceFilter)
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Prices</option>
                <option value="low">Low Budget</option>
                <option value="medium">Medium</option>
                <option value="high">Premium</option>
              </select>
            </div>

            {/* Attractions */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold mb-2 text-green-700">Attractions</h3>
              <div className="flex flex-wrap gap-2">
                {attractions.map((attr) => (
                  <button
                    key={attr}
                    type="button"
                    onClick={() => toggleAttraction(attr)}
                    className={`px-3 py-1 rounded-full text-green-700 ${
                      selectedAttractions.includes(attr)
                        ? "bg-green-300"
                        : "bg-green-100"
                    }`}
                  >
                    {attr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* States */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-green-700">States</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              {states.map((state) => (
                <label key={state} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => toggleState(state)}
                    className="accent-green-600"
                  />
                  <span>{state}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={resetFilters} className="mt-4 text-green-600 underline">
            Reset
          </button>
        </div>

        {/* Weather Forecast */}
        <div className="relative p-6 rounded-lg shadow-md bg-white/70 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2 text-green-900">
            Weather Forecast
          </h3>

          {weather.length === 0 ? (
            <p className="text-green-800">
              Click a campsite marker to view the weather forecast.
            </p>
          ) : (
            <div className="space-y-3">
              {/* 第一行：3 个 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weather.slice(0, 3).map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-2 bg-white/80 rounded-lg shadow"
                  >
                    <span className="text-sm font-medium text-gray-800">{day.date}</span>
                    <img src={day.icon} alt={day.description} className="w-14 h-14 my-1" />
                    <span className="text-sm text-gray-800">{day.temp}°C</span>
                    <span className="text-xs text-gray-600">{day.description}</span>
                  </div>
                ))}
              </div>

              {/* 第二行：2 个，居中 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 justify-center">
                {weather.slice(3, 5).map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-2 bg-white/80 rounded-lg shadow"
                  >
                    <span className="text-sm font-medium text-gray-800">{day.date}</span>
                    <img src={day.icon} alt={day.description} className="w-14 h-14 my-1" />
                    <span className="text-sm text-gray-800">{day.temp}°C</span>
                    <span className="text-xs text-gray-600">{day.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <section className="max-w-7xl mx-auto px-6 mt-4">
        <div className="h-[600px] w-full border rounded-lg overflow-hidden shadow-md bg-white/60 backdrop-blur-sm">
          <Map
            selectedStates={selectedStates}
            searchTerm={searchTerm}
            priceFilter={priceFilter}
            selectedAttractions={selectedAttractions}
            onWeatherUpdate={setWeather}
          />
        </div>
      </section>
    </main>
  );
};

export default CampPage;
