"use client";

import React, { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf"; // PDF 导出库

const categories = [
  {
    id: "essentials",
    title: "Essentials",
    icon: "ri-shopping-bag-3-line",
    color: "from-blue-500 to-blue-600",
    description: "Complete packing checklist for your camping adventure",
    itemCount: "40+",
    checklist: [
      { group: "Sleeping Gear", items: ["Tent", "Sleeping Bag", "Sleeping Mat", "Pillow", "Blanket"] },
      { group: "Cooking Essentials", items: ["Cooking Stove","Gas Canisters","Cooking Pot / Pan","Utensils","Plates / Bowls","Cups / Mugs","Cutting Board & Knife","Dish Soap & Sponge"] },
      { group: "Food & Water", items: ["Drinking Water","Water Filter / Purification Tablets","Packed Meals / Instant Food","Snacks","Cooler Box","Electrolyte Powder"] },
      { group: "Safety & First Aid", items: ["First Aid Kit","Insect Repellent (DEET-based)","Sunscreen (SPF 30+)","Personal Medication","Hand Sanitizer","Anti-diarrhea Medicine","Oral Rehydration Salts"] },
      { group: "Lighting & Power", items: ["Flashlight","Headlamp","Lantern","Extra Batteries","Power Bank","Solar Charger"] },
      { group: "Clothing & Footwear", items: ["Hiking Shoes / Boots","Extra Socks","Lightweight Raincoat","Quick-dry Pants","Long-sleeve Shirt (UV protection)","Hat / Cap","Mosquito Net Clothing"] },
      { group: "Malaysia Essentials", items: ["Mosquito Coils","Cooling Powder","Waterproof Document Pouch","Emergency Whistle","Local Emergency Numbers Card","Portable Fan"] },
      { group: "Others", items: ["Backpack","Map / Compass / GPS","Camping Chair","Trash Bags","Multi-tool / Swiss Knife","Rope / Paracord","Towel","Toiletries"] },
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
      { title: "Check Weather Forecast", description: "Malaysia has a tropical climate with heavy rain during monsoon. Always check the forecast before camping." },
      { title: "Wildlife Awareness", description: "Keep food sealed and avoid feeding animals to prevent attracting wildlife." },
      { title: "Fire Safety", description: "Use designated fire pits and never leave a fire unattended." },
      { title: "Flood Precaution", description: "Avoid camping near rivers during heavy rain to prevent flash floods." },
      { title: "Heat Protection", description: "Wear a hat, apply sunscreen, and stay hydrated under the hot sun." },
      { title: "Trail Safety", description: "Stay on marked trails to avoid getting lost." },
      { title: "First Aid Knowledge", description: "Learn basic first aid for insect bites, cuts, or dehydration." },
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
      { title: "Emergency Contacts", description: "Police: 999, Fire & Rescue: 994, Ambulance: 999." },
      { title: "Nearest Ranger / Forest Dept", description: "Locate the ranger station or park office before setting up camp." },
      { title: "Hospital Locator", description: "Know the nearest hospital or clinic to your campsite in case of emergencies." },
      { title: "Mobile Signal", description: "Check network coverage; bring a satellite phone if camping in remote areas." },
      { title: "Emergency Shelter", description: "Identify the nearest shelter or evacuation center in case of storms." },
      { title: "Whistle & Signal", description: "Carry a whistle, flashlight, or flare for distress signaling." },
      { title: "Group Safety", description: "Always inform friends or family about your camping location and duration." },
    ],
  },
];

const GuideCard = ({ title, icon, color, description, itemCount, onClick }) => (
  <div
    className="relative group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
    onClick={onClick}
  >
    <div className="relative h-56 rounded-3xl overflow-hidden backdrop-blur-md bg-white/20 border border-white/30 shadow-xl">
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30`}></div>
      <div className="relative h-full p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <i className={`${icon} text-white text-xl`}></i>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white drop-shadow-lg">{itemCount}</div>
            <div className="text-xs text-white/70 uppercase tracking-wider font-medium">Items</div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </div>
  </div>
);

export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [customChecklist, setCustomChecklist] = useState(categories[0].checklist);
  const [newItem, setNewItem] = useState("");
  const [targetGroup, setTargetGroup] = useState(categories[0].checklist[0].group);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  const category = categories.find((c) => c.id === activeCategory);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomItem = () => {
    if (newItem.trim()) {
      setCustomChecklist((prev) =>
        prev.map((group) =>
          group.group === targetGroup
            ? { ...group, items: [...group.items, newItem.trim()] }
            : group
        )
      );
      setNewItem("");
    }
  };

  const deleteItem = (groupName: string, item: string) => {
    setCustomChecklist((prev) =>
      prev.map((group) =>
        group.group === groupName
          ? { ...group, items: group.items.filter((i) => i !== item) }
          : group
      )
    );
    setCheckedItems((prev) => prev.filter((i) => i !== item));
  };

  // PDF 导出功能
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
        const checked = checkedItems.includes(item) ? "[x]" : "[ ]";
        doc.text(`${checked} ${item}`, 20, y);
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

  const handleBackToCards = () => setActiveCategory(null);

  const quizQuestions = [
    "Did you clean up your campsite?",
    "Did you extinguish your campfire completely?",
    "Did you avoid feeding wild animals?",
    "Did you follow park and forest regulations?",
  ];
  const toggleQuizAnswer = (q: string) => {
    setQuizAnswers((prev) =>
      prev.includes(q) ? prev.filter((i) => i !== q) : [...prev, q]
    );
  };

  // 子页面
  if (activeCategory && category) {
    return (
      <main className="pt-24 px-6 pb-20 min-h-screen bg-cover" style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}>
        <div className="max-w-7xl mx-auto">
          <button onClick={handleBackToCards} className="bg-black/30 text-white px-4 py-2 rounded-lg mb-6">← Back to Guide</button>
          <h2 className="text-3xl font-bold text-white mb-6">{category.title}</h2>

          {"checklist" in category && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customChecklist.map((group) => (
                  <div key={group.group} className="bg-white/90 p-4 rounded-lg shadow hover:shadow-lg transition">
                    <h3 className="font-bold text-gray-800">{group.group}</h3>
                    <ul className="pl-5 mt-2 text-gray-700 space-y-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center justify-between group">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(item)}
                              onChange={() => toggleCheck(item)}
                              className="mr-2"
                            />
                            {item}
                          </label>
                          <button
                            onClick={() => deleteItem(group.group, item)}
                            className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 添加自定义物品 */}
              <div className="mt-8 bg-white/90 p-4 rounded-lg shadow">
                <h3 className="font-bold text-gray-800 mb-3">Add Your Own Items</h3>
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
                    {customChecklist.map((group) => (
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

              {/* PDF 下载按钮 */}
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

          {"tips" in category && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.tips.map((tip) => (
                <div key={tip.title} className="bg-white/90 p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="font-bold text-gray-800">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // 默认主页面
  return (
    <main className="pt-24 px-6 pb-20 min-h-screen bg-cover" style={{ backgroundImage: "url('/images/bg-camping.jpg')" }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mt-6 mb-12">Camping Guide</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((cat) => (
            <GuideCard key={cat.id} {...cat} onClick={() => setActiveCategory(cat.id)} />
          ))}
        </div>

        {/* Do’s & Don’ts */}
        <section className="bg-white/90 p-10 rounded-2xl shadow-xl mb-16">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">Responsible Camping: Do’s & Don’ts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200">
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
            <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
              <h3 className="font-bold text-red-600 mb-3">❌ Don’ts</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Don’t leave litter or food scraps behind.</li>
                <li>Don’t start open fires outside of safe zones.</li>
                <li>Don’t damage plants or trees for firewood.</li>
                <li>Don’t feed wild animals – it harms their habits.</li>
              </ul>
            </div>
          </div>

          {/* 图文步骤 - 差异化 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <img src="/images/cleanup.jpg" alt="Pack Trash Correctly" className="w-40 h-40 object-cover rounded-lg mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Pack Trash Correctly</h3>
              <p className="text-gray-600 mt-2">Use trash bags and seal them tightly. Carry all waste back instead of burying it.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img src="/images/fire-safety.jpg" alt="Extinguish Fires Properly" className="w-40 h-40 object-cover rounded-lg mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Extinguish Fires Properly</h3>
              <p className="text-gray-600 mt-2">Pour water and stir ashes until cold. Never leave smoldering embers behind.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img src="/images/resources.jpg" alt="Eco-friendly Habits" className="w-40 h-40 object-cover rounded-lg mb-4 shadow" />
              <h3 className="font-bold text-gray-800">Eco-friendly Habits</h3>
              <p className="text-gray-600 mt-2">Use biodegradable soap, reusable bottles, and minimize plastic waste.</p>
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="bg-white/90 p-10 rounded-2xl shadow-xl mt-16">
          <div className="text-center">
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {showQuiz ? "Close Quiz" : "Check if you are camping responsibly"}
            </button>
          </div>

          {showQuiz && (
            <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Responsible Camper Quiz</h3>
              <ul className="space-y-3">
                {quizQuestions.map((q) => (
                  <li key={q} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizAnswers.includes(q)}
                      onChange={() => toggleQuizAnswer(q)}
                      className="mr-3 w-5 h-5 text-green-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{q}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <p className="font-semibold text-gray-800">Score: {quizAnswers.length}/{quizQuestions.length}</p>
                {quizAnswers.length === quizQuestions.length && (
                  <p className="text-green-600 font-bold mt-2">🎉 Great! You are a Responsible Camper!</p>
                )}
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/why" className="text-green-700 font-semibold hover:underline">
              ← Learn Why Responsible Camping Matters
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
