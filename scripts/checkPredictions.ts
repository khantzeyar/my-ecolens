import fs from "fs";

// 读取 district_tree_loss_predictions.json
const districtPredictions = JSON.parse(
  fs.readFileSync("src/app/data/district_tree_loss_predictions.json", "utf-8")
) as { district: string; state: string; year: number; tc_loss_pred: number }[];

// 聚合到州级
const stateYearLoss: Record<string, Record<number, number>> = {};

districtPredictions.forEach((d) => {
  if (d.year >= 2025 && d.year <= 2030) {
    if (!stateYearLoss[d.state]) stateYearLoss[d.state] = {};
    if (!stateYearLoss[d.state][d.year]) stateYearLoss[d.state][d.year] = 0;
    stateYearLoss[d.state][d.year] += d.tc_loss_pred;
  }
});

// 打印结果
Object.entries(stateYearLoss).forEach(([state, yearly]) => {
  console.log(`\n📍 ${state}`);
  for (let year = 2025; year <= 2030; year++) {
    console.log(`  ${year}: ${yearly[year] || 0}`);
  }
});
