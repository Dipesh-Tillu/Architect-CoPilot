# Browser Assistant - Installation Guide

## Prerequisites

Before installing the Browser Assistant extension, make sure you have:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Chrome Browser** (version 88 or higher)
   - Download from: https://www.google.com/chrome/

3. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys

## Installation Methods

### Method 1: Automated Installation (Recommended)

Run the automated installation script:

```bash
./install-dependencies.sh
```

This script will:
- Install all required dependencies
- Build the extension
- Provide next steps for Chrome installation

### Method 2: Manual Installation

1. **Install Dependencies:**
   ```bash
   npm install
   npm install --save-dev @babel/preset-env
   ```

2. **Build the Extension:**
   ```bash
   npm run build
   ```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist` folder

## Development Setup

For development with hot reloading:

```bash
# Start development mode
npm run dev

# This will watch for changes and rebuild automatically
```

## Project Structure

```
browser-assistant/
├── src/                    # Source files
│   ├── background.js       # Background script
│   ├── content.js          # Content script
│   ├── popup.js            # Popup script
│   └── langgraph-agent.js  # LangGraph agent
├── dist/                   # Built extension (after npm run build)
├── manifest.json           # Extension manifest
├── popup.html              # Popup interface
├── content.css             # Content styles
├── webpack.config.js       # Webpack configuration
├── package.json            # Dependencies
└── install-dependencies.sh # Installation script
```

## Configuration

1. **Load the Extension:**
   - Follow the installation steps above
   - The extension should appear in your Chrome toolbar

2. **Configure API Key:**
   - Click the extension icon
   - Enter your OpenAI API key
   - Click "Save" and "Test"

3. **Test the Extension:**
   - Open any webpage
   - Click the extension icon
   - Click "Open Assistant"
   - The assistant panel should slide in from the right

## Troubleshooting

### Common Issues

1. **"Extension not loading"**
   - Make sure you selected the `dist` folder, not the root folder
   - Check that the build completed successfully

2. **"API key not working"**
   - Verify your OpenAI API key is correct
   - Check that you have credits in your OpenAI account

3. **"Build errors"**
   - Make sure Node.js is installed
   - Run `npm install` to install dependencies
   - Check the console for specific error messages

### Debug Mode

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for error messages from the extension
4. Check the Network tab for API call failures

## Dependencies

The extension uses the following key packages:

- **@langchain/core**: Core LangChain functionality
- **@langchain/langgraph**: LangGraph agent framework
- **@langchain/openai**: OpenAI integration
- **webpack**: Module bundler
- **babel**: JavaScript transpiler

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look at the console for error messages
3. Verify all dependencies are installed correctly
4. Make sure your OpenAI API key is valid

## Next Steps

After installation:

1. Test the extension on different websites
2. Try asking various questions about page content
3. Experiment with different query types
4. Check the conversation history feature
5. Explore the thread-based conversation management
