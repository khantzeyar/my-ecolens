"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/peninsular_tree_cover_loss.json";
import rawDistrictPredictions from "../data/district_tree_loss_predictions.json";
import { MultiValue } from "react-select";

// ---------------- Types ----------------
interface OptionType {
  value: string;
  label: string;
}

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

// ---------------- Normalize prediction JSON ----------------
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

// ---------------- Lazy components ----------------
const ForestMap = dynamic(
  () => import("../components/ForestMap").then((mod) => mod.default),
  { ssr: false }
);

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

// ---------------- Recharts ----------------
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

// ---------------- Helpers: domain lists ----------------
const allStates = Array.from(
  new Set((forestData as ForestRecord[]).map((d) => d.subnational1).filter(Boolean))
) as string[];
const allDistricts = Array.from(
  new Set((forestData as ForestRecord[]).map((d) => d.subnational2).filter(Boolean))
) as string[];

// ---------------- Helpers: aggregations ----------------
function nationalLossByYear(year: number): number {
  if (year <= 2024) {
    return (forestData as ForestRecord[]).reduce((sum, d) => {
      const v = d[`tc_loss_ha_${year}`];
      return sum + (typeof v === "number" ? v : 0);
    }, 0);
  }
  return districtPredictions
    .filter((p) => p.year === year)
    .reduce((sum, p) => sum + (p.tc_loss_pred ?? 0), 0);
}

function stateLossByYear(stateName: string, year: number): number {
  if (year <= 2024) {
    return (forestData as ForestRecord[])
      .filter((d) => d.subnational1 === stateName)
      .reduce((sum, d) => sum + ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number), 0);
  }
  return districtPredictions
    .filter((p) => p.state === stateName && p.year === year)
    .reduce((sum, p) => sum + (p.tc_loss_pred ?? 0), 0);
}

function districtLossByYear(districtName: string, year: number): number {
  if (year <= 2024) {
    return (forestData as ForestRecord[])
      .filter((d) => d.subnational2 === districtName)
      .reduce((sum, d) => sum + ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number), 0);
  }
  return districtPredictions
    .filter((p) => p.district === districtName && p.year === year)
    .reduce((sum, p) => sum + (p.tc_loss_pred ?? 0), 0);
}

function computeStateTrend(stateName: string): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];
  for (let y = 2001; y <= 2030; y++) {
    result.push({ year: y, loss: stateLossByYear(stateName, y) });
  }
  return result;
}

function computeDistrictTrend(districtName: string): { year: number; loss: number }[] {
  const result: { year: number; loss: number }[] = [];
  for (let y = 2001; y <= 2030; y++) {
    result.push({ year: y, loss: districtLossByYear(districtName, y) });
  }
  return result;
}

function sumUntil(year: number, seq: (y: number) => number): number {
  let s = 0;
  for (let y = 2001; y <= year; y++) s += seq(y);
  return s;
}

function formatHa(v: number) {
  if (!isFinite(v)) return "-";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M ha";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "k ha";
  return Math.round(v).toLocaleString() + " ha";
}

// ---------------- Main ----------------
export default function ForestPage() {
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // playback speed
  const [selectedStates, setSelectedStates] = useState<string[]>(["Pahang"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const stateOptions: OptionType[] = allStates.map((s) => ({ value: s, label: s }));
  const districtOptions: OptionType[] = allDistricts.map((d) => ({ value: d, label: d }));

  // ------- Chart data (unchanged core) -------
  const chartData = useMemo(() => {
    return Array.from({ length: 2030 - 2001 + 1 }, (_, i) => {
      const y = 2001 + i;
      const entry: Record<string, number> = { year: y };
      selectedStates.forEach((s) => {
        entry[s] = computeStateTrend(s)[i]?.loss || 0;
      });
      selectedDistricts.forEach((d) => {
        entry[d] = computeDistrictTrend(d)[i]?.loss || 0;
      });
      return entry;
    });
  }, [selectedStates, selectedDistricts]);

  const colors = ["#FF5722", "#2196F3", "#9C27B0", "#FFC107", "#009688", "#795548", "#E91E63", "#00BCD4"];

  // ------- Auto play timeline -------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2030 ? prev + 1 : 2001));
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // ------- Narrative metrics (dynamic text) -------
  const natLossThisYear = useMemo(() => nationalLossByYear(year), [year]);
  const natLossPrevYear = useMemo(() => (year > 2001 ? nationalLossByYear(year - 1) : 0), [year]);
  const yoy = useMemo(() => {
    if (year <= 2001 || natLossPrevYear === 0) return 0;
    return ((natLossThisYear - natLossPrevYear) / natLossPrevYear) * 100;
  }, [natLossThisYear, natLossPrevYear, year]);

  const cumulativeNatLoss = useMemo(() => sumUntil(year, nationalLossByYear), [year]);

  const topStatesThisYear = useMemo(() => {
    const arr = allStates.map((s) => ({ state: s, loss: stateLossByYear(s, year) }));
    arr.sort((a, b) => b.loss - a.loss);
    return arr.slice(0, 3);
  }, [year]);

  const selectedLabel = useMemo(() => {
    if (selectedStates.length > 0) return selectedStates.join(", ");
    if (selectedDistricts.length > 0) return selectedDistricts.join(", ");
    return "Malaysia";
  }, [selectedStates, selectedDistricts]);

  const narration = useMemo(() => {
    const dir = yoy > 5 ? "higher than" : yoy < -5 ? "lower than" : "about the same as";
    const topLine =
      topStatesThisYear.length > 0
        ? `Top hotspots in ${year}: ${topStatesThisYear
            .map((t, i) => `${i + 1}. ${t.state} (${formatHa(t.loss)})`)
            .join("; ")}.`
        : "";

    return `In ${year}, estimated national tree-cover loss is ${formatHa(natLossThisYear)}, ${dir} ${year - 1}. ${topLine}`;
  }, [year, yoy, natLossThisYear, topStatesThisYear]);

  // ---------------- Render ----------------
  return (
    <main
      className="p-8 pt-36 space-y-12 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* ---------- Story Intro ---------- */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Forest Insights
        </h1>
        <p className="mt-5 text-[18px] md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          This page tells a story with data: where forest loss concentrates, how it changes over time,
          and what it means for eco-friendly choices. Use the timeline to watch change unfold, then compare states or districts below.
        </p>
      </header>

      {/* ---------- Key Numbers + Yearly Narration ---------- */}
      <section className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl shadow-xl border">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected scope</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{selectedLabel}</div>
            <p className="text-sm text-gray-600 mt-1">Map & chart reflect this selection.</p>
          </div>
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">This year loss</div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{formatHa(natLossThisYear)}</div>
            <p className={`text-sm mt-1 ${yoy > 0 ? "text-red-600" : yoy < 0 ? "text-emerald-700" : "text-gray-600"}`}>
              YoY: {isFinite(yoy) ? `${yoy > 0 ? "+" : ""}${yoy.toFixed(1)}%` : "-"}
            </p>
          </div>
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cumulative since 2001</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{formatHa(cumulativeNatLoss)}</div>
            <p className="text-sm text-gray-600 mt-1">National total up to {year}.</p>
          </div>
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top hotspots {year}</div>
            <ul className="mt-2 space-y-1">
              {topStatesThisYear.map((t, i) => (
                <li key={t.state} className="text-sm text-gray-800">
                  <span className="font-semibold">{i + 1}. {t.state}</span> — {formatHa(t.loss)}
                </li>
              ))}
              {topStatesThisYear.length === 0 && <li className="text-sm text-gray-500">No data</li>}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-5 bg-emerald-50">
          <div className="text-sm md:text-base text-emerald-900 leading-relaxed">
            <span className="font-semibold">Yearly narration: </span>{narration}
          </div>
        </div>
      </section>

      {/* ---------- Map + Timeline Controls ---------- */}
      <section id="district" className="bg-white p-8 rounded-3xl shadow-xl border">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-3xl font-bold text-green-700">Forest Loss Map</h2>
          <p className="text-sm text-gray-600 max-w-xl">
            Drag the slider or press Play to animate changes from 2001 to 2030 (predictions after 2024).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl shadow border border-gray-200 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <label className="text-sm text-gray-600">Speed</label>
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

        {/* Map only needs year */}
        <ForestMap year={year} />
      </section>

      {/* ---------- Compare: States vs Districts ---------- */}
      <section id="state" className="bg-white p-8 rounded-3xl shadow-xl border">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-3xl font-bold text-green-700">Forest Loss Trends</h2>
          <p className="text-sm text-gray-600 max-w-xl">
            Compare multiple states or districts. For clarity, the selector disables district picks when states are selected (and vice versa).
          </p>
        </div>

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

      {/* ---------- How to read + Methodology ---------- */}
      <section className="bg-white p-8 rounded-3xl shadow-xl border">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">How to read this page</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="font-semibold mb-1">Map</div>
            <p>Warm colors indicate higher tree-cover loss. Use the timeline to see when and where hotspots appear.</p>
          </div>
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="font-semibold mb-1">Trends</div>
            <p>Lines show annual loss per state/district. Focus on direction and relative magnitude rather than exact values.</p>
          </div>
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="font-semibold mb-1">Narration</div>
            <p>The banner summarizes this year’s loss, YoY change, and top hotspots to anchor your interpretation.</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Data & methodology</h3>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-2">
          <li><span className="font-semibold">2001–2024:</span> historical annual tree-cover loss aggregated by district/state.</li>
          <li><span className="font-semibold">2025–2030:</span> district-level predictions aggregated to states for comparability.</li>
          <li>Values represent <em>tree-cover loss</em> (hectares) and are not the same as net deforestation or biodiversity loss.</li>
          <li>Predictions are indicative; use them to explore possible patterns, not precise forecasts.</li>
        </ul>
      </section>

      {/* ---------- Eco Tips / Next Steps ---------- */}
      <section id="eco-tips" className="bg-white p-8 rounded-3xl shadow-xl border">
        <h2 className="text-3xl font-bold text-green-700 mb-4">Eco Tips & Next steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
              <li>Support reforestation programs and community nurseries.</li>
              <li>Reduce paper and palm-oil intensive consumption where possible.</li>
              <li>Choose eco-friendly tourism and certified operators.</li>
            </ul>
          </div>
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="text-sm text-emerald-900">
              Tip: Pick a hotspot year on the timeline, note which states rise in the “Top hotspots” list, then compare them in the chart to see if spikes are one-off or part of a longer trend.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
