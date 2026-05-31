interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Retrieves a cached value from sessionStorage if it exists and hasn't expired
 * @param key - The cache key
 * @returns The cached data or null if not found or expired
 */
export function cacheGet<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key)
    if (!item) return null

    const entry: CacheEntry<T> = JSON.parse(item)
    const now = Date.now()

    // Check if cache has expired
    if (now - entry.timestamp > entry.ttl) {
      sessionStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    // If parsing fails or any error occurs, return null
    return null
  }
}

/**
 * Stores a value in sessionStorage with a TTL (time to live)
 * @param key - The cache key
 * @param data - The data to cache
 * @param ttl - Time to live in milliseconds
 */
export function cacheSet<T>(key: string, data: T, ttl: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // Silently fail if sessionStorage is full or unavailable
    console.warn('Failed to set cache:', error)
  }
}

/**
 * Removes a cached value from sessionStorage
 * @param key - The cache key to remove
 */
export function cacheRemove(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    // Silently fail
  }
}

/**
 * Clears all cached values from sessionStorage
 */
export function cacheClear(): void {
  try {
    sessionStorage.clear()
  } catch (error) {
    // Silently fail
  }
}

// Made with Bob
