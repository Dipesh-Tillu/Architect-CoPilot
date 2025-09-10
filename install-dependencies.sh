#!/bin/bash

# Browser Assistant - Dependency Installation Script

echo "🚀 Installing Browser Assistant Dependencies"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install Babel preset
echo "📦 Installing Babel preset..."
npm install --save-dev @babel/preset-env

if [ $? -eq 0 ]; then
    echo "✅ Babel preset installed successfully"
else
    echo "❌ Failed to install Babel preset"
    exit 1
fi

# Build the extension
echo "🔨 Building the extension..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Extension built successfully"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' in the top right"
    echo "3. Click 'Load unpacked' and select the 'dist' folder"
    echo "4. Click the extension icon and configure your OpenAI API key"
    echo ""
    echo "🎉 Setup complete! The extension is ready to use."
else
    echo "❌ Failed to build the extension"
    exit 1
fi
