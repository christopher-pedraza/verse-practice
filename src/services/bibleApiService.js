const BIBLE_API_BASE = 'https://rest.api.bible/v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
// Default API key from environment variable (optional)
const DEFAULT_API_KEY = import.meta.env.VITE_BIBLE_API_KEY || '';

/**
 * Bible API service with caching
 */
class BibleApiService {
  constructor() {
    this.cache = this.loadCache();
  }

  /**
   * Get the API key to use (user's key or default)
   */
  getApiKey(userApiKey) {
    return userApiKey || DEFAULT_API_KEY;
  }

  /**
   * Load cache from localStorage
   */
  loadCache() {
    try {
      const cached = localStorage.getItem('bibleApiCache');
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          return data.cache;
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return {};
  }

  /**
   * Save cache to localStorage
   */
  saveCache() {
    try {
      localStorage.setItem('bibleApiCache', JSON.stringify({
        cache: this.cache,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  /**
   * Make API request with caching
   */
  async request(endpoint, apiKey) {
    const cacheKey = `${endpoint}`;
    
    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await fetch(`${BIBLE_API_BASE}${endpoint}`, {
        headers: {
          'api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache[cacheKey] = data;
      this.saveCache();
      
      return data;
    } catch (error) {
      console.error('Bible API request failed:', error);
      throw error;
    }
  }

  /**
   * Get list of available languages
   */
  async getLanguages(apiKey) {
    const effectiveKey = this.getApiKey(apiKey);
    const data = await this.request('/bibles/languages', effectiveKey);
    return data.data || [];
  }

  /**
   * Get list of available Bible versions
   */
  async getBibles(apiKey, language = 'eng') {
    const effectiveKey = this.getApiKey(apiKey);
    const data = await this.request(`/bibles?language=${language}`, effectiveKey);
    return data.data || [];
  }

  /**
   * Get a specific verse
   */
  async getVerse(apiKey, bibleId, verseReference) {
    try {
      const effectiveKey = this.getApiKey(apiKey);
      const data = await this.request(`/bibles/${bibleId}/verses/${verseReference}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false`, effectiveKey);
      return data.data;
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  /**
   * Search for a verse by reference
   */
  async searchVerse(apiKey, bibleId, query) {
    try {
      const data = await this.request(`/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=1`, apiKey);
      return data.data;
    } catch (error) {
      console.error('Error searching verse:', error);
      throw error;
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {};
    localStorage.removeItem('bibleApiCache');
  }
}

export const bibleApiService = new BibleApiService();
