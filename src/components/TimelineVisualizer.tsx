import React from 'react'

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface CountryTimeline {
  [country: string]: TimelineEvent[]
}

const COUNTRY_TIMELINES: CountryTimeline = {
  'United States': [
    { date: 'Jan-Feb', title: 'Primaries Begin', description: 'State primary elections start' },
    { date: 'Jul-Aug', title: 'National Conventions', description: 'Parties nominate candidates' },
    { date: 'Sep-Oct', title: 'Presidential Debates', description: 'Candidates debate key issues' },
    { date: 'Nov', title: 'Election Day', description: 'First Tuesday after first Monday' },
    { date: 'Dec', title: 'Electoral College', description: 'Electors cast official votes' },
    { date: 'Jan', title: 'Inauguration', description: 'New president takes office' },
  ],
  'United Kingdom': [
    { date: 'Week 1', title: 'Parliament Dissolved', description: 'Campaign period begins' },
    { date: 'Week 2-4', title: 'Campaigning', description: 'Parties campaign across constituencies' },
    { date: 'Week 5', title: 'Final Debates', description: 'Leaders debate on TV' },
    { date: 'Week 6', title: 'Election Day', description: 'Polling stations open 7am-10pm' },
    { date: 'Week 6+1', title: 'Results', description: 'New government formed' },
  ],
  'India': [
    { date: 'Phase 1', title: 'Voting Begins', description: 'First phase of polling' },
    { date: 'Phase 2-6', title: 'Multi-Phase Voting', description: 'Staggered voting across states' },
    { date: 'Phase 7', title: 'Final Phase', description: 'Last day of polling' },
    { date: 'Counting Day', title: 'Results Declared', description: 'Votes counted nationwide' },
    { date: 'Formation', title: 'Government Forms', description: 'Coalition negotiations if needed' },
  ],
  'Canada': [
    { date: 'Day 1', title: 'Writ Dropped', description: 'Election officially called' },
    { date: 'Week 2-4', title: 'Campaigning', description: 'Leaders tour the country' },
    { date: 'Week 5', title: 'Debates', description: 'English and French debates' },
    { date: 'Week 6', title: 'Election Day', description: 'Polls open across time zones' },
    { date: 'Week 6+1', title: 'Government Forms', description: 'PM appointed by Governor General' },
  ],
  'Australia': [
    { date: 'Week 1', title: 'Writs Issued', description: 'Election officially announced' },
    { date: 'Week 2-4', title: 'Campaign Period', description: 'Minimum 33 days' },
    { date: 'Week 5', title: 'Pre-poll Voting', description: 'Early voting opens' },
    { date: 'Week 6', title: 'Election Day', description: 'Compulsory voting' },
    { date: 'Week 6+1', title: 'Results Finalized', description: 'Postal votes counted' },
  ],
}

interface TimelineVisualizerProps {
  country: string
  className?: string
}

/**
 * Displays election timeline for selected country
 * Uses hardcoded timelines for major democracies
 */
export const TimelineVisualizer = React.memo<TimelineVisualizerProps>(
  ({ country, className = '' }) => {
    const timeline = COUNTRY_TIMELINES[country]

    if (!timeline) {
      return (
        <div
          className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}
        >
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Timeline not available for {country}
          </p>
        </div>
      )
    }

    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Election Timeline: {country}
        </h3>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200 dark:bg-primary-800" />

          {/* Timeline events */}
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={index} className="relative flex items-start gap-4">
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 w-16 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary-600 dark:bg-primary-400 border-4 border-white dark:border-gray-800" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {event.date}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Timeline is approximate and may vary by specific election
        </p>
      </div>
    )
  }
)

TimelineVisualizer.displayName = 'TimelineVisualizer'

// Made with Bob
