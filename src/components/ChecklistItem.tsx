import React from 'react'

interface ChecklistItemProps {
  label: string
  checked: boolean
  onToggle: () => void
  className?: string
}

/**
 * Individual checklist item with accessible checkbox
 * Includes proper labels and keyboard navigation
 */
export const ChecklistItem = React.memo<ChecklistItemProps>(
  ({ label, checked, onToggle, className = '' }) => {
    const id = `checklist-${label.replace(/\s+/g, '-').toLowerCase()}`

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onToggle}
          className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
          aria-label={label}
        />
        <label
          htmlFor={id}
          className={`flex-1 cursor-pointer select-none ${
            checked
              ? 'text-gray-500 line-through dark:text-gray-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
        </label>
      </div>
    )
  }
)

ChecklistItem.displayName = 'ChecklistItem'

// Made with Bob
