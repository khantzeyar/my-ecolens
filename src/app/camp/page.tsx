"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MultiValue } from "react-select";

// Import react-select dynamically to avoid hydration mismatch
// ⚠️ 动态引入的 Select 没有泛型签名，不能写 <{ value: string; label: string }>
const Select = dynamic(() => import("react-select"), { ssr: false });
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

type PriceFilter = "all" | "free" | "paid";

const CampPage: React.FC = () => {
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
    "W.P. Kuala Lumpur",
  ];

  const stateOptions = states.map((state) => ({ value: state, label: state }));

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

  const toggleAttraction = (attr: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Banner */}
      <section className="h-[233px] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-green-700 drop-shadow-md mb-2">
          Discover Camping Sites
        </h1>
        <p className="text-lg text-green-800 drop-shadow-sm">
          Find, explore, and enjoy sustainable camping locations across
          Malaysia&apos;s pristine forests
        </p>
      </section>

      {/* Filter Panel */}
      <section className="max-w-7xl mx-auto px-6 -mt-2">
        <div className="bg-white/70 shadow-md rounded-lg p-6 backdrop-blur-md">
          {/* Row 1: Search + Select States + Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-700">
                Search
              </h3>
              <input
                type="text"
                placeholder="Search by camp name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[38px] p-2 border rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-transparent"
              />
            </div>

            {/* Select States */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-700">
                Select States
              </h3>
              <Select
                instanceId="states-select"
                isMulti
                options={stateOptions}
                value={stateOptions.filter((opt) =>
                  selectedStates.includes(opt.value)
                )}
                // ✅ 用 unknown + 类型断言，避免泛型报错
                onChange={(selected: unknown) =>
                  setSelectedStates(
                    (selected as MultiValue<{ value: string; label: string }>)?.map(
                      (opt) => opt.value
                    ) ?? []
                  )
                }
                placeholder="Choose states..."
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                    height: "38px",
                    borderRadius: "0.375rem",
                    borderColor: "#000000",
                    boxShadow: "none",
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                    "&:hover": { borderColor: "#000000" },
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "38px",
                    padding: "0 8px",
                  }),
                  input: (base) => ({
                    ...base,
                    margin: 0,
                    padding: 0,
                    color: "#374151",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "38px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#374151",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#d1fae5",
                  }),
                  indicatorSeparator: () => ({ display: "none" }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, maxHeight: 400 }),
                }}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-700">
                Price
              </h3>
              <select
                value={priceFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFilter(e.target.value as PriceFilter)
                }
                className="w-full h-[38px] p-2 border border-black rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-transparent"
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Row 2: Attractions */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-green-700">
              Attractions
            </h3>
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
      </section>

      {/* Map */}
      <section className="max-w-7xl mx-auto px-6 mt-4">
        <div className="h-[600px] w-full border rounded-lg overflow-hidden shadow-md bg-white/60 backdrop-blur-sm">
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
