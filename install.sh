#!/bin/bash

# Browser Assistant Chrome Extension Installation Script

echo "🚀 Browser Assistant Chrome Extension Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

echo "✅ Found extension files"

# Create a zip package
echo "📦 Creating extension package..."
if command -v zip &> /dev/null; then
    zip -r browser-assistant.zip manifest.json popup.html popup.js content.js content.css background.js README.md
    echo "✅ Package created: browser-assistant.zip"
else
    echo "⚠️  zip command not found. Please manually package the files."
fi

echo ""
echo "📋 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' in the top right"
echo "3. Click 'Load unpacked' and select this directory"
echo "4. Click the extension icon in your toolbar"
echo "5. Enter your OpenAI API key in the settings"
echo "6. Click 'Save' and then 'Test' to verify"
echo ""
echo "🔑 Get your OpenAI API key from: https://platform.openai.com/api-keys"
echo ""
echo "🎉 Setup complete! The extension is ready to use."
