"use client";

import React, { useState } from "react";

const categories = [
  {
    id: "planning",
    title: "Planning & Safety",
    tips: [
      {
        title: "Choose the Right Location",
        description:
          "Camp only at designated sites away from disaster-prone zones such as steep slopes, floodplains, or riverbanks.",
        impact: "Reduces risk of landslides, flooding, and accidents.",
        reason: "Ensures visitor safety and protects fragile areas.",
        level: "Easy",
      },
      {
        title: "Safe Access & Emergency Routes",
        description:
          "Ensure the site has road access during all seasons and emergency routes for ambulances or fire trucks.",
        impact: "Improves response time during emergencies.",
        reason: "Helps authorities reach campers quickly when needed.",
        level: "Medium",
      },
      {
        title: "Boundary & Security",
        description:
          "Campsites should be fenced or landscaped to prevent wildlife intrusion and reduce security risks.",
        impact: "Protects campers and wildlife.",
        reason: "Prevents accidents and reduces conflict with animals.",
        level: "Medium",
      },
    ],
  },
  {
    id: "layout",
    title: "Campsite Layout & Facilities",
    tips: [
      {
        title: "Tent Placement",
        description:
          "Maintain at least 3 meters between tent clusters and avoid placing them too close to rivers or cliffs.",
        impact: "Prevents fire spread and accidents near hazards.",
        reason: "Creates safer spacing and reduces risks of collapse or flooding.",
        level: "Easy",
      },
      {
        title: "Basic Facilities",
        description:
          "Provide toilets, surau/prayer spaces, safe cooking, and dining areas away from tents.",
        impact: "Improves hygiene and reduces fire hazards.",
        reason: "Supports comfort and prevents accidents.",
        level: "Medium",
      },
      {
        title: "Utilities",
        description:
          "Ensure clean water (pipes or rain harvesting), electricity (solar preferred), and reliable communication.",
        impact: "Provides essential services for campers.",
        reason: "Improves resilience during longer stays and emergencies.",
        level: "Medium",
      },
    ],
  },
  {
    id: "environment",
    title: "Environmental Management",
    tips: [
      {
        title: "Solid Waste Management",
        description:
          "Apply 3R (Reduce, Reuse, Recycle). Campers should take back rubbish to support zero waste policy.",
        impact: "Minimises pollution and protects ecosystems.",
        reason: "Keeps campsites clean and prevents wildlife dependency.",
        level: "Easy",
      },
      {
        title: "Drainage & Flood Prevention",
        description:
          "Ensure proper drainage and no stagnant water to avoid breeding of mosquitoes and other vectors.",
        impact: "Prevents disease outbreaks and waterlogging.",
        reason: "Keeps environment safe and healthy.",
        level: "Medium",
      },
      {
        title: "Wildlife Protection",
        description:
          "Do not damage flora or disturb fauna. Place fire pits at least 5m away from tents.",
        impact: "Preserves biodiversity and reduces fire risks.",
        reason: "Protects habitats and ensures coexistence with nature.",
        level: "Easy",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations & Emergency Preparedness",
    tips: [
      {
        title: "Check-In System",
        description:
          "All campers must register with personal and emergency contact details.",
        impact: "Improves accountability and emergency response.",
        reason: "Allows authorities to track campers during incidents.",
        level: "Easy",
      },
      {
        title: "Safety Briefing",
        description:
          "Provide clear briefings or videos about campsite rules, cultural norms, and emergency plans.",
        impact: "Increases awareness of risks.",
        reason: "Educates campers and reduces unsafe practices.",
        level: "Easy",
      },
      {
        title: "Emergency Equipment",
        description:
          "Ensure availability of first-aid kits, fire extinguishers, evacuation points, and rescue contacts.",
        impact: "Strengthens preparedness for emergencies.",
        reason: "Enables quick and effective responses.",
        level: "Medium",
      },
      {
        title: "Adequate Staffing",
        description:
          "Each site must have a manager and enough staff, with emergency contacts clearly displayed.",
        impact: "Improves safety and operational control.",
        reason: "Ensures someone is always accountable for site safety.",
        level: "Medium",
      },
    ],
  },
  {
    id: "legal",
    title: "Legal & Governance",
    tips: [
      {
        title: "Permits & Licenses",
        description:
          "Operators must obtain business licenses and permits such as planning permission and building approvals.",
        impact: "Ensures legal compliance.",
        reason: "Protects both campers and operators from liability.",
        level: "Medium",
      },
      {
        title: "Compliance with Acts",
        description:
          "Follow planning, building, local authority, and tourism-related laws (e.g., Akta 172, Akta 171).",
        impact: "Aligns operations with national policies.",
        reason: "Maintains professional standards in site management.",
        level: "Medium",
      },
      {
        title: "Insurance",
        description:
          "Operators should provide public liability or takaful insurance for their campsite.",
        impact: "Covers risks of accidents or damages.",
        reason: "Protects campers financially in case of incidents.",
        level: "Medium",
      },
    ],
  },
];


export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState("planning");
  const category = categories.find((c) => c.id === activeCategory);

  return (
    <main className="pt-28 px-8 max-w-7xl mx-auto pb-20">
      {/* Title Section with background image */}
      <div
        className="bg-cover bg-center rounded-2xl shadow-lg h-80 flex items-start justify-center pt-12 mb-16"
        style={{
          backgroundImage: "url('/images/bg-camping.jpg')",
        }}
      >
        <h1 className="text-4xl font-extrabold text-black drop-shadow-md">
          Camping Environmental Guide
        </h1>
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeCategory === c.id
                  ? "bg-green-600 text-white shadow-lg scale-[1.02]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c.title}
              <span className="ml-2 text-sm font-normal text-gray-400">
                {c.tips.length} tips
              </span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <section className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {category?.tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all border-t-4 border-green-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">{tip.title}</h2>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    tip.level === "Easy"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {tip.level}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{tip.description}</p>
              <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                <strong className="text-blue-700">Why This Matters:</strong>{" "}
                {tip.reason}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Impact:</strong> {tip.impact}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}