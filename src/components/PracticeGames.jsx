import { useState, useEffect } from 'react';
import { bibleApiService } from '../services/bibleApiService';
import './PracticeGames.css';

export default function PracticeGames({ verses, settings }) {
  const [gameType, setGameType] = useState('fillBlank');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayVerse, setDisplayVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Game states
  const [userInput, setUserInput] = useState('');
  const [blankedWords, setBlankedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (verses.length > 0) {
      loadVerse(currentIndex);
    }
  }, [currentIndex, verses, settings.useApiVersion, settings.selectedBibleId]);

  useEffect(() => {
    if (displayVerse) {
      initializeGame();
    }
  }, [displayVerse, gameType]);

  const loadVerse = async (index) => {
    if (!verses[index]) return;

    const verse = verses[index];
    setLoading(true);

    try {
      if (settings.useApiVersion && settings.bibleApiKey && settings.selectedBibleId) {
        const verseId = formatVerseReference(verse.reference);
        const apiVerse = await bibleApiService.getVerse(
          settings.bibleApiKey,
          settings.selectedBibleId,
          verseId
        );
        setDisplayVerse({
          text: apiVerse.content.trim(),
          reference: verse.reference,
          version: settings.selectedBibleId
        });
      } else {
        setDisplayVerse({
          text: verse.text.trim(),
          reference: verse.reference,
          version: verse.version
        });
      }
    } catch (error) {
      console.error('Error loading verse:', error);
      setDisplayVerse({
        text: verse.text.trim(),
        reference: verse.reference,
        version: verse.version
      });
    } finally {
      setLoading(false);
    }
  };

  const formatVerseReference = (reference) => {
    const match = reference.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);
    if (!match) return reference;

    const book = match[1].trim();
    const chapter = match[2];
    const verseStart = match[3];
    const verseEnd = match[4];

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

  const initializeGame = () => {
    if (!displayVerse) return;

    setUserInput('');
    setGameComplete(false);
    setShowAnswer(false);
    setSelectedWords([]);
    setIsCorrect(false);

    const words = displayVerse.text.split(/\s+/);

    if (gameType === 'fillBlank') {
      // Remove every 3rd-5th word
      const blanked = words.map((word, idx) => ({
        word,
        isBlank: idx % 4 === 0 && idx > 0
      }));
      setBlankedWords(blanked);
    } else if (gameType === 'wordOrder') {
      // Shuffle all words
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  };

  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    let correct = false;

    if (gameType === 'fillBlank') {
      const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w);
      const correctWords = blankedWords
        .filter(w => w.isBlank)
        .map(w => w.word.toLowerCase().replace(/[.,!?;:"']/g, ''));
      
      correct = userWords.length === correctWords.length &&
        userWords.every((word, idx) => 
          correctWords[idx].includes(word) || word.includes(correctWords[idx])
        );
    } else if (gameType === 'wordOrder') {
      const correctOrder = displayVerse.text.toLowerCase().replace(/[.,!?;:"']/g, '');
      const userOrder = selectedWords.join(' ').toLowerCase().replace(/[.,!?;:"']/g, '');
      correct = correctOrder === userOrder;
    } else if (gameType === 'typing') {
      const correct_text = displayVerse.text.toLowerCase().replace(/[.,!?;:"']/g, '');
      const user = userInput.toLowerCase().replace(/[.,!?;:"']/g, '');
      correct = correct_text === user;
    }

    setIsCorrect(correct);
    setGameComplete(true);
  };

  const handleWordClick = (word, index) => {
    setSelectedWords([...selectedWords, word]);
    setShuffledWords(shuffledWords.filter((_, idx) => idx !== index));
  };

  const handleRemoveWord = (index) => {
    const word = selectedWords[index];
    setShuffledWords([...shuffledWords, word]);
    setSelectedWords(selectedWords.filter((_, idx) => idx !== index));
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

  if (verses.length === 0) {
    return (
      <div className="practice-games">
        <div className="empty-state">
          <h2>🎮 No verses available</h2>
          <p>Please configure your verses in Settings first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-games">
      <div className="game-header">
        <h2>🎮 Practice Games</h2>
        <div className="verse-selector-container">
          <label htmlFor="verse-select" className="verse-select-label">
            Select Verse:
          </label>
          <select
            id="verse-select"
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
            className="verse-select"
          >
            {verses.map((verse, index) => (
              <option key={verse.id} value={index}>
                {index + 1}. {verse.reference}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="game-type-selector">
        <button
          className={`game-type-btn ${gameType === 'fillBlank' ? 'active' : ''}`}
          onClick={() => setGameType('fillBlank')}
        >
          📝 Fill in the Blank
        </button>
        <button
          className={`game-type-btn ${gameType === 'wordOrder' ? 'active' : ''}`}
          onClick={() => setGameType('wordOrder')}
        >
          🔀 Word Order
        </button>
        <button
          className={`game-type-btn ${gameType === 'typing' ? 'active' : ''}`}
          onClick={() => setGameType('typing')}
        >
          ⌨️ Type It Out
        </button>
      </div>

      {loading ? (
        <div className="game-card">
          <div className="loading">Loading verse...</div>
        </div>
      ) : displayVerse ? (
        <div className="game-card">
          <div className="verse-reference-header">
            {displayVerse.reference} ({displayVerse.version})
          </div>

          {gameType === 'fillBlank' && (
            <div className="fill-blank-game">
              <div className="verse-with-blanks">
                {blankedWords.map((item, idx) => (
                  item.isBlank ? (
                    <span key={idx} className="blank-space">
                      {settings.showHints && `(${item.word.length})`} _____
                    </span>
                  ) : (
                    <span key={idx}>{item.word} </span>
                  )
                ))}
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the missing words here..."
                className="game-input"
                rows="3"
              />
            </div>
          )}

          {gameType === 'wordOrder' && (
            <div className="word-order-game">
              <div className="selected-words-area">
                {selectedWords.length === 0 ? (
                  <div className="placeholder-text">Tap words below to build the verse</div>
                ) : (
                  selectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveWord(idx)}
                      className="word-btn selected"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>
              <div className="word-bank">
                {shuffledWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWordClick(word, idx)}
                    className="word-btn"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameType === 'typing' && (
            <div className="typing-game">
              {settings.showHints && (
                <div className="hint-text">
                  First word: {displayVerse.text.split(' ')[0]}
                </div>
              )}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the entire verse here..."
                className="game-input"
                rows="5"
              />
            </div>
          )}

          <div className="game-actions">
            <button onClick={checkAnswer} className="btn-check">
              Check Answer
            </button>
            <button onClick={() => setShowAnswer(!showAnswer)} className="btn-show">
              {showAnswer ? 'Hide' : 'Show'} Answer
            </button>
          </div>

          {gameComplete && (
            <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? '✅ Correct! Well done!' : '❌ Not quite right. Keep practicing!'}
            </div>
          )}

          {showAnswer && (
            <div className="answer-display">
              <strong>Answer:</strong> {displayVerse.text}
            </div>
          )}
        </div>
      ) : null}

      <div className="game-navigation">
        <button onClick={prevVerse} disabled={currentIndex === 0} className="btn-nav">
          ← Previous
        </button>
        <button onClick={initializeGame} className="btn-nav btn-reset">
          🔄 Reset Game
        </button>
        <button onClick={nextVerse} disabled={currentIndex === verses.length - 1} className="btn-nav">
          Next →
        </button>
      </div>
    </div>
  );
}
