import { useState, useEffect } from 'react';
import { bibleApiService } from '../services/bibleApiService';
import './VerseViewer.css';

export default function VerseViewer({ verses, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayVerse, setDisplayVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    if (verses.length > 0) {
      loadVerse(currentIndex);
    }
  }, [currentIndex, verses, settings.useApiVersion, settings.selectedBibleId]);

  const loadVerse = async (index) => {
    if (!verses[index]) return;

    const verse = verses[index];
    setLoading(true);

    try {
      if (settings.useApiVersion && settings.bibleApiKey && settings.selectedBibleId) {
        // Fetch from API
        const verseId = formatVerseReference(verse.reference);
        const apiVerse = await bibleApiService.getVerse(
          settings.bibleApiKey,
          settings.selectedBibleId,
          verseId
        );
        setDisplayVerse({
          text: apiVerse.content,
          reference: verse.reference,
          version: settings.selectedBibleId
        });
      } else {
        // Use CSV version
        setDisplayVerse({
          text: verse.text,
          reference: verse.reference,
          version: verse.version
        });
      }
    } catch (error) {
      console.error('Error loading verse:', error);
      // Fallback to CSV version
      setDisplayVerse({
        text: verse.text,
        reference: verse.reference,
        version: verse.version
      });
    } finally {
      setLoading(false);
      setShowReference(false);
    }
  };

  const formatVerseReference = (reference) => {
    // Convert "John 3:16" to "JHN.3.16" format for API
    // This is a simplified version - you may need more robust parsing
    const match = reference.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);
    if (!match) return reference;

    const book = match[1].trim();
    const chapter = match[2];
    const verseStart = match[3];
    const verseEnd = match[4];

    // Map common book names to API codes (simplified)
    const bookMap = {
      'Genesis': 'GEN', 'Exodus': 'EXO', 'Matthew': 'MAT', 'Mark': 'MRK',
      'Luke': 'LUK', 'John': 'JHN', 'Romans': 'ROM', 'Psalm': 'PSA',
      'Psalms': 'PSA', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
      'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP',
      'Colossians': 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
      'Revelation': 'REV'
    };

    const bookCode = bookMap[book] || book.substring(0, 3).toUpperCase();
    return verseEnd ? 
      `${bookCode}.${chapter}.${verseStart}-${bookCode}.${chapter}.${verseEnd}` :
      `${bookCode}.${chapter}.${verseStart}`;
  };

  const nextVerse = () => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevVerse = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleReference = () => {
    setShowReference(!showReference);
  };

  if (verses.length === 0) {
    return (
      <div className="verse-viewer">
        <div className="empty-state">
          <h2>📖 No verses loaded</h2>
          <p>Please configure your Google Sheets CSV URL in Settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verse-viewer">
      <div className="verse-header">
        <h2>📖 Learn Verses</h2>
        <div className="verse-counter">
          Verse {currentIndex + 1} of {verses.length}
        </div>
      </div>

      <div className="verse-card">
        {loading ? (
          <div className="verse-loading">Loading verse...</div>
        ) : displayVerse ? (
          <>
            <div className="verse-text">
              "{displayVerse.text}"
            </div>
            
            <div className="verse-info">
              {showReference ? (
                <>
                  <div className="verse-reference">{displayVerse.reference}</div>
                  <div className="verse-version">{displayVerse.version}</div>
                </>
              ) : (
                <button onClick={toggleReference} className="btn-reveal">
                  Show Reference
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="verse-error">Failed to load verse</div>
        )}
      </div>

      <div className="verse-navigation">
        <button
          onClick={prevVerse}
          disabled={currentIndex === 0}
          className="btn-nav"
        >
          ← Previous
        </button>
        <button
          onClick={toggleReference}
          className="btn-nav btn-toggle"
        >
          {showReference ? 'Hide' : 'Show'} Reference
        </button>
        <button
          onClick={nextVerse}
          disabled={currentIndex === verses.length - 1}
          className="btn-nav"
        >
          Next →
        </button>
      </div>

      <div className="verse-list">
        <h3>All Verses</h3>
        <div className="verse-chips">
          {verses.map((verse, index) => (
            <button
              key={verse.id}
              onClick={() => setCurrentIndex(index)}
              className={`verse-chip ${index === currentIndex ? 'active' : ''}`}
            >
              {verse.reference}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
