'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface InsightsPanelProps {
  isOpen: boolean
  data: {
    yearly_loss?: Record<string, number>
    cumulative_loss_percent?: number
    rank?: number
    totalStates?: number
  } | null
  onClose: () => void
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  isOpen,
  data,
  onClose
}) => {
  if (!isOpen || !data) return null

  // Annual data
  const trends = data.yearly_loss
    ? Object.entries(data.yearly_loss).map(([year, loss]) => ({
        year,
        loss
      }))
    : []

  const maxLoss = trends.length > 0 ? Math.max(...trends.map((d) => d.loss)) : 0
  const maxYear = trends.find((d) => d.loss === maxLoss)?.year

  // Dynamic Eco Tips
  const percent = data.cumulative_loss_percent ?? 0
  let ecoTips: string[] = []

  if (percent < 10) {
    ecoTips = [
      "Keep up the good work! Choose eco-friendly campsites.",
      "Bring reusable bottles to reduce plastic waste.",
      "Respect local wildlife and avoid disturbing habitats."
    ]
  } else if (percent < 30) {
    ecoTips = [
      "Plant a tree after your trip to offset impact.",
      "Avoid campfires in sensitive areas to protect forests.",
      "Use biodegradable soap and cleaning products."
    ]
  } else {
    ecoTips = [
      "Support local reforestation projects financially or as a volunteer.",
      "Spread awareness about forest protection among your peers.",
      "Choose public transport or carpool when visiting forests to cut emissions."
    ]
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
        <h2 className="text-xl font-bold text-green-700">Forest Insights</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✖
        </button>
      </div>

      {/* Annual Forest Loss */}
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
                  formatter={(value: ValueType, _name: NameType, props?: unknown) => {
                    const payload = (props as { payload?: { year?: string } })?.payload
                    return [
                      `${Number(value).toLocaleString()} ha`,
                      payload?.year ? `Year ${payload.year}` : ''
                    ]
                  }}
                />
                <Bar
                  dataKey="loss"
                  fill="#82ca9d"
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
          ) : (
            <p className="text-sm text-gray-500">No annual data available.</p>
          )}
        </div>
        {maxYear && (
          <p className="text-xs text-gray-500 mt-2">
            Peak loss in {maxYear}: {maxLoss.toLocaleString()} ha
          </p>
        )}
      </div>

      {/* Cumulative Summary + Ranking */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">Cumulative Summary</h3>
        <p className="text-gray-700 leading-relaxed">
          Since 2001, this state has lost{' '}
          <span className="font-bold text-red-600">
            {percent.toFixed(1)}%
          </span>{' '}
          of its tree cover.
        </p>
        {data.rank && data.totalStates && (
          <p className="text-sm text-gray-600 mt-1">
            Ranking: {data.rank} / {data.totalStates} (most impacted states)
          </p>
        )}
      </div>

      {/* Dynamic Eco Tips */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-2">Eco Tips</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {ecoTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        Thanks for exploring
      </div>
    </motion.div>
  )
}

export default InsightsPanel
