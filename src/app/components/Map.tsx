'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import "remixicon/fonts/remixicon.css"
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { transformForestDataByState } from '../utils/transformForestData'

// ✅ 转换好的州级森林数据
const forestData = transformForestDataByState()

// Default icon
const defaultIcon = L.icon({
  iconUrl: '/icons/site-icon.svg',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// Highlighted icon
const highlightedIcon = L.icon({
  iconUrl: '/icons/site-icon-highlight.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

type CampSite = {
  id: number
  type: string
  name: string
  latitude: number
  longitude: number
  state: string
  fees?: string
  tags?: string
  price?: string
  attractions?: string[]
}

interface MapProps {
  selectedStates: string[]
  searchTerm: string
  priceFilter: string
  selectedAttractions: string[]
  // Epic-3 新增属性
  singleCampMode?: boolean
  centerLat?: number
  centerLng?: number
  defaultZoom?: number
  focusOnSingleLocation?: boolean
  enableInteraction?: boolean
  allowPageScroll?: boolean
}

const Map: React.FC<MapProps> = ({
  selectedStates,
  searchTerm,
  priceFilter,
  selectedAttractions,
  singleCampMode = false,
  centerLat,
  centerLng,
  defaultZoom = 7,
  focusOnSingleLocation = false,
  enableInteraction = false,
  allowPageScroll = false
}) => {
  const [sites, setSites] = useState<CampSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastClickedId, setLastClickedId] = useState<number | null>(null)

  // Restore last clicked marker
  useEffect(() => {
    const savedId = localStorage.getItem('lastClickedId')
    if (savedId) {
      setLastClickedId(Number(savedId))
    }
  }, [])

  // Fetch campsites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/campsites')
        if (!res.ok) throw new Error('Failed to fetch campsites')
        const data: CampSite[] = await res.json()

        const processed: CampSite[] = data.map((site) => {
          let price: string = 'paid'
          if (site.fees) {
            if (/RM\s?0/i.test(site.fees) || /FREE/i.test(site.fees)) {
              price = 'free'
            }
          }
          return {
            ...site,
            price,
            attractions: site.tags ? site.tags.split(',').map((t) => t.trim()) : []
          }
        })

        setSites(processed)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSites()
  }, [])

  // Apply filters
  const displayedSites = sites.filter((site) => {
    const matchState =
      selectedStates.length === 0 || selectedStates.includes(site.state)
    const matchSearch =
      searchTerm.trim() === '' ||
      site.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPrice = priceFilter === 'all' || site.price === priceFilter
    const matchAttractions =
      selectedAttractions.length === 0 ||
      (site.attractions &&
        selectedAttractions.every((attr) =>
          site.attractions?.includes(attr)
        ))

    return matchState && matchSearch && matchPrice && matchAttractions
  })

  // Function to get loss summary bar color + label
  const getLossInfo = (percent: number) => {
    if (percent < 20) return { color: 'bg-green-500', label: 'Low' }
    if (percent < 40) return { color: 'bg-yellow-400', label: 'Medium' }
    if (percent < 60) return { color: 'bg-orange-500', label: 'High' }
    return { color: 'bg-red-600', label: 'Critical' }
  }

  // Map center and zoom
  const mapCenter: [number, number] = (centerLat && centerLng)
    ? [centerLat, centerLng]
    : [3.139, 101.6869]

  const mapZoom = defaultZoom

  // Map interaction settings
  const mapSettings = {
    zoomControl: false,
    dragging: enableInteraction || !singleCampMode,
    doubleClickZoom: enableInteraction || !singleCampMode,
    scrollWheelZoom: allowPageScroll ? false : (enableInteraction || !singleCampMode),
    boxZoom: enableInteraction || !singleCampMode,
    keyboard: enableInteraction || !singleCampMode,
  }

  return (
    <div className="h-[600px] w-full relative">
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
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-md"
        {...mapSettings}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {displayedSites.map((site) => {
          const stateLoss = forestData[site.state]?.cumulative_loss_percent || 0
          const { color, label } = getLossInfo(stateLoss)

          // 判断是否高亮
          const isHighlighted = singleCampMode
            ? site.name.toLowerCase().includes(searchTerm.toLowerCase())
            : site.id === lastClickedId

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={isHighlighted ? highlightedIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (!singleCampMode) {
                    setLastClickedId(site.id)
                    localStorage.setItem('lastClickedId', String(site.id))
                  }
                }
              }}
            >
              <Popup>
                <div className="font-bold text-green-700">{site.name}</div>
                <div className="text-xs text-gray-600">State: {site.state}</div>
                <div className="text-xs text-gray-500 mt-1">Type: {site.type}</div>
                {site.price && (
                  <div className="text-xs text-gray-500">
                    Price: {site.price === 'free' ? 'Free' : 'Paid'}
                  </div>
                )}
                {site.attractions && site.attractions.length > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    Attractions: {site.attractions.join(', ')}
                  </div>
                )}

                {/* Quick forest loss summary bar */}
                <div className="w-full bg-gray-200 rounded h-2 mb-1">
                  <div
                    className={`${color} h-2 rounded`}
                    style={{ width: `${Math.min(stateLoss, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Forest loss: {label} ({stateLoss.toFixed(1)}%)
                </div>

                {/* Buttons row */}
                <div className="flex space-x-2 mt-2">
                  <Link
                    href={`/insights/${site.state}`}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                  >
                    Forest Insights →
                  </Link>
                  <Link
                    href={`/camp/${site.id}`}
                    onClick={() => {
                      if (!singleCampMode) {
                        setLastClickedId(site.id)
                        localStorage.setItem('lastClickedId', String(site.id))
                      }
                    }}
                    className="px-3 py-1 text-xs text-green-700 bg-blue-300 rounded-lg shadow hover:bg-blue-400"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  )
}

export default Map
