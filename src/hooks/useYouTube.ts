import { useState, useCallback } from 'react'
import { searchElectionVideos, type YouTubeVideo } from '../services/youtubeService'
import type { Country } from '../utils/constants'

interface UseYouTubeReturn {
  videos: YouTubeVideo[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadVideos: (country: Country) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Custom hook for fetching YouTube videos with caching and pagination
 * Automatically caches results per country
 */
export function useYouTube(): UseYouTubeReturn {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null)

  const hasMore = !!nextPageToken

  /**
   * Loads videos for a specific country
   */
  const loadVideos = useCallback(async (country: Country) => {
    setIsLoading(true)
    setError(null)
    setCurrentCountry(country)

    try {
      const result = await searchElectionVideos(country, 4)
      setVideos(result.videos)
      setNextPageToken(result.nextPageToken)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load videos')
      }
      setVideos([])
      setNextPageToken(undefined)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Loads more videos (next page)
   */
  const loadMore = useCallback(async () => {
    if (!currentCountry || !nextPageToken || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await searchElectionVideos(currentCountry, 4, nextPageToken)
      setVideos(prev => [...prev, ...result.videos])
      setNextPageToken(result.nextPageToken)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load more videos')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentCountry, nextPageToken, isLoading])

  /**
   * Refreshes videos for current country (clears cache)
   */
  const refresh = useCallback(async () => {
    if (!currentCountry) {
      return
    }

    // Clear cache by loading fresh data
    setIsLoading(true)
    setError(null)

    try {
      const result = await searchElectionVideos(currentCountry, 4)
      setVideos(result.videos)
      setNextPageToken(result.nextPageToken)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to refresh videos')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentCountry])

  return {
    videos,
    isLoading,
    error,
    hasMore,
    loadVideos,
    loadMore,
    refresh,
  }
}

// Made with Bob
