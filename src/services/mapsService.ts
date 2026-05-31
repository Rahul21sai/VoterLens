import { Loader } from '@googlemaps/js-api-loader'
import type { PollingLocation } from './civicService'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

let loader: Loader | null = null
let google: any = null

/**
 * Initializes the Google Maps JavaScript API
 */
async function initializeGoogleMaps(): Promise<any> {
  if (google) {
    return google
  }

  if (!GOOGLE_MAPS_KEY) {
    throw new Error('Google Maps API key is not configured')
  }

  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_KEY,
      version: 'weekly',
      libraries: ['places', 'marker'],
    })
  }

  google = await loader.load()
  return google
}

/**
 * Map marker with polling location data
 */
export interface MapMarker {
  marker: any
  location: PollingLocation
  infoWindow: any
}

/**
 * Creates a Google Map instance
 * @param container - The HTML element to render the map in
 * @param center - Initial center coordinates
 * @param zoom - Initial zoom level
 * @returns Google Maps instance
 */
export async function createMap(
  container: HTMLElement,
  center: { lat: number; lng: number } = { lat: 39.8283, lng: -98.5795 }, // Center of USA
  zoom: number = 4
): Promise<any> {
  const googleMaps = await initializeGoogleMaps()
  
  const map = new googleMaps.maps.Map(container, {
    center,
    zoom,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
  })

  return map
}

/**
 * Plots polling locations on the map
 * @param map - Google Maps instance
 * @param locations - Array of polling locations
 * @returns Array of map markers
 */
export async function plotPollingPlaces(
  map: any,
  locations: PollingLocation[]
): Promise<MapMarker[]> {
  const googleMaps = await initializeGoogleMaps()
  const markers: MapMarker[] = []

  for (const location of locations) {
    // Get coordinates (use geocoding if not provided)
    let lat = location.latitude
    let lng = location.longitude

    if (!lat || !lng) {
      // Skip if no coordinates and geocoding would be needed
      // In production, you'd geocode the address here
      continue
    }

    const position = { lat, lng }

    // Create custom marker icon (ballot box)
    const marker = new googleMaps.maps.Marker({
      position,
      map,
      title: location.name || location.address.locationName || 'Polling Place',
      icon: {
        path: googleMaps.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#0ea5e9',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })

    // Create info window content
    const infoWindowContent = `
      <div style="padding: 12px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
          ${location.name || location.address.locationName || 'Polling Place'}
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">
          ${location.address.line1}<br>
          ${location.address.line2 ? location.address.line2 + '<br>' : ''}
          ${location.address.city}, ${location.address.state} ${location.address.zip}
        </p>
        ${location.pollingHours ? `
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">
            <strong>Hours:</strong> ${location.pollingHours}
          </p>
        ` : ''}
        <a 
          href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${location.address.line1}, ${location.address.city}, ${location.address.state} ${location.address.zip}`
          )}"
          target="_blank"
          rel="noopener noreferrer"
          style="display: inline-block; margin-top: 8px; padding: 8px 16px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;"
        >
          Get Directions
        </a>
      </div>
    `

    const infoWindow = new googleMaps.maps.InfoWindow({
      content: infoWindowContent,
    })

    // Add click listener to show info window
    marker.addListener('click', () => {
      // Close all other info windows
      markers.forEach(m => m.infoWindow.close())
      infoWindow.open(map, marker)
    })

    markers.push({ marker, location, infoWindow })
  }

  return markers
}

/**
 * Fits the map bounds to show all markers
 * @param map - Google Maps instance
 * @param markers - Array of map markers
 */
export async function fitBoundsToMarkers(map: any, markers: MapMarker[]): Promise<void> {
  if (markers.length === 0) return

  const googleMaps = await initializeGoogleMaps()
  const bounds = new googleMaps.maps.LatLngBounds()

  markers.forEach(({ marker }) => {
    bounds.extend(marker.getPosition())
  })

  map.fitBounds(bounds)

  // Add some padding
  if (markers.length === 1) {
    map.setZoom(15) // Zoom in more for single location
  }
}

/**
 * Geocodes an address to get coordinates
 * @param address - Address string
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const googleMaps = await initializeGoogleMaps()
  const geocoder = new googleMaps.maps.Geocoder()

  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        })
      } else {
        resolve(null)
      }
    })
  })
}

// Made with Bob
