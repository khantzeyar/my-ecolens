'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';
import malaysiaGeoJsonRaw from '../data/peninsular-map.json';
import { stateNameMap, districtNameMap } from '../utils/nameMap';

import forestData from '../data/peninsular_tree_cover_loss.json';
import statePredictions from '../data/state_tree_loss_predictions.json';
import districtPredictions from '../data/district_tree_loss_predictions.json';

import InsightsPanel from './InsightsPanel';
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

// auto-generate story text dynamically
function getStoryText(year: number): string {
  const losses: { name: string; value: number }[] = [];

  (forestData as RawForestRecord[]).forEach((record) => {
    const name = record.subnational2 || record.subnational1 || 'Unknown';
    const value = getLossValue(name, year);
    losses.push({ name, value });
  });

  if (losses.length === 0) return '';

  losses.sort((a, b) => b.value - a.value);
  const top = losses[0];
  const bottom = losses[losses.length - 1];

  if (year <= 2024) {
    return `In ${year}, ${top.name} experienced the most forest loss (~${top.value} ha), while ${bottom.name} recorded the least.`;
  }
  if (year >= 2025 && year < 2030) {
    return `In ${year}, projections show severe loss in ${top.name} (~${top.value} ha), contrasting with relatively lower loss in ${bottom.name}.`;
  }
  if (year === 2030) {
    return `By 2030, forecast indicates ${top.name} remains the most impacted, while ${bottom.name} faces comparatively less deforestation pressure.`;
  }
  return '';
}

interface ForestMapProps {
  year: number;
  isPlaying?: boolean;
  storyMode?: boolean;
  onYearChange?: (year: number) => void;
  onStop?: () => void;
}

export default function ForestMap({
  year,
  isPlaying = false,
  storyMode = false,
  onYearChange,
  onStop,
}: ForestMapProps) {
  const [selectedData, setSelectedData] = useState<TransformedForestData & { name: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [storyText, setStoryText] = useState('');

  // ✅ 初始化默认区（Lipis）
  useEffect(() => {
    if (!selectedData) {
      const defaultRecord = (forestData as RawForestRecord[]).find(
        (d) => d.subnational2 === 'Lipis' || d.subnational1 === 'Lipis'
      );
      if (defaultRecord) {
        setSelectedData(transformRecord(defaultRecord));
        setPanelOpen(true);
      }
    }
  }, [selectedData]);

  // color scale
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

  // style
  const style = useCallback(
    (feature?: Feature<Geometry, GeoJsonProperties>): L.PathOptions => {
      if (!feature) {
        return { fillColor: '#ccc', weight: 0.5, opacity: 1, color: 'white', fillOpacity: 0.5 };
      }
      const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
      const districtKey = getDistrictKey(rawName);
      const value = getLossValue(districtKey, year);

      return { fillColor: getColor(value), weight: 0.8, opacity: 1, color: 'white', fillOpacity: 0.7 };
    },
    [year]
  );

  // interaction
  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
    const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
    const districtKey = getDistrictKey(rawName);
    const value = getLossValue(districtKey, year);

    const infoText = `<b>${rawName}</b><br/>Year: ${year}<br/>Forest Loss: ${value} ha`;

    if ('bindTooltip' in layer) {
      (layer as L.Layer & { bindTooltip: (s: string, o?: L.TooltipOptions) => void }).bindTooltip(infoText, {
        sticky: true,
        direction: 'top',
        className: 'info-tooltip',
        opacity: 0.9,
      });
    }

    if ('getElement' in layer) {
      const el = (layer as L.Path).getElement() as HTMLElement | null;
      if (el) el.style.cursor = 'pointer';
    }

    layer.on('click', () => {
      const record = (forestData as RawForestRecord[]).find(
        (d) => d.subnational1 === districtKey || d.subnational2 === districtKey
      );
      if (record) {
        setSelectedData(transformRecord(record));
        setPanelOpen(true);
      }
    });
  };

  // story + play effect
  useEffect(() => {
    if (!isPlaying) {
      if (storyMode) setStoryText(getStoryText(year));
      return;
    }
    let current = 2001;
    const timer = setInterval(() => {
      if (current > 2030) {
        clearInterval(timer);
        if (onStop) onStop();
        return;
      }
      if (onYearChange) onYearChange(current);
      setStoryText(getStoryText(current));
      current++;
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, storyMode, year, onYearChange, onStop]);

  const malaysiaBounds = L.geoJSON(malaysiaGeoJson).getBounds();

  return (
    <div className="relative">
      {/* story box */}
      {storyMode && storyText && (
        <div className="absolute top-4 left-20 z-[1000] bg-white p-3 rounded-lg shadow-md w-96 text-sm border border-gray-300">
          {storyText}
        </div>
      )}

      {/* legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md text-xs border border-gray-300">
        <div className="font-semibold mb-1">Forest Loss (ha)</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#800026]"></span> &gt; 5000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#BD0026]"></span> 2000–5000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#E31A1C]"></span> 1000–2000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#FC4E2A]"></span> 500–1000</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-3 bg-[#FD8D3C]"></span> 100–500</div>
        <div className="flex items-center gap-2"><span className="w-4 h-3 bg-[#FEB24C]"></span> &lt;= 100</div>
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

      {/* ✅ 默认 Lipis 会显示 */}
      <InsightsPanel isOpen={panelOpen} data={selectedData} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
