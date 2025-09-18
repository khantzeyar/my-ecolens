"use client";

import React, { useState } from "react";

// -------------------- Types --------------------
type ChecklistGroup = {
  group: string;
  color: string;
  icon: string;
  items: string[];
};

type CategoryBase = {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  itemCount: string;
};

type EssentialsCategory = CategoryBase & {
  checklist: ChecklistGroup[];
  tips?: never;
};

type TipsCategory = CategoryBase & {
  checklist?: never;
  tips: { title: string; description: string }[];
};

type Category = EssentialsCategory | TipsCategory;

type GuideCardProps = {
  title: string;
  icon: string;
  color: string;
  description: string;
  itemCount: string;
  onClick: () => void;
};

// -------------------- Type Guard --------------------
function hasChecklist(cat: Category): cat is EssentialsCategory {
  return "checklist" in cat;
}

// -------------------- Data --------------------
const categories: Category[] = [
  {
    id: "essentials",
    title: "Essentials",
    icon: "ri-shopping-bag-3-line",
    color: "from-blue-500 to-blue-600",
    description: "Complete packing checklist for your camping adventure",
    itemCount: "40+",
    checklist: [
      {
        group: "Sleeping Gear",
        color: "from-purple-500 to-purple-600",
        icon: "ri-hotel-bed-line",
        items: ["Tent", "Sleeping Bag", "Sleeping Mat", "Pillow", "Blanket"],
      },
      {
        group: "Cooking Essentials",
        color: "from-orange-500 to-orange-600",
        icon: "ri-restaurant-line",
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
        color: "from-blue-500 to-blue-600",
        icon: "ri-drop-line",
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
        color: "from-red-500 to-red-600",
        icon: "ri-heart-pulse-line",
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
        color: "from-yellow-500 to-yellow-600",
        icon: "ri-flashlight-line",
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
        color: "from-green-500 to-green-600",
        icon: "ri-shirt-line",
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
        color: "from-teal-500 to-teal-600",
        icon: "ri-map-pin-line",
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
        color: "from-gray-500 to-gray-600",
        icon: "ri-more-line",
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
    icon: "ri-shield-check-line",
    color: "from-orange-500 to-red-600",
    description: "Essential safety guidelines for Malaysian tropical climate",
    itemCount: "7",
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
    icon: "ri-leaf-line",
    color: "from-green-500 to-emerald-600",
    description: "Eco-friendly practices to protect Malaysia's natural beauty",
    itemCount: "6",
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
    icon: "ri-phone-line",
    color: "from-red-500 to-pink-600",
    description: "Critical emergency contacts and safety resources",
    itemCount: "7",
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

// -------------------- Components --------------------
const GuideCard: React.FC<GuideCardProps> = ({
  title,
  icon,
  color,
  description,
  itemCount,
  onClick,
}) => (
  <div
    className="relative group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
    onClick={onClick}
  >
    <div className="relative h-56 rounded-3xl overflow-hidden backdrop-blur-md bg-white/20 border border-white/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent"></div>

      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
      ></div>
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color} opacity-10`}
      ></div>

      <div
        className={`absolute -inset-1 rounded-3xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 -z-10`}
      ></div>

      <div className="relative h-full p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm`}
          >
            <i className={`${icon} text-white text-xl`}></i>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white drop-shadow-lg">
              {itemCount}
            </div>
            <div className="text-xs text-white/70 uppercase tracking-wider font-medium">
              Items
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors drop-shadow">
            {title}
          </h3>
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2 drop-shadow-sm">
            {description}
          </p>
        </div>

        <div className="absolute inset-px rounded-3xl bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl transform -skew-x-12 group-hover:animate-pulse"></div>
      </div>
    </div>
  </div>
);

// -------------------- Page --------------------
export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [season, setSeason] = useState<"dry" | "wet">("dry");

  const category = categories.find((c) => c.id === activeCategory);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleBackToCards = () => {
    setActiveCategory(null);
  };

  const getOverallProgress = () => {
    if (!category || !hasChecklist(category)) return 0;
    const totalItems = category.checklist.reduce(
      (sum, group) => sum + group.items.length,
      0
    );
    const checkedItemsCount = checkedItems.length;
    return Math.round((checkedItemsCount / totalItems) * 100);
  };

  const getCategoryProgress = (items: string[]) => {
    const checkedInCategory = items.filter((item) =>
      checkedItems.includes(item)
    ).length;
    return Math.round((checkedInCategory / items.length) * 100);
  };

  const getSeasonalItems = () => {
    if (season === "wet") {
      return [
        "Extra Waterproof Bags",
        "Quick-dry Towels",
        "Waterproof Phone Case",
        "Anti-slip Shoes",
        "Umbrella",
      ];
    }
    return ["Sun Hat", "Cooling Towel", "Extra Water Bottles", "Electrolyte Powder"];
  };

  // -------------------- Render --------------------
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
          <div className="flex items-center justify-center mb-16 mt-12">
            <button
              onClick={handleBackToCards}
              className="absolute left-0 flex items-center space-x-2 text-white hover:text-emerald-300 transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg"
            >
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="font-medium">Back to Guide</span>
            </button>

            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                {category.id === "essentials" ? "Packing Checklist" : category.title}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {hasChecklist(category) && (
            <div className="space-y-8">
              {/* Season Toggle + Progress */}
              <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-semibold">Climate Season:</span>
                    <div className="flex bg-black/30 rounded-lg p-1 border border-white/20">
                      <button
                        onClick={() => setSeason("dry")}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                          season === "dry"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <i className="ri-sun-line"></i>
                        <span>Dry Season</span>
                      </button>
                      <button
                        onClick={() => setSeason("wet")}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                          season === "wet"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <i className="ri-rainy-line"></i>
                        <span>Wet Season</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-white font-semibold">Overall Progress:</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-white/20 rounded-full h-3 border border-white/30">
                        <div
                          className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${getOverallProgress()}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-white font-bold text-lg">
                          {getOverallProgress()}%
                        </span>
                        {getOverallProgress() === 100 && (
                          <i className="ri-trophy-line text-yellow-400 text-lg animate-bounce"></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seasonal Recommendations */}
              {season && (
                <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-blue-500/15 backdrop-blur-sm rounded-xl p-6 border border-emerald-300/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          season === "wet" ? "bg-blue-500" : "bg-orange-500"
                        }`}
                      >
                        <i
                          className={`${
                            season === "wet" ? "ri-rainy-line" : "ri-sun-line"
                          } text-white text-lg`}
                        ></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {season === "wet"
                            ? "Monsoon Season Extras"
                            : "Dry Season Extras"}
                        </h3>
                        <p className="text-white/70 text-xs">
                          Additional items for {season === "wet" ? "rainy" : "sunny"} weather
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {getSeasonalItems().map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 text-white/90 cursor-pointer bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-200 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item)}
                          onChange={() => toggleCheck(item)}
                          className={`w-4 h-4 rounded border border-white/30 focus:ring-1 transition-all ${
                            season === "wet"
                              ? "text-blue-500 focus:ring-blue-400"
                              : "text-orange-500 focus:ring-orange-400"
                          }`}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Essentials Checklist Groups */}
              <div className="grid md:grid-cols-2 gap-6">
                {category.checklist.map((group) => (
                  <div
                    key={group.group}
                    className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md`}
                        >
                          <i className={`${group.icon} text-white text-lg`}></i>
                        </div>
                        <h3 className="text-lg font-bold text-white">{group.group}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-white/20 rounded-full h-2 border border-white/30">
                          <div
                            className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-full rounded-full transition-all duration-700"
                            style={{ width: `${getCategoryProgress(group.items)}%` }}
                          ></div>
                        </div>
                        <span className="text-white/70 text-sm font-medium">
                          {getCategoryProgress(group.items)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label
                          key={item}
                          className="flex items-center space-x-3 text-white/90 cursor-pointer bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-200"
                        >
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(item)}
                            onChange={() => toggleCheck(item)}
                            className="w-4 h-4 text-emerald-500 rounded border-white/30 focus:ring-emerald-400 focus:ring-1"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {category.tips && (
            <div className="grid md:grid-cols-2 gap-6">
              {category.tips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <i className="ri-lightbulb-flash-line text-emerald-400 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-bold text-white">{tip.title}</h3>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Landing page with category cards
  return (
    <main
      className="pt-28 px-6 pb-20 min-h-screen"
      style={{
        backgroundImage: "url('/images/bg-camping.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-12">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Camping Guide Malaysia
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
          <p className="text-white/80 max-w-2xl mx-auto mt-6 leading-relaxed">
            A complete camping guide for Malaysia — covering essential packing, weather
            safety, sustainable camping, and emergency contacts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <GuideCard
              key={cat.id}
              title={cat.title}
              icon={cat.icon}
              color={cat.color}
              description={cat.description}
              itemCount={cat.itemCount}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
