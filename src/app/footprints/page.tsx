"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type * as L from "leaflet"; 

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface CampSite {
  id: number;
  name: string;
  state: string;
  type?: string;
  imageUrl?: string;
  address?: string;
  activities?: string;
  tags?: string;
  latitude?: number;
  longitude?: number;
}

interface Plant {
  id: string;
  name: string;
  imageUrl: string;
  dateIdentified: string;
  location?: { lat: number; lng: number };
}

interface Visit {
  campsiteId: string;
  name: string;
  dateVisited: string;
  durationDays?: number;
}

type Tab = "favorites" | "plants" | "visits" | "map";

export default function MyFootprintsPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [camps, setCamps] = useState<CampSite[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  // All camps for map reference
  const [allCamps, setAllCamps] = useState<CampSite[]>([]);
   // Map layer toggles
  const [showAll, setShowAll] = useState(true);
  const [showVisited, setShowVisited] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);

  // Load local data
  useEffect(() => {
    const fav = localStorage.getItem("favorites");
    const plantData = localStorage.getItem("identifiedPlants");
    const visitData = localStorage.getItem("visitHistory");

    if (fav) {
      try {
        const parsedFav = JSON.parse(fav);
        if (Array.isArray(parsedFav)) {
          setFavorites(parsedFav.map((x) => String(x)));
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
    }
    if (plantData) {
      try {
        setPlants(JSON.parse(plantData));
      } catch {
        setPlants([]);
      }
    }
    if (visitData) {
      try {
        setVisits(JSON.parse(visitData));
      } catch {
        setVisits([]);
      }
    }
  }, []);

  const [LRef, setLRef] = useState<typeof L | null>(null);

  useEffect(() => {
    (async () => {
      const leafletModule = await import("leaflet");
      setLRef(leafletModule);
    })();
  }, []);

  const iconFor = (hex: string) => {
    if (!LRef) return undefined;
    return LRef.divIcon({
      className: "",
      html: `<span style="
        display:inline-block;width:14px;height:14px;border-radius:50%;
        background:${hex};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <main
      className="pt-20 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/footprints.jpg')" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-10 mt-10">
          {/* subtle glass chip behind the title for contrast */}
          <div className="absolute -z-0 top-1/2 -translate-y-1/2 w-[min(90%,720px)] h-16 rounded-full bg-black/35 backdrop-blur-sm blur-md"></div>
          <h1
            className="relative z-[1] text-4xl lg:text-5xl font-extrabold tracking-tight text-center text-white"
            style={{
              textShadow:
                "0 3px 16px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)",
            }}
          >
            My Eco Footprints
          </h1>
          <Link
            href="/camp"
            className="absolute right-0 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 shadow"
          >
            ← Back to Discover
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {[
            { id: "favorites", label: "Favorites" },
            { id: "plants", label: "Identified Plants" },
            { id: "visits", label: "Visit History" },
            { id: "map", label: "My Footprint Map" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-5 py-2 rounded-full font-medium shadow-sm transition transform hover:-translate-y-0.5 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white ring-2 ring-white/40 shadow-lg"
                  : "bg-white/85 text-gray-800 hover:bg-white ring-1 ring-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Favorites */}
        {activeTab === "favorites" && (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-24 bg-white/80 rounded-2xl shadow-md">
                <p className="text-gray-600 text-lg mb-4">
                  You haven’t favorited any camps yet.
                </p>
                <Link
                  href="/camp"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition"
                >
                  Explore Campsites →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.map((camp) => (
                  <Link
                    key={camp.id}
                    href={`/camp/${camp.id}`}
                    className="bg-white/90 rounded-2xl overflow-hidden shadow hover:shadow-lg transition block"
                  >
                    <div className="relative h-56 w-full">
                      <Image
                        src={
                          camp.imageUrl || "https://via.placeholder.com/600x400"
                        }
                        alt={camp.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {camp.name}
                      </h2>
                      <p className="text-sm text-gray-600">{camp.state}</p>
                      {camp.type && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          {camp.type}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {camp.tags &&
                          camp.tags.split(",").map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        {camp.activities &&
                          camp.activities.split(",").map((act, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                            >
                              {act.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Plants */}
        {activeTab === "plants" && (
          <div className="bg-white/90 rounded-2xl p-8 shadow-md">
            {plants.length === 0 ? (
              <p className="text-gray-600 text-center text-lg">
                You haven’t identified any plants yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plants.map((plant) => (
                  <div
                    key={plant.id}
                    className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition"
                  >
                    <Image
                      src={plant.imageUrl || "/images/plant-placeholder.jpg"}
                      alt={plant.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {plant.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Identified on {plant.dateIdentified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visits */}
        {activeTab === "visits" && (
          <div className="bg-white/90 rounded-2xl p-8 shadow-md">
            {visits.length === 0 ? (
              <p className="text-gray-600 text-center text-lg">
                You haven’t logged any visits yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {visits.map((visit, idx) => (
                  <li
                    key={idx}
                    className="border-l-4 border-green-600 pl-4 bg-white/80 py-3 rounded"
                  >
                    <h4 className="text-lg font-semibold text-gray-800">
                      {visit.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Visited on {visit.dateVisited}
                      {visit.durationDays
                        ? ` · Stayed ${visit.durationDays} days`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Map */}
        {activeTab === "map" && (
          <div className="bg-white/90 rounded-3xl p-5 shadow-xl ring-1 ring-green-100 backdrop-blur-sm h-[560px] md:h-[600px] lg:h-[640px] relative overflow-hidden">
            {/* Top-right: layer toggles */}
            <div className="absolute z-[400] top-4 right-4">
              <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-3 py-2 flex items-center gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    showAll
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShowAll((v) => !v)}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    showVisited
                      ? "bg-green-700 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShowVisited((v) => !v)}
                >
                  Visited
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    showFavorites
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShowFavorites((v) => !v)}
                >
                  Favorites
                </button>
              </div>
            </div>

            {/* Top-left: stats */}
            <div className="absolute z-[400] top-4 left-4">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: "#9CA3AF" }}
                  />
                  <span>
                    All: <b>{stats.all}</b>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: "#10B981" }}
                  />
                  <span>
                    Visited: <b>{stats.visited}</b>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: "#F59E0B" }}
                  />
                  <span>
                    Favorites: <b>{stats.favorites}</b>
                  </span>
                </div>
              </div>
            </div>

            <MapContainer
              // Focus on Peninsular Malaysia; clamp pan range
              center={[4.5, 102.0]}
              zoom={7.2}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
              zoomControl={true}
              maxBounds={[
                [0.8, 99.5], // SW
                [7.3, 104.7], // NE
              ]}
              maxBoundsViscosity={1.0}
              minZoom={6.6}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* All camps (grey) */}
              {showAll &&
                allCamps
                  .filter((c) => c.latitude && c.longitude)
                  .map((camp) => (
                    <Marker
                      key={`all-${camp.id}`}
                      position={[camp.latitude!, camp.longitude!]}
                      icon={iconFor("#9CA3AF")}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <strong>{camp.name}</strong>
                          <div className="text-sm text-gray-600">
                            {camp.state}
                          </div>
                          <Link
                            href={`/camp/${camp.id}`}
                            className="text-green-700 underline text-sm"
                          >
                            View detail →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

              {/* Visited (green) */}
              {showVisited &&
                visitedCampPoints.map((camp) => (
                  <Marker
                    key={`visited-${camp.id}`}
                    position={[camp.latitude!, camp.longitude!]}
                    icon={iconFor("#10B981")}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>Visited: {camp.name}</strong>
                        <div className="text-sm text-gray-600">
                          {camp.state}
                        </div>
                        <Link
                          href={`/camp/${camp.id}`}
                          className="text-green-700 underline text-sm"
                        >
                          View detail →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Favorites (gold) */}
              {showFavorites &&
                favoriteCampPoints.map((camp) => (
                  <Marker
                    key={`fav-${camp.id}`}
                    position={[camp.latitude!, camp.longitude!]}
                    icon={iconFor("#F59E0B")}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>Favorite: {camp.name}</strong>
                        <div className="text-sm text-gray-600">
                          {camp.state}
                        </div>
                        <Link
                          href={`/camp/${camp.id}`}
                          className="text-green-700 underline text-sm"
                        >
                          View detail →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        )}
      </div>
    </main>
  );
}
