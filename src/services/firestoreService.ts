import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

/**
 * Initializes Firebase and Firestore
 */
function initializeFirebase(): Firestore {
  if (db) {
    return db
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is incomplete')
  }

  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  
  return db
}

/**
 * Checklist data structure
 */
export interface ChecklistData {
  items: boolean[]
  lastUpdated: number
  sessionId: string
}

/**
 * Generates or retrieves a session ID from localStorage
 */
function getSessionId(): string {
  let sessionId = localStorage.getItem('electiq_session_id')
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('electiq_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Saves checklist data to Firestore
 * @param items - Array of checklist item states
 * @returns Promise that resolves when save is complete
 */
export async function saveChecklist(items: boolean[]): Promise<void> {
  const firestore = initializeFirebase()
  const sessionId = getSessionId()
  
  const checklistData: ChecklistData = {
    items,
    lastUpdated: Date.now(),
    sessionId,
  }
  
  try {
    const docRef = doc(firestore, 'checklists', sessionId)
    await setDoc(docRef, checklistData)
  } catch (error) {
    console.error('Failed to save checklist:', error)
    throw new Error('Failed to save checklist to Firestore')
  }
}

/**
 * Loads checklist data from Firestore
 * @returns Checklist data or null if not found
 */
export async function loadChecklist(): Promise<ChecklistData | null> {
  const firestore = initializeFirebase()
  const sessionId = getSessionId()
  
  try {
    const docRef = doc(firestore, 'checklists', sessionId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as ChecklistData
    }
    
    return null
  } catch (error) {
    console.error('Failed to load checklist:', error)
    return null
  }
}

/**
 * Gets the shareable URL for the current checklist
 * @returns URL with session ID
 */
export function getShareableUrl(): string {
  const sessionId = getSessionId()
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?session=${sessionId}`
}

/**
 * Loads checklist from a shared session ID
 * @param sharedSessionId - The session ID from URL parameter
 * @returns Checklist data or null if not found
 */
export async function loadSharedChecklist(sharedSessionId: string): Promise<ChecklistData | null> {
  const firestore = initializeFirebase()
  
  try {
    const docRef = doc(firestore, 'checklists', sharedSessionId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Store this session ID as the current one
      localStorage.setItem('electiq_session_id', sharedSessionId)
      return docSnap.data() as ChecklistData
    }
    
    return null
  } catch (error) {
    console.error('Failed to load shared checklist:', error)
    return null
  }
}

// Made with Bob
