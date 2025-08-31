/** 
 * This is the map for our website.
 * - It will display the location of forest based camp sites in Malaysia.
 * - The user can use the state filters to choose which sites are shown on the map.
 * - By clicking a site marker, the user can view that site's information.
*/

'use client'

import React, { useState, useEffect } from 'react'
import "remixicon/fonts/remixicon.css";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet';

// Custom site icon
const siteIcon = L.icon({
  iconUrl: '/icons/site-icon.svg',
  iconSize: [80, 80], 
  iconAnchor: [20, 40],
  popupAnchor: [20, -40],
});

const STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Selangor", "Terengganu"
];

type CampSite = {
  id: number;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
};

const Map = () => {
  const [search, setSearch] = useState("");
  const filteredStates = STATES.filter(state => state.toLowerCase().includes(search.toLowerCase()));

  // Campsite data state
  const [sites, setSites] = useState<CampSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State filter logic
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  // Handle checkbox toggle
  const handleCheckboxChange = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  // Handle reset
  const handleReset = () => {
    setSelectedStates([]);
    setSearch("");
  };

  // Filter sites by selected states
  const displayedSites = selectedStates.length === 0
    ? sites
    : sites.filter(site => selectedStates.includes(site.state));

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/campsites');
        if (!res.ok) throw new Error('Failed to fetch campsites');
        const data = await res.json();
        setSites(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="h-[700px] w-full relative">
      {/* Sidebar filter UI */}
      <div className="absolute top-8 left-4 z-10 border border-gray-300
       bg-white bg-opacity-90 rounded-lg shadow-lg p-4 w-64 max-h-[90%] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <i className="ri-filter-3-line text-green-600 text-xl"></i>
            Filter
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 p-1 rounded cursor-pointer"
            title="Reset filters"
            onClick={handleReset}
          >
            <i className="ri-refresh-line"></i>
            &nbsp; Reset
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search state..."
          className="mb-2 px-2 py-2 border border-gray-300 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <form className="flex flex-col gap-2">
          {filteredStates.map((state) => (
            <label key={state} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-green-600"
                checked={selectedStates.includes(state)}
                onChange={() => handleCheckboxChange(state)}
              />
              <span>{state}</span>
            </label>
          ))}
        </form>
      </div>

      {/* Map with dynamic markers from DB */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
          <span className="text-gray-600 text-lg">Loading campsites...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
          <span className="text-red-600 text-lg">{error}</span>
        </div>
      )}
      <MapContainer 
        center={[3.139, 101.6869]} // KL
        zoom={7} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-lg shadow-md"
        zoomControl={false}
      >
        {/* OpenStreetMap tile */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Dynamic markers from DB, filtered by state */}
        {displayedSites.map(site => (
          <Marker key={site.id} position={[site.latitude, site.longitude]} icon={siteIcon}>
            <Popup>
              <div className="font-bold text-green-700">{site.name}</div>
              <div className="text-xs text-gray-600">State: {site.state}</div>
              <div className="text-xs text-gray-500 mt-1">Type: {site.type}</div>
            </Popup>
          </Marker>
        ))}
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  )
}

export default Map
