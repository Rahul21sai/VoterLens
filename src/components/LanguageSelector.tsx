import React from 'react'

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
  className?: string
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ar', name: 'العربية (Arabic)' },
]

/**
 * Language selector dropdown with translation support
 * Triggers Google Translate API when language changes
 */
export const LanguageSelector = React.memo<LanguageSelectorProps>(
  ({ value, onChange, className = '' }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value)
    }

    return (
      <div className={className}>
        <label
          htmlFor="language-selector"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Language
        </label>
        <select
          id="language-selector"
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          aria-label="Select language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
)

LanguageSelector.displayName = 'LanguageSelector'

// Made with Bob
