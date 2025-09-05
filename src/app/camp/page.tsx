"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Map so that Leaflet runs only on the client side
const Map = dynamic(() => import("../components/Map"), { ssr: false });

// Type for campsite fetched from API
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

// Props for CampPage - Updated to match Next.js App Router expectations
interface CampPageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string>>;
}

// Price filter options
type PriceFilter = "all" | "low" | "medium" | "high";

const CampPage: React.FC<CampPageProps> = ({ params, searchParams }) => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>([]);

  const states: string[] = [
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

  // Helper function to fetch campsites
  const fetchCampsites = async (): Promise<CampSite[]> => {
    const res = await fetch("/api/campsites");
    if (!res.ok) throw new Error("Failed to fetch campsites");
    const data = (await res.json()) as CampSite[];
    return data;
  };

  // Handle async params and searchParams if needed
  useEffect(() => {
    const handleAsyncParams = async () => {
      if (params) {
        const resolvedParams = await params;
        // Handle resolved params if needed
        console.log("Resolved params:", resolvedParams);
      }
      
      if (searchParams) {
        const resolvedSearchParams = await searchParams;
        // Handle resolved search params if needed
        console.log("Resolved search params:", resolvedSearchParams);
      }
    };

    handleAsyncParams();
  }, [params, searchParams]);

  // Fetch all attractions
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
    <main className="pt-20">
      {/* Banner */}
      <section
        className="h-[300px] bg-cover bg-center flex flex-col items-center justify-center text-white relative"
        style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
      >
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold">Discover Camping Sites</h1>
          <p className="text-lg mt-2">
            Find, explore, and enjoy sustainable camping locations across
            Malaysia&apos;s pristine forests
          </p>
        </div>
      </section>

      {/* Filter Panel */}
      <section className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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
            <div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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