# ElectIQ - Interactive Election Education Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

**ElectIQ** is a nonpartisan, AI-powered election education platform that helps citizens understand the voting process, find polling locations, and prepare for elections. Built for the Google/Hack2Skill hackathon with a focus on code quality, security, efficiency, testing, accessibility, and Google Services integration.

## 🎯 Project Overview

ElectIQ provides factual, unbiased election information through an intelligent chat interface powered by Google Gemini AI. The platform integrates six Google services to deliver a comprehensive election education experience.

### Key Features

- **🤖 AI-Powered Chat**: Ask questions about elections, voting procedures, and civic participation
- **📍 Polling Place Finder**: Locate your nearest polling stations with interactive maps
- **✅ Election Checklist**: Track your election preparation progress with auto-save
- **📺 Educational Videos**: Curated YouTube content about elections and voting
- **🗓️ Election Timelines**: Country-specific election process visualizations
- **🌍 Multi-Country Support**: USA, India, UK election information
- **🌐 Multi-Language**: English, Hindi, Spanish, French, Arabic support
- **♿ Fully Accessible**: WCAG AA compliant with keyboard navigation

## 🏗️ Architecture

```
ElectIQ/
├── src/
│   ├── components/          # 12 React components with React.memo
│   │   ├── ChatInterface.tsx       # Main chat UI with rate limiting
│   │   ├── StepperDisplay.tsx      # Numbered steps renderer
│   │   ├── ChecklistItem.tsx       # Accessible checkbox component
│   │   ├── ProgressBadge.tsx       # Completion percentage display
│   │   ├── TopicChips.tsx          # Quick topic suggestions
│   │   ├── CountrySelector.tsx     # Country dropdown
│   │   ├── LanguageSelector.tsx    # Language switcher
│   │   ├── CivicInfoCard.tsx       # Voter information display
│   │   ├── VideoLibrary.tsx        # YouTube video grid
│   │   ├── PollingPlaceMap.tsx     # Google Maps integration
│   │   ├── ElectionChecklist.tsx   # Firestore-synced checklist
│   │   └── TimelineVisualizer.tsx  # Election timeline display
│   ├── hooks/               # 4 custom React hooks
│   │   ├── useGeminiChat.ts        # Chat state management
│   │   ├── useCivicInfo.ts         # Civic API data fetching
│   │   ├── useFirestoreChecklist.ts # Checklist persistence
│   │   └── useYouTube.ts           # Video search with caching
│   ├── services/            # 6 Google Services integrations
│   │   ├── geminiService.ts        # Gemini AI API
│   │   ├── civicService.ts         # Civic Information API
│   │   ├── mapsService.ts          # Google Maps JavaScript API
│   │   ├── firestoreService.ts     # Firebase Firestore
│   │   ├── youtubeService.ts       # YouTube Data API
│   │   └── translateService.ts     # Google Translate API
│   ├── utils/               # Utility functions
│   │   ├── electionUtils.ts        # 11 pure utility functions
│   │   ├── sanitize.ts             # XSS prevention
│   │   ├── cache.ts                # SessionStorage with TTL
│   │   └── constants.ts            # App constants
│   ├── __tests__/           # Comprehensive test suite
│   │   ├── electionUtils.test.ts   # 51 utility tests
│   │   └── components.test.tsx     # 11 component tests
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Tailwind CSS imports
├── public/                  # Static assets
├── .env.example             # Environment variable template
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.ts         # Vitest test configuration
```

## 🔧 Google Services Integration

| Service | Purpose | Implementation | Caching |
|---------|---------|----------------|---------|
| **Gemini AI** | Nonpartisan chat responses | System instruction enforcement, JSON parsing | No (real-time) |
| **Civic Information API** | Voter info & polling places | Address validation, debouncing (400ms) | 5 min TTL |
| **Google Maps JS API** | Interactive polling location maps | Lazy loading, custom markers | No (dynamic) |
| **Firebase Firestore** | Checklist persistence & sharing | Auto-save, session-based storage | No (real-time) |
| **YouTube Data API** | Educational video search | Pagination, result filtering | 15 min TTL |
| **Google Translate API** | Multi-language support | Batch translation, RTL detection | No (on-demand) |

## 🛡️ Nonpartisan Commitment

ElectIQ maintains strict political neutrality through multiple safeguards:

### 1. **Gemini System Instruction**
```typescript
const SYSTEM_INSTRUCTION = `You are a nonpartisan election education assistant.
STRICT RULES:
- Explain HOW elections work, not WHO to vote for
- Never express political opinions or preferences
- Reject partisan questions politely
- Focus on factual, procedural information only`
```

### 2. **Content Filtering**
- `filterNonpartisan()`: Detects political bias in responses
- `sanitizeQuestion()`: Removes HTML/scripts from user input
- Keyword-based rejection of partisan content

### 3. **UI Messaging**
- Clear nonpartisan disclaimer in footer
- Error messages for political questions
- Focus on "how" not "who" in all content

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Platform account
- API keys for all 6 Google services

### 1. Clone Repository
```bash
git clone https://github.com/Rahul21sai/VoterLens.git
cd VoterLens
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Civic Information API Key
VITE_CIVIC_API_KEY=your_civic_api_key_here

# Google Maps JavaScript API Key
VITE_MAPS_API_KEY=your_maps_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# YouTube Data API Key
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Translate API Key
VITE_TRANSLATE_API_KEY=your_translate_api_key_here
```

### 4. Enable Required APIs
In Google Cloud Console, enable:
- Generative Language API (Gemini)
- Google Civic Information API
- Maps JavaScript API
- Firebase (Firestore)
- YouTube Data API v3
- Cloud Translation API

### 5. Run Development Server
```bash
npm run dev
```
Open http://localhost:5173

### 6. Run Tests
```bash
npm run test
```

### 7. Build for Production
```bash
npm run build
```

## 🧪 Testing Approach

### Test Coverage
- **62 total tests** (51 utility + 11 component)
- **100% pass rate** required before UI development
- Unit tests for all utility functions
- Component tests with React Testing Library

### Test Categories
1. **Validation Tests**: Address, question, date validation
2. **Sanitization Tests**: XSS prevention, HTML stripping
3. **Formatting Tests**: Date formatting, title truncation
4. **Caching Tests**: TTL expiration, storage operations
5. **Component Tests**: Rendering, user interactions, accessibility

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## ♿ Accessibility Features

ElectIQ is WCAG AA compliant with:

- **Keyboard Navigation**: Full tab/enter/escape support
- **Screen Reader Support**: ARIA labels, roles, live regions
- **Skip Links**: Jump to main content
- **Focus Management**: Visible focus indicators (2px ring)
- **Color Contrast**: Minimum 4.5:1 ratio
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Form Labels**: All inputs have associated labels
- **Error Announcements**: aria-live for dynamic content

## 🔒 Security Measures

### Input Sanitization
- `stripHTML()`: Removes all HTML tags
- `stripScripts()`: Removes script tags and event handlers
- `sanitizeQuestion()`: Combines both for user input

### Rate Limiting
- 3-second cooldown on Ask button
- Prevents API abuse and spam

### API Key Protection
- Environment variables only
- No keys in console.log statements
- .gitignore excludes .env file

### XSS Prevention
- All user input sanitized before processing
- React's built-in XSS protection
- No dangerouslySetInnerHTML usage

## ⚡ Performance Optimizations

### Caching Strategy
- **YouTube**: 15-minute TTL in sessionStorage
- **Civic API**: 5-minute TTL in sessionStorage
- **Gemini**: No caching (real-time responses)

### Code Splitting
- Lazy loading for PollingPlaceMap component
- React.Suspense with fallback UI
- Reduces initial bundle size

### Debouncing
- 400ms delay on address input
- Reduces unnecessary API calls

### React Optimization
- React.memo on all 12 components
- useCallback for event handlers
- Prevents unnecessary re-renders

### AbortController
- Cancels in-flight Gemini requests
- Prevents race conditions

## 📊 Evaluation Axes Compliance

### 1. Code Quality ✅
- TypeScript strict mode
- ESLint + Prettier configured
- Modular architecture (components/hooks/services)
- Comprehensive JSDoc comments
- DRY principles followed

### 2. Security ✅
- Input sanitization (stripHTML, stripScripts)
- Rate limiting (3s cooldown)
- Environment variables for API keys
- No exposed secrets in code
- XSS prevention

### 3. Efficiency ✅
- SessionStorage caching (5-15 min TTL)
- Lazy loading (PollingPlaceMap)
- Debouncing (400ms on address input)
- React.memo on all components
- AbortController for request cancellation

### 4. Testing ✅
- 62 comprehensive tests
- 100% pass rate
- Unit + component tests
- Vitest + React Testing Library
- Test-driven development approach

### 5. Accessibility ✅
- WCAG AA compliant
- Keyboard navigation
- ARIA attributes (role, aria-live, aria-label)
- Skip to main content link
- 4.5:1 color contrast ratio
- Screen reader support

### 6. Google Services ✅
- 6 Google services integrated
- Proper error handling
- Caching where appropriate
- API key management
- Service-specific optimizations

## 🎨 Design Decisions

### Why React + TypeScript?
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Easier refactoring and maintenance

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support

### Why Tailwind CSS?
- Utility-first approach
- Consistent design system
- Dark mode support
- Responsive design utilities

### Why Vitest?
- Native Vite integration
- Fast test execution
- Jest-compatible API
- TypeScript support

## 🔮 Assumptions Made

1. **API Availability**: All Google APIs are accessible and functional
2. **Browser Support**: Modern browsers with ES2020+ support
3. **Internet Connection**: Required for all features
4. **API Keys**: User has valid API keys for all services
5. **Data Accuracy**: Google APIs provide accurate, up-to-date information
6. **User Literacy**: Users can read and understand English (or selected language)
7. **Address Format**: Users provide valid addresses for Civic API
8. **Storage Availability**: Browser supports sessionStorage and localStorage

## 🐛 Known Limitations

1. **Offline Mode**: Not supported (requires internet for all features)
2. **Country Coverage**: Limited to USA, India, UK
3. **Language Support**: 5 languages (EN, HI, ES, FR, AR)
4. **API Rate Limits**: Subject to Google API quotas
5. **Mobile Optimization**: Responsive but not native mobile app
6. **Real-time Updates**: Checklist sync requires manual refresh

## 🤝 Contributing

This project was built for the Google/Hack2Skill hackathon. Contributions are welcome!

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript strict mode
- Write tests for new features
- Maintain accessibility standards
- Document complex logic with JSDoc
- Run `npm run test` before committing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Cloud Platform**: For providing powerful APIs
- **Hack2Skill**: For organizing the hackathon
- **React Team**: For the amazing framework
- **Vite Team**: For the blazing-fast build tool
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For inspiration and support

## 📞 Contact

**Developer**: Rahul Vudumula  
**GitHub**: [@Rahul21sai](https://github.com/Rahul21sai)  
**Project**: [VoterLens](https://github.com/Rahul21sai/VoterLens)

---

**Built with ❤️ for democracy and civic engagement**

*ElectIQ - Empowering voters through education, not persuasion*