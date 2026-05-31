import type { LanguageCode } from '../utils/constants'

const TRANSLATE_API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY
const TRANSLATE_API_BASE = 'https://translation.googleapis.com/language/translate/v2'

/**
 * Translation result structure
 */
export interface TranslationResult {
  translatedText: string
  detectedSourceLanguage?: string
}

/**
 * Translates text to the target language using Google Translate API
 * @param text - Text to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (optional, auto-detect if not provided)
 * @returns Translation result
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<TranslationResult> {
  // If target is English and no source specified, return original
  if (targetLanguage === 'en' && !sourceLanguage) {
    return {
      translatedText: text,
    }
  }

  const url = new URL(TRANSLATE_API_BASE)
  url.searchParams.append('key', TRANSLATE_API_KEY)
  url.searchParams.append('q', text)
  url.searchParams.append('target', targetLanguage)
  
  if (sourceLanguage) {
    url.searchParams.append('source', sourceLanguage)
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.translations || data.data.translations.length === 0) {
      throw new Error('Invalid translation response')
    }

    const translation = data.data.translations[0]
    
    return {
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to translate text')
  }
}

/**
 * Translates multiple texts in a single request
 * @param texts - Array of texts to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (optional)
 * @returns Array of translation results
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<TranslationResult[]> {
  if (texts.length === 0) {
    return []
  }

  // If target is English and no source specified, return originals
  if (targetLanguage === 'en' && !sourceLanguage) {
    return texts.map(text => ({ translatedText: text }))
  }

  const url = new URL(TRANSLATE_API_BASE)
  url.searchParams.append('key', TRANSLATE_API_KEY)
  url.searchParams.append('target', targetLanguage)
  
  if (sourceLanguage) {
    url.searchParams.append('source', sourceLanguage)
  }

  // Add all texts as separate 'q' parameters
  texts.forEach(text => {
    url.searchParams.append('q', text)
  })

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.translations) {
      throw new Error('Invalid translation response')
    }

    return data.data.translations.map((translation: any) => ({
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to translate texts')
  }
}

/**
 * Detects the language of the given text
 * @param text - Text to detect language for
 * @returns Detected language code and confidence
 */
export async function detectLanguage(
  text: string
): Promise<{ language: string; confidence: number }> {
  const url = new URL(`${TRANSLATE_API_BASE}/detect`)
  url.searchParams.append('key', TRANSLATE_API_KEY)
  url.searchParams.append('q', text)

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.detections || data.data.detections.length === 0) {
      throw new Error('Invalid detection response')
    }

    const detection = data.data.detections[0][0]
    
    return {
      language: detection.language,
      confidence: detection.confidence,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to detect language')
  }
}

/**
 * Gets the language name from language code
 * @param code - Language code
 * @returns Language name
 */
export function getLanguageName(code: LanguageCode): string {
  const names: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    fr: 'French',
    ar: 'Arabic',
  }
  
  return names[code] || code
}

/**
 * Checks if a language is RTL (Right-to-Left)
 * @param code - Language code
 * @returns true if RTL, false otherwise
 */
export function isRTL(code: LanguageCode): boolean {
  return code === 'ar'
}

// Made with Bob
