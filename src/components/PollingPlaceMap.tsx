import React, { useEffect, useRef, useState } from 'react'
import type { PollingLocation } from '../services/civicService'
import { createMap, plotPollingPlaces, fitBoundsToMarkers } from '../services/mapsService'

interface PollingPlaceMapProps {
  locations: PollingLocation[]
  className?: string
}

/**
 * Google Maps component displaying polling locations
 * Lazy loads the map to improve initial page load performance
 */
export const PollingPlaceMap = React.memo<PollingPlaceMapProps>(
  ({ locations, className = '' }) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const [, setMap] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (!mapRef.current) return

      const initMap = async () => {
        try {
          setLoading(true)
          setError(null)

          // Create map centered on first location or default
          const center = locations[0]?.latitude && locations[0]?.longitude
            ? { lat: locations[0].latitude, lng: locations[0].longitude }
            : { lat: 39.8283, lng: -98.5795 } // Center of USA

          const mapInstance = await createMap(mapRef.current!, center)
          setMap(mapInstance)

          // Plot all polling locations
          if (locations.length > 0) {
            const markers = await plotPollingPlaces(mapInstance, locations)
            if (markers.length > 0) {
              fitBoundsToMarkers(mapInstance, markers)
            }
          }

          setLoading(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load map')
          setLoading(false)
        }
      }

      initMap()
    }, [locations])

    if (loading) {
      return (
        <div
          className={`bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}
          style={{ minHeight: '400px' }}
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div
          className={`p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
          role="alert"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )
    }

    return (
      <div className={className}>
        <div
          ref={mapRef}
          className="w-full rounded-lg shadow-md"
          style={{ minHeight: '400px' }}
          role="application"
          aria-label="Map showing polling locations"
        />
        {locations.length > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            Showing {locations.length} polling location{locations.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    )
  }
)

PollingPlaceMap.displayName = 'PollingPlaceMap'

// Made with Bob
