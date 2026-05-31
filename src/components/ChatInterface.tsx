import React, { useState, useRef, useEffect } from 'react'
import { useGeminiChat } from '../hooks/useGeminiChat'
import { StepperDisplay } from './StepperDisplay'
import { TopicChips } from './TopicChips'
import { TOPIC_SUGGESTIONS, type Country } from '../utils/constants'

interface ChatInterfaceProps {
  country: Country
  className?: string
}

/**
 * Main chat interface with Gemini AI integration
 * Includes starter chips, message history, and stepper display
 * Implements rate limiting and nonpartisan filtering
 */
export const ChatInterface = React.memo<ChatInterfaceProps>(
  ({ country, className = '' }) => {
    const [input, setInput] = useState('')
    const [lastAskTime, setLastAskTime] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    
    const { messages, isLoading, error, sendMessage } = useGeminiChat()

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input on mount
    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!input.trim() || isLoading) return

      // Rate limiting: 3 second cooldown
      const now = Date.now()
      if (now - lastAskTime < 3000) {
        return
      }

      setLastAskTime(now)
      await sendMessage(input.trim(), country)
      setInput('')
    }

    const handleTopicClick = async (topic: string) => {
      if (isLoading) return

      // Rate limiting
      const now = Date.now()
      if (now - lastAskTime < 3000) {
        return
      }

      setLastAskTime(now)
      await sendMessage(`Tell me about ${topic}`, country)
    }

    const canAsk = Date.now() - lastAskTime >= 3000

    return (
      <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Election Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask me anything about elections, voting, and civic participation
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by asking a question or selecting a topic below
              </p>
              <TopicChips
                topics={[...TOPIC_SUGGESTIONS]}
                onTopicClick={handleTopicClick}
                className="justify-center"
              />
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.role === 'assistant' && message.content.includes('steps:') ? (
                  <StepperDisplay steps={message.content.split('\n').filter(line => line.trim())} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask about voter registration, polling places, election dates..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={2}
              disabled={isLoading}
              aria-label="Ask a question about elections"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !canAsk}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? 'Sending...' : 'Ask'}
            </button>
          </div>
          {!canAsk && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Please wait {Math.ceil((3000 - (Date.now() - lastAskTime)) / 1000)}s before asking again
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    )
  }
)

ChatInterface.displayName = 'ChatInterface'

// Made with Bob
