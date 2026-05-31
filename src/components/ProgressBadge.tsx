import React from 'react'

interface ProgressBadgeProps {
  percentage: number
  className?: string
}

/**
 * Displays completion percentage with color-coded badge
 * Green for complete, yellow for in-progress, gray for not started
 */
export const ProgressBadge = React.memo<ProgressBadgeProps>(
  ({ percentage, className = '' }) => {
    const getColorClasses = () => {
      if (percentage === 100) {
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      } else if (percentage > 0) {
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      } else {
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }
    }

    const getStatusText = () => {
      if (percentage === 100) return 'Complete'
      if (percentage > 0) return 'In Progress'
      return 'Not Started'
    }

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getColorClasses()} ${className}`}
        role="status"
        aria-label={`Progress: ${percentage}% ${getStatusText()}`}
      >
        <span className="font-semibold">{percentage}%</span>
        <span className="hidden sm:inline">{getStatusText()}</span>
      </div>
    )
  }
)

ProgressBadge.displayName = 'ProgressBadge'

// Made with Bob
