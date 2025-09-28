"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface CampSite {
  id: string;
  name: string;
  tags?: string;
  activities?: string; // ✅ 新增 activities
  state: string;
  type?: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  fees?: string;
  forestType?: string;
  contact?: string;
  imageUrl?: string;
}

type PriceFilter = "all" | "free" | "paid";

const CampPage: React.FC = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]); // ✅ 新增
  const [attractions, setAttractions] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]); // ✅ 新增
  const [campsites, setCampsites] = useState<CampSite[]>([]);
  const [filteredCampsites, setFilteredCampsites] = useState<CampSite[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ 删除 "W.P. Kuala Lumpur"
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

  const fetchCampsites = async (): Promise<CampSite[]> => {
    const res = await fetch("/api/campsites");
    if (!res.ok) throw new Error("Failed to fetch campsites");
    return (await res.json()) as CampSite[];
  };

  useEffect(() => {
    setLoading(true);
    fetchCampsites()
      .then((data) => {
        setCampsites(data);
        setFilteredCampsites(data);

        // ✅ 收集 tags
        const allTags: string[] = Array.from(
          new Set(
            data.flatMap((site) =>
              site.tags ? site.tags.split(",").map((t) => t.trim()) : []
            )
          )
        );
        setAttractions(allTags);

        // ✅ 收集 activities
        const allActs: string[] = Array.from(
          new Set(
            data.flatMap((site) =>
              site.activities ? site.activities.split(",").map((a) => a.trim()) : []
            )
          )
        );
        setActivities(allActs);
      })
      .catch((err) => console.error("Error fetching campsites:", err))
      .finally(() => setLoading(false));
  }, []);

  // 过滤逻辑
  useEffect(() => {
    let filtered = campsites;

    if (searchTerm) {
      filtered = filtered.filter((site) =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStates.length > 0) {
      filtered = filtered.filter((site) => selectedStates.includes(site.state));
    }

    if (priceFilter !== "all") {
      filtered = filtered.filter((site) => {
        if (priceFilter === "free") {
          return !site.fees || site.fees.toLowerCase().includes("free");
        } else {
          return site.fees && !site.fees.toLowerCase().includes("free");
        }
      });
    }

    if (selectedAttractions.length > 0) {
      filtered = filtered.filter((site) => {
        if (!site.tags) return false;
        const siteTags = site.tags.split(",").map((t) => t.trim());
        return selectedAttractions.some((attr) => siteTags.includes(attr));
      });
    }

    if (selectedActivities.length > 0) {
      filtered = filtered.filter((site) => {
        if (!site.activities) return false;
        const siteActs = site.activities.split(",").map((a) => a.trim());
        return selectedActivities.some((act) => siteActs.includes(act));
      });
    }

    setFilteredCampsites(filtered);
    setCurrentPage(1);
  }, [
    campsites,
    searchTerm,
    selectedStates,
    priceFilter,
    selectedAttractions,
    selectedActivities,
  ]);

  const toggleAttraction = (attr: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSearchTerm("");
    setPriceFilter("all");
    setSelectedAttractions([]);
    setSelectedActivities([]); // ✅ 清空 activities
    setCurrentPage(1);
  };

  // 分页
  const totalPages = Math.ceil(filteredCampsites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampsites = filteredCampsites.slice(startIndex, endIndex);

  // 假天气数据
  const fakeWeather = ["☀️", "🌧️", "🌤️", "⛅", "🌫️"];

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/camping.jpg')" }}
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

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 -mt-2">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white/90 shadow-md rounded-lg p-6 backdrop-blur-md">
              {/* Filters content */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-green-700">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Search
                </h3>
                <input
                  type="text"
                  placeholder="Search by camp name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[38px] p-2 border rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>

              {/* States */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  States
                </h3>
                <div className="space-y-2">
                  {states.map((state) => (
                    <label key={state} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStates([...selectedStates, state]);
                          } else {
                            setSelectedStates(
                              selectedStates.filter((s) => s !== state)
                            );
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Entry Type
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={priceFilter === "free"}
                      onChange={(e) =>
                        setPriceFilter(e.target.checked ? "free" : "all")
                      }
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    Free Entry
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={priceFilter === "paid"}
                      onChange={(e) =>
                        setPriceFilter(e.target.checked ? "paid" : "all")
                      }
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    Paid Entry
                  </label>
                </div>
              </div>

              {/* Attractions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Attractions
                </h3>
                <div className="space-y-2">
                  {attractions.slice(0, 6).map((attr) => (
                    <label key={attr} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedAttractions.includes(attr)}
                        onChange={() => toggleAttraction(attr)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {attr}
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ Activities */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Activities
                </h3>
                <div className="space-y-2">
                  {activities.slice(0, 6).map((act) => (
                    <label key={act} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(act)}
                        onChange={() => toggleActivity(act)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {act}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white/70 shadow-md rounded-lg p-6 backdrop-blur-md">
              {loading ? (
                <p className="text-center text-gray-500">Loading campsites...</p>
              ) : (
                // ✅ 改成 2 列
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentCampsites.map((camp, index) => (
                    <div
                      key={camp.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col relative"
                    >
                      {/* Weather Icon */}
                      <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded-full text-sm">
                        {fakeWeather[index % fakeWeather.length]}
                      </div>

                      {/* Image */}
                      <div className="h-40 bg-gray-100 overflow-hidden relative">
                        <Image
                          src={
                            camp.imageUrl ||
                            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
                          }
                          alt={camp.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                          {camp.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {camp.forestType || "Forest Park"}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          📍 {camp.state}
                        </p>

                        <div className="mt-auto">
                          <Link href={`/camp/${camp.id}`}>
                            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage === page
                            ? "bg-green-600 text-white"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CampPage;
