# Browser Assistant - Troubleshooting Guide

## Assistant Panel Not Opening

If the assistant panel is not opening, follow these steps to debug:

### Step 1: Check Extension Installation

1. Open Chrome and go to `chrome://extensions/`
2. Make sure "Developer mode" is enabled (top right toggle)
3. Verify the "Browser Assistant" extension is listed and enabled
4. If not installed, click "Load unpacked" and select the extension folder

### Step 2: Check Console for Errors

1. Open the webpage where you want to use the assistant
2. Press F12 to open Chrome DevTools
3. Go to the "Console" tab
4. Look for any error messages related to the extension
5. Common errors to look for:
   - "Extension context invalidated"
   - "Cannot read property of undefined"
   - "Content script not loaded"

### Step 3: Test with Debug Page

1. Open `debug.html` in Chrome
2. Click the test buttons to check:
   - Extension API availability
   - Panel creation
   - Console logs
3. Check the debug information displayed on the page

### Step 4: Verify Content Script Injection

1. In Chrome DevTools, go to the "Sources" tab
2. Look for "Content scripts" in the left panel
3. Check if `content.js` is listed and loaded
4. If not, the content script may not be injecting properly

### Step 5: Check Manifest Permissions

1. Open `manifest.json`
2. Verify the content script matches are correct:
   ```json
   "content_scripts": [
     {
       "matches": ["<all_urls>"],
       "js": ["content.js"],
       "css": ["content.css"]
     }
   ]
   ```

### Step 6: Test Message Passing

1. Open the popup (click extension icon)
2. Open Chrome DevTools Console
3. Click "Open Assistant" in the popup
4. Check console for messages like:
   - "Popup: Opening assistant..."
   - "BrowserAssistant: Received message:"
   - "BrowserAssistant: Toggle called"

### Common Issues and Solutions

#### Issue: "Extension context invalidated"
**Solution:** Reload the extension in `chrome://extensions/`

#### Issue: Content script not loading
**Solution:** 
1. Check if the page URL matches the manifest matches
2. Try refreshing the page
3. Check for JavaScript errors on the page

#### Issue: Panel created but not visible
**Solution:**
1. Check if the panel has the correct CSS positioning
2. Look for z-index conflicts
3. Verify the panel is not hidden behind other elements

#### Issue: Message passing fails
**Solution:**
1. Ensure the popup is sending messages to the correct tab
2. Check if the content script is listening for messages
3. Verify the message format matches what the content script expects

### Debug Commands

You can also test the extension manually in the console:

```javascript
// Check if assistant exists
console.log(window.browserAssistant);

// Manually toggle assistant
if (window.browserAssistant) {
  window.browserAssistant.toggleAssistant();
}

// Check if panel exists
console.log(document.getElementById('browser-assistant-panel'));

// Manually create panel
const panel = document.createElement('div');
panel.id = 'browser-assistant-panel';
panel.style.cssText = 'position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: white; z-index: 10000;';
document.body.appendChild(panel);
```

### Still Having Issues?

1. Check the browser console for specific error messages
2. Try the extension on a simple HTML page (like `test.html`)
3. Verify your Chrome version supports Manifest V3
4. Check if any other extensions are interfering
5. Try disabling other extensions temporarily

### Getting Help

If you're still having issues:
1. Copy the exact error messages from the console
2. Note which browser version you're using
3. Describe the steps you took before the issue occurred
4. Check if the issue happens on all websites or just specific ones
