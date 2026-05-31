import { SUPPORTED_COUNTRIES, type Country } from './constants'
import { sanitize } from './sanitize'
import { cacheGet, cacheSet } from './cache'

/**
 * Gemini response structure
 */
export interface GeminiResponse {
  answer: string
  steps: string[]
  relatedTopics: string[]
  sources: string[]
}

/**
 * Validates if an address string is valid
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false
  return address.trim().length >= 5
}

/**
 * Validates if a country is supported
 * @param country - The country code to validate
 * @returns true if supported, false otherwise
 */
export function validateCountry(country: string): boolean {
  return SUPPORTED_COUNTRIES.includes(country as Country)
}

/**
 * Sanitizes user question input to prevent XSS attacks
 * @param question - The user's question
 * @returns Sanitized question string
 */
export function sanitizeQuestion(question: string): string {
  return sanitize(question)
}

/**
 * Builds a prompt for Gemini API with nonpartisan instructions
 * @param question - The user's question
 * @param country - The selected country
 * @returns Formatted prompt string
 */
export function buildGeminiPrompt(question: string, country: string): string {
  return `You are a nonpartisan election education assistant. You only explain electoral processes, timelines, voter registration steps, and how democratic systems work. You never express opinions about candidates, parties, or political positions. If asked anything politically opinionated, respond: "I'm here to explain how elections work, not to take political sides."

Context: The user is asking about elections in ${country}.

User Question: ${question}

Please respond in JSON format with the following structure:
{
  "answer": "Your detailed explanation here",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "relatedTopics": ["Related topic 1", "Related topic 2"],
  "sources": ["Source 1", "Source 2"]
}

Ensure your answer is factual, educational, and completely nonpartisan.`
}

/**
 * Parses Gemini API response from JSON string
 * @param response - The JSON response string from Gemini
 * @returns Parsed GeminiResponse object
 * @throws Error if JSON is malformed
 */
export function parseGeminiResponse(response: string): GeminiResponse {
  const parsed = JSON.parse(response)
  return {
    answer: parsed.answer || '',
    steps: parsed.steps || [],
    relatedTopics: parsed.relatedTopics || [],
    sources: parsed.sources || [],
  }
}

/**
 * Filters out politically biased questions
 * @param question - The user's question
 * @returns true if question is acceptable, false if politically biased
 */
export function filterNonpartisan(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  
  // List of politically charged keywords/phrases
  const biasedKeywords = [
    'better than',
    'worse than',
    'should i vote for',
    'who should i vote',
    'which party',
    'which candidate',
    'why is',
    'party x better',
    'party y worse',
    'support',
    'endorse',
    'recommend',
  ]
  
  // Check if question contains biased keywords
  for (const keyword of biasedKeywords) {
    if (lowerQuestion.includes(keyword)) {
      return false
    }
  }
  
  return true
}

/**
 * Calculates checklist completion percentage
 * @param items - Array of boolean values representing checklist items
 * @returns Completion percentage (0-100)
 */
export function calculateChecklistProgress(items: boolean[]): number {
  if (items.length === 0) return 0
  const completed = items.filter(item => item === true).length
  return Math.round((completed / items.length) * 100)
}

/**
 * Formats an ISO date string to human-readable format
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "November 5, 2024")
 */
export function formatElectionDate(isoDate: string): string {
  if (!isoDate || isoDate.trim() === '') return 'Date TBD'
  
  try {
    const date = new Date(isoDate)
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Date TBD'
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Date TBD'
  }
}

/**
 * Truncates a title to a maximum length
 * @param title - The title to truncate
 * @param maxLength - Maximum length (default: 60)
 * @returns Truncated title with ellipsis if needed
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength) + '...'
}

// Re-export cache functions for convenience
export { cacheGet, cacheSet }

// Made with Bob
