'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface InsightsPanelProps {
  isOpen: boolean
  data: {
    yearly_loss: Record<string, number>
    cumulative_loss_percent: number
  } | null
  onClose: () => void
  onToggleHeatmap?: (enabled: boolean) => void
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  isOpen,
  data,
  onClose,
  onToggleHeatmap
}) => {
  const [heatmapEnabled, setHeatmapEnabled] = React.useState(false)

  if (!isOpen || !data) return null

  const trends = Object.entries(data.yearly_loss).map(([year, loss]) => ({
    year,
    loss
  }))

  const maxLoss = Math.max(...trends.map((d) => d.loss))
  const maxYear = trends.find((d) => d.loss === maxLoss)?.year

  const handleToggle = () => {
    const newValue = !heatmapEnabled
    setHeatmapEnabled(newValue)
    if (onToggleHeatmap) {
      onToggleHeatmap(newValue)
    }
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed bottom-0 left-0 w-full bg-white shadow-xl rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto"
    >
      {/* Drag handle */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-green-700">🌳 Forest Insights</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✖
        </button>
      </div>

      {/* Annual Forest Loss */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3">📊 Annual Forest Loss</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <XAxis dataKey="year" interval={3} />
              <YAxis />
              <Tooltip
                formatter={(
                  value: ValueType,
                  _name: NameType,
                  props?: unknown
                ) => {
                  const payload = (props as { payload?: { year?: string } })
                    ?.payload
                  return [
                    `${Number(value).toLocaleString()} ha lost`,
                    payload?.year ? `Year ${payload.year}` : ''
                  ]
                }}
              />
              <Bar
                dataKey="loss"
                fill="#82ca9d"
                // ✅ 用 unknown，内部再断言
                shape={(props: unknown) => {
                  const {
                    x = 0,
                    y = 0,
                    width = 0,
                    height = 0,
                    value = 0
                  } = props as {
                    x?: number
                    y?: number
                    width?: number
                    height?: number
                    value?: number
                  }
                  const color = value === maxLoss ? '#e74c3c' : '#82ca9d'
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                      rx={3}
                      ry={3}
                    />
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {maxYear &&
            `🌍 Peak loss in ${maxYear}: ${maxLoss.toLocaleString()} ha`}
        </p>
      </div>

      {/* Cumulative Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">📖 Cumulative Summary</h3>
        <p className="text-gray-700 leading-relaxed">
          Since 2001, this state has lost{' '}
          <span className="font-bold text-red-600">
            {data.cumulative_loss_percent}%
          </span>{' '}
          of its tree cover. 🌍🔥🌳
        </p>
      </div>

      {/* Eco Tip */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">💡 Eco Tip</h3>
        <p className="text-sm text-gray-700">
          Bring reusable bottles when camping to reduce plastic waste.
        </p>
      </div>

      {/* Heatmap Toggle */}
      <div className="p-4 bg-yellow-50 rounded-lg shadow-sm mb-6">
        <h3 className="text-md font-semibold mb-2">🔥 Heatmap</h3>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded text-sm font-medium ${
            heatmapEnabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {heatmapEnabled ? 'Disable Heatmap' : 'Enable Heatmap'}
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        Thanks for exploring 🌱
      </div>
    </motion.div>
  )
}

export default InsightsPanel
