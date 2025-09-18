"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/tree_cover_loss.json";

// Define a type for forest data
interface ForestRecord {
  subnational1?: string;
  subnational2?: string;
  extent_2000_ha?: number;
  area_ha?: number;
  [key: string]: string | number | undefined;
}

// Dynamic import of ForestMap (disable SSR)
const ForestMap = dynamic(() => import("../components/ForestMap"), {
  ssr: false,
});

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// National trend
function computeNationalTrend(): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];
  for (let year = 2001; year <= 2024; year++) {
    const total = (forestData as ForestRecord[]).reduce(
      (sum, d) =>
        sum +
        (typeof d[`tc_loss_ha_${year}`] === "number"
          ? (d[`tc_loss_ha_${year}`] as number)
          : 0),
      0
    );
    result.push({ year, loss: total });
  }
  return result;
}

// State trend
function computeStateTrend(stateName: string): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];
  for (let year = 2001; year <= 2024; year++) {
    const total = (forestData as ForestRecord[])
      .filter(
        (d) => d.subnational1 === stateName || d.subnational2 === stateName
      )
      .reduce(
        (sum, d) =>
          sum +
          (typeof d[`tc_loss_ha_${year}`] === "number"
            ? (d[`tc_loss_ha_${year}`] as number)
            : 0),
        0
      );
    result.push({ year, loss: total });
  }
  return result;
}

export default function ForestPage() {
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyMode, setStoryMode] = useState(false);

  // State selected for comparison chart
  const [selectedState, setSelectedState] = useState("Pahang");

  const nationalTrend = computeNationalTrend();
  const stateTrend = computeStateTrend(selectedState);

  // Combine data
  const chartData = nationalTrend.map((nat, idx) => ({
    year: nat.year,
    national: nat.loss,
    state: stateTrend[idx]?.loss || 0,
  }));

  // Auto play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2024 ? prev + 1 : 2001));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Story mode
  useEffect(() => {
    if (!storyMode) return;
    let step = 2001;
    setYear(step);

    const timer = setInterval(() => {
      step += 5;
      if (step > 2024) {
        clearInterval(timer);
        setStoryMode(false);
        return;
      }
      setYear(step);
    }, 2000);

    return () => clearInterval(timer);
  }, [storyMode]);

  // All states
  const allStates = Array.from(
    new Set(
      (forestData as ForestRecord[]).map((d) => d.subnational1).filter(Boolean)
    )
  );

  return (
    <main className="p-8 pt-28 space-y-10">
      {/* Page title */}
      <header>
        <h1 className="text-4xl font-extrabold text-green-700">Forest Insights</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-3xl">
          Explore Malaysia&apos;s forest distribution, deforestation hotspots, and
          conservation areas through maps, charts, and interactive insights.
        </p>
      </header>

      {/* About the Data */}
      <section className="bg-yellow-50 p-8 rounded-2xl shadow-lg border border-yellow-200">
        <h2 className="text-2xl font-semibold mb-4">About the Data</h2>
        <p className="text-gray-700 mb-4">
          The charts and maps on this page are based on tree cover loss data from
          <b> Global Forest Watch (2001–2024)</b>. The values represent how many
          hectares of tree cover were lost in each year.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <b>Annual Forest Loss (tc_loss_ha_YEAR)</b>: Hectares of tree cover lost in that year.
          </li>
          <li>
            <b>National vs State Chart</b>: Compares Malaysia&apos;s total annual forest
            loss with the selected state.
          </li>
          <li>
            <b>Forest Loss Map</b>: Shows where forest loss occurred in each district
            for the selected year.
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Note: &quot;Tree cover loss&quot; means the removal or mortality of tree cover
          in areas that had at least 30% canopy density. It includes natural
          disturbances (storms, fires) as well as human-driven clearing, not only permanent deforestation.
        </p>
      </section>

      {/* Why Forests Matter */}
      <section className="bg-gradient-to-r from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100">
        <h2 className="text-2xl font-semibold mb-4">Why Forests Matter</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Maintain biodiversity and protect endangered species.</li>
          <li>Regulate climate and reduce disaster risks.</li>
          <li>Support local communities and sustainable livelihoods.</li>
        </ul>
      </section>

      {/* National vs State Comparison */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-2">National vs State Forest Loss</h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare Malaysia&apos;s total annual tree cover loss with the selected state.
          Each point represents hectares of forest lost in that year.
        </p>

        {/* State Selector */}
        <div className="mb-6">
          <label className="mr-2 font-medium">Select State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm text-gray-700 hover:border-green-500 focus:ring focus:ring-green-200"
          >
            {allStates.map((s) => (
              <option key={s} value={s as string}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} ha lost`, ""]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="national"
              stroke="#2E7D32"
              strokeWidth={2}
              dot={false}
              name="National Total"
            />
            <Line
              type="monotone"
              dataKey="state"
              stroke="#FF5722"
              strokeWidth={2}
              dot={false}
              name={selectedState}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Map Section */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Forest Loss by District</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Explore annual forest loss (in hectares) at the district level. Use the
          timeline slider to see how it changes over the years.
        </p>

        {/* Controls */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl shadow border border-gray-200 mb-6">
          {/* Play button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            disabled={storyMode}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Story Mode */}
          <button
            onClick={() => setStoryMode(!storyMode)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            {storyMode ? "Stop Story" : "Story Mode"}
          </button>

          {/* Year slider */}
          <input
            type="range"
            min="2001"
            max="2024"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-48 h-2 bg-gradient-to-r from-green-300 to-green-600 rounded-lg appearance-none cursor-pointer accent-green-700"
            disabled={storyMode}
          />
          <span className="text-lg font-bold text-gray-700">{year}</span>
        </div>

        <ForestMap year={year} storyMode={storyMode} />
      </section>
    </main>
  );
}
