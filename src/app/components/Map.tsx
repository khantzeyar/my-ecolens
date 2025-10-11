'use client'

import React, { useState, useEffect, useRef } from 'react'
import 'remixicon/fonts/remixicon.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { transformForestDataByState } from '../utils/transformForestData'

const forestData = transformForestDataByState()

const defaultIcon = L.icon({
  iconUrl: '/icons/site-icon.svg',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

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
  singleCampMode?: boolean
  centerLat?: number
  centerLng?: number
  defaultZoom?: number
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
  enableInteraction = false,
  allowPageScroll = false
}) => {
  const [sites, setSites] = useState<CampSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastClickedId, setLastClickedId] = useState<number | null>(null)

  // Keep refs of markers so we can programmatically open the popup
  const markerRefs = useRef<Record<number, L.Marker | null>>({})

  useEffect(() => {
    const savedId = localStorage.getItem('lastClickedId')
    if (savedId) setLastClickedId(Number(savedId))
  }, [])

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/campsites')
        if (!res.ok) throw new Error('Failed to fetch campsites')
        const data: CampSite[] = await res.json()

        const processed: CampSite[] = data.map((site) => {
          let price: string = 'paid'
          if (site.fees) {
            if (/RM\s?0/i.test(site.fees) || /FREE/i.test(site.fees)) price = 'free'
          }
          return {
            ...site,
            price,
            attractions: site.tags ? site.tags.split(',').map((t) => t.trim()) : []
          }
        })

        setSites(processed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchSites()
  }, [])

  const displayedSites = sites.filter((site) => {
    const matchState = selectedStates.length === 0 || selectedStates.includes(site.state)
    const matchSearch = searchTerm.trim() === '' || site.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPrice = priceFilter === 'all' || site.price === priceFilter
    const matchAttractions =
      selectedAttractions.length === 0 ||
      (site.attractions && selectedAttractions.every((attr) => site.attractions?.includes(attr)))
    return matchState && matchSearch && matchPrice && matchAttractions
  })

  const getLossInfo = (percent: number) => {
    if (percent < 20) return { color: 'bg-emerald-600', label: 'Low' }
    if (percent < 40) return { color: 'bg-amber-500', label: 'Medium' }
    if (percent < 60) return { color: 'bg-orange-600', label: 'High' }
    return { color: 'bg-red-700', label: 'Critical' }
  }

  const mapCenter: [number, number] = (centerLat && centerLng) ? [centerLat, centerLng] : [3.139, 101.6869]
  const mapZoom = defaultZoom
  const mapSettings = {
    zoomControl: false,
    dragging: enableInteraction || !singleCampMode,
    doubleClickZoom: enableInteraction || !singleCampMode,
    scrollWheelZoom: allowPageScroll ? false : (enableInteraction || !singleCampMode),
    boxZoom: enableInteraction || !singleCampMode,
    keyboard: enableInteraction || !singleCampMode,
  }

  // ✅ Auto-open popup when in singleCampMode (detail page)
  useEffect(() => {
    if (!singleCampMode) return
    // choose the highlighted site by searchTerm, or the first displayed
    const target =
      displayedSites.find((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || displayedSites[0]

    if (target) {
      const m = markerRefs.current[target.id]
      // Delay a tick to ensure Marker+Popup mounted
      if (m) setTimeout(() => m.openPopup(), 0)
    }
  }, [singleCampMode, displayedSites, searchTerm])

  return (
    <div className="h-[600px] w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
          <span className="text-gray-700 text-base">Loading campsites...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <span className="text-red-600 text-base">{error}</span>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-2xl shadow-lg"
        {...mapSettings}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {displayedSites.map((site) => {
          const stateLoss = forestData[site.state]?.cumulative_loss_percent || 0
          const { color, label } = getLossInfo(stateLoss)
          const isHighlighted = singleCampMode
            ? site.name.toLowerCase().includes(searchTerm.toLowerCase())
            : site.id === lastClickedId
          const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={isHighlighted ? highlightedIcon : defaultIcon}
              ref={(ref) => {
                // react-leaflet v4 gives L.Marker instance here
                markerRefs.current[site.id] = (ref as unknown as L.Marker) || null
              }}
              eventHandlers={{
                click: () => {
                  if (!singleCampMode) {
                    setLastClickedId(site.id)
                    localStorage.setItem('lastClickedId', String(site.id))
                  }
                }
              }}
            >
              <Popup minWidth={320}>
                <div className="space-y-3 text-gray-800">
                  <h3 className="text-xl font-semibold text-emerald-700 leading-snug">
                    {site.name}
                  </h3>

                  <div className="text-sm">
                    <span className="font-medium text-gray-700">State:</span>{' '}
                    <span className="text-gray-800">{site.state}</span>
                  </div>

                  {/* Progress bar + percentage */}
                  <div>
                    <div className="w-full bg-gray-300/90 rounded-full h-2.5">
                      <div
                        className={`${color} h-2.5 rounded-full transition-all`}
                        style={{ width: `${Math.min(stateLoss, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-700">
                      Forest loss: <span className="font-medium">{label}</span>{' '}
                      <span className="tabular-nums">{stateLoss.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Open in Google Maps */}
                  <a
                    href={gmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-100 to-green-200 text-emerald-800 text-sm font-semibold shadow-sm hover:from-green-200 hover:to-emerald-300 hover:text-emerald-900 transition"
                  >
                    <i className="ri-navigation-line text-base" />
                    Open in Google Maps
                  </a>
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
