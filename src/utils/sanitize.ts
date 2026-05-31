/**
 * Strips HTML tags from a string to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns The sanitized string without HTML tags
 */
export function stripHTML(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Strips script tags and their content from a string
 * @param input - The string to sanitize
 * @returns The sanitized string without script tags
 */
export function stripScripts(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

/**
 * Comprehensive sanitization function that removes both HTML and script tags
 * @param input - The string to sanitize
 * @returns The fully sanitized string
 */
export function sanitize(input: string): string {
  let sanitized = stripScripts(input)
  sanitized = stripHTML(sanitized)
  return sanitized.trim()
}

// Made with Bob
