import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildGeminiPrompt, parseGeminiResponse, type GeminiResponse } from '../utils/electionUtils'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

/**
 * System instruction for Gemini to ensure nonpartisan responses
 */
const SYSTEM_INSTRUCTION = `You are a nonpartisan election education assistant. You only explain electoral processes, timelines, voter registration steps, and how democratic systems work. You never express opinions about candidates, parties, or political positions. If asked anything politically opinionated, respond: "I'm here to explain how elections work, not to take political sides."`

let genAI: GoogleGenerativeAI | null = null
let model: any = null

/**
 * Initializes the Gemini AI client
 */
function initializeGemini() {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    })
  }
  
  return model
}

/**
 * Sends a question to Gemini and returns the parsed response
 * @param question - The user's question
 * @param country - The selected country context
 * @param signal - Optional AbortSignal for cancellation
 * @returns Parsed Gemini response
 */
export async function askGemini(
  question: string,
  country: string,
  signal?: AbortSignal
): Promise<GeminiResponse> {
  const geminiModel = initializeGemini()
  
  const prompt = buildGeminiPrompt(question, country)
  
  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Check if request was aborted
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }
    
    // Try to extract JSON from the response
    // Gemini sometimes wraps JSON in markdown code blocks
    let jsonText = text
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }
    
    return parseGeminiResponse(jsonText)
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled')
    }
    throw error
  }
}

/**
 * Chat history item structure
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

/**
 * Manages a multi-turn conversation with Gemini
 */
export class GeminiChat {
  private history: ChatMessage[] = []
  private chat: any = null
  
  constructor() {
    const geminiModel = initializeGemini()
    this.chat = geminiModel.startChat({
      history: [],
    })
  }
  
  /**
   * Sends a message in the chat context
   * @param message - The user's message
   * @param country - The selected country context
   * @returns Parsed Gemini response
   */
  async sendMessage(message: string, country: string): Promise<GeminiResponse> {
    const prompt = buildGeminiPrompt(message, country)
    
    // Add user message to history
    this.history.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    })
    
    try {
      const result = await this.chat.sendMessage(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      let jsonText = text
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      }
      
      const parsed = parseGeminiResponse(jsonText)
      
      // Add assistant response to history
      this.history.push({
        role: 'assistant',
        content: parsed.answer,
        timestamp: Date.now(),
      })
      
      return parsed
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Gets the chat history
   */
  getHistory(): ChatMessage[] {
    return [...this.history]
  }
  
  /**
   * Clears the chat history
   */
  clearHistory(): void {
    this.history = []
    const geminiModel = initializeGemini()
    this.chat = geminiModel.startChat({
      history: [],
    })
  }
}

// Made with Bob
