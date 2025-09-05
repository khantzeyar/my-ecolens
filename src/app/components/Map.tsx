/**
 * This is the map for our website.
 * - It displays the location of forest-based camp sites in Malaysia.
 * - Filters: state, search term, price, attractions (all from CampPage).
 * - Clicking a site marker opens a detail page.
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import "remixicon/fonts/remixicon.css"
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

// ✅ Custom site icon (smaller size)
const siteIcon = L.icon({
  iconUrl: '/icons/site-icon.svg',
  iconSize: [28, 28],   // smaller icon for less overlap
  iconAnchor: [14, 28], // bottom-center
  popupAnchor: [0, -28],
})

type CampSite = {
  id: number
  type: string
  name: string
  latitude: number
  longitude: number
  state: string
  fees?: string        // raw string from DB
  tags?: string        // raw string from DB
  price?: string       // normalized "low" | "medium" | "high"
  attractions?: string[]
}

interface MapProps {
  selectedStates: string[]
  searchTerm: string
  priceFilter: string
  selectedAttractions: string[]
}

const Map: React.FC<MapProps> = ({ selectedStates, searchTerm, priceFilter, selectedAttractions }) => {
  const [sites, setSites] = useState<CampSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/campsites')
        if (!res.ok) throw new Error('Failed to fetch campsites')
        const data = await res.json()

        // 🔄 Normalize fees -> price, tags -> attractions[]
        const processed = data.map((site: CampSite) => {
          let price: string = "low"
          if (site.fees) {
            if (/RM\s?(20|[3-9]\d+)/i.test(site.fees)) {
              price = "high"
            } else if (/RM\s?(5|10|15)/i.test(site.fees)) {
              price = "medium"
            } else if (/RM\s?(0|1|2|3|4)/i.test(site.fees) || /FREE/i.test(site.fees)) {
              price = "low"
            }
          }

          return {
            ...site,
            price,
            attractions: site.tags ? site.tags.split(",").map((t) => t.trim()) : []
          }
        })

        setSites(processed)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchSites()
  }, [])

  // ✅ Apply filters: state + searchTerm + price + attractions
  const displayedSites = sites.filter((site) => {
    const matchState =
      selectedStates.length === 0 || selectedStates.includes(site.state)

    const matchSearch =
      searchTerm.trim() === "" ||
      site.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchPrice =
      priceFilter === "all" || site.price === priceFilter

    const matchAttractions =
      selectedAttractions.length === 0 ||
      (site.attractions &&
        selectedAttractions.every((attr) =>
          site.attractions?.includes(attr)
        ))

    return matchState && matchSearch && matchPrice && matchAttractions
  })

  return (
    <div className="h-[600px] w-full relative">
      {/* Loading and error overlays */}
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

      {/* Map */}
      <MapContainer
        center={[3.139, 101.6869]} // Kuala Lumpur
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg shadow-md"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Markers */}
        {displayedSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={siteIcon}
          >
            <Popup>
              <div className="font-bold text-green-700">{site.name}</div>
              <div className="text-xs text-gray-600">State: {site.state}</div>
              <div className="text-xs text-gray-500 mt-1">Type: {site.type}</div>
              {site.price && (
                <div className="text-xs text-gray-500">Price: {site.price}</div>
              )}
              {site.attractions && site.attractions.length > 0 && (
                <div className="text-xs text-gray-500">
                  Attractions: {site.attractions.join(", ")}
                </div>
              )}
              <Link
                href={`/camp/${site.id}`}
                className="text-blue-600 underline text-sm mt-2 block"
              >
                View details →
              </Link>
            </Popup>
          </Marker>
        ))}

        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  )
}

export default Map
