# 📖 Bible Verse Practice App

A web application to help you learn and memorize Bible verses through interactive games and practice exercises.

## ✨ Features

- **📚 Verse Learning**: Browse and study verses with option to show/hide references
- **🎮 Practice Games**: Three different game modes to help memorize verses
  - Fill in the Blank
  - Word Order Challenge
  - Type It Out
- **📊 CSV Data Import**: Load verses from a published Google Sheets CSV
- **🌐 Bible API Integration**: Fetch verses in different Bible versions using API.Bible
- **💾 Persistent Settings**: All settings saved locally (no login required)
- **⚡ Smart Caching**: Reduces API calls with 24-hour cache

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd verse-practice
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 📝 Setting Up Your Google Sheets CSV

1. Create a Google Sheet with 3 columns:
   - Column 1: Verse Text
   - Column 2: Bible Version
   - Column 3: Verse Reference (e.g., "John 3:16")

2. Publish your sheet as CSV:
   - File → Share → Publish to web
   - Choose "Comma-separated values (.csv)"
   - Copy the URL

3. Paste the URL in Settings

### Example CSV Format
```csv
Verse Text,Bible Version,Verse Reference
"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",NIV,John 3:16
"I can do all this through him who gives me strength.",NIV,Philippians 4:13
```

## 🔑 API.Bible Setup (Optional)

1. Visit [scripture.api.bible](https://scripture.api.bible) and create a free account
2. Get your API key
3. In Settings, enable "Use API.Bible version"
4. Enter your API key
5. Select your preferred Bible version

## 🎯 How to Use

### Learning Mode
- View verses one at a time
- Click "Show Reference" to reveal the verse location
- Navigate between verses using Previous/Next buttons
- Click any verse chip to jump directly to it

### Practice Games

**Fill in the Blank**
- Some words are hidden from the verse
- Type the missing words in the text box
- Click "Check Answer" to verify

**Word Order Challenge**
- All words are shuffled
- Tap words in the correct order to rebuild the verse
- Click a selected word to remove it

**Type It Out**
- Type the entire verse from memory
- First word is shown as a hint (optional)
- Check your answer when complete

## 🛠️ Technologies Used

- React 19
- Vite
- API.Bible for verse fetching
- LocalStorage for settings persistence
- CSS3 for responsive design

## 📦 Build for Production

```bash
npm run build
```

The build files will be in the `dist` folder.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or educational purposes.