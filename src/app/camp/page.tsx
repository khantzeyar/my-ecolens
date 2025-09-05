/**
* This page has three sections:
* 1. Banner with background image and title
* 2. Filter panel (search, price filter, attraction filter, state filter)
* 3. Map (smaller size, not full screen)
*/
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Map so that Leaflet runs only on the client side
const Map = dynamic(() => import("../components/Map"), { ssr: false });

const CampPage = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);

  const states = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Perak",
    "Perlis",
    "Pulau Pinang",
    "Selangor",
    "Terengganu",
  ];

  const attractions = ["River", "Waterfall", "Wildlife", "Bird Watching"];

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
    <main className="pt-20">
      {/* Banner */}
      <section
        className="h-[300px] bg-cover bg-center flex flex-col items-center justify-center text-white relative"
        style={{
          backgroundImage: "url('/forest-banner.jpg')", // ensure this image is inside /public
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold">Discover Eco Camping Sites</h1>
          <p className="text-lg mt-2">
            Find, explore, and enjoy sustainable camping locations across
            Malaysia&apos;s pristine forests
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Filter</h2>

          {/* Three column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left: Search by camp name */}
            <div>
              <input
                type="text"
                placeholder="Search by camp name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Middle: Price filter */}
            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Prices</option>
                <option value="low">Low Budget</option>
                <option value="medium">Medium</option>
                <option value="high">Premium</option>
              </select>
            </div>

            {/* Right: Attraction filter */}
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

          {/* State checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
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

          <button
            onClick={resetFilters}
            className="mt-4 text-green-600 underline"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Map */}
      <section className="max-w-6xl mx-auto p-6">
        <div className="h-[500px] w-full border rounded-lg overflow-hidden shadow-md">
          <Map
            selectedStates={selectedStates}
            searchTerm={searchTerm}
            priceFilter={priceFilter}
            selectedAttractions={selectedAttractions}
          />
        </div>
      </section>
    </main>
  );
};

export default CampPage;
