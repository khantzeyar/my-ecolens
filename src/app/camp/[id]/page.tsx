"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WeatherCard from "@/app/components/WeatherCard";
import InsightsPanel from "@/app/components/InsightsPanel";
import dynamic from "next/dynamic";
import { transformForestDataByState } from "@/app/utils/transformForestData";
import statePredictions from "@/app/data/state_tree_loss_predictions.json";

const forestData = transformForestDataByState();
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
  activities?: string;
  latitude?: number;
  longitude?: number;
}

interface CampDetailProps {
  params: Promise<{ id: string }>;
}

interface WeatherData {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

interface WeatherApiItem {
  dt: number;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

type TabType = "detail" | "insight";

/** ---------------- Favorites helpers (robust sync) ---------------- */
function normalizeFavArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  // ensure all ids are strings and unique
  const list = raw.map((x) => String(x));
  return Array.from(new Set(list));
}
function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("favorites");
    return normalizeFavArray(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}
function setFavorites(arr: string[]) {
  if (typeof window === "undefined") return;
  const norm = normalizeFavArray(arr);
  localStorage.setItem("favorites", JSON.stringify(norm));
  // notify other components in the SAME tab (storage event doesn't fire here)
  window.dispatchEvent(new CustomEvent("favorites-updated"));
}

/** ---------------- Visit history helpers (manual mark) ---------------- */
interface VisitRecord {
  campsiteId: number | string;
  name: string;
  state: string;
  dateVisited: string;
  latitude?: number;
  longitude?: number;
}
function getVisitHistory(): VisitRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("visitHistory");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setVisitHistory(records: VisitRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("visitHistory", JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("visit-history-updated"));
}
function checkVisited(campId: number | string, date: string) {
  const history = getVisitHistory();
  return history.some(
    (v) => String(v.campsiteId) === String(campId) && v.dateVisited === date
  );
}

export default function CampDetail({ params }: CampDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("detail");
  const [camp, setCamp] = useState<CampSite | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Favorites synced via route param id (string) =====
  const [routeId, setRouteId] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);

  // ===== Manual Visit Mark =====
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [isVisited, setIsVisited] = useState(false);

  const refreshFavoriteFromStorage = (id: string) => {
    const favs = getFavorites();
    setIsFavorited(favs.includes(String(id)));
  };

  const toggleFavorite = (id: string) => {
    const strId = String(id);
    const favs = getFavorites();
    const next = favs.includes(strId)
      ? favs.filter((x) => x !== strId)
      : [...favs, strId];
    setFavorites(next);
    setIsFavorited(next.includes(strId));
  };

  // 手动标记访问
  const handleMarkVisited = () => {
    if (!camp) return;
    const history = getVisitHistory();
    if (checkVisited(camp.id, visitDate)) return;
    const newRecord: VisitRecord = {
      campsiteId: camp.id,
      name: camp.name,
      state: camp.state,
      dateVisited: visitDate,
      latitude: camp.latitude,
      longitude: camp.longitude,
    };
    setVisitHistory([...history, newRecord]);
    setIsVisited(true);
  };

  const handleUnmarkVisited = () => {
    if (!camp) return;
    const history = getVisitHistory();
    const next = history.filter(
      (v) =>
        !(
          String(v.campsiteId) === String(camp.id) &&
          v.dateVisited === visitDate
        )
    );
    setVisitHistory(next);
    setIsVisited(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolved = await params;
        const id = resolved.id; // use route param for favorites
        setRouteId(id);
        refreshFavoriteFromStorage(id);

        const campRes = await fetch(`/api/campsites/${id}`);
        const campData: CampSite = await campRes.json();
        setCamp(campData);

        // check visited
        setIsVisited(checkVisited(campData.id, visitDate));

        // Weather
        if (campData.latitude && campData.longitude) {
          const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY;
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${campData.latitude}&lon=${campData.longitude}&appid=${API_KEY}&units=metric`
          );
          const weatherApiData: { list?: WeatherApiItem[] } =
            await weatherRes.json();
          if (weatherApiData.list) {
            const processed: WeatherData[] = weatherApiData.list
              .filter((_, idx) => idx % 8 === 0)
              .slice(0, 5)
              .map((d) => {
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
            setWeatherData(processed);
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

  useEffect(() => {
    if (camp) setIsVisited(checkVisited(camp.id, visitDate));
  }, [visitDate, camp]);

  // Keep in sync across tabs + within same tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "favorites" && routeId) refreshFavoriteFromStorage(routeId);
    };
    const onFocus = () => routeId && refreshFavoriteFromStorage(routeId);
    const onCustom = () => routeId && refreshFavoriteFromStorage(routeId); // same-tab updates
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("favorites-updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("favorites-updated", onCustom as EventListener);
    };
  }, [routeId]);

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

  // Merge historical + prediction data
  const mergedYearlyLoss: Record<number, number> = {
    ...(forestData[camp.state]?.yearly_loss || {}),
    ...Object.fromEntries(
      (statePredictions as {
        state: string;
        year: string | number;
        tc_loss_pred: string | number;
      }[])
        .filter((p) => p.state === camp.state)
        .map((p) => [Number(p.year), Number(p.tc_loss_pred)])
    ),
  };

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/camping.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/camp"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6 bg-white/90 px-4 py-2 rounded-lg shadow-md"
        >
          ← Back to Camp Sites
        </Link>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex w-fit mx-auto">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === "detail"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Detail Information
            </button>
            <button
              onClick={() => setActiveTab("insight")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === "insight"
                  ? "bg-white text-green-700 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Forest Insight
            </button>
          </div>
        </div>

        <div className="bg-white/95 rounded-2xl p-8 shadow-xl">
          {activeTab === "detail" ? (
            <div className="space-y-8">
              {/* Header：左侧 标题+类型+标签；右侧 日期+按钮；星标仍在标题旁 */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Left block */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold">{camp.name}</h1>
                        {/* Favorite star aligned with title */}
                        <button
                          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                          onClick={() => toggleFavorite(routeId || String(camp.id))}
                          className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200"
                          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                            fill={isFavorited ? "#f59e0b" : "none"}
                            stroke={isFavorited ? "#f59e0b" : "#9ca3af"}
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
                      <p className="text-gray-600">{camp.type}</p>
                    </div>
                  </div>

                  {(camp.tags || camp.activities) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {camp.tags &&
                        camp.tags.split(",").map((tag, idx) => (
                          <span
                            key={`tag-${idx}`}
                            className="inline-block px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full whitespace-nowrap"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      {camp.activities &&
                        camp.activities.split(",").map((act, idx) => (
                          <span
                            key={`act-${idx}`}
                            className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full whitespace-nowrap"
                          >
                            {act.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Right controls: date + mark/unmark (no outer frame) */}
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm shadow-sm"
                  />
                  {isVisited ? (
                    <button
                      onClick={handleUnmarkVisited}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm shadow-sm"
                    >
                      Unmark
                    </button>
                  ) : (
                    <button
                      onClick={handleMarkVisited}
                      className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm shadow-sm"
                    >
                      Mark as Visited
                    </button>
                  )}
                </div>
              </div>

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Image */}
                <div className="lg:col-span-2">
                  <Image
                    src={camp.imageUrl || "https://via.placeholder.com/800x400"}
                    alt={camp.name}
                    width={800}
                    height={400}
                    className="rounded-xl shadow-lg object-cover w-full h-[420px]"
                  />
                </div>

                {/* Right - Quick Info Cards */}
                <div className="space-y-4">
                  <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      <span className="text-gray-800">Location</span>
                    </h2>
                    <p className="font-medium text-gray-900">{camp.state}</p>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {camp.address}
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-xl">🕐</span>
                      <span className="text-gray-800">Opening Hours</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {camp.openingTime || "Not available"}
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-xl">📞</span>
                      <span className="text-gray-800">Contact</span>
                    </h2>
                    <p className="text-gray-700 font-medium">{camp.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Weather + Entry Fee */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Weather */}
                <div className="p-6 bg-gradient-to-br from-blue-50 via-sky-50 to-white border border-blue-100 rounded-xl shadow-sm">
                  {weatherData.length > 0 ? (
                    <WeatherCard weather={weatherData} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Weather data not available</p>
                    </div>
                  )}
                </div>

                {/* Entry Fee */}
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-gray-800">Entry Fee</span>
                  </h2>
                  {camp.fees ? (
                    <div className="space-y-2">
                      {camp.fees
                        .split(/[,|]/)
                        .map((fee) => fee.trim())
                        .filter(Boolean)
                        .filter((fee) => {
                          const lowerFee = fee.toLowerCase();
                          return !(lowerFee === "admission" || lowerFee === "admission fee");
                        })
                        .map((fee, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-green-600 font-bold mt-0.5">•</span>
                            <span className="text-gray-700 text-sm leading-relaxed">
                              {fee}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                      Free / Not specified
                    </p>
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4 text-center">Location Map</h3>
                <div className="h-[320px] bg-gray-100 rounded-xl overflow-hidden shadow-md">
                  {camp.latitude && camp.longitude ? (
                    <Map
                      selectedStates={[camp.state]}
                      searchTerm={camp.name}
                      priceFilter="all"
                      selectedAttractions={[]}
                      singleCampMode={true}
                      centerLat={camp.latitude - 0.1}
                      centerLng={camp.longitude}
                      defaultZoom={10}
                      enableInteraction={true}
                      allowPageScroll={true}
                    />
                  ) : (
                    <p className="text-center text-gray-500 pt-12">Map not available</p>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/recommend"
                    className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-md hover:shadow-lg"
                  >
                    Go to Recommendations →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Forest Insight
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Forest Insight – {camp.state}
              </h2>
              <p className="text-gray-600">
                Over the past 20 years, forest loss in {camp.state} reached{" "}
                <span className="font-semibold text-red-600">
                  {forestData[camp.state]?.cumulative_loss_percent?.toFixed(1) || 0}%
                </span>{" "}
                of its total forest area.
              </p>

              <div className="max-w-lg mx-auto">
                <InsightsPanel
                  mode="mini"
                  data={{
                    name: camp.state,
                    yearly_loss: mergedYearlyLoss,
                    cumulative_loss_percent:
                      forestData[camp.state]?.cumulative_loss_percent,
                  }}
                />
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/insights"
                  className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                  View Full Forest Insights →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}