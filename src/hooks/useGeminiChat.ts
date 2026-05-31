import { useState, useCallback, useRef } from 'react'
import { GeminiChat, type ChatMessage } from '../services/geminiService'
import { sanitizeQuestion, filterNonpartisan, type GeminiResponse } from '../utils/electionUtils'
import type { Country } from '../utils/constants'

interface UseGeminiChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string, country: Country) => Promise<void>
  clearHistory: () => void
  lastResponse: GeminiResponse | null
}

/**
 * Custom hook for managing Gemini chat state and interactions
 * Includes nonpartisan filtering, input sanitization, and error handling
 */
export function useGeminiChat(): UseGeminiChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<GeminiResponse | null>(null)
  
  const chatRef = useRef<GeminiChat | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize chat instance on first use
  const getChat = useCallback(() => {
    if (!chatRef.current) {
      chatRef.current = new GeminiChat()
    }
    return chatRef.current
  }, [])

  /**
   * Sends a message to Gemini with nonpartisan filtering and sanitization
   */
  const sendMessage = useCallback(async (message: string, country: Country) => {
    // Sanitize input
    const sanitized = sanitizeQuestion(message)
    
    if (!sanitized.trim()) {
      setError('Please enter a valid question')
      return
    }

    // Check for political bias
    if (!filterNonpartisan(sanitized)) {
      setError("I can only explain how elections work, not political opinions.")
      
      // Add rejection message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: sanitized,
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: "I'm here to explain how elections work, not to take political sides. Please ask about election processes, timelines, or voter registration instead.",
          timestamp: Date.now(),
        },
      ])
      
      return
    }

    setIsLoading(true)
    setError(null)

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      const chat = getChat()
      const response = await chat.sendMessage(sanitized, country)
      
      setLastResponse(response)
      setMessages(chat.getHistory())
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('aborted') || err.message.includes('cancelled')) {
          // Request was cancelled, don't show error
          return
        }
        setError(err.message)
      } else {
        setError('Failed to get response from Gemini')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [getChat])

  /**
   * Clears chat history and resets state
   */
  const clearHistory = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.clearHistory()
    }
    setMessages([])
    setLastResponse(null)
    setError(null)
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    lastResponse,
  }
}

// Made with Bob
