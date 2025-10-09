"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface CampSite {
  id: string;
  name: string;
  tags?: string;
  activities?: string;
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

/* ---------- Fee meta (structured info parsed from original fees text) ---------- */
interface FeeMeta {
  hasText: boolean;
  fullyFree: boolean;
  freeCitizens: boolean;
  freeChildren: boolean;
  freeSeniors: boolean;
  freeOKU: boolean;
  hasAnyFreeOption: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  hasPrice: boolean;
}

function deriveFeeMeta(fees?: string): FeeMeta {
  if (!fees || !fees.trim()) {
    return {
      hasText: false,
      fullyFree: false,
      freeCitizens: false,
      freeChildren: false,
      freeSeniors: false,
      freeOKU: false,
      hasAnyFreeOption: false,
      minPrice: null,
      maxPrice: null,
      hasPrice: false,
    };
  }

  const text = fees.replace(/\s+/g, " ");
  const lower = text.toLowerCase();

  const priceMatches = [...lower.matchAll(/rm\s*([0-9]+(?:\.[0-9]{1,2})?)/g)];
  const prices = priceMatches.map((m) => parseFloat(m[1]));
  const hasPrice = prices.length > 0;
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const hasFreeWord = /\bfree\b|free\s*admission/i.test(text);
  const fullyFree = hasFreeWord && !hasPrice;

  const freeCitizens =
    /(citizen|malaysian|warga\s*negar|warganegara)/i.test(text) && /\bfree\b/i.test(text);
  const freeChildren =
    /(child|children|kids?|under\s*\d+\s*years?)/i.test(text) && /\bfree\b/i.test(text);
  const freeSeniors =
    /(senior|older|60\s*years?\s*(and\s*above)?)/i.test(text) && /\bfree\b/i.test(text);
  const freeOKU = /(oku|disabled|disabilities)/i.test(text) && /\bfree\b/i.test(text);

  const hasAnyFreeOption = fullyFree || freeCitizens || freeChildren || freeSeniors || freeOKU;

  return {
    hasText: true,
    fullyFree,
    freeCitizens,
    freeChildren,
    freeSeniors,
    freeOKU,
    hasAnyFreeOption,
    minPrice,
    maxPrice,
    hasPrice,
  };
}

/* ---------------- Favorites utils (shared behavior with detail page) ---------------- */
const FAVORITES_KEY = "favorites";

const normalizeFavArray = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const list = raw.map((x) => String(x));
  return Array.from(new Set(list));
};

const readFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return normalizeFavArray(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
};

const writeFavorites = (arr: string[]) => {
  const norm = normalizeFavArray(arr);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(norm));
  // notify same-tab listeners (storage event won't fire in same tab)
  window.dispatchEvent(new CustomEvent("favorites-updated"));
};

const CampPage: React.FC = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [campsites, setCampsites] = useState<CampSite[]>([]);
  const [filteredCampsites, setFilteredCampsites] = useState<CampSite[]>([]);
  const [loading, setLoading] = useState(true);

  // === 3 fixed rows per page: calculate columns responsively ===
  const [cols, setCols] = useState<number>(1);
  useEffect(() => {
    const calcCols = () => {
      const w = window.innerWidth;
      if (w >= 1536) return 4;
      if (w >= 1024) return 3;
      if (w >= 640) return 2;
      return 1;
    };
    const update = () => setCols(calcCols());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const itemsPerPage = cols * 3;

  // ===== Entry fee filters (keep free-related only) =====
  const [onlyFullyFree, setOnlyFullyFree] = useState(false);
  const [onlyHasFreeOption, setOnlyHasFreeOption] = useState(false);
  const [needFreeCitizens, setNeedFreeCitizens] = useState(false);
  const [needFreeChildren, setNeedFreeChildren] = useState(false);
  const [needFreeSeniors, setNeedFreeSeniors] = useState(false);
  const [needFreeOKU, setNeedFreeOKU] = useState(false);

  // ===== Favorites (synced across pages/tabs) =====
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    // initial load
    setFavorites(readFavorites());
    // cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) setFavorites(readFavorites());
    };
    // same-tab sync
    const onCustom = () => setFavorites(readFavorites());
    window.addEventListener("storage", onStorage);
    window.addEventListener("favorites-updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("favorites-updated", onCustom as EventListener);
    };
  }, []);

  const isFavorited = (id: string) => favorites.includes(String(id));
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const strId = String(id);
      const next = prev.includes(strId) ? prev.filter((x) => x !== strId) : [...prev, strId];
      writeFavorites(next);
      return next;
    });
  };

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

        const allTags = Array.from(
          new Set(
            data.flatMap((site) =>
              site.tags ? site.tags.split(",").map((t) => t.trim()) : []
            )
          )
        );
        setAttractions(allTags);

        const allActs = Array.from(
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

  // Precompute fee meta per campsite
  const feeMetaMap = useMemo(() => {
    const map = new Map<string, FeeMeta>();
    campsites.forEach((c) => {
      map.set(c.id, deriveFeeMeta(c.fees));
    });
    return map;
  }, [campsites]);

  // Filtering (no Max price logic)
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

    // Entry-fee based filters
    filtered = filtered.filter((site) => {
      const meta = feeMetaMap.get(site.id)!;

      if (onlyFullyFree && !meta.fullyFree) return false;
      if (onlyHasFreeOption && !meta.hasAnyFreeOption) return false;

      if (needFreeCitizens && !meta.freeCitizens) return false;
      if (needFreeChildren && !meta.freeChildren) return false;
      if (needFreeSeniors && !meta.freeSeniors) return false;
      if (needFreeOKU && !meta.freeOKU) return false;

      return true;
    });

    setFilteredCampsites(filtered);
    setCurrentPage(1);
  }, [
    campsites,
    searchTerm,
    selectedStates,
    selectedAttractions,
    selectedActivities,
    onlyFullyFree,
    onlyHasFreeOption,
    needFreeCitizens,
    needFreeChildren,
    needFreeSeniors,
    needFreeOKU,
    feeMetaMap,
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
    setSelectedAttractions([]);
    setSelectedActivities([]);
    setOnlyFullyFree(false);
    setOnlyHasFreeOption(false);
    setNeedFreeCitizens(false);
    setNeedFreeChildren(false);
    setNeedFreeSeniors(false);
    setNeedFreeOKU(false);
    setCurrentPage(1);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCampsites.length / Math.max(itemsPerPage, 1));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampsites = filteredCampsites.slice(startIndex, endIndex);

  // Keep page in range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, totalPages]);

  // Page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (currentPage - delta < 1) {
      end = Math.min(totalPages, end + (delta - currentPage + 1));
    }
    if (currentPage + delta > totalPages) {
      start = Math.max(1, start - (currentPage + delta - totalPages));
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (start > 1) {
      if (start > 2) pages.unshift(1);
      pages.splice(1, 0, "...");
    }
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(totalPages);
      pages.splice(pages.length - 1, 0, "...");
    }

    return pages;
  };

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
      <section className="max-w-7xl mx-auto px-6 -mt-2 pb-20">
        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-6 items-stretch">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-white/90 shadow-md rounded-lg p-6 backdrop-blur-md">
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
                <h3 className="text-sm font-semibold mb-2 text-green-700">Search</h3>
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
                <h3 className="text-sm font-semibold mb-2 text-green-700">States</h3>
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
                            setSelectedStates(selectedStates.filter((s) => s !== state));
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>

              {/* Entry Fee */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-green-700">Entry Fee</h3>

                <label className="flex items-center text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={onlyFullyFree}
                    onChange={(e) => setOnlyFullyFree(e.target.checked)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  Fully Free (everyone)
                </label>

                <label className="flex items-center text-sm mb-4">
                  <input
                    type="checkbox"
                    checked={onlyHasFreeOption}
                    onChange={(e) => setOnlyHasFreeOption(e.target.checked)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  Has any free option
                </label>

                <div className="rounded-md border p-3 bg-white/80">
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Free for specific groups
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={needFreeCitizens}
                        onChange={(e) => setNeedFreeCitizens(e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      Citizens
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={needFreeChildren}
                        onChange={(e) => setNeedFreeChildren(e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      Children
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={needFreeSeniors}
                        onChange={(e) => setNeedFreeSeniors(e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      Seniors (60+)
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={needFreeOKU}
                        onChange={(e) => setNeedFreeOKU(e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      OKU / Disabled
                    </label>
                  </div>
                </div>
              </div>

              {/* Attractions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-green-700">Attractions</h3>
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

              {/* Activities */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-green-700">Activities</h3>
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

          {/* Right side: cards + pagination */}
          <div className="h-full">
            <div className="h-full flex flex-col bg-white/70 shadow-md rounded-lg p-6 backdrop-blur-md">
              <div className="flex-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading campsites...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {currentCampsites.map((camp) => {
                      const meta = feeMetaMap.get(camp.id)!;
                      const fav = isFavorited(camp.id);
                      return (
                        <div
                          key={camp.id}
                          className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
                        >
                          {/* Image */}
                          <div className="relative aspect-[16/9] bg-gray-100">
                            <Image
                              src={
                                camp.imageUrl ||
                                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
                              }
                              alt={camp.name}
                              fill
                              className="object-cover"
                            />
                            {/* Favorite button — star */}
                            <button
                              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleFavorite(camp.id);
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow hover:bg-white"
                              title={fav ? "Remove from favorites" : "Add to favorites"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-6 h-6"
                                fill={fav ? "#f59e0b" : "none"}
                                stroke={fav ? "#f59e0b" : "#6b7280"}
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 2.25l2.955 5.985 6.607.96-4.781 4.658 1.129 6.586L12 17.77l-5.91 3.669 1.129-6.586L2.438 9.195l6.607-.96L12 2.25z"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Info */}
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                              {camp.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {camp.forestType || "Forest Park"}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">📍 {camp.state}</p>

                            {/* Fee badges */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {meta.fullyFree && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                                  Fully Free
                                </span>
                              )}
                              {!meta.fullyFree && meta.hasAnyFreeOption && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
                                  Free options
                                </span>
                              )}
                              {meta.minPrice !== null && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                  from RM {meta.minPrice.toFixed(2).replace(/\.00$/, "")}
                                </span>
                              )}
                            </div>

                            <div className="mt-auto">
                              <Link href={`/camp/${camp.id}`}>
                                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium">
                                  View Details
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 mb-2 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`e-${idx}`} className="px-3 py-2 text-gray-400 text-sm">
                          ···
                        </span>
                      ) : (
                        <button
                          key={`p-${page}`}
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-[42px] h-[42px] flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-green-600 text-white shadow-md scale-105"
                              : "text-gray-700 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span>Next</span>
                    <span>→</span>
                  </button>
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
