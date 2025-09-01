
/**
 * This is the Environmental Guide page.
 * - Displays categories and tips for sustainable outdoor activities in Malaysia.
 * - Loads guide data from guides.json and renders StaticGuideCard for each tip.
 * - Sidebar allows switching between guide categories.
 */
"use client";

import { useState } from "react";


// List of guide categories for sidebar
const categories = [
  { id: "camping", name: "Camping Preparation", icon: "ri-tent-line" },
  { id: "lnt", name: "Leave No Trace", icon: "ri-leaf-line" },
  { id: "wildlife", name: "Wildlife Protection", icon: "ri-bear-smile-line" },
  { id: "waste", name: "Waste Management", icon: "ri-recycle-line" },
];

import { useEffect, useRef } from "react";
import StaticGuideCard from "../components/StaticGuideCard";


const GuidePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("camping");
  const [guides, setGuides] = useState<any>({});
  const loaded = useRef(false);

  // Load guides.json once on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    import("./guides.json").then((mod) => {
      setGuides(mod.default || mod);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white mt-20">
      {/* Introduction Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Environmental Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Master sustainable practices for outdoor activities in Malaysia.
          </p>
        </div>
      </div>
      {/* Main guide section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Sidebar: guide categories */}
            <div className="w-80 bg-white rounded-2xl shadow-lg p-6 h-fit top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guide Categories</h2>
              <div className="space-y-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center p-4 rounded-xl transition-all cursor-pointer text-left ${
                      selectedCategory === category.id
                        ? 'bg-green-500 text-white shadow-lg transform scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    {/* Category icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      selectedCategory === category.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-200'
                    }`}>
                      <i className={`${category.icon} text-lg ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                      }`}></i>
                    </div>
                    <div>
                      {/* Category name */}
                      <div className="font-semibold text-sm">{category.name}</div>
                      {/* Number of tips in category */}
                      <div className={`text-xs ${
                        selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {guides[selectedCategory]?.length || 0} tips available
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Main content: guide cards */}
            <div className="flex-1">
              <div className="mb-8">
                {/* Selected category title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                {/* Category description */}
                <p className="text-gray-600">
                  Essential practices for sustainable outdoor activities and environmental protection
                </p>
              </div>
              {/* Guide cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {guides[selectedCategory]?.map((guide: any, index: number) => (
                  <StaticGuideCard
                    key={index}
                    icon={guide.icon}
                    title={guide.title}
                    description={guide.description}
                    importance={guide.importance}
                    difficulty={guide.difficulty}
                    stats={guide.stats}
                    color={guide.color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidePage;