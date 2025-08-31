/** 
 * This is the map for our website.
 * - It will display the location of forest based camp sites in Malaysia.
 * - The user can use the state filters to choose which sites are shown on the map.
 * - By clicking a site marker, the user can view that site's information.
*/
'use client'

import React, { useState }  from 'react'
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
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"
];

const Map = () => {
  const [search, setSearch] = useState("");
  const filteredStates = STATES.filter(state => state.toLowerCase().includes(search.toLowerCase()));
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
              <input type="checkbox" className="accent-green-600" />
              <span>{state}</span>
            </label>
          ))}
        </form>
      </div>

      <MapContainer 
        center={[3.139, 101.6869]} // KL
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-lg shadow-md"
        zoomControl={false}
      >
        {/* OpenStreetMap tile */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Example marker with custom icon */}
        <Marker position={[3.139, 101.6869]} icon={siteIcon}>
          <Popup>
            Kuala Lumpur <br /> Capital of Malaysia.
          </Popup>
        </Marker>
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  )
}

export default Map
