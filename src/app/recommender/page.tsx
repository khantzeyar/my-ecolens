"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// === Type Definitions ===
interface RecommendationForm {
  states: string[];
  attractions: string[];
  visitDate: string;
}

interface Recommendation {
  campsite: {
    id: number;
    name: string;
    state: string;
    address: string;
    activities: string;
    tags: string;
    imageUrl: string;
    fees: string;
  };
  weather: {
    temperature: number;
    description: string;
  };
  isPartialMatch: boolean;
}

// === Constants ===
const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
  "Pahang", "Pulau Pinang", "Perak", "Perlis", "Selangor", "Terengganu",
];

const ATTRACTIONS = [
  "Beach", "Cave", "Lake", "River", "Waterfall", "Wildlife",
];

// === Main Component ===
export default function RecommendPage() {
  // Multi-step form progression
  const [step, setStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState<RecommendationForm>({
    states: [],
    attractions: [],
    visitDate: "",
  });

  // Recommendation result
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  
  // Loading state when fetching recommendations
  const [loading, setLoading] = useState(false);

  // Toggle state selection
  const handleStateToggle = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter((s) => s !== state)
        : [...prev.states, state],
    }));
  };

  // Toggle attraction selection
  const handleAttractionToggle = (attraction: string) => {
    setFormData((prev) => ({
      ...prev,
      attractions: prev.attractions.includes(attraction)
        ? prev.attractions.filter((a) => a !== attraction)
        : [...prev.attractions, attraction],
    }));
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setRecommendation(data.recommendations?.[0] || null);
      setStep(4);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Reset to initial state
  const handleRestart = () => {
    setStep(1);
    setRecommendation(null);
    setFormData({ states: [], attractions: [], visitDate: "" });
  };

  // Render
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-12 px-4"
      style={{ backgroundImage: "url('/images/recommender-bg-2.jpg')" }}
    >
      {/* Light background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/60 to-white/30 backdrop-blur-[2px]" />

      <div className="relative max-w-4xl mx-auto mt-21">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 drop-shadow-md">
            Recommended <span className="text-green-700">Campsite</span> for You
          </h1>
          <p className="text-lg text-gray-900">
            Get campsite suggestions based on your preferences and predicted weather conditions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 transition-all ${
                    step > s ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1 - Date */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/80 rounded-2xl shadow-xl p-8 backdrop-blur-sm"
            >
              {/* Step Title */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  When are you planning to visit?
                </h2>
                <p className="text-gray-600">
                  We&apos;ll check the weather forecast for your chosen date
                </p>
              </div>

              {/* Date Picker */}
              <div className="max-w-md mx-auto mb-8 relative">
                <style jsx>{`
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                  }
                `}</style>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, visitDate: e.target.value })
                  }
                  // Limit selection between today and 3 months ahead
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(new Date().setMonth(new Date().getMonth() + 3))
                    .toISOString()
                    .split("T")[0]}
                  onKeyDown={(e) => e.preventDefault()}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none text-lg"
                />
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setStep(2)}
                disabled={!formData.visitDate}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next: Choose Location
              </button>
            </motion.div>
          )}

          {/* Step 2 - Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/80 rounded-2xl shadow-xl p-8 backdrop-blur-sm"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Where do you want to camp?
                </h2>
                <p className="text-gray-600">
                  Select the states you&apos;re interested in exploring
                </p>
              </div>

              {/* State Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {MALAYSIAN_STATES.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleStateToggle(state)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
                      formData.states.includes(state)
                        ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.states.length === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Next: Choose Attractions
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 - Choose Attractions */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/80 rounded-2xl shadow-xl p-8 backdrop-blur-sm"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏕️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  What attractions interest you?
                </h2>
                <p className="text-gray-600">
                  Choose the features you'd like your campsite to have
                </p>
              </div>

              {/* Attraction Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {ATTRACTIONS.map((attraction) => (
                  <button
                    key={attraction}
                    onClick={() => handleAttractionToggle(attraction)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
                      formData.attractions.includes(attraction)
                        ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {attraction}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={fetchRecommendations}
                  disabled={formData.attractions.length === 0 || loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Finding Campsites..." : "Get Recommendations"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4 - Results */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {!recommendation ? (
                <div className="bg-white/80 rounded-2xl shadow-xl p-12 text-center backdrop-blur-sm">
                  <div className="text-6xl mb-4">🏕️</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No matches found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your preferences for better results
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={`${
                      recommendation.isPartialMatch
                        ? "bg-yellow-50 border-yellow-500 text-yellow-900"
                        : "bg-green-50 border-green-600 text-green-900"
                    } border-l-4 p-4 mb-6 rounded-lg font-semibold`}
                  >
                    {recommendation.isPartialMatch
                      ? "⚠️ Partial Match: This campsite partially matches your preferences."
                      : "✅ Perfect Match: This campsite fully matches your preferences!"}
                  </div>

                  {/* Recommendation Result Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-64 md:h-auto">
                        <img
                          src={recommendation.campsite.imageUrl}
                          alt={recommendation.campsite.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info Section */}
                      <div className="md:w-2/3 p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {recommendation.campsite.name}
                        </h3>
                        <p className="text-gray-600">
                          📍 {recommendation.campsite.state}
                        </p>
                        {recommendation.campsite.fees && (
                          <p className="text-sm text-gray-500 mt-1">
                            💰 {recommendation.campsite.fees}
                          </p>
                        )}

                        {/* Weather Summary */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded mt-3">
                          <p className="text-blue-900 font-medium text-sm mb-1">
                            📅 {formatDate(formData.visitDate)}
                          </p>
                          <p className="text-blue-900 font-medium">
                            🌤️ {recommendation.weather.temperature}°C - {recommendation.weather.description}
                          </p>
                        </div>

                        {/* Attractions Tags */}
                        {recommendation.campsite.tags && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">✨ Attractions</h4>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.campsite.tags.split(",").map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activities Tags */}
                        {recommendation.campsite.activities && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              🏕️ Available Activities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.campsite.activities.split(",").map((activity, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                  {activity.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Link to detailed page */}
                        <Link
                          href={`/camp/${recommendation.campsite.id}`}
                          className="block text-center mt-6 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm leading-relaxed p-5 rounded-xl shadow-sm mx-auto max-w-[890px]">
                    ⚠️ <span className="font-semibold">Note:</span> Weather can be unpredictable. 
                    Always pack appropriately and check the latest local updates for a safe camping trip.
                  </div>
                </>
              )}

              {/* Restart Button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleRestart}
                  className="block mx-auto relative px-8 py-3 rounded-xl font-semibold text-green-700 
                  border-2 border-green-600 bg-white/80 backdrop-blur-sm 
                  hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 
                  hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] 
                  transition-all cursor-pointer"
                >
                  Start New Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
