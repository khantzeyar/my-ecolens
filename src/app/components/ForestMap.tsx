'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';
import malaysiaGeoJsonRaw from '../data/peninsular-map.json';
import { stateNameMap, districtNameMap } from '../utils/nameMap';

import forestData from '../data/peninsular_tree_cover_loss.json';
import statePredictions from '../data/state_tree_loss_predictions.json';
import districtPredictions from '../data/district_tree_loss_predictions.json';

import type { RawForestRecord, TransformedForestData } from '../utils/transformForestData';

const malaysiaGeoJson = malaysiaGeoJsonRaw as FeatureCollection<Geometry, GeoJsonProperties>;

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then((mod) => mod.GeoJSON), { ssr: false });

// ✅ 定义预测数据类型
interface StatePrediction {
  state: string;
  year: number;
  tc_loss_pred: number;
}

interface DistrictPrediction {
  district: string;
  year: number;
  tc_loss_pred: number;
}

// normalize names
function getDistrictKey(rawName: string): string {
  if (districtNameMap[rawName]) return districtNameMap[rawName];
  if (stateNameMap[rawName]) return stateNameMap[rawName];
  return rawName.trim();
}

// compute ranks
function computeAllRanks() {
  const ranking: { name: string; percent: number }[] = (forestData as RawForestRecord[]).map((record) => {
    const yearly_loss: Record<string, number> = {};
    for (let year = 2001; year <= 2024; year++) {
      yearly_loss[String(year)] = record[`tc_loss_ha_${year}`] ?? 0;
    }
    const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
    const baseExtent = record.extent_2000_ha || 1;
    const percent = (totalLoss / baseExtent) * 100;
    return {
      name: record.subnational2 || record.subnational1 || 'Unknown',
      percent,
    };
  });

  ranking.sort((a, b) => b.percent - a.percent);
  return ranking;
}

const allRanks = computeAllRanks();

// transform record
function transformRecord(record: RawForestRecord): TransformedForestData & { name: string } {
  const yearly_loss: Record<string, number> = {};
  for (let year = 2001; year <= 2024; year++) {
    yearly_loss[String(year)] = record[`tc_loss_ha_${year}`] ?? 0;
  }

  const name = record.subnational2 || record.subnational1 || 'Unknown';

  for (let year = 2025; year <= 2030; year++) {
    const districtPred = (districtPredictions as DistrictPrediction[]).find((d) => d.district === name && d.year === year);
    if (districtPred) {
      yearly_loss[String(year)] = districtPred.tc_loss_pred ?? 0;
      continue;
    }
    const statePred = (statePredictions as StatePrediction[]).find((d) => d.state === name && d.year === year);
    if (statePred) {
      yearly_loss[String(year)] = statePred.tc_loss_pred ?? 0;
    }
  }

  const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
  const baseExtent = record.extent_2000_ha || 1;
  const cumulative_loss_percent = (totalLoss / baseExtent) * 100;

  const rankIndex = allRanks.findIndex((d) => d.name === name);
  const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;

  return {
    name,
    yearly_loss,
    cumulative_loss_percent,
    rank,
    totalRegions: allRanks.length,
  };
}

// get map value
function getLossValue(districtKey: string, year: number) {
  if (year <= 2024) {
    const record = (forestData as RawForestRecord[]).find(
      (d) => d.subnational1 === districtKey || d.subnational2 === districtKey
    );
    return record ? record[`tc_loss_ha_${year}`] ?? 0 : 0;
  }
  if (year >= 2025) {
    const districtPred = (districtPredictions as DistrictPrediction[]).find((d) => d.district === districtKey && d.year === year);
    if (districtPred) return districtPred.tc_loss_pred ?? 0;

    const statePred = (statePredictions as StatePrediction[]).find((d) => d.state === districtKey && d.year === year);
    if (statePred) return statePred.tc_loss_pred ?? 0;
  }
  return 0;
}

interface ForestMapProps {
  year: number;
}

export default function ForestMap({ year }: ForestMapProps) {
  // ✅ 颜色对比增强版（更美观）
  const getColor = (value: number) => {
    return value > 10000
      ? '#4B006E'
      : value > 5000
      ? '#800026'
      : value > 2000
      ? '#BD0026'
      : value > 1000
      ? '#E31A1C'
      : value > 500
      ? '#FC4E2A'
      : value > 100
      ? '#FD8D3C'
      : '#FFFFB2';
  };

  // style
  const style = useCallback(
    (feature?: Feature<Geometry, GeoJsonProperties>): L.PathOptions => {
      if (!feature) {
        return { fillColor: '#ccc', weight: 0.5, opacity: 1, color: 'white', fillOpacity: 0.5 };
      }
      const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
      const districtKey = getDistrictKey(rawName);
      const value = getLossValue(districtKey, year);

      return { fillColor: getColor(value), weight: 1, opacity: 1, color: 'white', fillOpacity: 0.8 };
    },
    [year]
  );

  // interaction (hover tooltip 显示排名和损失率)
  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
    const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
    const districtKey = getDistrictKey(rawName);
    const value = getLossValue(districtKey, year);

    const record = (forestData as RawForestRecord[]).find(
      (d) => d.subnational1 === districtKey || d.subnational2 === districtKey
    );

    let extraInfo = '';
    if (record) {
      const data = transformRecord(record);
      extraInfo = `<br/>Loss Rate: ${data.cumulative_loss_percent.toFixed(1)}%<br/>Rank: ${data.rank} / ${data.totalRegions}`;
    }

    const infoText = `<b>${rawName}</b><br/>Year: ${year}<br/>Forest Loss: ${value.toLocaleString()} ha${extraInfo}`;

    if ('bindTooltip' in layer) {
      (layer as L.Layer & { bindTooltip: (s: string, o?: L.TooltipOptions) => void }).bindTooltip(infoText, {
        sticky: true,
        direction: 'top',
        className: 'info-tooltip',
        opacity: 0.95,
      });
    }

    if ('getElement' in layer) {
      const el = (layer as L.Path).getElement() as HTMLElement | null;
      if (el) el.style.cursor = 'pointer';
    }
  };

  const malaysiaBounds = L.geoJSON(malaysiaGeoJson).getBounds();

  return (
    <div className="relative">
      {/* legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md text-xs border border-gray-300">
        <div className="font-semibold mb-1">Forest Loss (ha)</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#4B006E]"></span> &gt; 10000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#800026]"></span> 5000–10000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#BD0026]"></span> 2000–5000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#E31A1C]"></span> 1000–2000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#FC4E2A]"></span> 500–1000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#FD8D3C]"></span> 100–500</div>
        <div className="flex items-center gap-2"><span className="w-4 h-3 bg-[#FFFFB2]"></span> &lt;= 100</div>
      </div>

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
        <GeoJSON key={year} data={malaysiaGeoJson} style={style} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}
