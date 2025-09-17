"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Import react-select dynamically to avoid hydration mismatch
const Select = dynamic(() => import("react-select"), { ssr: false });

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
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface CampPageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string>>;
}

type PriceFilter = "all" | "free" | "paid";

const CampPage: React.FC<CampPageProps> = ({ params, searchParams }) => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>([]);
  const [campsites, setCampsites] = useState<CampSite[]>([]);
  const [filteredCampsites, setFilteredCampsites] = useState<CampSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    setLoading(true);
    fetchCampsites()
      .then((data) => {
        setCampsites(data);
        setFilteredCampsites(data);
        const allTags: string[] = Array.from(
          new Set(
            data.flatMap((site) =>
              site.tags ? site.tags.split(",").map((t) => t.trim()) : []
            )
          )
        );
        setAttractions(allTags);
      })
      .catch((err) => console.error("Error fetching campsites:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = campsites;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((site) =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by states
    if (selectedStates.length > 0) {
      filtered = filtered.filter((site) =>
        selectedStates.includes(site.state)
      );
    }

    // Filter by price
    if (priceFilter !== "all") {
      filtered = filtered.filter((site) => {
        if (priceFilter === "free") {
          return !site.fees || site.fees.toLowerCase().includes("free");
        } else {
          return site.fees && !site.fees.toLowerCase().includes("free");
        }
      });
    }

    // Filter by attractions
    if (selectedAttractions.length > 0) {
      filtered = filtered.filter((site) => {
        if (!site.tags) return false;
        const siteTags = site.tags.split(",").map((t) => t.trim());
        return selectedAttractions.some((attr) => siteTags.includes(attr));
      });
    }

    setFilteredCampsites(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [campsites, searchTerm, selectedStates, priceFilter, selectedAttractions]);

  const toggleAttraction = (attr: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSearchTerm("");
    setPriceFilter("all");
    setSelectedAttractions([]);
    setCurrentPage(1);
  };

  const isFree = (fees?: string) => {
    if (!fees) return true;
    return fees.toLowerCase().includes("free");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCampsites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampsites = filteredCampsites.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    document.querySelector('#results-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  };

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Banner - reduced height */}
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
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/90 shadow-md rounded-lg p-6 backdrop-blur-md">
              {/* Filter Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-green-700">Filter Plants</h2>
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
                  Search Plants
                </h3>
                <input
                  type="text"
                  placeholder="Search by camp name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[38px] p-2 border rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>

              {/* Plant Suitability (States) */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Plant Suitability
                </h3>
                <div className="space-y-2">
                  {states.slice(0, 6).map((state) => (
                    <label key={state} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStates([...selectedStates, state]);
                          } else {
                            setSelectedStates(selectedStates.filter(s => s !== state));
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>

              {/* Gardening Type (Price) */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Gardening Type
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={priceFilter === "free"}
                      onChange={(e) => setPriceFilter(e.target.checked ? "free" : "all")}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    Free Entry
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={priceFilter === "paid"}
                      onChange={(e) => setPriceFilter(e.target.checked ? "paid" : "all")}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    Paid Entry
                  </label>
                </div>
              </div>

              {/* Plant Category (Attractions) */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">
                  Plant Category
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

              {/* Active Filters */}
              {(selectedStates.length > 0 || selectedAttractions.length > 0 || priceFilter !== "all") && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-green-700">Active Filters:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedStates.map((state) => (
                      <span
                        key={state}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                      >
                        {state}
                      </span>
                    ))}
                    {selectedAttractions.map((attr) => (
                      <span
                        key={attr}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                      >
                        {attr}
                      </span>
                    ))}
                    {priceFilter !== "all" && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {priceFilter}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Cards */}
          <div className="flex-1">
            <div className="bg-white/70 shadow-md rounded-lg p-6 backdrop-blur-md" id="results-section">
              {/* Results Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🌿</span>
                    </div>
                    <span className="text-sm text-green-700">
                      Showing {Math.min(filteredCampsites.length, itemsPerPage)} of {filteredCampsites.length} plants (Page {currentPage} of {totalPages || 1})
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading campsites...</p>
                </div>
              ) : (
                /* Cards Grid */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentCampsites.map((camp) => (
                      <div
                        key={camp.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
                      >
                        {/* Card Image */}
                        <div className="h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={camp.imageUrl || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"}
                            alt={camp.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
                            }}
                          />
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                            {camp.name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">{camp.forestType || "Forest Park"}</p>

                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>📍 {camp.state}</span>
                          </div>

                          {/* Entry Fee and Attractions Section - Single Row */}
                          <div className="mb-4 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {/* Entry Fee Status */}
                              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                isFree(camp.fees) 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-orange-100 text-orange-800 border border-orange-200'
                              }`}>
                                {isFree(camp.fees) ? 'Free Entry' : 'Paid Entry'}
                              </span>

                              {/* Attractions */}
                              {camp.tags ? camp.tags.split(",").map((tag, idx) => {
                                const trimmedTag = tag.trim();
                                // Define color scheme based on attraction type
                                const getTagColor = (tagName: string) => {
                                  const lowerTag = tagName.toLowerCase();
                                  if (lowerTag.includes('river')) return 'bg-blue-50 text-blue-700 border-blue-200';
                                  if (lowerTag.includes('waterfall')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                                  if (lowerTag.includes('wildlife')) return 'bg-green-50 text-green-700 border-green-200';
                                  if (lowerTag.includes('bird')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
                                  if (lowerTag.includes('lake')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                                  if (lowerTag.includes('beach')) return 'bg-orange-50 text-orange-700 border-orange-200';
                                  if (lowerTag.includes('cave')) return 'bg-gray-50 text-gray-700 border-gray-200';
                                  return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // default green theme
                                };

                                return (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 text-xs rounded-full border ${getTagColor(trimmedTag)}`}
                                  >
                                    {trimmedTag}
                                  </span>
                                );
                              }) : (
                                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                                  No attractions listed
                                </span>
                              )}
                            </div>
                          </div>

                          {/* View Details Button - Always at bottom */}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage = page === 1 || 
                                         page === totalPages || 
                                         (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          if (!showPage) {
                            // Show ellipsis
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-3 py-2 text-sm text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                currentPage === page
                                  ? "bg-green-600 text-white"
                                  : "border hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* No Results */}
              {!loading && filteredCampsites.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏕️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No campsites found</h3>
                  <p className="text-gray-500">Try adjusting your filters to see more results.</p>
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