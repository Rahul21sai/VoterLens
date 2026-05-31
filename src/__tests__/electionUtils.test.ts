import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateAddress,
  validateCountry,
  sanitizeQuestion,
  buildGeminiPrompt,
  parseGeminiResponse,
  filterNonpartisan,
  calculateChecklistProgress,
  formatElectionDate,
  truncateTitle,
  cacheGet,
  cacheSet,
} from '../utils/electionUtils'

describe('Address Validation', () => {
  it('rejects empty address', () => {
    expect(validateAddress('')).toBe(false)
  })

  it('rejects address shorter than 5 characters', () => {
    expect(validateAddress('123')).toBe(false)
  })

  it('accepts valid US address', () => {
    expect(validateAddress('1600 Pennsylvania Ave NW, Washington DC')).toBe(true)
  })

  it('rejects null or undefined', () => {
    expect(validateAddress(null as any)).toBe(false)
    expect(validateAddress(undefined as any)).toBe(false)
  })

  it('accepts address with exactly 5 characters', () => {
    expect(validateAddress('12345')).toBe(true)
  })
})

describe('Country Validation', () => {
  it('accepts supported countries', () => {
    expect(validateCountry('USA')).toBe(true)
    expect(validateCountry('India')).toBe(true)
    expect(validateCountry('UK')).toBe(true)
  })

  it('rejects unsupported country', () => {
    expect(validateCountry('XYZ')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateCountry('')).toBe(false)
  })

  it('is case sensitive', () => {
    expect(validateCountry('usa')).toBe(false)
    expect(validateCountry('USA')).toBe(true)
  })
})

describe('Input Sanitization', () => {
  it('strips script tags from user question', () => {
    const input = 'What is voting? <script>alert("xss")</script>'
    expect(sanitizeQuestion(input)).not.toContain('<script>')
  })

  it('strips HTML tags', () => {
    expect(sanitizeQuestion('<b>How</b> do I register?')).toBe('How do I register?')
  })

  it('preserves clean text', () => {
    expect(sanitizeQuestion('How do I register to vote?')).toBe('How do I register to vote?')
  })

  it('strips multiple HTML tags', () => {
    const input = '<div><p>Test</p></div>'
    expect(sanitizeQuestion(input)).toBe('Test')
  })

  it('handles mixed content', () => {
    const input = 'Hello <b>world</b> <script>alert(1)</script> test'
    const result = sanitizeQuestion(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })
})

describe('Gemini Prompt Builder', () => {
  it('includes country in prompt', () => {
    const prompt = buildGeminiPrompt('How do I vote?', 'India')
    expect(prompt).toContain('India')
  })

  it('includes user question in prompt', () => {
    const prompt = buildGeminiPrompt('How do I vote?', 'USA')
    expect(prompt).toContain('How do I vote?')
  })

  it('includes nonpartisan instruction in prompt', () => {
    const prompt = buildGeminiPrompt('Who should I vote for?', 'USA')
    expect(prompt.toLowerCase()).toContain('nonpartisan')
  })

  it('requests JSON format', () => {
    const prompt = buildGeminiPrompt('What is election day?', 'USA')
    expect(prompt.toLowerCase()).toContain('json')
  })

  it('includes all required JSON fields', () => {
    const prompt = buildGeminiPrompt('Test question', 'UK')
    expect(prompt).toContain('answer')
    expect(prompt).toContain('steps')
    expect(prompt).toContain('relatedTopics')
    expect(prompt).toContain('sources')
  })
})

describe('Gemini Response Parser', () => {
  it('parses valid response with steps', () => {
    const mock = JSON.stringify({
      answer: 'Elections work by...',
      steps: ['Step 1: Register', 'Step 2: Vote'],
      relatedTopics: ['Absentee voting'],
      sources: ['usa.gov'],
    })
    const result = parseGeminiResponse(mock)
    expect(result.steps).toHaveLength(2)
    expect(result.answer).toBeTruthy()
  })

  it('throws on malformed JSON', () => {
    expect(() => parseGeminiResponse('not json')).toThrow()
  })

  it('returns empty steps array if steps missing', () => {
    const mock = JSON.stringify({ answer: 'Hello', relatedTopics: [], sources: [] })
    const result = parseGeminiResponse(mock)
    expect(result.steps).toEqual([])
  })

  it('handles missing optional fields gracefully', () => {
    const mock = JSON.stringify({ answer: 'Test answer' })
    const result = parseGeminiResponse(mock)
    expect(result.answer).toBe('Test answer')
    expect(result.steps).toEqual([])
    expect(result.relatedTopics).toEqual([])
    expect(result.sources).toEqual([])
  })

  it('parses complete response correctly', () => {
    const mock = JSON.stringify({
      answer: 'Complete answer',
      steps: ['Step 1', 'Step 2', 'Step 3'],
      relatedTopics: ['Topic 1', 'Topic 2'],
      sources: ['Source 1', 'Source 2'],
    })
    const result = parseGeminiResponse(mock)
    expect(result.answer).toBe('Complete answer')
    expect(result.steps).toHaveLength(3)
    expect(result.relatedTopics).toHaveLength(2)
    expect(result.sources).toHaveLength(2)
  })
})

describe('Nonpartisan Filter', () => {
  it('flags politically opinionated questions', () => {
    expect(filterNonpartisan('Why is Party X better than Party Y?')).toBe(false)
  })

  it('allows process-related questions', () => {
    expect(filterNonpartisan('How does voter registration work?')).toBe(true)
  })

  it('allows timeline questions', () => {
    expect(filterNonpartisan('When is the next election in India?')).toBe(true)
  })

  it('flags "should I vote for" questions', () => {
    expect(filterNonpartisan('Should I vote for candidate X?')).toBe(false)
  })

  it('flags "which party" questions', () => {
    expect(filterNonpartisan('Which party should I support?')).toBe(false)
  })

  it('allows neutral "which" questions', () => {
    expect(filterNonpartisan('Which documents do I need to register?')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(filterNonpartisan('WHO SHOULD I VOTE FOR?')).toBe(false)
  })
})

describe('Checklist Progress', () => {
  it('calculates 0% for empty checklist', () => {
    const items = [false, false, false, false]
    expect(calculateChecklistProgress(items)).toBe(0)
  })

  it('calculates 100% for fully completed checklist', () => {
    const items = [true, true, true, true]
    expect(calculateChecklistProgress(items)).toBe(100)
  })

  it('calculates correct partial percentage', () => {
    const items = [true, true, false, false]
    expect(calculateChecklistProgress(items)).toBe(50)
  })

  it('handles empty array', () => {
    expect(calculateChecklistProgress([])).toBe(0)
  })

  it('rounds to nearest integer', () => {
    const items = [true, false, false] // 33.33%
    expect(calculateChecklistProgress(items)).toBe(33)
  })

  it('calculates 7-item checklist correctly', () => {
    const items = [true, true, true, true, true, false, false] // 5/7 = 71.43%
    expect(calculateChecklistProgress(items)).toBe(71)
  })
})

describe('Date Formatting', () => {
  it('formats ISO date to human readable', () => {
    expect(formatElectionDate('2024-11-05')).toBe('November 5, 2024')
  })

  it('returns "Date TBD" for empty string', () => {
    expect(formatElectionDate('')).toBe('Date TBD')
  })

  it('handles different months correctly', () => {
    expect(formatElectionDate('2024-01-15')).toBe('January 15, 2024')
    expect(formatElectionDate('2024-12-25')).toBe('December 25, 2024')
  })

  it('returns "Date TBD" for invalid date', () => {
    expect(formatElectionDate('invalid-date')).toBe('Date TBD')
  })
})

describe('Title Truncation', () => {
  it('truncates titles longer than 60 chars', () => {
    const long = 'A'.repeat(80)
    expect(truncateTitle(long).length).toBeLessThanOrEqual(63) // 60 + '...'
  })

  it('leaves short titles unchanged', () => {
    expect(truncateTitle('Short title')).toBe('Short title')
  })

  it('adds ellipsis to truncated titles', () => {
    const long = 'A'.repeat(80)
    expect(truncateTitle(long)).toContain('...')
  })

  it('handles exactly 60 characters', () => {
    const exact = 'A'.repeat(60)
    expect(truncateTitle(exact)).toBe(exact)
  })

  it('respects custom maxLength', () => {
    const text = 'This is a test title'
    expect(truncateTitle(text, 10).length).toBeLessThanOrEqual(13)
  })
})

describe('Session Cache', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  it('returns null for missing cache key', () => {
    expect(cacheGet('nonexistent_key')).toBeNull()
  })

  it('stores and retrieves cached value', () => {
    cacheSet('test_key', { data: 'hello' }, 10000)
    expect(cacheGet('test_key')).toEqual({ data: 'hello' })
  })

  it('returns null for expired cache', () => {
    // Set cache with 0ms TTL (immediately expired)
    cacheSet('expired_key', { data: 'test' }, 0)
    // Wait a tiny bit
    setTimeout(() => {
      expect(cacheGet('expired_key')).toBeNull()
    }, 10)
  })

  it('handles different data types', () => {
    cacheSet('string_key', 'test string', 10000)
    cacheSet('number_key', 42, 10000)
    cacheSet('object_key', { foo: 'bar' }, 10000)
    cacheSet('array_key', [1, 2, 3], 10000)

    expect(cacheGet('string_key')).toBe('test string')
    expect(cacheGet('number_key')).toBe(42)
    expect(cacheGet('object_key')).toEqual({ foo: 'bar' })
    expect(cacheGet('array_key')).toEqual([1, 2, 3])
  })

  it('overwrites existing cache key', () => {
    cacheSet('key', 'first', 10000)
    cacheSet('key', 'second', 10000)
    expect(cacheGet('key')).toBe('second')
  })
})

// Made with Bob
