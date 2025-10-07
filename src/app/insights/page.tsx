"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/peninsular_tree_cover_loss.json";
import rawDistrictPredictions from "../data/district_tree_loss_predictions.json"; 
import { MultiValue } from "react-select";

// Option type
interface OptionType {
  value: string;
  label: string;
}

const Select = dynamic(
  () => import("react-select") as unknown as Promise<
    React.ComponentType<{
      isMulti: true;
      options: OptionType[];
      value: OptionType[];
      onChange: (newValue: MultiValue<OptionType>) => void;
      className?: string;
      isDisabled?: boolean;
    }>
  >,
  { ssr: false }
);

// Forest data type
interface ForestRecord {
  subnational1?: string; // state
  subnational2?: string; // district
  [key: string]: string | number | undefined;
}

interface DistrictPrediction {
  district: string;
  state: string;
  year: number;
  tc_loss_pred: number;
}

// ✅ Normalize JSON to correct types
const districtPredictions: DistrictPrediction[] = (rawDistrictPredictions as unknown as {
  district: string;
  state: string;
  year: string;
  tc_loss_pred: string;
}[]).map((d) => ({
  district: d.district,
  state: d.state,
  year: parseInt(d.year, 10),
  tc_loss_pred: parseFloat(d.tc_loss_pred),
}));

// Map component
const ForestMap = dynamic(
  () => import("../components/ForestMap").then((mod) => mod.default),
  { ssr: false }
);

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

// ✅ State-level trends
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
            ((typeof d[`tc_loss_ha_${year}`] === "number"
              ? d[`tc_loss_ha_${year}`]
              : 0) as number),
          0
        );
    } else {
      total = districtPredictions
        .filter((d) => d.state === stateName && d.year === year)
        .reduce((sum, d) => sum + (d.tc_loss_pred ?? 0), 0);
    }
    result.push({ year, loss: total });
  }
  return result;
}

// ✅ District-level trends
function computeDistrictTrend(districtName: string): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];
  for (let year = 2001; year <= 2030; year++) {
    let total = 0;
    if (year <= 2024) {
      total = (forestData as ForestRecord[])
        .filter((d) => d.subnational2 === districtName)
        .reduce(
          (sum, d) =>
            sum +
            ((typeof d[`tc_loss_ha_${year}`] === "number"
              ? d[`tc_loss_ha_${year}`]
              : 0) as number),
          0
        );
    } else {
      total = districtPredictions
        .filter((d) => d.district === districtName && d.year === year)
        .reduce((sum, d) => sum + (d.tc_loss_pred ?? 0), 0);
    }
    result.push({ year, loss: total });
  }
  return result;
}

export default function ForestPage() {
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // ✅ playback speed

  const [selectedStates, setSelectedStates] = useState<string[]>(["Pahang"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // ✅ All states/districts
  const allStates = Array.from(
    new Set(
      (forestData as ForestRecord[]).map((d) => d.subnational1).filter(Boolean)
    )
  ) as string[];
  const allDistricts = Array.from(
    new Set(
      (forestData as ForestRecord[]).map((d) => d.subnational2).filter(Boolean)
    )
  ) as string[];
  const stateOptions: OptionType[] = allStates.map((s) => ({
    value: s,
    label: s,
  }));
  const districtOptions: OptionType[] = allDistricts.map((d) => ({
    value: d,
    label: d,
  }));

  // ✅ Chart data
  const chartData = Array.from({ length: 2030 - 2001 + 1 }, (_, i) => {
    const year = 2001 + i;
    const entry: Record<string, number> = { year };

    selectedStates.forEach((s) => {
      entry[s] = computeStateTrend(s)[i]?.loss || 0;
    });
    selectedDistricts.forEach((d) => {
      entry[d] = computeDistrictTrend(d)[i]?.loss || 0;
    });

    return entry;
  });

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

  // Auto play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2030 ? prev + 1 : 2001));
      }, 1000 / speed); // ✅ playback speed control
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  return (
    <main
      className="p-8 pt-36 space-y-12 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Title */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Forest Insights
        </h1>
        <p className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Explore Malaysia&apos;s forest distribution, deforestation hotspots,
          and conservation areas through maps, charts, and interactive insights.
        </p>
      </header>

      {/* Map Section */}
      <section
        id="district"
        className="bg-white p-8 rounded-3xl shadow-xl border"
      >
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Forest Loss Map
        </h2>

        {/* ✅ Play + Speed Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl shadow border border-gray-200 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Playback speed selector */}
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>

          <input
            type="range"
            min="2001"
            max="2030"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-56"
          />
          <span className="font-bold">{year}</span>
        </div>

        {/* ✅ 修复：只传 year */}
        <ForestMap year={year} />
      </section>

      {/* State & District Comparison */}
      <section
        id="state"
        className="bg-white p-8 rounded-3xl shadow-xl border"
      >
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          Forest Loss Trends
        </h2>
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Select States</label>
            <Select
              isMulti
              options={stateOptions}
              value={selectedStates.map((s) => ({ value: s, label: s }))}
              onChange={(vals: MultiValue<OptionType>) =>
                setSelectedStates(vals.map((v) => v.value))
              }
              className="text-gray-700"
              isDisabled={selectedDistricts.length > 0}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Select Districts</label>
            <Select
              isMulti
              options={districtOptions}
              value={selectedDistricts.map((d) => ({ value: d, label: d }))}
              onChange={(vals: MultiValue<OptionType>) =>
                setSelectedDistricts(vals.map((v) => v.value))
              }
              className="text-gray-700"
              isDisabled={selectedStates.length > 0}
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString()} ha`, "Loss"]}
            />
            <Legend />
            {[...selectedStates, ...selectedDistricts].map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ✅ Eco Tips only */}
      <section
        id="eco-tips"
        className="bg-white p-8 rounded-3xl shadow-xl border"
      >
        <h2 className="text-3xl font-bold text-green-700 mb-4">Eco Tips</h2>
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Support reforestation projects</li>
            <li>Reduce paper and palm oil consumption</li>
            <li>Choose eco-friendly tourism options</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
