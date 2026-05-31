import React from 'react'
import { SUPPORTED_COUNTRIES } from '../utils/constants'

interface CountrySelectorProps {
  value: string
  onChange: (country: string) => void
  className?: string
}

/**
 * Dropdown selector for supported countries
 * Includes proper labeling and keyboard navigation
 */
export const CountrySelector = React.memo<CountrySelectorProps>(
  ({ value, onChange, className = '' }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value)
    }

    return (
      <div className={className}>
        <label
          htmlFor="country-selector"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Country
        </label>
        <select
          id="country-selector"
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          aria-label="Select your country"
        >
          {SUPPORTED_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    )
  }
)

CountrySelector.displayName = 'CountrySelector'

// Made with Bob
