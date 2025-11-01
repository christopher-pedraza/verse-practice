import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchCSVData } from './services/csvService';
import { bibleApiService } from './services/bibleApiService';
import Settings from './components/Settings';
import VerseViewer from './components/VerseViewer';
import PracticeGames from './components/PracticeGames';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('learn');
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get default CSV URL from environment
  const defaultCsvUrl = import.meta.env.VITE_DEFAULT_CSV_URL || '';

  // Persistent settings using localStorage
  const [settings, setSettings] = useLocalStorage('bibleVerseSettings', {
    csvUrl: '',
    useApiVersion: false,
    bibleApiKey: '',
    selectedBibleId: '',
    selectedBibleName: '',
    selectedLanguage: 'eng',
    showHints: true
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  
  // States for header language/version selectors
  const [languages, setLanguages] = useState([]);
  const [bibles, setBibles] = useState([]);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  // Initialize CSV URL with default if not set
  useEffect(() => {
    if (!settings.csvUrl && defaultCsvUrl) {
      setSettings({ ...settings, csvUrl: defaultCsvUrl });
    }
  }, []);

  // Load languages for header dropdown
  useEffect(() => {
    if (settings.useApiVersion) {
      const apiKey = settings.bibleApiKey || import.meta.env.VITE_BIBLE_API_KEY;
      if (apiKey) {
        bibleApiService.getLanguages(apiKey).then(setLanguages).catch(console.error);
      }
    }
  }, [settings.useApiVersion, settings.bibleApiKey]);

  // Load bibles when language changes
  useEffect(() => {
    if (settings.useApiVersion && settings.selectedLanguage) {
      const apiKey = settings.bibleApiKey || import.meta.env.VITE_BIBLE_API_KEY;
      if (apiKey) {
        bibleApiService.getBibles(apiKey, settings.selectedLanguage)
          .then(setBibles)
          .catch(console.error);
      }
    }
  }, [settings.useApiVersion, settings.selectedLanguage, settings.bibleApiKey]);

  // Load verses from CSV when URL changes
  useEffect(() => {
    if (settings.csvUrl) {
      loadVerses();
    }
  }, [settings.csvUrl]);

  const loadVerses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCSVData(settings.csvUrl);
      setVerses(data);
      if (data.length === 0) {
        setError('No verses found in CSV. Please check the format.');
      }
    } catch (err) {
      setError('Failed to load verses. Please check the CSV URL.');
      console.error(err);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>📖 Bible Verse Practice</h1>
          <div className="header-controls">
            {settings.useApiVersion && (settings.bibleApiKey || import.meta.env.VITE_BIBLE_API_KEY) ? (
              <div className="version-selector-container">
                <select
                  value={settings.selectedLanguage || 'eng'}
                  onChange={(e) => setSettings({ ...settings, selectedLanguage: e.target.value })}
                  className="header-select language-select"
                  title="Select language"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <select
                  value={settings.selectedBibleId || ''}
                  onChange={(e) => {
                    const selectedBible = bibles.find(b => b.id === e.target.value);
                    setSettings({ 
                      ...settings, 
                      selectedBibleId: e.target.value,
                      selectedBibleName: selectedBible ? selectedBible.abbreviation || selectedBible.name : ''
                    });
                  }}
                  className="header-select version-select"
                  title="Select Bible version"
                >
                  <option value="">Select Version</option>
                  {bibles.map((bible) => (
                    <option key={bible.id} value={bible.id}>
                      {bible.abbreviation || bible.name}
                    </option>
                  ))}
                </select>
                {settings.selectedBibleName && (
                  <div className="version-display" title={settings.selectedBibleName}>
                    📖 {settings.selectedBibleName}
                  </div>
                )}
              </div>
            ) : !settings.useApiVersion && verses.length > 0 ? (
              <div className="version-display" title="Using CSV version">
                📄 CSV
              </div>
            ) : null}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="theme-toggle"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${currentView === 'learn' ? 'active' : ''}`}
            onClick={() => setCurrentView('learn')}
          >
            📚 Learn
          </button>
          <button
            className={`nav-btn ${currentView === 'practice' ? 'active' : ''}`}
            onClick={() => setCurrentView('practice')}
          >
            🎮 Practice
          </button>
          <button
            className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading verses...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {currentView === 'learn' && (
          <VerseViewer verses={verses} settings={settings} />
        )}

        {currentView === 'practice' && (
          <PracticeGames verses={verses} settings={settings} />
        )}

        {currentView === 'settings' && (
          <Settings settings={settings} onSettingsChange={setSettings} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Practice and memorize Bible verses • {verses.length} verses loaded
        </p>
      </footer>
    </div>
  );
}

export default App;
