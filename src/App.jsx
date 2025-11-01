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

  // Persistent settings using localStorage
  const [settings, setSettings] = useLocalStorage('bibleVerseSettings', {
    csvUrl: '',
    useApiVersion: false,
    bibleApiKey: '',
    selectedBibleId: '',
    showHints: true
  });

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>📖 Bible Verse Practice</h1>
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
