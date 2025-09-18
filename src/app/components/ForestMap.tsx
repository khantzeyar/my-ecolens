'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';
import malaysiaGeoJsonRaw from '../data/peninsular-map.json';
import { stateNameMap, districtNameMap } from '../utils/nameMap';
import forestData from '../data/peninsular_tree_cover_loss.json'; // ✅ only Peninsular data
import InsightsPanel from './InsightsPanel';
import type { RawForestRecord, TransformedForestData } from '../utils/transformForestData';

const malaysiaGeoJson = malaysiaGeoJsonRaw as FeatureCollection<Geometry, GeoJsonProperties>;

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

// ✅ normalize names via nameMap
function getDistrictKey(rawName: string): string {
  if (districtNameMap[rawName]) return districtNameMap[rawName];
  if (stateNameMap[rawName]) return stateNameMap[rawName];
  return rawName.trim();
}

function computeAllRanks() {
  const ranking: { name: string; percent: number }[] = (forestData as RawForestRecord[]).map(
    (record) => {
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
    }
  );

  ranking.sort((a, b) => b.percent - a.percent);
  return ranking;
}

const allRanks = computeAllRanks();

function transformRecord(record: RawForestRecord): TransformedForestData & { name: string } {
  const yearly_loss: Record<string, number> = {};
  for (let year = 2001; year <= 2024; year++) {
    yearly_loss[String(year)] = record[`tc_loss_ha_${year}`] ?? 0;
  }

  const totalLoss = Object.values(yearly_loss).reduce((a, b) => a + b, 0);
  const baseExtent = record.extent_2000_ha || 1;
  const cumulative_loss_percent = (totalLoss / baseExtent) * 100;

  const name = record.subnational2 || record.subnational1 || 'Unknown';
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

const storyMap: Record<number, string> = {
  2001: 'In 2001, forest cover was still relatively stable.',
  2006: 'By 2006, early signs of deforestation became visible.',
  2011: 'In 2011, deforestation accelerated in some states.',
  2016: '2016 saw major forest fires contributing to loss.',
  2021: 'By 2021, cumulative forest loss reached critical levels.',
};

interface ForestMapProps {
  year: number;
  storyMode?: boolean;
}

export default function ForestMap({ year, storyMode = false }: ForestMapProps) {
  const [selectedData, setSelectedData] = useState<TransformedForestData & { name: string } | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [storyText, setStoryText] = useState('');

  const getLossValue = (districtKey: string, year: number) => {
    const record = (forestData as RawForestRecord[]).find(
      (d) => d.subnational1 === districtKey || d.subnational2 === districtKey
    );
    if (!record) return 0;
    return record[`tc_loss_ha_${year}`] ?? 0;
  };

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

  const style = useCallback(
    (feature?: Feature<Geometry, GeoJsonProperties>): L.PathOptions => {
      if (!feature) {
        return {
          fillColor: '#ccc',
          weight: 0.5,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.5,
        };
      }
      const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
      const districtKey = getDistrictKey(rawName);
      const value = getLossValue(districtKey, year);

      return {
        fillColor: getColor(value),
        weight: 0.8,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
        cursor: 'pointer',
      };
    },
    [year]
  );

  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: L.Layer) => {
    const rawName = feature.properties?.NAME_2 || feature.properties?.NAME_1 || 'Unknown';
    const districtKey = getDistrictKey(rawName);
    const value = getLossValue(districtKey, year);

    let infoText = `<b>${rawName}</b><br/>Year: ${year}<br/>Forest Loss: ${value} ha`;

    if ('bindTooltip' in layer) {
      (layer as L.Layer & { bindTooltip: (s: string, o?: any) => void }).bindTooltip(infoText, {
        sticky: true,
        direction: 'top',
        className: 'info-tooltip',
        opacity: 0.9,
      });
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

  useEffect(() => {
    if (!storyMode) {
      setStoryText('');
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
        setStoryText('');
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [storyMode]);

  const malaysiaBounds = L.geoJSON(malaysiaGeoJson).getBounds();

  return (
    <div className="relative">
      {storyMode && storyText && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md w-64 text-sm border border-gray-300">
          {storyText}
        </div>
      )}

      {/* legend */}
      <div className="absolute top-4 right-4 z-[999] bg-white/90 p-3 rounded-lg shadow-md text-sm border border-gray-200">
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
          data={malaysiaGeoJson}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <InsightsPanel isOpen={panelOpen} data={selectedData} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
