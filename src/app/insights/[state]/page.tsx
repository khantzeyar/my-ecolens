'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import forestRaw from '../../data/peninsular_forest_loss.json'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

// ✅ 给 forestData 添加强类型
type ForestLossData = {
  yearly_loss: Record<string, number>
  cumulative_loss_percent: number
}
const forestData: Record<string, ForestLossData> = forestRaw as Record<
  string,
  ForestLossData
>

// ✅ 格式化州名（首字母大写，其余小写）
const formatStateName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()

export default function InsightsPage() {
  const { state } = useParams() as { state: string }
  const stateKey = state.replace(/\s+/g, '') // 兼容 URL 中有空格的情况
  const data = forestData[stateKey]

  if (!data) {
    return (
      <div className="p-6">
        No data available for {formatStateName(state)}
      </div>
    )
  }

  // ✅ 格式化年度趋势数据
  const trends = Object.entries(data.yearly_loss).map(([year, loss]) => ({
    year,
    loss,
  }))

  // ✅ 限制累计损失最大值不超过 100%
  const cumulativeLoss = Math.min(data.cumulative_loss_percent, 100)

  return (
    <div className="p-6 max-w-3xl mx-auto mt-20">
      {/* Back button */}
      <div className="mb-4 flex gap-2">
        <Link
          href="/camp"
          className="inline-block px-3 py-1 text-sm bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          ← Back to Camping Map
        </Link>
        <Link
          href="/forest"
          className="inline-block px-3 py-1 text-sm bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
        >
          ← Back to Forest Map
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-green-700 mb-4">
        🌳 Forest Insights: {formatStateName(state)}
      </h1>

      {/* Summary */}
      <p className="mb-6 text-gray-700">
        Since 2001, {formatStateName(state)} has lost{' '}
        <span className="font-bold text-red-600">
          {cumulativeLoss.toFixed(1)}%
        </span>{' '}
        of its tree cover.
      </p>

      {/* Annual Loss Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">📊 Annual Forest Loss</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{
                value: 'ha',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip formatter={(v: number) => v.toLocaleString() + ' ha'} />
            <Bar dataKey="loss" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Eco Tips Section */}
      <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
        <h3 className="font-semibold text-green-700 mb-2">🌱 Eco Tips</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Choose eco-certified campsites to minimize impact.</li>
          <li>Reduce campfire use and avoid cutting trees.</li>
          <li>Respect local biodiversity and avoid littering.</li>
          <li>Share awareness about forest conservation.</li>
        </ul>
      </div>
    </div>
  )
}
