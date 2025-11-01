import { useState, useEffect } from 'react';
import { bibleApiService } from '../services/bibleApiService';
import './Settings.css';

export default function Settings({ settings, onSettingsChange }) {
  const [bibles, setBibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Load available Bibles when API key is provided
  useEffect(() => {
    if (settings.bibleApiKey && settings.useApiVersion) {
      loadBibles();
    }
  }, [settings.bibleApiKey]);

  const loadBibles = async () => {
    setLoading(true);
    setError('');
    try {
      const biblesData = await bibleApiService.getBibles(settings.bibleApiKey);
      setBibles(biblesData);
    } catch (err) {
      setError('Failed to load Bible versions. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <label>
            API Key:
            <div className="api-key-input">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.bibleApiKey || ''}
                onChange={(e) => handleSettingChange('bibleApiKey', e.target.value)}
                placeholder="Enter your API.Bible key"
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
          </p>

          {settings.bibleApiKey && (
            <>
              <label>
                Select Bible Version:
                <select
                  value={settings.selectedBibleId || ''}
                  onChange={(e) => handleSettingChange('selectedBibleId', e.target.value)}
                  className="input-full"
                  disabled={loading}
                >
                  <option value="">-- Select a version --</option>
                  {bibles.map((bible) => (
                    <option key={bible.id} value={bible.id}>
                      {bible.name} ({bible.abbreviation})
                    </option>
                  ))}
                </select>
              </label>

              {loading && <p className="loading">Loading Bible versions...</p>}
              {error && <p className="error">{error}</p>}

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
