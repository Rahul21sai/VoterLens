import React from 'react'
import { ChecklistItem } from './ChecklistItem'
import { ProgressBadge } from './ProgressBadge'
import { useFirestoreChecklist } from '../hooks/useFirestoreChecklist'
import { CHECKLIST_ITEMS } from '../utils/constants'

interface ElectionChecklistProps {
  className?: string
}

/**
 * Complete election preparation checklist with Firestore persistence
 * Auto-saves progress and displays completion percentage
 */
export const ElectionChecklist = React.memo<ElectionChecklistProps>(
  ({ className = '' }) => {
    const { items, progress, toggleItem, isLoading, error } = useFirestoreChecklist()

    if (isLoading) {
      return (
        <div
          className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
          role="status"
          aria-live="polite"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <span className="sr-only">Loading checklist...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div
          className={`p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}
          role="alert"
        >
          <p className="text-yellow-800 dark:text-yellow-200">
            {error}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            Your progress will be saved locally.
          </p>
        </div>
      )
    }

    return (
      <div
        className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Election Preparation Checklist
          </h2>
          <ProgressBadge percentage={progress} />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete these steps to ensure you're ready to vote
        </p>

        <div className="space-y-4" role="list" aria-label="Preparation checklist">
          {CHECKLIST_ITEMS.map((item, index) => (
            <ChecklistItem
              key={item}
              label={item}
              checked={items[index] || false}
              onToggle={() => toggleItem(index)}
              className="py-2"
            />
          ))}
        </div>

        {progress === 100 && (
          <div
            className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-green-800 dark:text-green-200 font-medium">
              🎉 Congratulations! You've completed all preparation steps.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Your progress is automatically saved
        </p>
      </div>
    )
  }
)

ElectionChecklist.displayName = 'ElectionChecklist'

// Made with Bob
