import { cacheGet, cacheSet } from '../utils/cache'
import { CACHE_TTL } from '../utils/constants'
import { truncateTitle } from '../utils/electionUtils'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

/**
 * YouTube video structure
 */
export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: string
  url: string
}

/**
 * YouTube search response
 */
interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string }
    snippet: {
      title: string
      description: string
      thumbnails: {
        medium: { url: string }
        high: { url: string }
      }
      channelTitle: string
      publishedAt: string
    }
  }>
  nextPageToken?: string
}

/**
 * Searches for election-related videos on YouTube
 * @param country - The country to search for
 * @param maxResults - Maximum number of results (default: 4)
 * @param pageToken - Page token for pagination
 * @returns Array of YouTube videos
 */
export async function searchElectionVideos(
  country: string,
  maxResults: number = 4,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  // Check cache first
  const cacheKey = `yt_${country}_${pageToken || 'first'}`
  const cached = cacheGet<{ videos: YouTubeVideo[]; nextPageToken?: string }>(cacheKey)
  if (cached) {
    return cached
  }

  const query = `${country} election process explained official`
  
  const url = new URL(`${YOUTUBE_API_BASE}/search`)
  url.searchParams.append('key', YOUTUBE_API_KEY)
  url.searchParams.append('part', 'snippet')
  url.searchParams.append('q', query)
  url.searchParams.append('type', 'video')
  url.searchParams.append('maxResults', maxResults.toString())
  url.searchParams.append('safeSearch', 'strict')
  url.searchParams.append('relevanceLanguage', 'en')
  url.searchParams.append('order', 'relevance')
  
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken)
  }

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`)
    }

    const data: YouTubeSearchResponse = await response.json()
    
    // Get video statistics for view counts
    const videoIds = data.items.map(item => item.id.videoId).join(',')
    const videos = await enrichWithStatistics(data.items, videoIds)
    
    const result = {
      videos,
      nextPageToken: data.nextPageToken,
    }
    
    // Cache the result
    cacheSet(cacheKey, result, CACHE_TTL.YOUTUBE)
    
    return result
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to search YouTube videos')
  }
}

/**
 * Enriches video data with statistics (view counts)
 * @param items - Search result items
 * @param videoIds - Comma-separated video IDs
 * @returns Array of enriched YouTube videos
 */
async function enrichWithStatistics(
  items: YouTubeSearchResponse['items'],
  videoIds: string
): Promise<YouTubeVideo[]> {
  try {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`)
    url.searchParams.append('key', YOUTUBE_API_KEY)
    url.searchParams.append('part', 'statistics')
    url.searchParams.append('id', videoIds)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      // If statistics fetch fails, return videos without view counts
      return items.map(item => formatVideo(item, undefined))
    }

    const data = await response.json()
    const statsMap = new Map<string, string>(
      data.items.map((item: any) => [item.id, item.statistics.viewCount])
    )

    return items.map(item => formatVideo(item, statsMap.get(item.id.videoId) as string | undefined))
  } catch {
    // If enrichment fails, return basic video data
    return items.map(item => formatVideo(item, undefined))
  }
}

/**
 * Formats a YouTube search result into a YouTubeVideo object
 * @param item - Search result item
 * @param viewCount - View count (optional)
 * @returns Formatted YouTube video
 */
function formatVideo(
  item: YouTubeSearchResponse['items'][0],
  viewCount?: string
): YouTubeVideo {
  return {
    id: item.id.videoId,
    title: truncateTitle(item.snippet.title, 60),
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: viewCount ? formatViewCount(viewCount) : undefined,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }
}

/**
 * Formats view count to human-readable format
 * @param count - View count as string
 * @returns Formatted view count (e.g., "1.2M views")
 */
function formatViewCount(count: string): string {
  const num = parseInt(count, 10)
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`
  }
  
  return `${num} views`
}

/**
 * Gets the embed URL for a YouTube video
 * @param videoId - YouTube video ID
 * @returns Embed URL
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Clears the YouTube cache for a specific country
 * @param country - The country to clear cache for
 */
export function clearYouTubeCache(country: string): void {
  // Clear first page cache
  sessionStorage.removeItem(`yt_${country}_first`)
  
  // Note: We don't clear all pages as we don't track page tokens
  // This is acceptable as cache will expire naturally
}

// Made with Bob
