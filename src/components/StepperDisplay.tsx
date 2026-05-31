import React from 'react'

interface StepperDisplayProps {
  steps: string[]
  className?: string
}

/**
 * Displays a numbered list of steps with visual indicators
 * Accessible with ARIA attributes and semantic HTML
 */
export const StepperDisplay = React.memo<StepperDisplayProps>(({ steps, className = '' }) => {
  if (steps.length === 0) {
    return null
  }

  return (
    <ol 
      className={`space-y-4 ${className}`}
      role="list"
      aria-label="Step-by-step instructions"
    >
      {steps.map((step, index) => (
        <li
          key={index}
          className="flex items-start gap-3"
          aria-current={index === 0 ? 'step' : undefined}
        >
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm"
            aria-label={`Step ${index + 1}`}
          >
            {index + 1}
          </span>
          <span className="flex-1 pt-1 text-gray-700 dark:text-gray-300">
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
})

StepperDisplay.displayName = 'StepperDisplay'

// Made with Bob
