import React from 'react'
import type { VoterInfo } from '../services/civicService'
import { formatElectionDate } from '../utils/electionUtils'

interface CivicInfoCardProps {
  voterInfo: VoterInfo | null
  loading: boolean
  error: string | null
  className?: string
}

/**
 * Displays voter information from Google Civic Information API
 * Shows elections, polling places, and early voting locations
 */
export const CivicInfoCard = React.memo<CivicInfoCardProps>(
  ({ voterInfo, loading, error, className = '' }) => {
    if (loading) {
      return (
        <div
          className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
          role="status"
          aria-live="polite"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <span className="sr-only">Loading voter information...</span>
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

    if (!voterInfo) {
      return null
    }

    return (
      <div
        className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4 ${className}`}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Voter Information
        </h3>

        {voterInfo.election && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Election Information
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-medium text-gray-900 dark:text-white">
                {voterInfo.election.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatElectionDate(voterInfo.election.electionDay)}
              </p>
            </div>
          </div>
        )}

        {voterInfo.pollingLocations && voterInfo.pollingLocations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Polling Places ({voterInfo.pollingLocations.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View locations on the map below
            </p>
          </div>
        )}

        {voterInfo.earlyVoteSites && voterInfo.earlyVoteSites.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Early Voting Sites ({voterInfo.earlyVoteSites.length})
            </h4>
            <ul className="space-y-2">
              {voterInfo.earlyVoteSites.slice(0, 3).map((site, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {site.address?.locationName || 'Early Voting Location'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)

CivicInfoCard.displayName = 'CivicInfoCard'

// Made with Bob
