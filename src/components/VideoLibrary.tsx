import React from 'react'
import type { YouTubeVideo } from '../services/youtubeService'
import { truncateTitle } from '../utils/electionUtils'

interface VideoLibraryProps {
  videos: YouTubeVideo[]
  loading: boolean
  error: string | null
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

/**
 * Displays YouTube video results in a responsive grid
 * Includes thumbnails, titles, and channel information
 */
export const VideoLibrary = React.memo<VideoLibraryProps>(
  ({ videos, loading, error, onLoadMore, hasMore = false, className = '' }) => {
    if (loading && videos.length === 0) {
      return (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
          role="status"
          aria-live="polite"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"
            />
          ))}
          <span className="sr-only">Loading videos...</span>
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

    if (videos.length === 0) {
      return (
        <div
          className={`p-6 text-center text-gray-500 dark:text-gray-400 ${className}`}
        >
          No videos found. Try a different search term.
        </div>
      )
    }

    return (
      <div className={className}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Educational videos"
        >
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              role="listitem"
            >
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <img
                  src={video.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {truncateTitle(video.title, 60)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {video.channelTitle}
                </p>
              </div>
            </a>
          ))}
        </div>

        {hasMore && onLoadMore && (
          <div className="mt-6 text-center">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {loading ? 'Loading...' : 'Load More Videos'}
            </button>
          </div>
        )}
      </div>
    )
  }
)

VideoLibrary.displayName = 'VideoLibrary'

// Made with Bob
