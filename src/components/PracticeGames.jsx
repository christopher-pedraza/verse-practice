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
  const [blankInputs, setBlankInputs] = useState({});
  const [blankStatus, setBlankStatus] = useState({});
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealedWords, setRevealedWords] = useState([]);

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
    setBlankInputs({});
    setBlankStatus({});
    setRevealedWords([]);

    const words = displayVerse.text.split(/\s+/);

    if (gameType === 'fillBlank') {
      // Randomly select 20-30% of words to blank out
      const blankCount = Math.max(2, Math.floor(words.length * 0.25));
      const blankIndices = new Set();
      
      // Don't blank the first or last word
      while (blankIndices.size < blankCount) {
        const randomIdx = Math.floor(Math.random() * (words.length - 2)) + 1;
        blankIndices.add(randomIdx);
      }
      
      const blanked = words.map((word, idx) => ({
        word,
        isBlank: blankIndices.has(idx),
        id: `blank-${idx}`
      }));
      setBlankedWords(blanked);
      
      // Initialize blank inputs
      const inputs = {};
      blanked.forEach((item, idx) => {
        if (item.isBlank) {
          inputs[idx] = '';
        }
      });
      setBlankInputs(inputs);
    } else if (gameType === 'wordOrder') {
      // Shuffle all words
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    } else if (gameType === 'typing') {
      // Initialize with first word revealed
      setRevealedWords([words[0]]);
    }
  };

  const handleBlankInput = (index, value) => {
    setBlankInputs({
      ...blankInputs,
      [index]: value
    });
  };

  const [isCorrect, setIsCorrect] = useState(false);

  const revealMoreWords = () => {
    const words = displayVerse.text.split(/\s+/);
    if (revealedWords.length < words.length) {
      setRevealedWords(words.slice(0, revealedWords.length + 3));
    }
  };

  const checkAnswer = () => {
    let correct = false;

    if (gameType === 'fillBlank') {
      const status = {};
      let allCorrect = true;
      let allFilled = true;
      
      blankedWords.forEach((item, idx) => {
        if (item.isBlank) {
          const userWord = (blankInputs[idx] || '').toLowerCase().replace(/[.,!?;:"']/g, '').trim();
          const correctWord = item.word.toLowerCase().replace(/[.,!?;:"']/g, '');
          
          if (!userWord) {
            allFilled = false;
            status[idx] = 'empty';
          } else if (userWord === correctWord) {
            status[idx] = 'correct';
          } else {
            status[idx] = 'incorrect';
            allCorrect = false;
          }
        }
      });
      
      setBlankStatus(status);
      correct = allCorrect && allFilled;
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

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newWords = [...selectedWords];
    const draggedWord = newWords[draggedIndex];
    newWords.splice(draggedIndex, 1);
    newWords.splice(index, 0, draggedWord);
    
    setSelectedWords(newWords);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
                    <span key={idx} className="blank-inline">
                      {settings.showHints && <span className="hint-length">({item.word.length})</span>}
                      <input
                        type="text"
                        className={`blank-input ${blankStatus[idx] || ''}`}
                        value={blankInputs[idx] || ''}
                        onChange={(e) => handleBlankInput(idx, e.target.value)}
                        placeholder="____"
                        style={{ width: `${Math.max(80, item.word.length * 15)}px` }}
                      />
                    </span>
                  ) : (
                    <span key={idx}>{item.word} </span>
                  )
                ))}
              </div>
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
                      className={`word-btn selected draggable ${draggedIndex === idx ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
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
              {settings.showHints && revealedWords.length > 0 && (
                <div className="hint-text">
                  <strong>Revealed words:</strong> {revealedWords.join(' ')}...
                </div>
              )}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the entire verse here..."
                className="game-input"
                rows="5"
              />
              {settings.showHints && revealedWords.length < displayVerse.text.split(/\s+/).length && (
                <button onClick={revealMoreWords} className="btn-hint">
                  💡 Show More Words
                </button>
              )}
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
