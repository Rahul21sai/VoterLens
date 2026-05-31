import { cacheGet, cacheSet } from '../utils/cache'
import { CACHE_TTL } from '../utils/constants'

const CIVIC_API_KEY = import.meta.env.VITE_CIVIC_API_KEY
const CIVIC_API_BASE = 'https://civicinfo.googleapis.com/civicinfo/v2'

/**
 * Election information structure
 */
export interface Election {
  id: string
  name: string
  electionDay: string
  ocdDivisionId: string
}

/**
 * Polling location structure
 */
export interface PollingLocation {
  address: {
    locationName?: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  pollingHours?: string
  name?: string
  startDate?: string
  endDate?: string
  latitude?: number
  longitude?: number
}

/**
 * Voter information response structure
 */
export interface VoterInfo {
  election: Election
  pollingLocations?: PollingLocation[]
  earlyVoteSites?: PollingLocation[]
  dropOffLocations?: PollingLocation[]
  normalizedInput?: {
    line1: string
    city: string
    state: string
    zip: string
  }
}

/**
 * Representative information structure
 */
export interface Representative {
  name: string
  party?: string
  phones?: string[]
  urls?: string[]
  photoUrl?: string
  channels?: Array<{
    type: string
    id: string
  }>
  office: string
  level: string
}

/**
 * Fetches voter information for a given address
 * @param address - The voter's address
 * @returns Voter information including polling places
 */
export async function fetchVoterInfo(address: string): Promise<VoterInfo> {
  // Check cache first
  const cacheKey = `civic_${btoa(address)}`
  const cached = cacheGet<VoterInfo>(cacheKey)
  if (cached) {
    return cached
  }

  const url = new URL(`${CIVIC_API_BASE}/voterinfo`)
  url.searchParams.append('key', CIVIC_API_KEY)
  url.searchParams.append('address', address)

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No election information found for this address')
      }
      throw new Error(`Civic API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the result
    cacheSet(cacheKey, data, CACHE_TTL.CIVIC)
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch voter information')
  }
}

/**
 * Fetches representatives for a given address
 * @param address - The voter's address
 * @returns List of representatives
 */
export async function fetchRepresentatives(address: string): Promise<Representative[]> {
  const url = new URL(`${CIVIC_API_BASE}/representatives`)
  url.searchParams.append('key', CIVIC_API_KEY)
  url.searchParams.append('address', address)

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Civic API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform the response into a flat list of representatives
    const representatives: Representative[] = []
    
    if (data.offices && data.officials) {
      data.offices.forEach((office: any) => {
        office.officialIndices.forEach((index: number) => {
          const official = data.officials[index]
          representatives.push({
            name: official.name,
            party: official.party,
            phones: official.phones,
            urls: official.urls,
            photoUrl: official.photoUrl,
            channels: official.channels,
            office: office.name,
            level: office.levels?.[0] || 'unknown',
          })
        })
      })
    }
    
    return representatives
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch representatives')
  }
}

/**
 * Formats a polling location address for display
 * @param location - The polling location
 * @returns Formatted address string
 */
export function formatPollingAddress(location: PollingLocation): string {
  const { address } = location
  const parts = [
    address.locationName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.zip}`,
  ].filter(Boolean)
  
  return parts.join(', ')
}

/**
 * Gets Google Maps directions URL for a polling location
 * @param location - The polling location
 * @returns Google Maps URL
 */
export function getDirectionsUrl(location: PollingLocation): string {
  const address = formatPollingAddress(location)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

// Made with Bob
