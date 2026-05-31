import { useState, useEffect, useCallback } from 'react'
import { saveChecklist, loadChecklist, loadSharedChecklist, getShareableUrl } from '../services/firestoreService'
import { calculateChecklistProgress } from '../utils/electionUtils'
import { CHECKLIST_ITEMS } from '../utils/constants'

interface UseFirestoreChecklistReturn {
  items: boolean[]
  progress: number
  isLoading: boolean
  error: string | null
  toggleItem: (index: number) => void
  shareUrl: string
  loadShared: (sessionId: string) => Promise<void>
}

/**
 * Custom hook for managing checklist state with Firestore persistence
 * Automatically saves changes and calculates progress
 */
export function useFirestoreChecklist(): UseFirestoreChecklistReturn {
  const [items, setItems] = useState<boolean[]>(
    new Array(CHECKLIST_ITEMS.length).fill(false)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')

  // Calculate progress whenever items change
  const progress = calculateChecklistProgress(items)

  /**
   * Loads checklist from Firestore on mount
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if there's a shared session in URL
        const urlParams = new URLSearchParams(window.location.search)
        const sharedSession = urlParams.get('session')

        let data
        if (sharedSession) {
          data = await loadSharedChecklist(sharedSession)
        } else {
          data = await loadChecklist()
        }

        if (data && data.items) {
          setItems(data.items)
        }

        // Set share URL
        setShareUrl(getShareableUrl())
      } catch (err) {
        // Silently fail - user can still use checklist without persistence
        console.warn('Failed to load checklist:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  /**
   * Saves checklist to Firestore whenever items change
   */
  useEffect(() => {
    // Don't save on initial load
    if (isLoading) return

    const saveData = async () => {
      try {
        await saveChecklist(items)
        setError(null)
      } catch (err) {
        // Silently fail - checklist still works locally
        console.warn('Failed to save checklist:', err)
      }
    }

    saveData()
  }, [items, isLoading])

  /**
   * Toggles a checklist item
   */
  const toggleItem = useCallback((index: number) => {
    if (index < 0 || index >= items.length) {
      return
    }

    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = !newItems[index]
      return newItems
    })
  }, [items.length])

  /**
   * Loads a shared checklist by session ID
   */
  const loadShared = useCallback(async (sessionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await loadSharedChecklist(sessionId)
      
      if (data && data.items) {
        setItems(data.items)
        setShareUrl(getShareableUrl())
        setError(null)
      } else {
        setError('Shared checklist not found')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load shared checklist')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    items,
    progress,
    isLoading,
    error,
    toggleItem,
    shareUrl,
    loadShared,
  }
}

// Made with Bob
