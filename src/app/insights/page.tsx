"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import forestData from "../data/peninsular_tree_cover_loss.json";
import rawDistrictPredictions from "../data/district_tree_loss_predictions.json";
import { MultiValue } from "react-select";

// ---------------- Types ----------------
type TabKey = "map" | "trends";
type TrendMode = "state" | "district";

interface OptionType {
  value: string;
  label: string;
}

interface ForestRecord {
  subnational1?: string;
  subnational2?: string;
  [key: string]: string | number | undefined;
}

interface DistrictPrediction {
  district: string;
  state: string;
  year: number;
  tc_loss_pred: number;
}

// ---------------- Normalize prediction JSON ----------------
const districtPredictions: DistrictPrediction[] = (
  rawDistrictPredictions as unknown as {
    district: string;
    state: string;
    year: string;
    tc_loss_pred: string;
  }[]
).map((d) => ({
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
  () =>
    import("react-select") as unknown as Promise<
      React.ComponentType<{
        isMulti: true;
        options: OptionType[];
        value: OptionType[];
        onChange: (newValue: MultiValue<OptionType>) => void;
        className?: string;
        isDisabled?: boolean;
        closeMenuOnSelect?: boolean;
        blurInputOnSelect?: boolean;
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
      .reduce(
        (sum, d) =>
          sum +
          ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number),
        0
      );
  }
  return districtPredictions
    .filter((p) => p.state === stateName && p.year === year)
    .reduce((sum, p) => sum + (p.tc_loss_pred ?? 0), 0);
}

function districtLossByYear(districtName: string, year: number): number {
  if (year <= 2024) {
    return (forestData as ForestRecord[])
      .filter((d) => d.subnational2 === districtName)
      .reduce(
        (sum, d) =>
          sum +
          ((typeof d[`tc_loss_ha_${year}`] === "number" ? d[`tc_loss_ha_${year}`] : 0) as number),
        0
      );
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
  const [active, setActive] = useState<TabKey>("map");
  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trendMode, setTrendMode] = useState<TrendMode>("state");
  const [selectedStates, setSelectedStates] = useState<string[]>(["Pahang"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (trendMode === "state" && selectedDistricts.length) setSelectedDistricts([]);
    if (trendMode === "district" && selectedStates.length) setSelectedStates([]);
  }, [trendMode]);

  const stateOptions: OptionType[] = allStates.map((s) => ({ value: s, label: s }));
  const districtOptions: OptionType[] = allDistricts.map((d) => ({ value: d, label: d }));

  const seriesKeys = trendMode === "state" ? selectedStates : selectedDistricts;

  const chartData = useMemo(() => {
    return Array.from({ length: 2030 - 2001 + 1 }, (_, i) => {
      const y = 2001 + i;
      const entry: Record<string, number> = { year: y };

      if (trendMode === "state") {
        seriesKeys.forEach((s) => {
          entry[s] = computeStateTrend(s)[i]?.loss || 0;
        });
      } else {
        seriesKeys.forEach((d) => {
          entry[d] = computeDistrictTrend(d)[i]?.loss || 0;
        });
      }
      return entry;
    });
  }, [seriesKeys, trendMode]);

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

  useEffect(() => {
    if (active === "trends") setIsPlaying(false);
  }, [active]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => (prev < 2030 ? prev + 1 : 2001));
      }, 1000 / speed);
    }
    return () => (timer ? clearInterval(timer) : undefined);
  }, [isPlaying, speed]);

  const natLossThisYear = useMemo(() => nationalLossByYear(year), [year]);
  const natLossPrevYear = useMemo(
    () => (year > 2001 ? nationalLossByYear(year - 1) : 0),
    [year]
  );
  const yoy = useMemo(() => {
    if (year <= 2001 || natLossPrevYear === 0) return 0;
    return ((natLossThisYear - natLossPrevYear) / natLossPrevYear) * 100;
  }, [natLossThisYear, natLossPrevYear, year]);

  const cumulativeNatLoss = useMemo(
    () => sumUntil(year, nationalLossByYear),
    [year]
  );

  const topStatesThisYear = useMemo(() => {
    const arr = allStates.map((s) => ({ state: s, loss: stateLossByYear(s, year) }));
    arr.sort((a, b) => b.loss - a.loss);
    return arr.slice(0, 3);
  }, [year]);

  const narration = useMemo(() => {
    const dir = yoy > 5 ? "higher than" : yoy < -5 ? "lower than" : "about the same as";
    const topLine =
      topStatesThisYear.length > 0
        ? `Top hotspots in ${year}: ${topStatesThisYear
            .map((t, i) => `${i + 1}. ${t.state} (${formatHa(t.loss)})`)
            .join("; ")}.`
        : "";

    return `In ${year}, estimated national tree-cover loss is ${formatHa(
      natLossThisYear
    )}, ${dir} ${year - 1}. ${topLine}`;
  }, [year, yoy, natLossThisYear, topStatesThisYear]);

  return (
    <main
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      <div className="min-h-screen flex flex-col justify-center items-center px-8 py-12 pt-24">
        <header className="text-center mb-10 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Forest Insights
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/90 drop-shadow-lg font-light leading-relaxed max-w-2xl mx-auto">
            Explore Malaysia's Forest Cover Changes from 2001 to 2030
          </p>
        </header>

        <section className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-white/50 max-w-6xl w-full">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">How to read this page</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm md:text-base text-gray-700">
            <div className="rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg transition">
              <div className="font-bold text-lg mb-3 text-green-700">Map & timeline</div>
              <p className="leading-relaxed">
                Drag the year slider or press Play to animate from 2001–2030. The
                choropleth shows annual tree-cover loss (ha) by district/state.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg transition">
              <div className="font-bold text-lg mb-3 text-green-700">Forest Loss Trends</div>
              <p className="leading-relaxed">
                Compare yearly loss between multiple states or districts. Pick the
                series you want, then read the legend and hover for values.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg transition">
              <div className="font-bold text-lg mb-3 text-green-700">Data & methodology</div>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>
                  <span className="font-semibold">2001–2024</span>: historical
                  annual tree-cover loss aggregated by district/state.
                </li>
                <li>
                  <span className="font-semibold">2025–2030</span>: district-level
                  predictions aggregated to states.
                </li>
                <li>
                  Values show <em>tree-cover loss</em> (ha), not net
                  deforestation.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <div className="px-8 pt-6 pb-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-1.5 shadow-xl border-2 border-gray-200 flex">
            {[
              { key: "map" as const, label: "Map & Timeline" },
              { key: "trends" as const, label: "Trends & Selectors" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`flex-1 px-8 py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 whitespace-nowrap ${
                  active === t.key
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {active === "map" ? (
          <section id="map-tab" className="bg-white/95 p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-white/50 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="text-2xl md:text-3xl font-bold text-green-700">
                Forest Loss Map
              </h2>
              <p className="text-sm text-gray-600 max-w-xl leading-snug">
                Drag the slider or press Play to animate changes from 2001 to 2030 (predictions after 2024)
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
              <section className="rounded-2xl overflow-hidden">
                <ForestMap year={year} />
              </section>

              <aside className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition font-medium"
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <label className="text-sm text-gray-600 font-medium">Speed</label>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="border-2 border-gray-200 px-3 py-2 rounded-lg text-sm font-medium focus:border-green-500 focus:outline-none transition"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                  </select>

                  <span className="ml-auto font-bold text-xl text-gray-800">{year}</span>
                </div>

                <input
                  type="range"
                  min={2001}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                  2001–2030 (predictions after 2024)
                </p>

                <div className="mt-5 rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                    Top 3 Hotspots · {year}
                  </div>
                  <ul className="space-y-2.5 text-gray-900">
                    {topStatesThisYear.map((t, i) => (
                      <li key={t.state} className="text-sm flex items-baseline gap-2">
                        <span className="font-bold text-green-700 min-w-[1.5rem]">
                          {i + 1}.
                        </span>
                        <span className="font-semibold flex-1">{t.state}</span>
                        <span className="text-gray-600 font-medium">{formatHa(t.loss)}</span>
                      </li>
                    ))}
                    {topStatesThisYear.length === 0 && (
                      <li className="text-gray-400 text-xs italic">No data available</li>
                    )}
                  </ul>
                </div>
              </aside>
            </div>

            <div className="mt-4 rounded-2xl border-2 border-emerald-200 p-4 md:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
              <div className="text-sm md:text-base text-emerald-900 leading-relaxed">
                <span className="font-bold">Yearly narration: </span>
                {narration}
              </div>
            </div>
          </section>
        ) : (
          <section id="trends-tab" className="bg-white/95 p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-white/50 max-w-7xl mx-auto">
            <div className="mb-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-green-700">
                  Forest Loss Trends
                </h2>
                <p className="text-sm text-gray-600 max-w-2xl leading-snug">
                  Compare multiple states or districts. Choose a mode first, then pick one or more series to plot.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Mode:</span>
                <div className="inline-flex rounded-full border-2 border-gray-300 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setTrendMode("state")}
                    className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                      trendMode === "state"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    States
                  </button>
                  <button
                    onClick={() => setTrendMode("district")}
                    className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                      trendMode === "district"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Districts
                  </button>
                </div>
              </div>
            </div>

            {trendMode === "state" ? (
              <div className="mb-5">
                <div className="font-semibold text-sm mb-2">Select States</div>
                <Select
                  isMulti
                  options={stateOptions}
                  value={selectedStates.map((s) => ({ value: s, label: s }))}
                  onChange={(vals: MultiValue<OptionType>) =>
                    setSelectedStates(vals.map((v) => v.value))
                  }
                  className="text-gray-700"
                  closeMenuOnSelect={false}
                  blurInputOnSelect={false}
                />
              </div>
            ) : (
              <div className="mb-5">
                <div className="font-semibold text-sm mb-2">Select Districts</div>
                <Select
                  isMulti
                  options={districtOptions}
                  value={selectedDistricts.map((d) => ({ value: d, label: d }))}
                  onChange={(vals: MultiValue<OptionType>) =>
                    setSelectedDistricts(vals.map((v) => v.value))
                  }
                  className="text-gray-700"
                  closeMenuOnSelect={false}
                  blurInputOnSelect={false}
                />
              </div>
            )}

            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ha`, "Loss"]} />
                <Legend />
                {seriesKeys.map((key, idx) => (
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
        )}

        <section id="eco-tips" className="bg-white/95 p-5 md:p-6 rounded-3xl shadow-2xl border-2 border-white/50 max-w-7xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">
            Eco Tips & Next steps
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
              <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm leading-relaxed">
                <li>Support reforestation programs and community nurseries.</li>
                <li>Reduce paper and palm-oil intensive consumption where possible.</li>
                <li>Choose eco-friendly tourism and certified operators.</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-sm">
              <p className="text-sm text-emerald-900 leading-relaxed">
                Tip: Pick a hotspot year on the timeline, note which states rise
                in the trends chart, then see if spikes are one-off or part of a
                longer trend.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}