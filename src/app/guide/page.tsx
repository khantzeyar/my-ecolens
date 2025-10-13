/* eslint-disable */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import jsPDF from "jspdf";

/* ======================= Types ======================= */
interface GuideCardProps {
  title: string;
  icon?: string; // remixicon class
  color: string; // tailwind gradient: from-.. to-..
  description: string;
  itemCount?: string | number;
  onClick?: () => void;
}

interface ChecklistGroup {
  group: string;
  items: (string | { name: string; custom?: boolean })[];
}

interface Tip {
  title: string;
  description: string;
  details?: string;
  learnMoreHref?: string;
}

type Category =
  | ({
      id: string;
      title: string;
      icon: string;
      color: string;
      description: string;
      itemCount?: string | number;
      checklist: ChecklistGroup[];
    })
  | ({
      id: string;
      title: string;
      icon: string;
      color: string;
      description: string;
      itemCount?: string | number;
      tips: Tip[];
    });

/* ======================= Static Data ======================= */
const categories: Category[] = [
  {
    id: "essentials",
    title: "Packing Checklist",
    icon: "ri-shopping-bag-3-line",
    color: "from-blue-500 to-blue-700",
    description: "",
    itemCount: "40+",
    checklist: [
      { group: "Sleeping Gear", items: ["Tent", "Sleeping Bag", "Sleeping Mat", "Pillow", "Blanket"] },
      {
        group: "Cooking Essentials",
        items: [
          "Cooking Stove",
          "Gas Canisters",
          "Cooking Pot / Pan",
          "Utensils",
          "Plates / Bowls",
          "Cups / Mugs",
          "Cutting Board & Knife",
          "Dish Soap & Sponge",
        ],
      },
      { group: "Food & Water", items: ["Drinking Water", "Water Filter / Purification Tablets", "Packed Meals / Instant Food", "Snacks", "Cooler Box", "Electrolyte Powder"] },
      {
        group: "Safety & First Aid",
        items: [
          "First Aid Kit",
          "Insect Repellent (DEET-based)",
          "Sunscreen (SPF 30+)",
          "Personal Medication",
          "Hand Sanitizer",
          "Anti-diarrhea Medicine",
          "Oral Rehydration Salts",
        ],
      },
      { group: "Lighting & Power", items: ["Flashlight", "Headlamp", "Lantern", "Extra Batteries", "Power Bank", "Solar Charger"] },
      {
        group: "Clothing & Footwear",
        items: [
          "Hiking Shoes / Boots",
          "Extra Socks",
          "Lightweight Raincoat",
          "Quick-dry Pants",
          "Long-sleeve Shirt (UV protection)",
          "Hat / Cap",
          "Mosquito Net Clothing",
        ],
      },
      { group: "Malaysia Essentials", items: ["Mosquito Coils", "Cooling Powder", "Waterproof Document Pouch", "Emergency Whistle", "Local Emergency Numbers Card", "Portable Fan"] },
      { group: "Others", items: ["Backpack", "Map / Compass / GPS", "Camping Chair", "Trash Bags", "Multi-tool / Swiss Knife", "Rope / Paracord", "Towel", "Toiletries"] },
    ] as ChecklistGroup[],
  },
  {
    id: "emergency",
    title: "Emergency Info",
    icon: "ri-phone-line",
    color: "from-rose-500 to-red-600",
    description: "",
    itemCount: "10",
    tips: [
      { title: "Emergency Contacts", description: "Police: 999, Fire & Rescue: 994, Ambulance: 999." },
      { title: "Nearest Ranger / Forest Dept", description: "Locate the ranger station or park office before setting up camp." },
      { title: "Hospital Locator", description: "Know the nearest hospital or clinic to your campsite in case of emergencies." },
      { title: "Mobile Signal", description: "Check network coverage; bring a satellite phone if camping in remote areas." },
      { title: "Emergency Shelter", description: "Identify the nearest shelter or evacuation center in case of storms." },
      { title: "Whistle & Signal", description: "Carry a whistle, flashlight, or mirror for distress signaling." },
      { title: "Group Safety", description: "Always inform friends or family about your camping location and duration." },
      {
        title: "Signaling for Rescue",
        description: "Use whistle, mirror, and high-visibility cloth.",
        details:
          "Standard distress: three short blasts or flashes; large ground signals (SOS) in open areas.",
      },
    ],
  },
  {
    id: "nature",
    title: "Nature Safety Tips",
    icon: "ri-leaf-line",
    color: "from-emerald-500 to-green-600",
    description:
      "",
    itemCount: "4",
    tips: [
      {
        title: "Wildlife Safety",
        description: "",
        details:
          "Food & camp: seal odors (bags/containers); cook away from sleeping area.\nTravel: avoid solo hikes at dawn/dusk in dense brush; speak up at blind corners.\nDistance: ≥25–30 m for most mammals, ≥100 m for large animals.\nNever feed, chase, or approach infants.",
      },
      {
        title: "Extreme Weather",
        description: "",
        details:
          "Rain/flash floods: do not camp in valleys or dry riverbeds; move to higher ground early.\nLightning: avoid lone trees/metal; stow antennae/poles; feet together in a crouch.\nHeat: hydrate with electrolytes, light quick-dry clothing, schedule low-intensity noon activities.",
      },
      {
        title: "Toxic Plants & Mushrooms",
        description: "Identify and avoid common toxic species; never ingest unknown plants or fungi.",
        details:
          "Look for sap that causes dermatitis and brightly colored mushrooms.\nExposure: rinse skin with water, avoid sunlight, seek medical advice.",
      },
      {
        title: "Snake Awareness",
        description: "Stay calm; back away slowly; do not attempt to handle snakes.",
        details:
          "Wear ankle-covering boots.\nIf bitten: keep still, immobilize the limb, get immediate medical help.\nDo NOT cut, suck, or apply a tourniquet.",
      },
    ],
  },
];

/* ======================= Small Components ======================= */
// Polished card for homepage: compact, with icon + two-line count
const GuideCard: React.FC<GuideCardProps> = ({
  title,
  icon,
  color,
  description,
  itemCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
    >
      {/* gradient veil */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-25 group-hover:opacity-35 transition-opacity`} />
      {/* subtle noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: "url('/images/noise.png')" }} />
      <div className="relative p-5 md:p-6 flex items-center gap-4">
        {/* icon bubble */}
        <div className="shrink-0 h-12 w-12 rounded-full bg-white/20 border border-white/30 grid place-items-center backdrop-blur-md">
          <i className={`${icon || "ri-compass-3-line"} text-white text-2xl`} />
        </div>
        {/* text */}
        <div className="min-w-0 text-left">
          {/* two-line counter */}
          {itemCount !== undefined && (
            <div className="leading-none">
              <div className="text-xl font-extrabold text-white tracking-tight">{String(itemCount)}</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/90">items</div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg md:text-xl font-extrabold text-white leading-snug">{title}</h3>
          <p className="mt-1 text-[13px] md:text-sm text-white/90 line-clamp-2">{description}</p>
        </div>
        {/* chevron */}
        <i className="ri-arrow-right-up-line text-white/90 text-xl opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
    </button>
  );
};

/* ======================= Utils ======================= */
function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
function dedupe<T extends { place_id?: string }>(arr: T[]) {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const id = String(x.place_id ?? Math.random());
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/* ======================= Main ======================= */
export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [customChecklist, setCustomChecklist] = useState<ChecklistGroup[]>((categories[0] as any).checklist ?? []);
  const [newItem, setNewItem] = useState("");
  const [targetGroup, setTargetGroup] = useState((categories[0] as any).checklist?.[0]?.group ?? "");

  // Emergency: geolocation + facilities
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [hLoading, setHLoading] = useState(false);
  const [hError, setHError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"hospitals" | "clinics">("hospitals");

  // Prompt modal state
  const [showLocPrompt, setShowLocPrompt] = useState(false);
  const [pendingMode, setPendingMode] = useState<"hospitals" | "clinics" | null>(null);

  const isSecureOrLocal =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" || window.location.hostname === "localhost");

  // dynamic count for Essentials
  const essentialsCount = useMemo(
    () => customChecklist.reduce((sum, g) => sum + g.items.length, 0),
    [customChecklist]
  );

  const toxicGallery = useMemo(
    () => [
      {
        key: "giant-hogweed",
        common: "Giant Hogweed Group (Heracleum spp.)",
        img: "/images/Giant_Hogweed.jpg",
        hazard: "Sap causes severe skin reactions, including blistering and burning when exposed to sunlight.",
        response: "Rinse affected area with water immediately, avoid sunlight, and seek medical attention.",
      },
      {
        key: "manchineel",
        common: "Manchineel (Hippomane Mancinella)",
        img: "/images/Manchineel.jpg",
        hazard: "Extremely toxic sap and fruit; rain dripping from leaves can burn skin.",
        response: "Avoid all contact. If exposed, rinse thoroughly with water and obtain medical care immediately.",
      },
      {
        key: "dieffenbachia",
        common: "Dieffenbachia",
        img: "/images/Dieffenbachia.jpg",
        hazard: "Contains calcium oxalate crystals that irritate skin and mouth; ingestion causes swelling and pain.",
        response: "Rinse skin or mouth with water. Seek medical attention if symptoms are severe.",
      },
      {
        key: "rubber-vine",
        common: "Rubber Vine (Cryptostegia Grandiflora)",
        img: "/images/Rubber_Vine.jpg",
        hazard: "Sap contains cardiac glycosides; skin irritation is possible, ingestion is dangerous.",
        response: "Avoid contact with sap. Rinse skin if exposed and seek medical care immediately if ingested.",
      },
      {
        key: "toxic-mushrooms",
        common: "Brightly Colored Tropical Mushrooms (various toxic spp.)",
        img: "/images/Brightly_Colored_Tropical_Mushrooms.jpg",
        hazard: "Many species are highly toxic and can be fatal even after cooking.",
        response: "Never consume wild mushrooms. Seek immediate medical attention if ingestion occurs.",
      },
      {
        key: "oleander",
        common: "Oleander (Nerium Oleander)",
        img: "/images/Oleander.jpg",
        hazard: "All parts contain cardiac glycosides; ingestion can disrupt heart rhythm.",
        response: "Avoid all contact and ingestion. Seek urgent medical care if exposure occurs.",
      },
    ],
    []
  );

  // checklist persistence
  useEffect(() => {
    const saved = localStorage.getItem("customChecklist");
    if (saved) setCustomChecklist(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("customChecklist", JSON.stringify(customChecklist));
  }, [customChecklist]);

  const category = categories.find((c) => c.id === activeCategory) as Category | undefined;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };
  const addCustomItem = () => {
    if (!newItem.trim()) return;
    setCustomChecklist((prev) =>
      prev.map((g) => (g.group === targetGroup ? { ...g, items: [...g.items, { name: newItem.trim(), custom: true }] } : g))
    );
    setNewItem("");
  };
  const deleteItem = (groupName: string, item: string) => {
    setCustomChecklist((prev) =>
      prev.map((g) =>
        g.group === groupName ? { ...g, items: g.items.filter((i) => (typeof i === "string" ? i !== item : i.name !== item)) } : g
      )
    );
    setCheckedItems((prev) => prev.filter((i) => i !== item));
  };

  // PDF export
  const downloadChecklistPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Camping Checklist", 14, 20);

    let y = 30;
    customChecklist.forEach((group) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(group.group, 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      group.items.forEach((item) => {
        const itemName = typeof item === "string" ? item : item.name;
        const checked = checkedItems.includes(itemName) ? "[x]" : "[ ]";
        doc.text(`${checked} ${itemName}`, 20, y);
        y += 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 5;
    });

    doc.save("camping_checklist.pdf");
  };

  // --- Geolocation helpers
  const getPositionOnce = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const ensureLocationOnce = async (): Promise<{ lat: number; lon: number }> => {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation not supported by your browser.");
    }
    if (!isSecureOrLocal) {
      throw new Error("Geolocation is blocked on non-HTTPS pages opened by IP. Use http://localhost:3000 or deploy to HTTPS (e.g., Vercel).");
    }

    try {
      const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
      if (status && status.state === "denied") {
        throw new Error("Location permission was denied. Enable it in your browser settings.");
      }
    } catch {
      // ignore and continue to prompt
    }

    try {
      const p1 = await getPositionOnce({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      return { lat: p1.coords.latitude, lon: p1.coords.longitude };
    } catch {
      const p2 = await getPositionOnce({ enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 });
      return { lat: p2.coords.latitude, lon: p2.coords.longitude };
    }
  };

  // Search helpers
  const queryNominatim = async (term: string, box: { left: number; right: number; top: number; bottom: number }) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=50&q=${encodeURIComponent(
      term
    )}&viewbox=${box.left},${box.top},${box.right},${box.bottom}&bounded=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Nominatim error: ${res.status}`);
    }
    return (await res.json()) as any[];
  };

  const fetchFacilities = async (mode: "hospitals" | "clinics", position: { lat: number; lon: number }) => {
    setSearchType(mode);
    try {
      setHLoading(true);
      setHError(null);

      const boxes = [{ dLat: 0.25, dLon: 0.25 }, { dLat: 0.5, dLon: 0.5 }];

      const terms = mode === "hospitals" ? ["hospital", "emergency", "medical centre", "medical center"] : ["clinic", "polyclinic", "health clinic", "medical clinic"];

      let results: any[] = [];
      for (const { dLat, dLon } of boxes) {
        const box = { left: position.lon - dLon, right: position.lon + dLon, top: position.lat + dLat, bottom: position.lat - dLat };
        const batches = await Promise.allSettled(terms.map((t) => queryNominatim(t, box)));
        const merged: any[] = [];
        for (const b of batches) if (b.status === "fulfilled") merged.push(...(b.value as any[]));
        if (merged.length > 0) results = merged;
        if (results.length > 0) break;
      }

      if (results.length === 0) {
        setFacilities([]);
        setHError("No results nearby. This might be a temporary map data gap—try again later.");
        return;
      }

      const withDistance = dedupe(results)
        .map((d) => ({ ...d, distanceKm: haversineKm(position, { lat: parseFloat(d.lat), lon: parseFloat(d.lon) }) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setPos(position);
      setFacilities(withDistance);
    } catch (e: any) {
      const msg = typeof e?.message === "string" && e.message.includes("Too Many Requests") ? "Map service is rate-limiting this network. Please retry in ~1 minute." : e?.message || "Failed to fetch places.";
      setHError(msg);
    } finally {
      setHLoading(false);
    }
  };

  // Click on a search button → open the location confirm modal
  const openLocationPrompt = (mode: "hospitals" | "clinics") => {
    setPendingMode(mode);
    setShowLocPrompt(true);
    setHError(null);
  };

  // User confirms "Use my location"
  const confirmUseLocationAndSearch = async () => {
    const mode = pendingMode;
    if (!mode) return;
    try {
      setHError(null);
      setHLoading(true);
      const p = await ensureLocationOnce();
      await fetchFacilities(mode, p);
    } catch (err: any) {
      setHError(err?.message || "Location permission is required to search nearby places.");
    } finally {
      setShowLocPrompt(false);
      setPendingMode(null);
      setHLoading(false);
    }
  };

  const handleBackToCards = () => setActiveCategory(null);

  /* ============== Subpages (unchanged logic) ============== */
  if (activeCategory && category) {
    const isChecklist = (category as any).checklist;
    const tips: Tip[] = (category as any).tips || [];
    const isEmergency = (category as any).id === "emergency";
    const isNature = (category as any).id === "nature";

    return (
      <main className="pt-24 px-4 md:px-6 pb-24 min-h-screen bg-fixed bg-cover" style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5 mt-8">
            <button onClick={handleBackToCards} className="bg-white/15 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/25 cursor-pointer">
              ← Back to Guide
            </button>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-10 drop-shadow text-center">{(category as any).title}</h2>

          {/* Emergency */}
          {isEmergency && (
            <>
              <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emergency Calls (Left) */}
                <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 shadow border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">One-tap Emergency Calls</h3>
                  <div className="flex gap-3 flex-wrap md:flex-nowrap">
                    <a href="tel:999" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700">
                      <i className="ri-police-car-line" /> Police 999
                    </a>
                    <a href="tel:994" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700">
                      <i className="ri-fire-line" /> Fire & Rescue 994
                    </a>
                    <a href="tel:999" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700">
                      <i className="ri-first-aid-kit-line" /> Ambulance 999
                    </a>
                  </div>
                </div>

                {/* Nearby Hospitals & Clinics (Right) */}
                <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 shadow border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Hospitals & Clinics</h3>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <button onClick={() => openLocationPrompt("hospitals")} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 cursor-pointer">
                      <i className="ri-hospital-line" /> Search nearby hospitals
                    </button>
                    <button onClick={() => openLocationPrompt("clinics")} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer">
                      <i className="ri-first-aid-kit-line" /> Search nearby clinics
                    </button>
                    {pos && (
                      <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                        <i className="ri-map-pin-2-line" />
                        {pos.lat.toFixed(4)}, {pos.lon.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {/* Facilities list */}
                  {hError && <p className="text-red-600 mb-2">{hError}</p>}
                  {hLoading && <p className="text-gray-700">Locating / Searching…</p>}
                  {!hLoading && facilities.length > 0 && (
                    <ul className="space-y-4">
                      {facilities.slice(0, 5).map((h, idx) => {
                        const lat = parseFloat(h.lat);
                        const lon = parseFloat(h.lon);
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                        const phone = h?.extratags?.phone || h?.extratags?.contact_phone;
                        return (
                          <li key={`${h.place_id}-${idx}`} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {h.display_name?.split(",")[0] || (searchType === "clinics" ? "Clinic" : "Hospital")}
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-2">{h.display_name}</div>
                                <div className="text-sm text-gray-700 mt-1">Straight-line: {h.distanceKm.toFixed(2)} km</div>
                                {phone && (
                                  <div className="text-sm text-gray-700 mt-1">
                                    Phone:{" "}
                                    <a className="text-emerald-700 font-medium hover:underline" href={`tel:${(phone as string).replace(/\s/g, "")}`}>
                                      {phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {phone && (
                                  <a href={`tel:${(phone as string).replace(/\s/g, "")}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                                    <i className="ri-phone-line" /> Call
                                  </a>
                                )}
                                <a href={gmaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                  <i className="ri-map-pin-line" /> Google Maps
                                </a>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {!hLoading && pos && facilities.length === 0 && !hError && (
                    <p className="text-gray-700">No nearby {searchType === "clinics" ? "clinics" : "hospitals"} found in the current search area. Try again in a moment.</p>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Insect Bites & Stings */}
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-500 text-white p-2.5 rounded-xl shadow-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl">Insect Bites & Stings</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 text-base leading-relaxed">
                      <div className="flex gap-2">
                        <span className="text-red-500 font-bold shrink-0">1.</span>
                        <p>Move away from the source of the bite or sting. Remove the stinger carefully using a flat object, such as a card, without squeezing it.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-red-500 font-bold shrink-0">2.</span>
                        <p>Clean the affected area with soap and water. Apply a cold pack for 10-15 minutes, alternating on and off as needed to reduce swelling.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-red-500 font-bold shrink-0">3.</span>
                        <p>Take an oral antihistamine to alleviate itching or swelling.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm leading-relaxed p-4 rounded-xl shadow-sm mt-6 h-37 overflow-y-auto mt-10">
                    ⚠️ Seek immediate medical attention if there are signs of difficulty breathing, facial swelling, or other severe reactions.
                  </div>
                </div>

                {/* Cuts & Wounds */}
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 text-white p-2.5 rounded-xl shadow-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl">Cuts & Wounds</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 text-base leading-relaxed">
                      <div className="flex gap-2">
                        <span className="text-blue-500 font-bold shrink-0">1.</span>
                        <p>Apply direct pressure for 5-10 minutes to control bleeding</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-blue-500 font-bold shrink-0">2.</span>
                        <p>Rinse the wound thoroughly with clean water, apply antiseptic, and cover with a sterile dressing.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm leading-relaxed p-4 rounded-xl shadow-sm mt-6 h-37 overflow-y-auto">
                    ⚠️ Seek medical attention if the wound is deep, heavily contaminated, or bleeding persists. 
                  </div>
                </div>

                {/* Heat Exhaustion */}
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl">Heat Exhaustion</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 text-base leading-relaxed">
                      <div className="flex gap-2">
                        <span className="text-orange-500 font-bold shrink-0">1.</span>
                        <p>Move to a shaded or cool area, loosen clothing, and apply cool water to the skin while fanning to lower body temperature.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-orange-500 font-bold shrink-0">2.</span>
                        <p>Drink oral rehydration solutions or electrolyte-containing fluids. Avoid alcohol and caffeinated beverages.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm leading-relaxed p-4 rounded-xl shadow-sm mt-6 h-37 overflow-y-auto">
                    ⚠️ If the person shows confusion, collapses, or has hot, dry skin, this may indicate heat stroke. Contact emergency medical services immediately.
                  </div>
                </div>
                
                {/* Signaling for Rescue */}
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl">Signaling for Rescue</h3>
                  </div>
                  <div className="space-y-3 text-gray-700 text-base leading-relaxed">
                    <p><strong className="text-emerald-600">Audible:</strong> Use a whistle or three short blasts, repeating at intervals.</p>
                    <p><strong className="text-emerald-600">Visual:</strong> Signal with mirror flashes toward aircraft or ground teams, or use a high-visibility cloth or headlamp.</p>
                    <p><strong className="text-emerald-600">Ground:</strong> Create large "SOS" markings or arrows in open areas using rocks or logs with strong contrast.</p>
                    <p><strong className="text-emerald-600">Stay Visible:</strong> Position yourself in open terrain, limit movement, and send signals periodically to conserve battery.</p>
                    <p><strong className="text-emerald-600">Stay Calm:</strong> Control your breathing, conserve energy, and avoid panic.</p>
                  </div>
                </div>
              </section>

              {/* Location permission modal */}
              {showLocPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white w-[92vw] max-w-md rounded-2xl shadow-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900">Use your location?</h4>
                    <p className="text-gray-700 mt-2">
                      To search nearby {pendingMode === "clinics" ? "clinics" : "hospitals"}, the site needs your permission to access your location.
                    </p>
                    <div className="mt-5 flex items-center justify-end gap-2">
                      <button onClick={() => { setShowLocPrompt(false); setPendingMode(null); }} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button onClick={confirmUseLocationAndSearch} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                        Yes, use my location
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Nature */}
          {isNature && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Wildlife Safety */}
                <div className="group bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Wildlife Safety</h3>
                  </div>
                  <div className="space-y-2.5 text-gray-700 text-sm leading-relaxed">
                    <p><strong className="text-amber-600">Food & Camp:</strong> Store all food in sealed containers or odor-proof bags, and cook well away from sleeping areas.</p>
                    <p><strong className="text-amber-600">Travel:</strong> Avoid hiking alone at dawn or dusk in dense brush, and make your presence known around blind corners.</p>
                    <p><strong className="text-amber-600">Distance:</strong> Keep 25-30 meters away from most animals, and at least 100 meters from larger wildlife.</p>
                    <p><strong className="text-amber-600">Never:</strong> Feed, chase, or approach wild animals.</p>
                  </div>
                </div>

                {/* Extreme Weather */}
                <div className="group bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-indigo-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Extreme Weather</h3>
                  </div>
                  <div className="space-y-2.5 text-gray-700 text-sm leading-relaxed">
                    <p><strong className="text-indigo-600">Rain/Flash Floods:</strong> Avoid camping in valleys or dry riverbeds. Move to higher ground early to stay safe.</p>
                    <p><strong className="text-indigo-600">Lightning:</strong> Stay away from lone trees and metal objects. Keep antennae and poles stowed, and crouch with feet together if caught outside.</p>
                    <p><strong className="text-indigo-600">Heat:</strong> Stay hydrated with electrolytes, wear light, breathable clothing, and plan low-intensity activities during the hottest part of the day.</p>
                  </div>
                </div>

                {/* Toxic Plants */}
                <div className="group bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-purple-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8 6 3 10 3 14a9 9 0 0018 0c0-4-5-8-9-12z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Toxic Plants</h3>
                  </div>
                  <div className="space-y-2.5 text-gray-700 text-sm leading-relaxed">
                    <p><strong className="text-purple-600">Avoid:</strong> Touching or consuming unknown plants and mushrooms.</p>
                    <p><strong className="text-purple-600">Warning Signs:</strong> Sap that irritates the skin or brightly colored mushrooms are indicators of toxicity.</p>
                    <p><strong className="text-purple-600">If Exposed:</strong> Rinse the affected area with water, keep it out of sunlight, and seek medical attention if needed.</p>
                  </div>
                </div>

                {/* Snake Awareness */}
                <div className="group bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-rose-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Snake Awareness</h3>
                  </div>
                  <div className="space-y-2.5 text-gray-700 text-sm leading-relaxed">
                    <p><strong className="text-rose-600">Action:</strong> Stay calm, move away slowly, and never attempt to handle a snake.</p>
                    <p><strong className="text-rose-600">Prevention:</strong> Wear sturdy, ankle-covering boots when hiking or in snake-prone areas.</p>
                    <p><strong className="text-rose-600">If Bitten:</strong> Remain still, keep the affected limb immobilised, and seek immediate medical attention.</p>
                    <p><strong className="text-rose-600">Do Not:</strong> Cut the wound, suck out venom, or apply a tourniquet.</p>
                  </div>
                </div>
              </section>

              <section className="mb-4 mt-20">
                <h3 className="text-4xl font-semibold text-white mb-10 drop-shadow text-center">Common Toxic Plants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toxicGallery.map((p) => (
                    <div key={p.key} className="bg-white/85 rounded-2xl shadow border border-gray-200 overflow-hidden">
                      <div className="relative w-full h-44 bg-gray-100">
                        <img
                          src={p.img}
                          alt={p.common}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/bg-camping.jpg";
                          }}
                        />
                      </div>
                      <div className="p-4 mb-2">
                        <div className="font-semibold text-gray-900">{p.common}</div>
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-red-700">Hazard: </span>
                          <span className="text-gray-700">{p.hazard}</span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-emerald-700">What to do: </span>
                          <span className="text-gray-700">{p.response}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Default tips */}
          {!isChecklist && tips.length > 0 && !isEmergency && !isNature && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip) => (
                <div key={tip.title} className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200 hover:shadow-lg transition">
                  <h3 className="font-bold text-gray-900">{tip.title}</h3>
                  <p className="text-gray-700 mt-1">{tip.description}</p>
                  {tip.details && <p className="text-gray-600 mt-3 leading-relaxed">{tip.details}</p>}
                  {tip.learnMoreHref && (
                    <div className="mt-4">
                      <Link href={tip.learnMoreHref} className="inline-flex items-center gap-2 text-sm text-emerald-700 font-semibold hover:underline">
                        Learn More <i className="ri-external-link-line" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Checklist page */}
          {isChecklist && (
            <div>
              {/* Add custom item */}
              <div className="mt-8 bg-white/85 p-4 rounded-2xl shadow border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Add Your Own Items</h3>
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Enter custom item" className="flex-1 px-3 py-2 border rounded" />
                  <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} className="px-3 py-2 border rounded">
                    {(customChecklist as any).map((group: ChecklistGroup) => (
                      <option key={group.group} value={group.group}>
                        {group.group}
                      </option>
                    ))}
                  </select>
                  <button onClick={addCustomItem} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(customChecklist as any).map((group: ChecklistGroup) => (
                  <div key={group.group} className="bg-white/85 p-4 rounded-2xl shadow border border-gray-200 hover:shadow-lg transition">
                    <h3 className="font-bold text-gray-900">{group.group}</h3>
                    <ul className="pl-5 mt-2 text-gray-700 space-y-2">
                      {group.items.map((item) => {
                        const itemName = typeof item === "string" ? item : item.name;
                        const isCustom = typeof item !== "string" && item.custom;
                        return (
                          <li key={itemName} className="flex items-center justify-between group">
                            <label className="flex items-center">
                              <input type="checkbox" checked={checkedItems.includes(itemName)} onChange={() => toggleCheck(itemName)} className="mr-2 w-4 h-4" />
                              {itemName}
                            </label>
                            {isCustom && (
                              <button onClick={() => deleteItem(group.group, itemName)} className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition">
                                <i className="ri-delete-bin-line text-lg" />
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* PDF Download */}
              <div className="mt-12 text-center -mb-8">
                <button onClick={downloadChecklistPdf} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 cursor-pointer">
                  Download Checklist (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ============== Homepage (refreshed layout) ============== */
  return (
    <main className="pt-24 md:pt-28 px-4 md:px-6 pb-24 min-h-screen bg-fixed bg-cover" style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}>
      <div className="max-w-7xl mx-auto mt-5">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] px-6 md:px-10 py-10 md:py-14 mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-transparent" />
          <div className="relative text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-sm">Camping Guide</h1>
            <p className="mt-3 text-sm md:text-base text-white/90">
              Pack smart. Stay safe. Explore responsibly.
            </p>
          </div>
        </header>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => {
            const props = { ...(cat as any) };
            if ((cat as any).id === "essentials") props.itemCount = essentialsCount;
            return <GuideCard key={(cat as any).id} {...props} onClick={() => setActiveCategory((cat as any).id)} />;
          })}
        </div>

        {/* Do’s & Don’ts (polished block) */}
        <section className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">Responsible Camping: Do’s & Don’ts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-100">
              <h3 className="font-bold text-green-700 mb-3">✅ Do’s</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Clean up your campsite and take all trash with you.</li>
                <li>Respect wildlife and keep a safe distance.</li>
                <li>Follow local park and forest regulations.</li>
                <li>Use eco-friendly products (biodegradable soap, reusable containers).</li>
                <li>Save water and use it sparingly at campsites.</li>
                <li>Use solar-powered lamps or rechargeable batteries.</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl shadow border border-red-100">
              <h3 className="font-bold text-red-600 mb-3">❌ Don’ts</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Do not leave litter or food scraps behind.</li>
                <li>Do not start open fires outside of safe zones.</li>
                <li>Do not damage plants or trees for firewood.</li>
                <li>Do not feed wild animals — it harms their habits.</li>
              </ul>
            </div>
          </div>

          {/* Illustrated steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Image src="/images/cleanup.jpg" alt="Pack Trash Correctly" width={160} height={160} className="w-full h-48 md:h-50 object-cover rounded-2xl mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Pack Trash Correctly</h3>
              <p className="text-gray-600 mt-2">Use trash bags and seal them tightly. Carry all waste back instead of burying it.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image src="/images/fire-safety.jpg" alt="Extinguish Fires Properly" width={160} height={160} className="w-full h-48 md:h-50 object-cover rounded-2xl mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Extinguish Fires Properly</h3>
              <p className="text-gray-600 mt-2">Pour water and stir ashes until cold. Never leave smoldering embers behind.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image src="/images/resources.jpg" alt="Eco-friendly Habits" width={160} height={160} className="w-full h-48 md:h-50 object-cover rounded-2xl mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Eco-friendly Habits</h3>
              <p className="text-gray-600 mt-2">Use biodegradable soap, reusable bottles, and minimize plastic waste.</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/why"
            className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-4 rounded-2xl bg-emerald-600 text-white text-base md:text-l font-semibold shadow hover:bg-emerald-700 -mb-10"
          >
            Why Eco Camping Matters →
          </Link>
        </div>
      </div>
    </main>
  );
}

