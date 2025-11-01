# Quick Start Guide

## 🎯 First Time Setup (5 minutes)

### Step 1: Get the App Running
The development server is already running at http://localhost:5173

### Step 2: Set Up Your Verses

#### Option A: Use the Sample CSV (Easiest)
1. The project includes a `sample-verses.csv` file with 10 popular verses
2. If you want to use it locally, you'll need to host it somewhere (see Option B)

#### Option B: Create Your Own Google Sheets (Recommended)
1. **Create a new Google Sheet** with these exact columns:
   ```
   Verse Text | Bible Version | Verse Reference
   ```

2. **Add your verses**, for example:
   ```
   For God so loved the world... | NIV | John 3:16
   I can do all this through... | NIV | Philippians 4:13
   ```

3. **Publish as CSV**:
   - Click: File → Share → Publish to web
   - In the dropdown, select "Comma-separated values (.csv)"
   - Click "Publish"
   - Copy the URL (looks like: https://docs.google.com/spreadsheets/d/e/...)

4. **In the App**:
   - Click "⚙️ Settings"
   - Paste your CSV URL
   - The verses will load automatically!

### Step 3: Start Learning!

#### Learn Mode 📚
- Browse through verses
- Practice hiding/showing references
- Build familiarity with each verse

#### Practice Games 🎮
Choose from 3 game modes:

1. **Fill in the Blank** - Type missing words
2. **Word Order** - Arrange scrambled words
3. **Type It Out** - Type the complete verse

---

## 🔑 Optional: Use Different Bible Versions

Want to see verses in different translations? Use API.Bible!

### Setup API.Bible

1. **Get Free API Key**:
   - Visit: https://scripture.api.bible
   - Sign up (it's free!)
   - Get your API key from the dashboard

2. **Configure in App**:
   - Go to Settings (⚙️)
   - Select "Use API.Bible version"
   - Enter your API key
   - Choose your preferred Bible version (KJV, ESV, etc.)

3. **Benefits**:
   - Access 1000+ Bible translations
   - Automatic caching (reduces API calls)
   - Switch versions anytime

---

## 💡 Pro Tips

### Verse CSV Format
- Use quotes around verse text if it contains commas
- Keep references consistent (e.g., always "John 3:16" not "Jn 3:16")
- The app works best with complete verses

### Practice Strategy
1. Start in **Learn Mode** - Read through all verses 2-3 times
2. Use **Type It Out** - Great for initial memorization
3. Try **Fill in the Blank** - Tests specific words
4. Master with **Word Order** - Ensures word-perfect recall

### Performance
- Settings are saved automatically (no login needed)
- API responses are cached for 24 hours
- Clear cache in Settings if you need fresh data
- Works offline once verses are loaded (except API features)

---

## 📱 Using the App

### Navigation
- **Learn**: Study verses with show/hide reference
- **Practice**: Play memory games
- **Settings**: Configure data sources and preferences

### Settings Options
- **CSV URL**: Your Google Sheets published CSV link
- **Version Type**: Custom (from CSV) or API.Bible
- **API Key**: Your API.Bible key (if using API)
- **Bible Version**: Choose translation (if using API)
- **Show Hints**: Toggle hints in practice games

---

## 🐛 Troubleshooting

### "No verses loaded"
- Check your CSV URL is correct
- Make sure the sheet is published (not just shared)
- Verify the CSV has the correct format (3 columns)

### "Failed to load verses"
- Check your internet connection
- Verify the Google Sheets URL is still active
- Try republishing the sheet

### API.Bible not working
- Verify your API key is correct
- Check you've selected a Bible version
- Some verses may not be available in all translations
- Try clearing the API cache

### Verse not displaying correctly
- Check for special characters in your CSV
- Make sure verse text is in quotes if it contains commas
- Verify the reference format matches standard notation

---

## 🎓 Example Google Sheets Template

Copy this format exactly:

| Verse Text | Bible Version | Verse Reference |
|------------|---------------|-----------------|
| For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. | NIV | John 3:16 |
| I can do all this through him who gives me strength. | NIV | Philippians 4:13 |
| Trust in the Lord with all your heart and lean not on your own understanding. | NIV | Proverbs 3:5 |

**Important**: 
- First row MUST be headers
- Each verse gets its own row
- Keep it simple and consistent

---

## 🚀 Ready to Start?

1. ✅ Dev server running at http://localhost:5173
2. ✅ Create your Google Sheets CSV
3. ✅ Add URL in Settings
4. ✅ Start learning!

Happy memorizing! 📖✨
