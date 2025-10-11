"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function WhyPage() {
  const [activeTab, setActiveTab] = useState("forestLoss");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const impactData = {
    forestLoss: {
      title: "Forest Loss",
      content: [
        "Malaysia lost over 8.6% of tree cover between 2001–2023 (Global Forest Watch).",
        "Deforestation destroys natural habitats and disrupts ecosystems.",
        "Illegal logging and land conversion accelerate forest degradation.",
        "Loss of forest cover contributes to climate change and soil erosion."
      ],
      images: [
        "/images/forest-loss-1.jpg",
        "/images/forest-loss-2.jpg",
        "/images/forest-loss-3.jpg",
        "/images/forest-loss-4.jpg",
        "/images/forest-loss-5.jpg"
      ]
    },
    wildlife: {
      title: "Wildlife at Risk",
      content: [
        "Iconic species like hornbills lose nesting trees due to habitat destruction.",
        "Tigers are pushed closer to extinction as their habitats shrink.",
        "Rare plants like Rafflesia are endangered by irresponsible camping.",
        "Wildlife corridors are disrupted, affecting migration and breeding patterns."
      ],
      images: [
        "/images/wildlife-1.jpg",
        "/images/wildlife-2.jpg",
        "/images/wildlife-3.jpg",
        "/images/wildlife-4.jpg",
        "/images/wildlife-5.jpg"
      ]
    },
    pollution: {
      title: "Environmental Pollution",
      content: [
        "Improper waste disposal pollutes rivers and attracts pests.",
        "Plastic waste harms wildlife and contaminates water sources.",
        "Chemical pollutants from camping activities damage soil quality.",
        "Accumulated trash degrades the natural beauty of forest areas."
      ],
      images: [
        "/images/pollution-1.jpg",
        "/images/pollution-2.jpg",
        "/images/pollution-3.jpg",
        "/images/pollution-4.jpg",
        "/images/pollution-5.jpg"
      ]
    },
    fire: {
      title: "Forest Fire Risk",
      content: [
        "Uncontrolled campfires can cause devastating forest fires.",
        "Dry conditions and careless behavior increase fire hazards.",
        "Forest fires destroy wildlife habitats and biodiversity.",
        "Smoke pollution affects air quality and human health."
      ],
      images: [
        "/images/fire-1.jpg",
        "/images/fire-2.jpg",
        "/images/fire-3.jpg",
        "/images/fire-4.jpg",
        "/images/fire-5.jpg"
      ]
    }
  };

  // Auto-play images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prev) =>
          (prev + 1) %
          impactData[activeTab as keyof typeof impactData].images.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Reset image index when tab changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTab]);

  const currentTabData = impactData[activeTab as keyof typeof impactData];

  return (
    <main
      className="pt-40 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Header */}
      <section className="text-center max-w-4xl mx-auto px-6 mb-16">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Why Responsible Camping Matters
        </h1>
      </section>

      {/* Tab Section - The Impact of Irresponsible Camping */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            The Impact of Irresponsible Camping
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-10">
            {Object.entries(impactData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {data.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8 items-start">
            {/* Left Side - Text */}
            <div className="md:col-span-4 pt-0">
              <h3 className="text-2xl font-bold text-green-700 mb-4">
                {currentTabData.title}
              </h3>
              <ul className="space-y-3">
                {currentTabData.content.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 text-base"
                  >
                    <span className="text-green-600 font-bold mr-3 mt-0.5">
                      •
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side - Stacked Images */}
            <div className="md:col-span-3 relative h-80 pt-0">
              {currentTabData.images.map((image, index) => {
                const isActive = index === currentImageIndex;
                const offset = index - currentImageIndex;

                return (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="absolute inset-0 cursor-pointer transition-all duration-500 ease-out"
                    style={{
                      transform: `
                        translateX(${offset * 25}px)
                        translateY(${offset * 15}px)
                        rotate(${offset * 4}deg)
                        scale(${isActive ? 1 : 0.93 - Math.abs(offset) * 0.05})
                      `,
                      zIndex: 5 - Math.abs(offset),
                      opacity:
                        Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15
                    }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                      <Image
                        src={image}
                        alt={`${currentTabData.title} - Image ${index + 1}`}
                        width={500}
                        height={350}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Navigation Dots */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {currentTabData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-green-600 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video and Introduction Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left Side - Text */}
            <div>
              <h2 className="text-3xl font-bold text-green-700 mb-4">
                The Meaning of Eco-Camping
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Eco-camping is more than just an outdoor activity — it&apos;s a
                commitment and responsibility to nature.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Through responsible camping practices, we can:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Protect wildlife habitats</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Reduce damage to forest ecosystems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Preserve beautiful nature for future generations</span>
                </li>
              </ul>
            </div>

            {/* Right Side - Video */}
            <div>
              <div
                className="relative w-full rounded-xl overflow-hidden shadow-lg"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/Y5e3r1f-kzg?si=uXZg44LlLztVhggE"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Data */}
      <section className="text-center max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Want to See the Data?
          </h2>
          <p className="text-gray-800 mb-8 font-medium text-lg max-w-4xl mx-auto">
            Explore interactive charts and maps to understand how Malaysia&apos;s
            forests are changing from 2001 to 2030.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a
              href="/insights"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              See More Data →
            </a>
            <a
              href="/guide"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              How to Camp Responsibly →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
