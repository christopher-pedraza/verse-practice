/**
 * Fetches and parses CSV data from Google Sheets
 * @param {string} url - The published CSV URL from Google Sheets
 * @returns {Promise<Array>} - Array of verse objects
 */
export async function fetchCSVData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error('Error fetching CSV:', error);
    throw error;
  }
}

/**
 * Parses CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array} - Array of verse objects
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const verses = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 3) {
      verses.push({
        text: values[0]?.trim() || '',
        version: values[1]?.trim() || '',
        reference: values[2]?.trim() || '',
        id: `verse-${i}`
      });
    }
  }

  return verses;
}

/**
 * Parses a single CSV line, handling quotes
 * @param {string} line - CSV line
 * @returns {Array} - Array of values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
