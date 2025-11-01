import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchCSVData } from './services/csvService';
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
    selectedLanguage: 'eng',
    showHints: true
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  // Initialize CSV URL with default if not set
  useEffect(() => {
    if (!settings.csvUrl && defaultCsvUrl) {
      setSettings({ ...settings, csvUrl: defaultCsvUrl });
    }
  }, []);

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
            {settings.useApiVersion && settings.selectedBibleId && (
              <div className="version-display" title="Change in Settings">
                📖 {settings.selectedBibleId}
              </div>
            )}
            {!settings.useApiVersion && verses.length > 0 && (
              <div className="version-display" title="Using CSV version">
                📄 CSV
              </div>
            )}
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
