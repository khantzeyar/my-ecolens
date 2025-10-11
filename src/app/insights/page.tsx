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
  // 顶部页签
  const [active, setActive] = useState<TabKey>("map");

  const [year, setYear] = useState(2001);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // playback speed

  // 趋势模式：先选 States 还是 Districts
  const [trendMode, setTrendMode] = useState<TrendMode>("state");

  const [selectedStates, setSelectedStates] = useState<string[]>(["Pahang"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // 切换模式时清空另一侧选择，避免混淆
  useEffect(() => {
    if (trendMode === "state" && selectedDistricts.length) setSelectedDistricts([]);
    if (trendMode === "district" && selectedStates.length) setSelectedStates([]);
  }, [trendMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const stateOptions: OptionType[] = allStates.map((s) => ({ value: s, label: s }));
  const districtOptions: OptionType[] = allDistricts.map((d) => ({ value: d, label: d }));

  // ------- Chart data -------
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

  // ------- Auto play timeline -------
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

  // ------- Narrative metrics -------
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

  // ---------------- Render ----------------
  return (
    <main
      className="p-8 pt-36 space-y-8 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* ---------- Title ---------- */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Forest Insights
        </h1>
      </header>

      {/* ---------- How to read（标题下面） ---------- */}
      <section className="bg-white/85 backdrop-blur p-5 md:p-6 rounded-2xl shadow border">
        <h3 className="text-xl font-bold text-gray-900 mb-3">How to read this page</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="font-semibold mb-1">Map & timeline</div>
            <p>
              Drag the year slider or press Play to animate from 2001–2030. The
              choropleth shows annual tree-cover loss (ha) by district/state.
            </p>
          </div>
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="font-semibold mb-1">Forest Loss Trends</div>
            <p>
              Compare yearly loss between multiple states or districts. Pick the
              series you want, then read the legend and hover for values.
            </p>
          </div>
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="font-semibold mb-1">Data & methodology</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">2001–2024</span>: historical
                annual tree-cover loss aggregated by district/state.
              </li>
              <li>
                <span className="font-medium">2025–2030</span>: district-level
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

      {/* ---------- Tabs ---------- */}
      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-1 flex">
          {[
            { key: "map" as const, label: "Map & Timeline" },
            { key: "trends" as const, label: "Trends & Selectors" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex-1 py-2 md:py-3 rounded-xl text-sm md:text-base transition ${
                active === t.key
                  ? "bg-white shadow font-semibold text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== Tab 内容 ========== */}
      {active === "map" ? (
        <section id="map-tab" className="bg-white p-6 rounded-3xl shadow-xl border">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">
              Forest Loss Map
            </h2>
            <p className="text-sm text-gray-600 max-w-xl">
              Drag the slider or press Play to animate changes from 2001 to 2030
              (predictions after 2024).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
            {/* Map */}
            <section className="rounded-2xl overflow-hidden">
              <ForestMap year={year} />
            </section>

            {/* Right panel: Play bar + Top 3 hotspots */}
            <aside className="bg-gray-50 border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
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

                <span className="ml-auto font-semibold">{year}</span>
              </div>

              <input
                type="range"
                min={2001}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                2001–2030 (predictions after 2024)
              </p>

              {/* ✅ Top 3 hotspots 列表（移动到右侧面板） */}
              <div className="mt-4 rounded-xl border bg-white p-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Top 3 hotspots · {year}
                </div>
                <ul className="space-y-1.5 text-gray-900">
                  {topStatesThisYear.map((t, i) => (
                    <li key={t.state} className="text-sm">
                      <span className="font-semibold">
                        {i + 1}. {t.state}
                      </span>{" "}
                      — {formatHa(t.loss)}
                    </li>
                  ))}
                  {topStatesThisYear.length === 0 && (
                    <li className="text-gray-500 text-xs">No data</li>
                  )}
                </ul>
              </div>
            </aside>
          </div>

          {/* 下面只保留 Yearly narration（不再重复 hotspots 列表） */}
          <div className="mt-5 rounded-2xl border p-4 md:p-5 bg-emerald-50">
            <div className="text-sm md:text-base text-emerald-900 leading-relaxed">
              <span className="font-semibold">Yearly narration: </span>
              {narration}
            </div>
          </div>
        </section>
      ) : (
        <section id="trends-tab" className="bg-white p-6 rounded-3xl shadow-xl border">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">
              Forest Loss Trends
            </h2>
            <p className="text-sm text-gray-600 max-w-xl">
              Compare multiple states or districts. Choose a mode first, then
              pick one or more series to plot.
            </p>
          </div>

          {/* 模式切换：States / Districts */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Mode:</span>
            <div className="inline-flex rounded-xl border bg-white overflow-hidden">
              <button
                onClick={() => setTrendMode("state")}
                className={`px-3 py-1.5 text-sm ${
                  trendMode === "state"
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                States
              </button>
              <button
                onClick={() => setTrendMode("district")}
                className={`px-3 py-1.5 text-sm border-l ${
                  trendMode === "district"
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                Districts
              </button>
            </div>
          </div>

          {/* 选择器：根据模式显示一个 */}
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

          {/* 趋势图 */}
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

      {/* ---------- Eco Tips / Next Steps ---------- */}
      <section id="eco-tips" className="bg-white p-6 rounded-3xl shadow-xl border">
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Eco Tips & Next steps
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
              <li>Support reforestation programs and community nurseries.</li>
              <li>Reduce paper and palm-oil intensive consumption where possible.</li>
              <li>Choose eco-friendly tourism and certified operators.</li>
            </ul>
          </div>
          <div className="p-5 bg-emerald-50 rounded-2xl border-emerald-200 border">
            <p className="text-sm text-emerald-900">
              Tip: Pick a hotspot year on the timeline, note which states rise
              in the trends chart, then see if spikes are one-off or part of a
              longer trend.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
