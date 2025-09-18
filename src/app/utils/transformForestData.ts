// src/app/utils/transformForestData.ts
import rawData from '../data/tree_cover_loss.json'

// 定义转换后的格式
export interface TransformedForestData {
  yearly_loss: Record<string, number>
  cumulative_loss_percent: number
  rank?: number
  totalRegions?: number
}

// 按州聚合 (Camping 页用)
export function transformForestDataByState(): Record<string, TransformedForestData> {
  const grouped: Record<string, TransformedForestData> = {}

  ;(rawData as any[]).forEach((item) => {
    const state = item.subnational1
    if (!state) return

    if (!grouped[state]) {
      grouped[state] = { yearly_loss: {}, cumulative_loss_percent: 0 }
    }

    // 每年的损失
    Object.keys(item).forEach((key) => {
      if (key.startsWith('tc_loss_ha_')) {
        const year = key.replace('tc_loss_ha_', '')
        grouped[state].yearly_loss[year] =
          (grouped[state].yearly_loss[year] || 0) + (item[key] || 0)
      }
    })

    // 计算累计损失百分比
    const totalLoss = Object.values(grouped[state].yearly_loss).reduce(
      (a, b) => a + b,
      0
    )
    const base = item.extent_2000_ha || item.area_ha || 1
    grouped[state].cumulative_loss_percent = (totalLoss / base) * 100
  })

  // ✅ 给州加排名
  const states = Object.entries(grouped).map(([name, data]) => ({
    name,
    loss: data.cumulative_loss_percent,
  }))

  states.sort((a, b) => b.loss - a.loss)
  const totalRegions = states.length

  states.forEach((item, index) => {
    grouped[item.name].rank = index + 1
    grouped[item.name].totalRegions = totalRegions
  })

  return grouped
}

// 按区/县级转换 (Forest 页用)
export function transformForestDataByDistrict(): Record<string, TransformedForestData> {
  const grouped: Record<string, TransformedForestData> = {}

  ;(rawData as any[]).forEach((item) => {
    const district = item.subnational2 || item.subnational1
    if (!district) return

    const yearly_loss: Record<string, number> = {}
    Object.keys(item).forEach((key) => {
      if (key.startsWith('tc_loss_ha_')) {
        const year = key.replace('tc_loss_ha_', '')
        yearly_loss[year] = item[key] || 0
      }
    })

    const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0)
    const base = item.extent_2000_ha || item.area_ha || 1
    const cumulative = (totalLoss / base) * 100

    grouped[district] = { yearly_loss, cumulative_loss_percent: cumulative }
  })

  // ✅ 给区/县加排名
  const districts = Object.entries(grouped).map(([name, data]) => ({
    name,
    loss: data.cumulative_loss_percent,
  }))

  districts.sort((a, b) => b.loss - a.loss)
  const totalRegions = districts.length

  districts.forEach((item, index) => {
    grouped[item.name].rank = index + 1
    grouped[item.name].totalRegions = totalRegions
  })

  return grouped
}
