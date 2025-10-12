/* eslint-disable */
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

/* ---------- Fee meta (minimal: only need "free for everyone") ---------- */
interface FeeMeta {
  hasText: boolean;
  fullyFree: boolean; // free for everyone (no price mentioned)
}

function deriveFeeMeta(fees?: string): FeeMeta {
  if (!fees || !fees.trim()) {
    return { hasText: false, fullyFree: false };
  }
  const text = fees.replace(/\s+/g, " ");
  const lower = text.toLowerCase();

  // any explicit price means not "free for everyone"
  const priceMatches = [...lower.matchAll(/rm\s*([0-9]+(?:\.[0-9]{1,2})?)/g)];
  const hasPrice = priceMatches.length > 0;

  const hasFreeWord = /\bfree\b|free\s*admission|no\s*charge|no\s*entry\s*fee/i.test(text);

  const fullyFree = hasFreeWord && !hasPrice;

  return { hasText: true, fullyFree };
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

/* ---------------- Center Toast (big, prominent, dismissible) ---------------- */
type ToastState = { message: string; visible: boolean } | null;

function Toast({ state }: { state: ToastState }) {
  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed inset-0 z-[9999] pointer-events-none"
    >
      {/* light overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-200
        ${state?.visible ? "opacity-30" : "opacity-0"} bg-black`}
      />

      {/* centered card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`pointer-events-auto transition-all duration-300
          ${state?.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          role="status"
        >
          {state && (
            <button
              type="button"
              onClick={() => (window as any).__toastDismiss?.()}
              className="mx-auto w-[24rem] sm:w-[28rem] rounded-2xl bg-white/95 backdrop-blur
                         shadow-2xl ring-1 ring-black/10 p-5 sm:p-6 text-left"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center
                                 rounded-full bg-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor"
                       className="h-6 w-6 text-emerald-700">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
                  {state.message}
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">Tap to dismiss</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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

  // === toast state ===
  const [toast, setToast] = useState<ToastState>(null);
  const pushToast = (message: string) => {
    setToast({ message, visible: true });

    // allow click to close immediately
    (window as any).__toastDismiss = () =>
      setToast((t) => (t ? { ...t, visible: false } : t));

    // auto hide after 2.2s
    window.clearTimeout((pushToast as any)._t);
    (pushToast as any)._t = window.setTimeout(() => {
      setToast((t) => (t ? { ...t, visible: false } : t));
    }, 2200);

    // remove node after fade-out
    window.clearTimeout((pushToast as any)._t2);
    (pushToast as any)._t2 = window.setTimeout(() => setToast(null), 2600);
  };

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

  // ===== Entry fee filter: ONLY "Free for everyone" =====
  const [onlyFullyFree, setOnlyFullyFree] = useState(false);

  // ===== Favorites (synced across pages/tabs) =====
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setFavorites(readFavorites());
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) setFavorites(readFavorites());
    };
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

  // Filtering
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

    // Entry-fee based filter: only "Free for everyone"
    if (onlyFullyFree) {
      filtered = filtered.filter((site) => {
        const meta = feeMetaMap.get(site.id)!;
        return meta.fullyFree;
      });
    }

    setFilteredCampsites(filtered);
    setCurrentPage(1);
  }, [
    campsites,
    searchTerm,
    selectedStates,
    selectedAttractions,
    selectedActivities,
    onlyFullyFree,
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
                  className=" text-green-600 hover:text-green-800 underline"
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
                        className="w-4 h-4 mr-2 text-green-600 focus:ring-green-500"
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>

              {/* Entry Fee — ONLY "Free for everyone" */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-green-700">Entry Fee</h3>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={onlyFullyFree}
                    onChange={(e) => setOnlyFullyFree(e.target.checked)}
                    className="w-4 h-4 mr-2 text-green-600 focus:ring-green-500"
                  />
                  Free for Everyone
                </label>
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
                        className="w-4 h-4 mr-2 text-green-600 focus:ring-green-500"
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
                        className="w-4 h-4 mr-2 text-green-600 focus:ring-green-500"
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
                                const pre = isFavorited(camp.id);
                                toggleFavorite(camp.id);
                                // toast
                                pushToast(pre ? "Removed from Favorites" : "Added to Favorites");
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
                              title={fav ? "Remove from favorites" : "Add to favorites"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-5 h-5"
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

                            <div className="mt-auto">
                              <Link href={`/camp/${camp.id}`}>
                                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium cursor-pointer">
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
                <div className="mt-10 mb-2 flex justify-center items-center">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all cursor-pointer ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                    aria-label="Previous page"
                  >
                    <i className="ri-arrow-left-s-line text-2xl"></i>
                  </button>

                  <div className="flex items-center mx-2">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`e-${idx}`} className="px-3 py-2 text-gray-400 text-sm">
                          ···
                        </span>
                      ) : (
                        <button
                          key={`p-${page}`}
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-[42px] h-[42px] flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer ${
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
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all cursor-pointer ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                    aria-label="Next page"
                  >
                    <i className="ri-arrow-right-s-line text-2xl"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Toast */}
      <Toast state={toast} />
    </main>
  );
};

export default CampPage;
