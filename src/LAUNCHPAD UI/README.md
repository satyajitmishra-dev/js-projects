# Launchpad UI - Chrome Extension

## 🚀 Installation Instructions

### Method 1: Load Unpacked Extension (For Development/Testing)

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to this folder: `c:\LEARN JAVASCIRPT\JS_Beginner_Projects\src\LAUNCHPAD UI`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Launchpad UI - Premium New Tab" in your extensions list
   - Open a new tab to see your Launchpad UI!

### Method 2: Pack and Install (For Distribution)

1. **Pack the Extension**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Pack extension"
   - Select the extension root directory: `c:\LEARN JAVASCIRPT\JS_Beginner_Projects\src\LAUNCHPAD UI`
   - Click "Pack Extension"
   - This creates a `.crx` file

2. **Install the Packed Extension**
   - Drag and drop the `.crx` file onto the `chrome://extensions/` page
   - Click "Add extension" when prompted

---

## 📋 Features

✨ **Premium Design**
- Beautiful glassmorphism UI
- Animated gradient background
- Smooth micro-interactions

🔍 **Google Search**
- Quick search bar with voice input
- Instant Google search integration

⏰ **Time & Date**
- Real-time clock display
- Current date information

🌤️ **Weather**
- Live weather based on your location
- Temperature, feels like, and humidity
- Animated weather icons

✅ **Tasks/Reminders**
- Add and manage tasks
- Check off completed items
- Persistent storage

💬 **Daily Quotes**
- Inspirational quotes
- Auto-refresh daily

🚀 **Quick Apps**
- One-click access to favorite websites
- Add custom apps
- Delete unwanted apps

📰 **Tech News**
- Latest technology news
- Direct links to articles

🎨 **Dark Mode**
- Toggle between light and dark themes
- Smooth theme transitions

---

## 🔧 Customization

### Adding Custom Quick Apps

1. Click the "+ Add App" button
2. Enter app name and URL
3. Click "Add App"
4. Your custom app appears with a favicon

### Removing Apps

- Hover over any app button
- Click the × button that appears
- App is removed (can be re-added later)

### Managing Tasks

- Type in the task input field
- Press Enter to add
- Click checkbox to mark complete
- Click trash icon to delete

---

## 🔑 Keyboard Shortcuts

- `Ctrl + K` - Command Palette
- `Ctrl + D` - Toggle dark mode
- `Ctrl + N` - Focus task input
- `Ctrl + F` - Toggle Focus Mode
- `Escape` - Close panels/modals

---

## 🛠️ Technical Details

**Built With:**
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Google Fonts (Inter)
- SortableJS for drag-and-drop
- Canvas Confetti for celebrations

**APIs Used:**
- OpenWeatherMap API (Weather data)
- DummyJSON Quotes API (Daily quotes)
- GNews API (Tech news)
- Google Favicon API (App icons)
- GitHub Contributions API (Contribution grid)

**Browser Compatibility:**
- Chrome 88+
- Edge 88+
- Brave
- Any Chromium-based browser

---

## 📦 File Structure

```
LAUNCHPAD UI/
├── manifest.json          # Chrome extension manifest
├── launchpadUi.html      # Main HTML file
├── src/
│   ├── css/
│   │   ├── style.css           # Main styles
│   │   ├── animations.css      # Animation library
│   │   ├── darkTheme.css       # Dark mode styles
│   │   ├── responsive.css      # Responsive design
│   │   └── custom-apps.css     # Quick apps styles
│   ├── js/
│   │   └── script.js           # Main JavaScript
│   └── favicon.ico             # Extension icon
└── README.md             # This file
```

---

## 🐛 Troubleshooting

### Extension not loading?
- Make sure Developer mode is enabled
- Check that you selected the correct folder
- Look for errors in the Extensions page

### Weather not showing?
- Allow location permissions when prompted
- Check your internet connection
- Verify the API key is valid

### News not loading?
- Check internet connection
- API might have rate limits
- Fallback news will display if API fails

### Tasks not saving?
- Check browser storage permissions
- Clear browser cache and reload
- Ensure localStorage is enabled

---

## 🔄 Updates

To update the extension after making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the Launchpad UI card
3. Open a new tab to see changes

---

## 📝 Privacy

This extension:
- ✅ Stores data locally in your browser
- ✅ Uses your location only for weather
- ✅ Does NOT collect or send personal data
- ✅ All data stays on your device

---

## 🎯 Future Enhancements

- [ ] Customizable backgrounds
- [ ] More widget options
- [ ] Export/import settings
- [ ] Sync across devices
- [ ] Custom themes
- [ ] More API integrations

---

## 👨‍💻 Developer

**Satyajit Mishra**
- GitHub: [@satyajit-mishra-dev](https://github.com/satyajit-mishra-dev)
- LinkedIn: [satyajitmishra1](https://linkedin.com/in/satyajitmishra1)

---

## 📄 License

This project is open source and available for personal use.

---

## 🙏 Credits

- Icons: Font Awesome
- Fonts: Google Fonts
- Weather: OpenWeatherMap
- Quotes: DummyJSON
- News: GNews.io
- GitHub: GitHub Contributions API

---

**Enjoy your premium new tab experience! 🎉**
