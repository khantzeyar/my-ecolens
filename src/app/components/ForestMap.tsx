'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import malaysiaGeoJson from '../data/malaysia-map.json';
import { stateNameMap, districtNameMap } from '../utils/nameMap';
import forestData from '../data/tree_cover_loss.json';
import InsightsPanel from './InsightsPanel';

// ✅ 动态导入 react-leaflet，关闭 SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

// ✅ 获取统一的 key
function getDistrictKey(rawName: string) {
  const mappedDistrict = Object.entries(districtNameMap).find(
    ([treeKey, geoName]) => geoName === rawName
  )?.[0];
  if (mappedDistrict) return mappedDistrict;

  const mappedState = Object.entries(stateNameMap).find(
    ([treeKey, geoName]) => geoName === rawName
  )?.[0];
  if (mappedState) return mappedState;

  return rawName.replace(/\s+/g, '');
}

// ✅ 提前计算所有地区的累计损失百分比，用于排名
function computeAllRanks() {
  const ranking: { name: string; percent: number }[] = forestData.map((record: any) => {
    const yearly_loss: Record<string, number> = {};
    for (let year = 2001; year <= 2024; year++) {
      yearly_loss[String(year)] = record[`tc_loss_ha_${year}`] || 0;
    }
    const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
    const baseExtent = record['extent_2000_ha'] || 1;
    const percent = (totalLoss / baseExtent) * 100;
    return {
      name: record.subnational2 || record.subnational1,
      percent,
    };
  });

  ranking.sort((a, b) => b.percent - a.percent);
  return ranking;
}

const allRanks = computeAllRanks();

// ✅ 转换 record 为 InsightsPanel 格式
function transformRecord(record: any) {
  const yearly_loss: Record<string, number> = {};
  for (let year = 2001; year <= 2024; year++) {
    yearly_loss[String(year)] = record[`tc_loss_ha_${year}`] || 0;
  }

  const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
  const baseExtent = record['extent_2000_ha'] || 1;
  const cumulative_loss_percent = (totalLoss / baseExtent) * 100;

  const name = record.subnational2 || record.subnational1;
  const rankIndex = allRanks.findIndex((d) => d.name === name);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  return {
    name,
    yearly_loss,
    cumulative_loss_percent,
    rank,
    totalStates: allRanks.length,
  };
}

// ✅ 故事模式解说文本
const storyMap: Record<number, string> = {
  2001: "📌 In 2001, forest cover was still relatively stable.",
  2006: "⚠️ By 2006, early signs of deforestation became visible.",
  2011: "🌳 In 2011, deforestation accelerated in Sabah & Sarawak.",
  2016: "🔥 2016 saw major forest fires contributing to loss.",
  2021: "🌏 By 2021, cumulative forest loss reached critical levels.",
};

// ✅ 动物彩蛋
const animalMap: Record<string, string> = {
  "Pahang": "🐯 Malayan Tiger lives here!",
  "Sabah": "🦜 Home to the Bornean Hornbill.",
  "Sarawak": "🐒 Proboscis monkeys are found here.",
  "Johor": "🦊 Habitat of the Malayan Tapir."
};

interface ForestMapProps {
  year: number;         // ✅ 外部传入 year
  storyMode?: boolean;  // ✅ 从 ForestPage 传入的 storyMode
}

export default function ForestMap({ year, storyMode = false }: ForestMapProps) {
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);

  // 故事模式文本
  const [storyText, setStoryText] = useState("");

  // 获取某区/县某年的 forest loss
  const getLossValue = (districtKey: string, year: number) => {
    const record = forestData.find(
      (d: any) =>
        d.subnational1 === districtKey || d.subnational2 === districtKey
    );
    if (!record) return 0;
    return record[`tc_loss_ha_${year}`] || 0;
  };

  // 颜色映射
  const getColor = (value: number) => {
    return value > 5000
      ? '#800026'
      : value > 2000
      ? '#BD0026'
      : value > 1000
      ? '#E31A1C'
      : value > 500
      ? '#FC4E2A'
      : value > 100
      ? '#FD8D3C'
      : '#FEB24C';
  };

  // 样式
  const style = useCallback(
    (feature: any) => {
      const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1;
      const districtKey = getDistrictKey(rawName);
      const value = getLossValue(districtKey, year);

      return {
        fillColor: getColor(value),
        weight: 0.8,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
      };
    },
    [year]
  );

  // popup + 点击事件 → 打开 InsightsPanel
  const onEachFeature = (feature: any, layer: any) => {
    const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1;
    const districtKey = getDistrictKey(rawName);
    const value = getLossValue(districtKey, year);

    let popupText = `<b>${rawName}</b><br/>Year: ${year}<br/>Forest Loss: ${value} ha`;

    // ✅ 如果有动物信息，加进去
    if (animalMap[rawName]) {
      popupText += `<br/><span style="color:green;font-weight:bold">${animalMap[rawName]}</span>`;
    }

    layer.bindPopup(popupText + "<br/><i>Click for details</i>");

    layer.on('click', () => {
      const record = forestData.find(
        (d: any) =>
          d.subnational1 === districtKey || d.subnational2 === districtKey
      );
      if (record) {
        setSelectedData(transformRecord(record));
        setPanelOpen(true);
      }
    });
  };

  // ✅ 故事模式自动播放
  useEffect(() => {
    if (!storyMode) {
      setStoryText("");
      return;
    }
    let step = 2001;
    const timer = setInterval(() => {
      if (storyMap[step]) {
        setStoryText(storyMap[step]);
      }
      step += 5;
      if (step > 2024) {
        clearInterval(timer);
        setStoryText("");
      }
    }, 2000); // 每 2 秒更新
    return () => clearInterval(timer);
  }, [storyMode]);

  // ✅ 计算马来西亚边界
  const malaysiaBounds = L.geoJSON(malaysiaGeoJson as any).getBounds();

  return (
    <div className="relative">
      {/* 故事模式文本框 */}
      {storyMode && storyText && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md w-64 text-sm border border-gray-300">
          {storyText}
        </div>
      )}

      {/* 图例 (Legend) */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 p-3 rounded-lg shadow-md text-sm border border-gray-200">
        <h4 className="font-semibold mb-1">Forest Loss (ha)</h4>
        <div className="flex flex-col gap-1">
          <div><span style={{ background: '#800026', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> &gt; 5000</div>
          <div><span style={{ background: '#BD0026', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> 2001 – 5000</div>
          <div><span style={{ background: '#E31A1C', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> 1001 – 2000</div>
          <div><span style={{ background: '#FC4E2A', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> 501 – 1000</div>
          <div><span style={{ background: '#FD8D3C', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> 101 – 500</div>
          <div><span style={{ background: '#FEB24C', display: 'inline-block', width: 20, height: 10, borderRadius: 2 }}></span> 0 – 100</div>
        </div>
      </div>

      {/* 地图 */}
      <MapContainer
        bounds={malaysiaBounds}
        maxBounds={malaysiaBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '70vh', width: '100%', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />
        <GeoJSON
          key={year}
          data={malaysiaGeoJson as any}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Insights Panel */}
      <InsightsPanel
        isOpen={panelOpen}
        data={selectedData}
        onClose={() => setPanelOpen(false)}
        onToggleHeatmap={setHeatmapEnabled}
      />
    </div>
  );
}
