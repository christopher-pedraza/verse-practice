import { useState, useEffect } from 'react';
import { bibleApiService } from '../services/bibleApiService';
import './Settings.css';

export default function Settings({ settings, onSettingsChange }) {
  const [languages, setLanguages] = useState([]);
  const [bibles, setBibles] = useState([]);
  const [filteredBibles, setFilteredBibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [usingDefaultKey, setUsingDefaultKey] = useState(false);

  // Check if using default API key
  useEffect(() => {
    const defaultKey = import.meta.env.VITE_BIBLE_API_KEY;
    setUsingDefaultKey(!!defaultKey && !settings.bibleApiKey);
  }, [settings.bibleApiKey]);

  // Load languages when API is enabled
  useEffect(() => {
    if (settings.useApiVersion) {
      loadLanguages();
    }
  }, [settings.useApiVersion]);

  // Load available Bibles when language changes
  useEffect(() => {
    if (settings.selectedLanguage && settings.useApiVersion) {
      loadBibles();
    }
  }, [settings.selectedLanguage, settings.bibleApiKey]);

  const loadLanguages = async () => {
    try {
      const langsData = await bibleApiService.getLanguages(settings.bibleApiKey);
      setLanguages(langsData);
      // Set default language if not set
      if (!settings.selectedLanguage && langsData.length > 0) {
        const defaultLang = langsData.find(l => l.id === 'eng') || langsData[0];
        handleSettingChange('selectedLanguage', defaultLang.id);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  };

  const loadBibles = async () => {
    setLoading(true);
    setError('');
    try {
      const biblesData = await bibleApiService.getBibles(
        settings.bibleApiKey, 
        settings.selectedLanguage || 'eng'
      );
      setBibles(biblesData);
      setFilteredBibles(biblesData);
    } catch (err) {
      setError('Failed to load Bible versions. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bibles based on search query
  useEffect(() => {
    if (bibleSearchQuery) {
      const query = bibleSearchQuery.toLowerCase();
      const filtered = bibles.filter(bible => 
        bible.name.toLowerCase().includes(query) ||
        bible.abbreviation?.toLowerCase().includes(query) ||
        bible.description?.toLowerCase().includes(query)
      );
      setFilteredBibles(filtered);
    } else {
      setFilteredBibles(bibles);
    }
  }, [bibleSearchQuery, bibles]);

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleClearCache = () => {
    bibleApiService.clearCache();
    alert('Cache cleared successfully!');
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Settings</h2>

      <div className="setting-group">
        <h3>📖 Data Source</h3>
        <label>
          Google Sheets CSV URL:
          <input
            type="text"
            value={settings.csvUrl || ''}
            onChange={(e) => handleSettingChange('csvUrl', e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="input-full"
          />
        </label>
        <p className="hint">
          Publish your Google Sheet as CSV (File → Share → Publish to web → CSV)
          <br />
          Expected columns: Verse Text, Bible Version, Verse Reference
        </p>
      </div>

      <div className="setting-group">
        <h3>📚 Bible Version Preference</h3>
        <label className="radio-option">
          <input
            type="radio"
            name="versionType"
            checked={!settings.useApiVersion}
            onChange={() => handleSettingChange('useApiVersion', false)}
          />
          <span>Use custom version from CSV</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="versionType"
            checked={settings.useApiVersion}
            onChange={() => handleSettingChange('useApiVersion', true)}
          />
          <span>Use API.Bible version</span>
        </label>
      </div>

      {settings.useApiVersion && (
        <div className="setting-group api-settings">
          <h3>🔑 API.Bible Configuration</h3>
          
          {usingDefaultKey && (
            <div className="info-banner">
              ℹ️ Using default API key. You can enter your own key below for higher rate limits.
            </div>
          )}

          <label>
            API Key {usingDefaultKey && <span className="optional-text">(Optional - using default)</span>}:
            <div className="api-key-input">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.bibleApiKey || ''}
                onChange={(e) => handleSettingChange('bibleApiKey', e.target.value)}
                placeholder={usingDefaultKey ? "Using default key" : "Enter your API.Bible key"}
                className="input-full"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="btn-toggle-visibility"
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>
          <p className="hint">
            Get your free API key at <a href="https://scripture.api.bible" target="_blank" rel="noopener noreferrer">scripture.api.bible</a>
            {usingDefaultKey && " for unlimited requests"}
          </p>

          <label>
            Language:
            <select
              value={settings.selectedLanguage || 'eng'}
              onChange={(e) => handleSettingChange('selectedLanguage', e.target.value)}
              className="input-full"
            >
              <option value="">-- Select a language --</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name} ({lang.nameLocal || lang.id})
                </option>
              ))}
            </select>
          </label>

          {settings.selectedLanguage && (
            <>
              <label>
                Search Bible Version:
                <input
                  type="text"
                  value={bibleSearchQuery}
                  onChange={(e) => setBibleSearchQuery(e.target.value)}
                  placeholder="Type to filter versions..."
                  className="input-full search-input"
                />
              </label>

              <label>
                Select Bible Version:
                <select
                  value={settings.selectedBibleId || ''}
                  onChange={(e) => handleSettingChange('selectedBibleId', e.target.value)}
                  className="input-full"
                  disabled={loading}
                  size="10"
                >
                  <option value="">-- Select a version --</option>
                  {filteredBibles.map((bible) => (
                    <option key={bible.id} value={bible.id}>
                      {bible.name} ({bible.abbreviation || bible.id})
                    </option>
                  ))}
                </select>
              </label>

              {loading && <p className="loading">Loading Bible versions...</p>}
              {error && <p className="error">{error}</p>}
              {filteredBibles.length === 0 && !loading && bibleSearchQuery && (
                <p className="hint">No versions found matching "{bibleSearchQuery}"</p>
              )}

              <button onClick={handleClearCache} className="btn-secondary">
                Clear API Cache
              </button>
            </>
          )}
        </div>
      )}

      <div className="setting-group">
        <h3>🎯 Practice Settings</h3>
        <label>
          <input
            type="checkbox"
            checked={settings.showHints || false}
            onChange={(e) => handleSettingChange('showHints', e.target.checked)}
          />
          <span>Show hints in practice games</span>
        </label>
      </div>
    </div>
  );
}
