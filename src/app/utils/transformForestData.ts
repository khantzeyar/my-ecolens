// src/app/utils/transformForestData.ts
import rawData from "../data/peninsular_tree_cover_loss.json"; // ✅ 改成西马数据源

// Raw data record type
export interface RawForestRecord {
  subnational1?: string;
  subnational2?: string;
  extent_2000_ha?: number;
  area_ha?: number;
  [key: `tc_loss_ha_${number}`]: number | undefined; // yearly loss fields
}

// Converted format
export interface TransformedForestData {
  yearly_loss: Record<string, number>;
  cumulative_loss_percent: number;
  rank?: number;
  totalRegions?: number;
}

// ✅ Aggregate by state (for Camping page)
export function transformForestDataByState(): Record<string, TransformedForestData> {
  const grouped: Record<string, { yearly_loss: Record<string, number>; extent: number }> = {};

  (rawData as RawForestRecord[]).forEach((item) => {
    const state = item.subnational1;
    if (!state) return;

    if (!grouped[state]) {
      grouped[state] = { yearly_loss: {}, extent: 0 };
    }

    // yearly loss
    Object.keys(item).forEach((key) => {
      if (key.startsWith("tc_loss_ha_")) {
        const year = key.replace("tc_loss_ha_", "");
        const value = item[key as keyof RawForestRecord];
        grouped[state].yearly_loss[year] =
          (grouped[state].yearly_loss[year] || 0) +
          (typeof value === "number" ? value : 0);
      }
    });

    // 累计 extent（注意要加总）
    grouped[state].extent += item.extent_2000_ha ?? item.area_ha ?? 0;
  });

  // 生成最终结果
  const finalGrouped: Record<string, TransformedForestData> = {};
  Object.entries(grouped).forEach(([state, data]) => {
    const totalLoss = Object.values(data.yearly_loss).reduce((a, b) => a + b, 0);
    const percent = data.extent > 0 ? (totalLoss / data.extent) * 100 : 0;

    finalGrouped[state] = {
      yearly_loss: data.yearly_loss,
      cumulative_loss_percent: percent,
    };
  });

  // ranking
  const states = Object.entries(finalGrouped).map(([name, data]) => ({
    name,
    loss: data.cumulative_loss_percent,
  }));

  states.sort((a, b) => b.loss - a.loss);
  const totalRegions = states.length;

  states.forEach((item, index) => {
    finalGrouped[item.name].rank = index + 1;
    finalGrouped[item.name].totalRegions = totalRegions;
  });

  return finalGrouped;
}

// ✅ Aggregate by district (for Forest page)
export function transformForestDataByDistrict(): Record<string, TransformedForestData> {
  const grouped: Record<string, TransformedForestData> = {};

  (rawData as RawForestRecord[]).forEach((item) => {
    const district = item.subnational2 || item.subnational1;
    if (!district) return;

    const yearly_loss: Record<string, number> = {};
    Object.keys(item).forEach((key) => {
      if (key.startsWith("tc_loss_ha_")) {
        const year = key.replace("tc_loss_ha_", "");
        const value = item[key as keyof RawForestRecord];
        yearly_loss[year] = typeof value === "number" ? value : 0;
      }
    });

    const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
    const base = item.extent_2000_ha ?? item.area_ha ?? 1;
    const cumulative = (totalLoss / base) * 100;

    grouped[district] = { yearly_loss, cumulative_loss_percent: cumulative };
  });

  // ranking
  const districts = Object.entries(grouped).map(([name, data]) => ({
    name,
    loss: data.cumulative_loss_percent,
  }));

  districts.sort((a, b) => b.loss - a.loss);
  const totalRegions = districts.length;

  districts.forEach((item, index) => {
    grouped[item.name].rank = index + 1;
    grouped[item.name].totalRegions = totalRegions;
  });

  return grouped;
}
