"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import jsPDF from "jspdf";

// ---------------- Types ----------------
interface GuideCardProps {
  title: string;
  icon: string;
  color: string;
  description: string;
  itemCount?: string | number; // ← show above title
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

// -------------- Static Data --------------
const categories: Category[] = [
  {
    id: "essentials",
    title: "Essentials",
    icon: "ri-shopping-bag-3-line",
    color: "from-blue-500 to-blue-600",
    description:
      "Not sure what to pack before camping? Open for a complete checklist.",
    itemCount: "40+",
    checklist: [
      {
        group: "Sleeping Gear",
        items: ["Tent", "Sleeping Bag", "Sleeping Mat", "Pillow", "Blanket"],
      },
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
      {
        group: "Food & Water",
        items: [
          "Drinking Water",
          "Water Filter / Purification Tablets",
          "Packed Meals / Instant Food",
          "Snacks",
          "Cooler Box",
          "Electrolyte Powder",
        ],
      },
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
      {
        group: "Lighting & Power",
        items: [
          "Flashlight",
          "Headlamp",
          "Lantern",
          "Extra Batteries",
          "Power Bank",
          "Solar Charger",
        ],
      },
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
      {
        group: "Malaysia Essentials",
        items: [
          "Mosquito Coils",
          "Cooling Powder",
          "Waterproof Document Pouch",
          "Emergency Whistle",
          "Local Emergency Numbers Card",
          "Portable Fan",
        ],
      },
      {
        group: "Others",
        items: [
          "Backpack",
          "Map / Compass / GPS",
          "Camping Chair",
          "Trash Bags",
          "Multi-tool / Swiss Knife",
          "Rope / Paracord",
          "Towel",
          "Toiletries",
        ],
      },
    ] as ChecklistGroup[],
  },

  // Emergency
  {
    id: "emergency",
    title: "Emergency Info",
    icon: "ri-phone-line",
    color: "from-rose-500 to-red-600",
    description: "Use quick-dial and find nearby medical care.",
    itemCount: "10",
    tips: [
      {
        title: "Emergency Contacts",
        description: "Police: 999, Fire & Rescue: 994, Ambulance: 999.",
      },
      {
        title: "Nearest Ranger / Forest Dept",
        description:
          "Locate the ranger station or park office before setting up camp.",
      },
      {
        title: "Hospital Locator",
        description:
          "Know the nearest hospital or clinic to your campsite in case of emergencies.",
      },
      {
        title: "Mobile Signal",
        description:
          "Check network coverage; bring a satellite phone if camping in remote areas.",
      },
      {
        title: "Emergency Shelter",
        description:
          "Identify the nearest shelter or evacuation center in case of storms.",
      },
      {
        title: "Whistle & Signal",
        description:
          "Carry a whistle, flashlight, or mirror for distress signaling.",
      },
      {
        title: "Group Safety",
        description:
          "Always inform friends or family about your camping location and duration.",
      },
      {
        title: "Signaling for Rescue",
        description: "Use whistle, mirror, and high-visibility cloth.",
        details:
          "Standard distress: three short blasts or flashes; large ground signals (SOS) in open areas.",
      },
    ],
  },

  // Nature Awareness — curated
  {
    id: "nature",
    title: "Nature Awareness",
    icon: "ri-leaf-line",
    color: "from-emerald-500 to-green-600",
    description:
      "Quick safety primers for wildlife, extreme weather, toxic plants & mushrooms, and snakes.",
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
        description:
          "Identify and avoid common toxic species; never ingest unknown plants or fungi.",
        details:
          "Look for sap that causes dermatitis and brightly colored mushrooms.\nExposure: rinse skin with water, avoid sunlight, seek medical advice.",
      },
      {
        title: "Snake Awareness",
        description:
          "Stay calm; back away slowly; do not attempt to handle snakes.",
        details:
          "Wear ankle-covering boots.\nIf bitten: keep still, immobilize the limb, get immediate medical help.\nDo NOT cut, suck, or apply a tourniquet.",
      },
    ],
  },
];

// ---------- Small Components ----------
const GuideCard: React.FC<GuideCardProps> = ({
  title,
  color,
  description,
  itemCount,
  onClick,
}) => (
  <button
    className="relative group transition-all duration-300 hover:scale-[1.02] focus-visible:scale-[1.02] outline-none"
    onClick={onClick}
  >
    <div className="relative h-56 rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color} opacity-25 group-hover:opacity-35`}
      />
      <div className="relative h-full p-7 flex flex-col items-center justify-center text-center">
        {itemCount !== undefined && (
          // Bigger number, smaller "items"
          <div className="uppercase tracking-widest text-white/90 mb-1 font-semibold flex items-end gap-1">
            <span className="text-xl md:text-2xl font-extrabold leading-none">
              {String(itemCount)}
            </span>
            <span className="text-[10px] md:text-xs leading-none">items</span>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-base md:text-lg leading-snug text-white/95 max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  </button>
);

// ---------- Utils ----------
function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
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

// ---------- Main ----------
export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [customChecklist, setCustomChecklist] = useState<ChecklistGroup[]>(
    (categories[0] as any).checklist ?? []
  );
  const [newItem, setNewItem] = useState("");
  const [targetGroup, setTargetGroup] = useState(
    (categories[0] as any).checklist?.[0]?.group ?? ""
  );

  // Emergency: location + facilities
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [hLoading, setHLoading] = useState(false);
  const [hError, setHError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"hospitals" | "clinics">(
    "hospitals"
  );

  const isSecureOrLocal =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost");

  // prevent duplicate auto-requests
  const hasRequestedRef = useRef(false);

  // --- Dynamic count for Essentials (includes user-added custom items)
  const essentialsCount = useMemo(
    () => customChecklist.reduce((sum, g) => sum + g.items.length, 0),
    [customChecklist]
  );

  // Nature gallery images
  const toxicGallery = useMemo(
    () => [
      {
        key: "giant-hogweed",
        common: "Giant Hogweed group (Heracleum spp.)",
        img: "/images/plants/giant-hogweed.jpg",
        hazard: "Sap can cause phototoxic dermatitis with blisters/burning.",
        response:
          "Rinse with water, avoid sunlight, and seek medical advice.",
      },
      {
        key: "manchineel",
        common: "Manchineel (Hippomane mancinella)",
        img: "/images/plants/manchineel.jpg",
        hazard:
          "Highly toxic sap and fruit; rain dripping off leaves can burn skin.",
        response:
          "Avoid contact entirely; if exposed, flush with plenty of water and get medical help.",
      },
      {
        key: "dieffenbachia",
        common: "Dieffenbachia",
        img: "/images/plants/dieffenbachia.jpg",
        hazard:
          "Calcium oxalate crystals irritate mouth/skin; ingestion causes swelling and pain.",
        response: "Rinse mouth/skin and drink water; seek care if severe.",
      },
      {
        key: "rubber-vine",
        common: "Rubber Vine (Cryptostegia grandiflora)",
        img: "/images/plants/rubber-vine.jpg",
        hazard:
          "Contains cardiac glycosides; sap is irritating; ingestion is dangerous.",
        response:
          "Avoid sap contact; rinse skin if exposed; seek medical care if ingested.",
      },
      {
        key: "toxic-mushrooms",
        common: "Brightly Colored Tropical Mushrooms (various toxic spp.)",
        img: "/images/plants/blue-ring-mushroom.jpg",
        hazard: "Many species can be deadly even after cooking.",
        response:
          "Never forage/eat wild mushrooms; go to a hospital if symptoms occur.",
      },
      {
        key: "oleander",
        common: "Oleander (Nerium oleander)",
        img: "/images/plants/oleander.jpg",
        hazard:
          "All parts contain cardiac glycosides; ingestion can affect heart rhythm.",
        response:
          "Avoid contact/ingestion; seek urgent care if exposure occurs.",
      },
    ],
    []
  );

  // Checklist persistence
  useEffect(() => {
    const saved = localStorage.getItem("customChecklist");
    if (saved) setCustomChecklist(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("customChecklist", JSON.stringify(customChecklist));
  }, [customChecklist]);

  const category = categories.find(
    (c) => c.id === activeCategory
  ) as Category | undefined;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
  const addCustomItem = () => {
    if (!newItem.trim()) return;
    setCustomChecklist((prev) =>
      prev.map((g) =>
        g.group === targetGroup
          ? { ...g, items: [...g.items, { name: newItem.trim(), custom: true }] }
          : g
      )
    );
    setNewItem("");
  };
  const deleteItem = (groupName: string, item: string) => {
    setCustomChecklist((prev) =>
      prev.map((g) =>
        g.group === groupName
          ? {
              ...g,
              items: g.items.filter((i) =>
                typeof i === "string" ? i !== item : i.name !== item
              ),
            }
          : g
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

  // Location helpers (with retry)
  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setHError("Geolocation not supported by your browser.");
      return;
    }
    if (!isSecureOrLocal) {
      setHError(
        "Geolocation is blocked on non-HTTPS pages opened by IP. Use http://localhost:3000 or deploy to HTTPS (e.g., Vercel)."
      );
      return;
    }
    setHError(null);
    setHLoading(true);

    const tryOnce = (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    (async () => {
      try {
        const p1 = await tryOnce({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
        setPos({ lat: p1.coords.latitude, lon: p1.coords.longitude });
      } catch {
        try {
          const p2 = await tryOnce({
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 30000,
          });
          setPos({ lat: p2.coords.latitude, lon: p2.coords.longitude });
        } catch (err: any) {
          setHError(err?.message || "Failed to get your location.");
        }
      } finally {
        setHLoading(false);
      }
    })();
  };

  // 👉 NEW: Auto-request location when the Emergency page opens.
  useEffect(() => {
    const isEmergency = activeCategory === "emergency";
    if (!isEmergency || hasRequestedRef.current || pos) return;

    // If Permissions API exists, use it to reduce unnecessary prompts.
    try {
      // @ts-expect-error — PermissionName typing is broader in browsers
      navigator.permissions
        ?.query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (status.state === "granted" || status.state === "prompt") {
            hasRequestedRef.current = true;
            requestLocation();
          } else {
            // If denied, keep UI as-is; user can still click the button.
            hasRequestedRef.current = true;
          }
        })
        .catch(() => {
          hasRequestedRef.current = true;
          requestLocation();
        });
    } catch {
      hasRequestedRef.current = true;
      requestLocation();
    }
  }, [activeCategory, pos]); // runs when user enters Emergency Info

  // Search helpers
  const queryNominatim = async (
    term: string,
    box: { left: number; right: number; top: number; bottom: number }
  ) => {
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

  const fetchFacilities = async (mode: "hospitals" | "clinics") => {
    if (!pos) {
      setHError("No location yet. Tap “Use my location” first.");
      return;
    }
    setSearchType(mode);

    try {
      setHLoading(true);
      setHError(null);

      const boxes = [
        { dLat: 0.25, dLon: 0.25 },
        { dLat: 0.5, dLon: 0.5 },
      ];

      const terms =
        mode === "hospitals"
          ? ["hospital", "emergency", "medical centre", "medical center"]
          : ["clinic", "polyclinic", "health clinic", "medical clinic"];

      let results: any[] = [];
      for (const { dLat, dLon } of boxes) {
        const box = {
          left: pos.lon - dLon,
          right: pos.lon + dLon,
          top: pos.lat + dLat,
          bottom: pos.lat - dLat,
        };

        const batches = await Promise.allSettled(
          terms.map((t) => queryNominatim(t, box))
        );
        const merged: any[] = [];
        for (const b of batches)
          if (b.status === "fulfilled")
            merged.push(...(b as PromiseFulfilledResult<any[]>).value);
        if (merged.length > 0) {
          results = merged;
          break;
        }
      }

      if (results.length === 0) {
        setFacilities([]);
        setHError(
          "No results nearby. This might be a temporary map data gap—try again later."
        );
        return;
      }

      const withDistance = dedupe(results)
        .map((d) => ({
          ...d,
          distanceKm: haversineKm(pos, {
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
          }),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setFacilities(withDistance);
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" && e.message.includes("Too Many Requests")
          ? "Map service is rate-limiting this network. Please retry in ~1 minute."
          : e?.message || "Failed to fetch places.";
      setHError(msg);
    } finally {
      setHLoading(false);
    }
  };

  const handleBackToCards = () => setActiveCategory(null);

  // -------------- Subpage --------------
  if (activeCategory && category) {
    const isChecklist = (category as any).checklist;
    const tips: Tip[] = (category as any).tips || [];

    const isEmergency = (category as any).id === "emergency";
    const isNature = (category as any).id === "nature";

    return (
      <main
        className="pt-24 px-4 md:px-6 pb-24 min-h-screen bg-fixed bg-cover"
        style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToCards}
              className="bg-white/15 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/25"
            >
              ← Back to Guide
            </button>
            <nav className="hidden md:flex gap-2 text-white/95">
              {categories.map((c) => (
                <button
                  key={(c as any).id}
                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20"
                  onClick={() => setActiveCategory((c as any).id)}
                >
                  {(c as any).title}
                </button>
              ))}
            </nav>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow">
            {(category as any).title}
          </h2>

          {/* Emergency */}
          {isEmergency && (
            <>
              {/* Calls + Nearby */}
              <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 shadow border border-gray-200 lg:col-span-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    One-tap Emergency Calls
                  </h3>
                  <div className="flex gap-3 flex-wrap md:flex-nowrap">
                    <a
                      href="tel:999"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
                    >
                      <i className="ri-police-car-line" /> Police 999
                    </a>
                    <a
                      href="tel:994"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                    >
                      <i className="ri-fire-line" /> Fire & Rescue 994
                    </a>
                    <a
                      href="tel:999"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                    >
                      <i className="ri-first-aid-kit-line" /> Ambulance 999
                    </a>
                  </div>
                </div>

                <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 shadow border border-gray-200 lg:col-span-7">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Nearby Hospitals & Clinics
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <button
                      onClick={requestLocation}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <i className="ri-navigation-line" /> Use my location
                    </button>

                    <button
                      onClick={() => fetchFacilities("hospitals")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                      disabled={!pos}
                    >
                      <i className="ri-hospital-line" /> Search nearby hospitals
                    </button>

                    <button
                      onClick={() => fetchFacilities("clinics")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      disabled={!pos}
                    >
                      <i className="ri-first-aid-kit-line" /> Search nearby
                      clinics
                    </button>

                    {pos && (
                      <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                        <i className="ri-map-pin-2-line" />
                        {pos.lat.toFixed(4)}, {pos.lon.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {hError && <p className="text-red-600 mb-2">{hError}</p>}
                  {hLoading && <p className="text-gray-700">Locating / Searching…</p>}

                  {!hLoading && facilities.length > 0 && (
                    <ul className="space-y-4">
                      {facilities.slice(0, 5).map((h, idx) => {
                        const lat = parseFloat(h.lat);
                        const lon = parseFloat(h.lon);
                        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                        const phone =
                          h?.extratags?.phone || h?.extratags?.contact_phone;
                        return (
                          <li
                            key={`${h.place_id}-${idx}`}
                            className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {h.display_name?.split(",")[0] ||
                                    (searchType === "clinics"
                                      ? "Clinic"
                                      : "Hospital")}
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-2">
                                  {h.display_name}
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                  Straight-line: {h.distanceKm.toFixed(2)} km
                                </div>
                                {phone && (
                                  <div className="text-sm text-gray-700 mt-1">
                                    Phone:{" "}
                                    <a
                                      className="text-emerald-700 font-medium hover:underline"
                                      href={`tel:${(phone as string).replace(
                                        /\s/g,
                                        ""
                                      )}`}
                                    >
                                      {phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {phone && (
                                  <a
                                    href={`tel:${(phone as string).replace(
                                      /\s/g,
                                      ""
                                    )}`}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    <i className="ri-phone-line" /> Call
                                  </a>
                                )}
                                <a
                                  href={gmaps}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                >
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
                    <p className="text-gray-700">
                      No nearby {searchType === "clinics" ? "clinics" : "hospitals"} found in the current search area. Try again in a moment.
                    </p>
                  )}
                </div>
              </section>

              {/* First-aid & Signaling — paragraph style, no bullets */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Insect Bites & Stings
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Move away from source; remove stinger by scraping with a
                    card (do not squeeze).<br />
                    Wash with soap and water; apply a cold pack 10–15 minutes
                    on/off.<br />
                    Use oral antihistamine for itch/swelling; seek care for
                    breathing trouble or facial swelling.
                  </p>
                </div>
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Cuts & Wounds</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Apply direct pressure 5–10 minutes to stop bleeding.<br />
                    Rinse with clean water; apply antiseptic; cover with sterile
                    dressing.<br />
                    Seek care if deep, gaping, contaminated, or bleeding will
                    not stop; review tetanus status.
                  </p>
                </div>
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Dehydration / Heat Exhaustion
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Move to shade; loosen clothing; cool with water on skin and
                    fanning.<br />
                    Sip oral rehydration solution/electrolytes; avoid alcohol
                    and caffeine.<br />
                    Confusion/collapse or hot dry skin → suspect heat stroke:
                    cool aggressively and call emergency services.
                  </p>
                </div>
                <div className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Signaling for Rescue
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Audible: whistle or three short blasts; repeat at
                    intervals.<br />
                    Visual: mirror flashes toward aircraft/ground teams;
                    high-visibility cloth or headlamp flashes.<br />
                    Ground-to-air symbols: large “SOS” / arrows in open areas;
                    use rocks/logs with strong contrast.<br />
                    Stay visible: choose open ground, reduce movement, and send
                    periodic signals to conserve battery.
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Nature */}
          {isNature && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {(
                  (categories.find((c) => (c as any).id === "nature") as any)
                    .tips as Tip[]
                ).map((tip) => (
                  <div
                    key={tip.title}
                    className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200"
                  >
                    <h3 className="font-bold text-gray-900">{tip.title}</h3>
                    {tip.description && (
                      <p className="text-gray-700 mt-1">{tip.description}</p>
                    )}
                    {tip.details && (
                      <p className="text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
                        {tip.details}
                      </p>
                    )}
                  </div>
                ))}
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-3 drop-shadow">
                  Toxic Plants & Mushrooms Gallery (Malaysia)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toxicGallery.map((p) => (
                    <div
                      key={p.key}
                      className="bg-white/85 rounded-2xl shadow border border-gray-200 overflow-hidden"
                    >
                      <div className="relative w-full h-44 bg-gray-100">
                        <img
                          src={p.img}
                          alt={p.common}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/forest-fallback.png";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-900">
                          {p.common}
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-red-700">
                            Hazard:{" "}
                          </span>
                          <span className="text-gray-700">{p.hazard}</span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium text-emerald-700">
                            What to do:{" "}
                          </span>
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
                <div
                  key={tip.title}
                  className="bg-white/85 backdrop-blur-xl p-6 rounded-2xl shadow border border-gray-200 hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-gray-900">{tip.title}</h3>
                  <p className="text-gray-700 mt-1">{tip.description}</p>
                  {tip.details && (
                    <p className="text-gray-600 mt-3 leading-relaxed">
                      {tip.details}
                    </p>
                  )}
                  {tip.learnMoreHref && (
                    <div className="mt-4">
                      <Link
                        href={tip.learnMoreHref}
                        className="inline-flex items-center gap-2 text-sm text-emerald-700 font-semibold hover:underline"
                      >
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(customChecklist as any).map((group: ChecklistGroup) => (
                  <div
                    key={group.group}
                    className="bg-white/85 p-4 rounded-2xl shadow border border-gray-200 hover:shadow-lg transition"
                  >
                    <h3 className="font-bold text-gray-900">{group.group}</h3>
                    <ul className="pl-5 mt-2 text-gray-700 space-y-2">
                      {group.items.map((item) => {
                        const itemName =
                          typeof item === "string" ? item : item.name;
                        const isCustom =
                          typeof item !== "string" && item.custom;
                        return (
                          <li
                            key={itemName}
                            className="flex items-center justify-between group"
                          >
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={checkedItems.includes(itemName)}
                                onChange={() => toggleCheck(itemName)}
                                className="mr-2"
                              />
                              {itemName}
                            </label>
                            {isCustom && (
                              <button
                                onClick={() =>
                                  deleteItem(group.group, itemName)
                                }
                                className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                              >
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

              {/* Add custom item */}
              <div className="mt-8 bg-white/85 p-4 rounded-2xl shadow border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  Add Your Own Items
                </h3>
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter custom item"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    {(customChecklist as any).map((group: ChecklistGroup) => (
                      <option key={group.group} value={group.group}>
                        {group.group}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addCustomItem}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* PDF Download */}
              <div className="mt-6 text-center">
                <button
                  onClick={downloadChecklistPdf}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-purple-700"
                >
                  Download Checklist (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // -------------- Main page --------------
  return (
    <main
      className="pt-28 px-4 md:px-6 pb-24 min-h-screen bg-fixed bg-cover"
      style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-12 mt-8 md:mt-14">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-sm">
            Camping Guide
          </h1>
          <p className="mt-3 text-white/90 text-lg drop-shadow">
            Pack smart, stay safe, and enjoy the wild. Everything you need in
            one place.
          </p>
          {/* Quick Access */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
            {categories.map((c) => (
              <button
                key={(c as any).id}
                onClick={() => setActiveCategory((c as any).id)}
                className="px-3 py-1 rounded-full bg-white/15 text-white/95 hover:bg-white/25 border border-white/20"
              >
                {(c as any).title}
              </button>
            ))}
          </div>
        </header>

        {/* Category cards — one per row */}
        <div className="grid grid-cols-1 gap-8 mb-16">
          {categories.map((cat) => {
            // Inject dynamic count for Essentials card
            const props = { ...(cat as any) };
            if ((cat as any).id === "essentials") {
              props.itemCount = essentialsCount; // live total from current checklist (includes custom items)
            }
            return (
              <GuideCard
                key={(cat as any).id}
                {...props}
                onClick={() => setActiveCategory((cat as any).id)}
              />
            );
          })}
        </div>

        {/* Do’s & Don’ts */}
        <section className="bg-white/85 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 mb-12">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
            Responsible Camping: Do’s & Don’ts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-100">
              <h3 className="font-bold text-green-700 mb-3">✅ Do’s</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Clean up your campsite and take all trash with you.</li>
                <li>Respect wildlife and keep a safe distance.</li>
                <li>Follow local park and forest regulations.</li>
                <li>
                  Use eco-friendly products (biodegradable soap, reusable
                  containers).
                </li>
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
              <Image
                src="/images/cleanup.jpg"
                alt="Pack Trash Correctly"
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-xl mb-4 shadow"
              />
              <h3 className="font-bold text-gray-800">Pack Trash Correctly</h3>
              <p className="text-gray-600 mt-2">
                Use trash bags and seal them tightly. Carry all waste back
                instead of burying it.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/fire-safety.jpg"
                alt="Extinguish Fires Properly"
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-xl mb-4 shadow"
              />
              <h3 className="font-bold text-gray-800">Extinguish Fires Properly</h3>
              <p className="text-gray-600 mt-2">
                Pour water and stir ashes until cold. Never leave smoldering
                embers behind.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/resources.jpg"
                alt="Eco-friendly Habits"
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-xl mb-4 shadow"
              />
              <h3 className="font-bold text-gray-800">Eco-friendly Habits</h3>
              <p className="text-gray-600 mt-2">
                Use biodegradable soap, reusable bottles, and minimize plastic
                waste.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/why"
            className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-emerald-600 text-white text-lg md:text-xl font-semibold shadow hover:bg-emerald-700"
          >
            Why Eco Camping Matters
          </Link>
        </div>
      </div>
    </main>
  );
}
