import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchVoterInfo, fetchRepresentatives, type VoterInfo, type Representative } from '../services/civicService'
import { validateAddress } from '../utils/electionUtils'
import { DEBOUNCE_DELAY } from '../utils/constants'

interface UseCivicInfoReturn {
  voterInfo: VoterInfo | null
  representatives: Representative[]
  isLoading: boolean
  error: string | null
  fetchInfo: (address: string) => Promise<void>
  fetchReps: (address: string) => Promise<void>
  clearData: () => void
}

/**
 * Custom hook for fetching Civic Information API data with debouncing
 * Includes address validation and error handling
 */
export function useCivicInfo(): UseCivicInfoReturn {
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null)
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastAddressRef = useRef<string>('')

  /**
   * Fetches voter information for an address with debouncing
   */
  const fetchInfo = useCallback(async (address: string) => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Validate address
    if (!validateAddress(address)) {
      setError('Please enter a valid address (at least 5 characters)')
      setVoterInfo(null)
      return
    }

    // Don't fetch if same address
    if (address === lastAddressRef.current && voterInfo) {
      return
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      lastAddressRef.current = address

      try {
        const info = await fetchVoterInfo(address)
        setVoterInfo(info)
        setError(null)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to fetch voter information')
        }
        setVoterInfo(null)
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_DELAY.ADDRESS_INPUT)
  }, [voterInfo])

  /**
   * Fetches representatives for an address
   */
  const fetchReps = useCallback(async (address: string) => {
    // Validate address
    if (!validateAddress(address)) {
      setError('Please enter a valid address (at least 5 characters)')
      setRepresentatives([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reps = await fetchRepresentatives(address)
      setRepresentatives(reps)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch representatives')
      }
      setRepresentatives([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clears all data and resets state
   */
  const clearData = useCallback(() => {
    setVoterInfo(null)
    setRepresentatives([])
    setError(null)
    lastAddressRef.current = ''
    
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    voterInfo,
    representatives,
    isLoading,
    error,
    fetchInfo,
    fetchReps,
    clearData,
  }
}

// Made with Bob
