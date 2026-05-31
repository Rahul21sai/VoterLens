import React, { useState, lazy, Suspense } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { CountrySelector } from './components/CountrySelector'
import { LanguageSelector } from './components/LanguageSelector'
import { ElectionChecklist } from './components/ElectionChecklist'
import { TimelineVisualizer } from './components/TimelineVisualizer'
import { CivicInfoCard } from './components/CivicInfoCard'
import { VideoLibrary } from './components/VideoLibrary'
import { useCivicInfo } from './hooks/useCivicInfo'
import { useYouTube } from './hooks/useYouTube'
import type { Country } from './utils/constants'

// Lazy load the map component for better performance
const PollingPlaceMap = lazy(() => 
  import('./components/PollingPlaceMap').then(module => ({ default: module.PollingPlaceMap }))
)

function App() {
  const [country, setCountry] = useState<Country>('USA')
  const [language, setLanguage] = useState('en')
  const [address, setAddress] = useState('')

  // Hooks for data fetching
  const { voterInfo, isLoading: civicLoading, error: civicError, fetchInfo } = useCivicInfo()
  const { videos, isLoading: videosLoading, error: videosError, loadVideos } = useYouTube()

  // Handle address submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      fetchInfo(address.trim())
    }
  }

  // Handle video search
  const handleVideoSearch = () => {
    loadVideos(country)
  }

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as Country)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ElectIQ
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your Nonpartisan Election Education Assistant
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <CountrySelector value={country} onChange={handleCountryChange} />
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            <ChatInterface country={country} className="h-[600px]" />

            {/* Voter Information Section */}
            <section aria-labelledby="voter-info-heading">
              <h2 id="voter-info-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Find Your Voter Information
              </h2>
              <form onSubmit={handleAddressSubmit} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address (e.g., 1600 Pennsylvania Ave, Washington DC)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    aria-label="Enter your address to find voter information"
                  />
                  <button
                    type="submit"
                    disabled={!address.trim() || civicLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {civicLoading ? 'Loading...' : 'Find'}
                  </button>
                </div>
              </form>

              <CivicInfoCard
                voterInfo={voterInfo}
                loading={civicLoading}
                error={civicError}
              />

              {/* Polling Place Map - Lazy Loaded */}
              {voterInfo?.pollingLocations && voterInfo.pollingLocations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Polling Locations Map
                  </h3>
                  <Suspense
                    fallback={
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
                        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                      </div>
                    }
                  >
                    <PollingPlaceMap locations={voterInfo.pollingLocations} />
                  </Suspense>
                </div>
              )}
            </section>

            {/* Educational Videos Section */}
            <section aria-labelledby="videos-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="videos-heading" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Educational Videos
                </h2>
                <button
                  onClick={handleVideoSearch}
                  disabled={videosLoading}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {videosLoading ? 'Loading...' : 'Load Videos'}
                </button>
              </div>
              <VideoLibrary
                videos={videos}
                loading={videosLoading}
                error={videosError}
              />
            </section>
          </div>

          {/* Right Column - Checklist and Timeline */}
          <div className="space-y-6">
            <ElectionChecklist />
            <TimelineVisualizer country={country} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>Nonpartisan Commitment:</strong> ElectIQ provides factual, unbiased election information only.
            </p>
            <p>
              Powered by Google Gemini AI, Civic Information API, Maps, YouTube, Firestore, and Translate
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

// Made with Bob
