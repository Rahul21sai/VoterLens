import React from 'react'

interface TopicChipsProps {
  topics: string[]
  onTopicClick: (topic: string) => void
  className?: string
}

/**
 * Displays clickable topic suggestion chips
 * Used for quick access to common election topics
 */
export const TopicChips = React.memo<TopicChipsProps>(
  ({ topics, onTopicClick, className = '' }) => {
    if (topics.length === 0) return null

    return (
      <div
        className={`flex flex-wrap gap-2 ${className}`}
        role="group"
        aria-label="Related topics"
      >
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopicClick(topic)}
            className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-full hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800"
            type="button"
            aria-label={`Learn about ${topic}`}
          >
            {topic}
          </button>
        ))}
      </div>
    )
  }
)

TopicChips.displayName = 'TopicChips'

// Made with Bob
