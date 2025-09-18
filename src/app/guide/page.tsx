"use client";

import React, { useState } from "react";

const categories = [
  // ⚠️ 用 Epic-1 的数据，不动
  {
    id: "essentials",
    title: "Essentials",
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
        ],
      },
      {
        group: "Safety & First Aid",
        items: [
          "First Aid Kit",
          "Insect Repellent",
          "Sunscreen",
          "Personal Medication",
          "Hand Sanitizer",
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
        ],
      },
      {
        group: "Clothing & Footwear",
        items: [
          "Hiking Shoes / Boots",
          "Extra Socks",
          "Raincoat / Poncho",
          "Warm Jacket",
          "Hat / Cap",
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
    ],
  },
  {
    id: "safety",
    title: "Weather & Safety",
    tips: [
      {
        title: "Check Weather Forecast",
        description:
          "Malaysia has a tropical climate with heavy rain during monsoon. Always check the forecast before camping.",
      },
      {
        title: "Wildlife Awareness",
        description:
          "Keep food sealed and avoid feeding animals to prevent attracting wildlife.",
      },
      {
        title: "Fire Safety",
        description: "Use designated fire pits and never leave a fire unattended.",
      },
      {
        title: "Flood Precaution",
        description:
          "Avoid camping near rivers during heavy rain to prevent flash floods.",
      },
      {
        title: "Heat Protection",
        description:
          "Wear a hat, apply sunscreen, and stay hydrated under the hot sun.",
      },
      {
        title: "Trail Safety",
        description: "Stay on marked trails to avoid getting lost.",
      },
      {
        title: "First Aid Knowledge",
        description:
          "Learn basic first aid for insect bites, cuts, or dehydration.",
      },
    ],
  },
  {
    id: "sustainable",
    title: "Sustainable Tips",
    tips: [
      {
        title: "Leave No Trace",
        description:
          "Pack up all your trash and minimise impact on the environment.",
      },
      {
        title: "Eco-Friendly Products",
        description: "Use biodegradable soap, reusable containers, and eco-bags.",
      },
      {
        title: "Respect Local Communities",
        description:
          "Follow local rules and be considerate of nearby villagers.",
      },
      {
        title: "Save Water",
        description:
          "Use water sparingly when washing or cooking at campsites.",
      },
      {
        title: "Energy Efficiency",
        description:
          "Use solar-powered lamps or rechargeable batteries instead of disposable ones.",
      },
      {
        title: "Protect Nature",
        description:
          "Do not pick plants, disturb animals, or damage trees in camping areas.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Info",
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
          "Carry a whistle, flashlight, or flare for distress signaling.",
      },
      {
        title: "Group Safety",
        description:
          "Always inform friends or family about your camping location and duration.",
      },
    ],
  },
];

const GuideCard = ({ title, description, onClick }) => (
  <div
    className="relative group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
    onClick={onClick}
  >
    <div className="relative h-56 rounded-3xl overflow-hidden backdrop-blur-md bg-white/20 border border-white/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent"></div>
      <div className="relative h-full p-6 flex flex-col justify-between">
        <h3 className="text-xl font-bold text-white mb-3 drop-shadow">
          {title}
        </h3>
        <p className="text-sm text-white/80 leading-relaxed drop-shadow-sm">
          {description || "Explore more details"}
        </p>
      </div>
    </div>
  </div>
);

export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const category = categories.find((c) => c.id === activeCategory);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleBack = () => setActiveCategory(null);

  if (activeCategory && category) {
    return (
      <main
        className="pt-24 px-6 pb-20 min-h-screen"
        style={{
          backgroundImage: "url('/images/bg-camping.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center space-x-2 text-white hover:text-emerald-300 transition-colors bg-black/30 px-4 py-2 rounded-lg"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="font-medium">Back to Guide</span>
          </button>

          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
            {category.id === "essentials"
              ? "Packing Checklist"
              : category.title}
          </h2>

          {/* Checklist UI */}
          {category.checklist && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.checklist.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-white/85 rounded-xl p-6 shadow-md hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {group.group}
                  </h3>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item)}
                          onChange={() => toggleCheck(item)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded"
                        />
                        <span
                          className={`text-sm ${
                            checkedItems.includes(item)
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Tips UI */}
          {category.tips && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white/90 rounded-xl shadow-lg hover:shadow-xl transition"
                >
                  <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      className="pt-24 px-6 pb-20 min-h-screen"
      style={{
        backgroundImage: "url('/images/bg-camping.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Camping Guide
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 drop-shadow-lg">
            Choose Your Camping Phase
          </h2>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Select a camping phase to explore checklists and safety tips
          </p>
        </div>

        {/* 卡片选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <GuideCard
              key={cat.id}
              title={cat.title}
              description={
                "checklist" in cat
                  ? "Essential items for camping"
                  : "Important guidance and tips"
              }
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}