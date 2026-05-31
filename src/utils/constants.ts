/**
 * Supported countries for election information
 */
export const SUPPORTED_COUNTRIES = ['USA', 'India', 'UK'] as const

export type Country = typeof SUPPORTED_COUNTRIES[number]

/**
 * Election readiness checklist items
 */
export const CHECKLIST_ITEMS = [
  'Check voter registration status',
  'Confirm polling place location',
  'Note election date in calendar',
  'Understand your ballot format',
  'Arrange transportation to polling place',
  'Review ID requirements',
  'Learn about absentee/mail voting option',
] as const

/**
 * Suggested starter topics for the chat interface
 */
export const TOPIC_SUGGESTIONS = [
  'How does voter registration work in {country}?',
  'What happens on election day?',
  'How are votes counted?',
  'What is the electoral college?',
  'How does absentee voting work?',
  'What are the key election dates?',
  'How do I find my polling place?',
  'What ID do I need to vote?',
] as const

/**
 * Supported languages for translation
 */
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

/**
 * Cache TTL values in milliseconds
 */
export const CACHE_TTL = {
  YOUTUBE: 15 * 60 * 1000, // 15 minutes
  CIVIC: 5 * 60 * 1000,    // 5 minutes
} as const

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  ASK_BUTTON_COOLDOWN: 3000, // 3 seconds
} as const

/**
 * Debounce delays in milliseconds
 */
export const DEBOUNCE_DELAY = {
  ADDRESS_INPUT: 400, // 400ms
} as const

// Made with Bob
