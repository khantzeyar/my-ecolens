"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/peninsular_tree_cover_loss.json";
import districtPredictions from "../data/district_tree_loss_predictions.json"; 
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
            sum + ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number),
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
            sum + ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number),
          0
        );
    } else {
      total = (districtPredictions as DistrictPrediction[])
        .filter((d) => d.district === districtName && d.year === year)
        .reduce((sum, d) => sum + (d.tc_loss_pred ?? 0), 0);
    }
    result.push({ year, loss: total });
  }
  return result;
}

// ✅ Compute cumulative loss (states + districts)
function computeCumulativeLoss(startYear: number, endYear: number, states: string[], districts: string[]) {
  const results: { name: string; type: string; totalLoss: number }[] = [];

  states.forEach((s) => {
    const trend = computeStateTrend(s);
    const totalLoss = trend
      .filter((d) => d.year >= startYear && d.year <= endYear)
      .reduce((sum, d) => sum + d.loss, 0);
    results.push({ name: s, type: "State", totalLoss });
  });

  districts.forEach((d) => {
    const trend = computeDistrictTrend(d);
    const totalLoss = trend
      .filter((d) => d.year >= startYear && d.year <= endYear)
      .reduce((sum, d) => sum + d.loss, 0);
    results.push({ name: d, type: "District", totalLoss });
  });

  return results.sort((a, b) => b.totalLoss - a.totalLoss);
}

export default function ForestPage() {
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // ✅ 播放速度

  const [selectedStates, setSelectedStates] = useState<string[]>(["Pahang"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const [startYear, setStartYear] = useState(2001);
  const [endYear, setEndYear] = useState(2030);

  // ✅ All states/districts
  const allStates = Array.from(new Set((forestData as ForestRecord[]).map((d) => d.subnational1).filter(Boolean))) as string[];
  const allDistricts = Array.from(new Set((forestData as ForestRecord[]).map((d) => d.subnational2).filter(Boolean))) as string[];

  const stateOptions: OptionType[] = allStates.map((s) => ({ value: s, label: s }));
  const districtOptions: OptionType[] = allDistricts.map((d) => ({ value: d, label: d }));

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

  const colors = ["#FF5722", "#2196F3", "#9C27B0", "#FFC107", "#009688", "#795548", "#E91E63", "#00BCD4"];

  // ✅ cumulativeLoss（互斥逻辑）
  const cumulativeLoss = (() => {
    if (selectedStates.length > 0) {
      return computeCumulativeLoss(startYear, endYear, selectedStates, []);
    } else if (selectedDistricts.length > 0) {
      return computeCumulativeLoss(startYear, endYear, [], selectedDistricts);
    } else {
      return computeCumulativeLoss(startYear, endYear, allStates, []);
    }
  })();

  // ✅ Export CSV
  const exportCSV = () => {
    const header = "Name,Type,Total Loss (ha)\n";
    const rows = cumulativeLoss.map((d) => `${d.name},${d.type},${d.totalLoss}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forest_loss_${startYear}_${endYear}.csv`;
    link.click();
  };

  // Auto play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2030 ? prev + 1 : 2001));
      }, 1000 / speed); // ✅ 播放速度控制
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  return (
    <main className="p-8 pt-36 space-y-12 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Title */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Forest Insights
        </h1>
        <p className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Explore Malaysia&apos;s forest distribution, deforestation hotspots, and conservation areas through maps, charts, and interactive insights.
        </p>
      </header>

      {/* Map Section */}
      <section id="district" className="bg-white p-8 rounded-3xl shadow-xl border">
        <h2 className="text-3xl font-bold text-green-700 mb-4">Forest Loss Map</h2>

        {/* ✅ Play + 播放速度 控制区（Story Mode 已删除） */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl shadow border border-gray-200 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* 播放速度选择器 */}
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

        <ForestMap
          year={year}
          colorScale={[
            { limit: 100, color: "#deebf7" },
            { limit: 500, color: "#9ecae1" },
            { limit: 1000, color: "#31a354" },
            { limit: 2000, color: "#feb24c" },
            { limit: 5000, color: "#fd8d3c" },
            { limit: 10000, color: "#f03b20" },
            { limit: Infinity, color: "#7a0177" },
          ]}
          mapOptions={{
            dragging: false,
            zoomControl: true,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
          }}
        />
      </section>

      {/* State & District Comparison */}
      <section id="state" className="bg-white p-8 rounded-3xl shadow-xl border">
        <h2 className="text-3xl font-bold text-green-700 mb-2">Forest Loss Trends</h2>
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Select States</label>
            <Select
              isMulti
              options={stateOptions}
              value={selectedStates.map((s) => ({ value: s, label: s }))}
              onChange={(vals: MultiValue<OptionType>) => setSelectedStates(vals.map((v) => v.value))}
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
              onChange={(vals: MultiValue<OptionType>) => setSelectedDistricts(vals.map((v) => v.value))}
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
            <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ha`, "Loss"]} />
            <Legend />
            {[...selectedStates, ...selectedDistricts].map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={3} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Rankings */}
      <section id="ranking" className="bg-white p-8 rounded-3xl shadow-xl border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-green-700">Rankings (State & District)</h2>
          <div className="flex gap-4 items-center">
            <label>
              Start:
              <input type="number" value={startYear} min={2001} max={2030}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="ml-2 border px-2 py-1 rounded w-20"/>
            </label>
            <label>
              End:
              <input type="number" value={endYear} min={2001} max={2030}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="ml-2 border px-2 py-1 rounded w-20"/>
            </label>
            <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
              Export CSV
            </button>
          </div>
        </div>

        {/* ✅ 筛选器 */}
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Filter States</label>
            <Select
              isMulti
              options={stateOptions}
              value={selectedStates.map((s) => ({ value: s, label: s }))}
              onChange={(vals: MultiValue<OptionType>) => setSelectedStates(vals.map((v) => v.value))}
              className="text-gray-700"
              isDisabled={selectedDistricts.length > 0}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Filter Districts</label>
            <Select
              isMulti
              options={districtOptions}
              value={selectedDistricts.map((d) => ({ value: d, label: d }))}
              onChange={(vals: MultiValue<OptionType>) => setSelectedDistricts(vals.map((v) => v.value))}
              className="text-gray-700"
              isDisabled={selectedStates.length > 0}
            />
          </div>
        </div>

        {/* 表格 */}
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Rank</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Total Loss (ha)</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeLoss.map((d, idx) => (
              <tr key={d.name} className="text-center">
                <td className="border p-2">{idx + 1}</td>
                <td className="border p-2">{d.name}</td>
                <td className="border p-2">{d.type}</td>
                <td className="border p-2">{d.totalLoss.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Eco Tips */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <h3 className="font-bold text-lg mb-2">Eco Tips</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Support reforestation projects 🌱</li>
            <li>Reduce paper and palm oil consumption 📝</li>
            <li>Choose eco-friendly tourism options 🌍</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
