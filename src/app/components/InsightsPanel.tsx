'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  RectangleProps,
} from 'recharts';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface InsightsPanelProps {
  isOpen?: boolean;
  data: {
    name: string;
    yearly_loss?: Record<number, number>; // ✅ 改成 number key
    cumulative_loss_percent?: number;
    rank?: number;
    totalRegions?: number;
  } | null;
  onClose?: () => void;
  mode?: 'modal' | 'embed' | 'mini';
}

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  year?: number; // ✅ 改成 number
  maxLoss: number;
}

const CustomBarShape: React.FC<BarShapeProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value = 0,
  year,
  maxLoss,
}) => {
  const isPrediction = year !== undefined && year >= 2025;
  let color = value === maxLoss ? '#e74c3c' : '#82ca9d';
  if (isPrediction) {
    color = '#999999';
  }
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      rx={3}
      ry={3}
      stroke={isPrediction ? '#666' : undefined}
      strokeDasharray={isPrediction ? '4 2' : undefined}
    />
  );
};

// ✅ shape props 统一类型
type CustomShapeProps = RectangleProps & {
  payload?: { year?: number; loss?: number };
};

// ✅ Generate eco tips dynamically
function generateEcoTips(percent: number, rank?: number) {
  const tips: string[] = [];

  if (percent > 30) {
    tips.push("Support local reforestation projects to restore degraded areas.");
  } else if (percent > 15) {
    tips.push("Reduce single-use products and switch to eco-friendly alternatives.");
  } else {
    tips.push("Continue sustainable practices to keep the forest healthy.");
  }

  if (rank && rank <= 5) {
    tips.push("This region is among the most impacted – spread awareness in your community.");
  }

  tips.push("Always camp responsibly: carry trash out, avoid disturbing wildlife.");
  tips.push("Choose reusable gear (bottles, utensils) to minimize waste.");
  tips.push("Report illegal logging or suspicious activities to local authorities.");

  return tips;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  isOpen = true,
  data,
  onClose,
  mode = 'embed',
}) => {
  if (!isOpen || !data) return null;

  const trends = data.yearly_loss
    ? Array.from({ length: 30 }, (_, i) => {
        const year = 2001 + i;
        return { year, loss: data.yearly_loss?.[year] ?? 0 };
      })
    : [];

  const maxLoss = trends.length > 0 ? Math.max(...trends.map((d) => d.loss)) : 0;
  const maxYear = trends.find((d) => d.loss === maxLoss)?.year;
  const percent = data.cumulative_loss_percent ?? 0;

  const ecoTips = generateEcoTips(percent, data.rank);

  // Mini mode
  if (mode === 'mini') {
    return (
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="text-md font-semibold mb-3">
          Forest Loss Trend – {data.name}
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <XAxis dataKey="year" interval={5} />
              <YAxis />
              <Tooltip
                formatter={(value: ValueType) => [
                  `${Number(value).toLocaleString()} ha`,
                  'Forest Loss',
                ]}
              />
              <Bar
                dataKey="loss"
                fill="#82ca9d"
                shape={(props: unknown) => {
                  const p = props as CustomShapeProps;
                  return (
                    <CustomBarShape
                      x={p.x ?? 0}
                      y={p.y ?? 0}
                      width={p.width ?? 0}
                      height={p.height ?? 0}
                      value={p.payload?.loss ?? 0}
                      year={p.payload?.year}
                      maxLoss={maxLoss}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Total forest loss:{' '}
          <span className="font-bold text-red-600">{percent.toFixed(1)}%</span>
        </p>
      </div>
    );
  }

  // Embed or modal
  const Wrapper = mode === 'modal' ? motion.div : 'div';
  const wrapperClass =
    mode === 'modal'
      ? 'fixed bottom-0 left-0 w-full bg-white shadow-xl rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto'
      : 'bg-white shadow-md rounded-xl p-6';

  return (
    <Wrapper
      initial={mode === 'modal' ? { y: '100%', opacity: 0 } : undefined}
      animate={mode === 'modal' ? { y: 0, opacity: 1 } : undefined}
      exit={mode === 'modal' ? { y: '100%', opacity: 0 } : undefined}
      transition={
        mode === 'modal'
          ? { type: 'spring', stiffness: 100, damping: 20 }
          : undefined
      }
      className={wrapperClass}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-green-700">
          Forest Insights – {data.name}
        </h2>
        {mode === 'modal' && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✖
          </button>
        )}
      </div>

      {/* Annual forest loss */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3">Annual Forest Loss</h3>
        <div className="h-64">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" interval={3} />
                <YAxis />
                <Tooltip
                  formatter={(value: ValueType, _unused, props?: { payload?: { year?: number } }) => {
                    const payload = props?.payload;
                    return [
                      `${Number(value).toLocaleString()} ha`,
                      payload?.year ? `Year ${payload.year}` : '',
                    ];
                  }}
                />
                <Bar
                  dataKey="loss"
                  fill="#82ca9d"
                  shape={(props: unknown) => {
                    const p = props as CustomShapeProps;
                    return (
                      <CustomBarShape
                        x={p.x ?? 0}
                        y={p.y ?? 0}
                        width={p.width ?? 0}
                        height={p.height ?? 0}
                        value={p.payload?.loss ?? 0}
                        year={p.payload?.year}
                        maxLoss={maxLoss}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No annual data available.</p>
          )}
        </div>
        {maxYear && (
          <p className="text-xs text-gray-500 mt-2">
            Peak loss in {maxYear}: {maxLoss.toLocaleString()} ha
          </p>
        )}
        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-4 h-3 bg-green-400 rounded-sm"></span> Historical
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-3 bg-gray-400 border border-gray-500 border-dashed rounded-sm"></span> Prediction
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-3 bg-red-500 rounded-sm"></span> Peak Year
          </div>
        </div>
      </div>

      {/* Cumulative summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">Cumulative Summary</h3>
        <p className="text-gray-700 leading-relaxed">
          Since 2001, this region has lost{' '}
          <span className="font-bold text-red-600">{percent.toFixed(1)}%</span>{' '}
          of its tree cover.
        </p>
        {data.rank && data.totalRegions && (
          <p className="text-sm text-gray-600 mt-1">
            Ranking: {data.rank} / {data.totalRegions} (most impacted regions)
          </p>
        )}
      </div>

      {/* Eco Tips */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">Eco Tips</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {ecoTips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        Thanks for exploring 🌱
      </div>
    </Wrapper>
  );
};

export default InsightsPanel;
