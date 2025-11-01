# 📁 Project Structure

## Overview
This Bible Verse Practice app is built with React + Vite and includes all necessary components for learning and practicing Bible verses.

## File Structure

```
verse-practice/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── Settings.jsx            # Settings configuration
│   │   ├── Settings.css            # Settings styles
│   │   ├── VerseViewer.jsx         # Verse learning component
│   │   ├── VerseViewer.css         # Verse viewer styles
│   │   ├── PracticeGames.jsx       # Practice games component
│   │   └── PracticeGames.css       # Practice games styles
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useLocalStorage.js      # LocalStorage persistence hook
│   │
│   ├── services/                    # External services
│   │   ├── csvService.js           # Google Sheets CSV parser
│   │   └── bibleApiService.js      # API.Bible integration
│   │
│   ├── App.jsx                      # Main app component
│   ├── App.css                      # Main app styles
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles
│
├── sample-verses.csv                # Example CSV file
├── QUICKSTART.md                    # Quick start guide
├── README.md                        # Full documentation
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
└── eslint.config.js                 # ESLint configuration
```

## Component Architecture

### App.jsx (Main Component)
- **State Management**: Manages verses, settings, and current view
- **Routing**: Switches between Learn, Practice, and Settings views
- **Data Loading**: Fetches verses from CSV on settings change
- **Persistence**: Uses localStorage for settings via useLocalStorage hook

### Settings.jsx
- **CSV Configuration**: Input for Google Sheets URL
- **Version Selection**: Toggle between custom and API versions
- **API Setup**: API key input and Bible version selector
- **Cache Management**: Clear API cache functionality

### VerseViewer.jsx
- **Verse Display**: Shows verses with formatting
- **Navigation**: Previous/Next buttons and verse chips
- **Reference Toggle**: Show/hide verse reference
- **API Integration**: Fetches from API.Bible if configured

### PracticeGames.jsx
- **Three Game Modes**:
  1. Fill in the Blank - Type missing words
  2. Word Order - Arrange scrambled words
  3. Type It Out - Type complete verse
- **Answer Checking**: Validates user input
- **Hint System**: Optional hints based on settings

## Services

### csvService.js
- **CSV Fetching**: Retrieves data from Google Sheets
- **CSV Parsing**: Handles quoted fields and special characters
- **Data Structure**: Returns array of verse objects

### bibleApiService.js
- **API Integration**: Connects to API.Bible
- **Caching System**: 24-hour cache to reduce API calls
- **Version Management**: Lists and selects Bible translations
- **Verse Fetching**: Retrieves verses by reference

### useLocalStorage.js (Hook)
- **Persistence**: Saves settings to browser localStorage
- **State Management**: React hook for localStorage state
- **Error Handling**: Graceful fallbacks on errors

## Data Flow

1. **User Configuration** (Settings)
   - Enter CSV URL or API key
   - Settings saved to localStorage via useLocalStorage hook

2. **Data Loading** (App.jsx)
   - CSV URL triggers fetchCSVData()
   - Verses stored in state
   - Available to all child components

3. **Verse Display** (VerseViewer/PracticeGames)
   - Receives verses as props
   - Fetches API version if configured
   - Uses cached data when available

## Key Features Implementation

### 🔄 Persistent Settings
- Implemented via `useLocalStorage` hook
- Automatically syncs with browser localStorage
- No backend or authentication required

### ⚡ API Caching
- Implemented in `bibleApiService`
- 24-hour cache duration
- Stored in localStorage
- Reduces API calls significantly

### 📊 CSV Parsing
- Handles quoted fields with commas
- Supports multi-line verses
- Flexible column parsing
- Error handling for malformed data

### 🎮 Game Logic
- **Fill in Blank**: Removes every 4th word
- **Word Order**: Fisher-Yates shuffle algorithm
- **Type It Out**: String comparison with punctuation tolerance

## Styling Approach

- **Component-Scoped CSS**: Each component has its own CSS file
- **Responsive Design**: Mobile-first with media queries
- **Consistent Theme**: Green (#4CAF50) primary color
- **Gradient Background**: Purple gradient for visual appeal
- **Accessibility**: Clear buttons, good contrast, readable fonts

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires localStorage support
- ES6+ JavaScript features
- CSS Grid and Flexbox

## Performance Optimizations

1. **API Caching**: Reduces network requests
2. **Lazy Loading**: Components loaded on demand
3. **Local State**: Settings in localStorage, not server
4. **Efficient Parsing**: CSV parsing optimized for large sheets

## Security Considerations

- API keys stored in localStorage (client-side only)
- No server-side authentication
- CORS-friendly CSV fetching
- User data never leaves browser

## Future Enhancement Ideas

- [ ] Add verse progress tracking
- [ ] Implement spaced repetition algorithm
- [ ] Add audio verse playback
- [ ] Export/import verse collections
- [ ] Multiplayer practice games
- [ ] Dark mode theme
- [ ] Offline PWA support
- [ ] Verse sharing functionality
- [ ] Statistics and progress charts

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Technologies & Libraries

- **React 19**: UI framework
- **Vite 7**: Build tool and dev server
- **API.Bible**: Bible verse API
- **Google Sheets**: CSV data source
- **localStorage**: Client-side persistence
- **CSS3**: Styling and animations

---

Built with ❤️ for Bible verse memorization
