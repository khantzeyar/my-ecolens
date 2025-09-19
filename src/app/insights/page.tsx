"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/peninsular_tree_cover_loss.json";
import districtPredictions from "../data/district_tree_loss_predictions.json"; // ✅ district-level predictions
import { MultiValue } from "react-select";

// Option type
interface OptionType {
  value: string;
  label: string;
}

// ✅ Dynamic import react-select (avoid hydration error)
const Select = dynamic(
  () => import("react-select") as unknown as Promise<
    React.ComponentType<{
      isMulti: true;
      options: OptionType[];
      value: OptionType[];
      onChange: (newValue: MultiValue<OptionType>) => void;
      className?: string;
    }>
  >,
  { ssr: false }
);

// Forest data type
interface ForestRecord {
  subnational1?: string;
  subnational2?: string;
  extent_2000_ha?: number;
  area_ha?: number;
  [key: string]: string | number | undefined;
}

interface DistrictPrediction {
  district: string;
  state: string;
  year: number;
  tc_loss_pred: number;
}

// Map component
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

// ✅ Compute state-level trends (historical + aggregated predictions)
function computeStateTrend(stateName: string): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];

  for (let year = 2001; year <= 2030; year++) {
    let total = 0;

    if (year <= 2024) {
      total = (forestData as ForestRecord[])
        .filter((d) => d.subnational1 === stateName)
        .reduce(
          (sum, d) =>
            sum +
            (typeof d[`tc_loss_ha_${year}`] === "number"
              ? (d[`tc_loss_ha_${year}`] as number)
              : 0),
          0
        );
    } else {
      total = (districtPredictions as DistrictPrediction[])
        .filter((d) => d.state === stateName && d.year === year)
        .reduce((sum, d) => sum + (d.tc_loss_pred ?? 0), 0);
    }

    result.push({ year, loss: total });
  }

  return result;
}

export default function ForestPage() {
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyMode, setStoryMode] = useState(false);

  // ✅ Default states
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "Pahang",
    "Johor",
    "Kelantan",
  ]);

  // ✅ Chart data
  const chartData = Array.from({ length: 2030 - 2001 + 1 }, (_, i) => {
    const year = 2001 + i;
    const entry: Record<string, number> = { year };
    selectedStates.forEach((s) => {
      entry[s] = computeStateTrend(s)[i]?.loss || 0;
    });
    return entry;
  });

  // Auto play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2030 ? prev + 1 : 2001));
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
      if (step > 2030) {
        clearInterval(timer);
        setStoryMode(false);
        return;
      }
      setYear(step);
    }, 2000);

    return () => clearInterval(timer);
  }, [storyMode]);

  // ✅ All states
  const allStates = Array.from(
    new Set(
      (forestData as ForestRecord[])
        .map((d) => d.subnational1)
        .filter(Boolean)
    )
  ) as string[];

  const stateOptions: OptionType[] = allStates.map((s) => ({
    value: s,
    label: s,
  }));

  // ✅ Colors
  const colors = [
    "#FF5722",
    "#2196F3",
    "#9C27B0",
    "#FFC107",
    "#009688",
    "#795548",
    "#E91E63",
    "#00BCD4",
  ];

  return (
    <main
      className="p-8 pt-36 space-y-12 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Page title */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Forest Insights
        </h1>
        <p className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Explore Malaysia&apos;s forest distribution, deforestation hotspots, and
          conservation areas through maps, charts, and interactive insights.
        </p>
      </header>

      {/* About the Data */}
      <section className="bg-yellow-50 p-8 rounded-3xl shadow-xl border border-yellow-200 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          About the Data
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The charts and maps on this page are based on tree cover loss data from
          <b> Global Forest Watch (2001–2024)</b>, combined with{" "}
          <b>state- and district-level projections (2025–2030)</b>. To ensure
          consistency, all datasets use a <b>canopy density threshold of 30%</b>.
          This means only areas with at least 30% tree cover in the year 2000 are
          counted as “forest.” The threshold is widely used in scientific
          analyses to balance accuracy between sparse vegetation and dense forest.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <b>Annual Forest Loss (tc_loss_ha_YEAR)</b>: Hectares of forest cover
            lost in that year.
          </li>
          <li>
            <b>State Chart</b>: Compare annual forest loss across selected
            states.
          </li>
          <li>
            <b>Forest Loss Map</b>: Shows where forest loss occurred in each
            district for the selected year.
          </li>
        </ul>
      </section>

      {/* State Comparison */}
      <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          State Forest Loss
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Compare annual forest loss across selected states. Each line
          represents hectares of forest lost in that year.
        </p>

        {/* ✅ Multi-select states */}
        <div className="mb-6 max-w-lg">
          <label className="block font-medium mb-2">Select States:</label>
          <Select
            isMulti
            options={stateOptions}
            value={selectedStates.map((s) => ({ value: s, label: s }))}
            onChange={(vals: MultiValue<OptionType>) =>
              setSelectedStates(vals.map((v) => v.value))
            }
            className="text-gray-700"
          />
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()} ha`,
                "Loss",
              ]}
            />
            <Legend />
            {selectedStates.map((s, idx) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                dot={false}
                name={s}
                strokeDasharray="0"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Map Section */}
      <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Forest Loss by District
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Explore annual forest loss (in hectares) at the district level. Use the
          timeline slider to see how it changes over the years.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl shadow border border-gray-200 mb-8">
          {/* Play button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            disabled={storyMode}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Story Mode */}
          <button
            onClick={() => setStoryMode(!storyMode)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            {storyMode ? "Stop Story" : "Story Mode"}
          </button>

          {/* ✅ Year slider */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="2001"
              max="2030"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-56 h-2 bg-gradient-to-r from-green-300 to-green-600 rounded-lg appearance-none cursor-pointer accent-green-700"
              disabled={storyMode}
            />
            <span className="text-lg font-bold text-gray-700">{year}</span>
          </div>
        </div>

        <ForestMap year={year} storyMode={storyMode} />
      </section>
    </main>
  );
}
