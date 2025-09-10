# "Could not establish connection" Error - Troubleshooting Guide

## Error: "Could not establish connection. Receiving end does not exist."

This error occurs when the content script can't communicate with the background script. Here's how to fix it:

## Quick Fixes (Try These First)

### 1. Reload the Extension
```bash
# Go to chrome://extensions/
# Find "Browser Assistant"
# Click the refresh/reload button
# Try using the extension again
```

### 2. Check Extension Loading
- Make sure you're loading the `dist` folder, not the root folder
- Verify the extension appears in `chrome://extensions/`
- Ensure it's enabled (not disabled)

### 3. Restart Chrome
- Close all Chrome windows completely
- Reopen Chrome
- Try the extension again

## Step-by-Step Debugging

### Step 1: Test Background Script Communication

1. **Open the test page:**
   - Navigate to `test-background.html` in Chrome
   - Click "Test Connection" button
   - Check the results

2. **Check Console Logs:**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Look for these messages:
     - `"LangGraphAssistant: Initializing..."`
     - `"LangGraphAssistant: Initialization complete"`
     - `"LangGraphAssistant: Received message: analyzePage"`

### Step 2: Check Background Script Status

1. **Inspect Background Script:**
   - Go to `chrome://extensions/`
   - Find "Browser Assistant"
   - Click "Inspect views: background page"
   - Look for error messages in the console

2. **Check for Import Errors:**
   - Look for errors related to LangGraph imports
   - Check if the background script is actually running

### Step 3: Verify File Structure

Make sure your `dist` folder contains:
```
dist/
├── background.js
├── content.js
├── popup.js
├── vendors.js
├── manifest.json
├── popup.html
└── content.css
```

### Step 4: Check Manifest Permissions

Verify `manifest.json` has:
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

## Common Causes and Solutions

### Cause 1: Background Script Not Starting

**Symptoms:**
- "Receiving end does not exist" error
- No background script console logs

**Solutions:**
1. Check for JavaScript errors in background script
2. Verify all imports are working
3. Try reloading the extension
4. Check if LangGraph imports are causing issues

### Cause 2: Extension Context Invalidated

**Symptoms:**
- Error appears after extension reload
- Content script can't send messages

**Solutions:**
1. Reload the extension completely
2. Refresh the webpage
3. Try in a new tab

### Cause 3: Incorrect Extension Loading

**Symptoms:**
- Extension appears but doesn't work
- Background script not found

**Solutions:**
1. Make sure you're loading the `dist` folder
2. Check that all files are present
3. Verify the manifest.json is correct

### Cause 4: Chrome Storage Issues

**Symptoms:**
- Configuration not saving
- Background script fails to initialize

**Solutions:**
1. Check storage permissions
2. Try in regular Chrome window (not incognito)
3. Clear extension storage and reconfigure

## Advanced Debugging

### 1. Check Background Script Logs

```javascript
// In Chrome DevTools Console (background script)
console.log('Background script running');
console.log('Chrome runtime:', chrome.runtime);
console.log('API key loaded:', this.apiKey ? 'Yes' : 'No');
```

### 2. Test Message Passing Manually

```javascript
// In content script console
chrome.runtime.sendMessage({action: 'test'}, (response) => {
  console.log('Response:', response);
});
```

### 3. Check Extension State

```javascript
// In any console
chrome.runtime.getManifest();
chrome.runtime.id;
```

## Prevention Tips

1. **Always load the `dist` folder** after building
2. **Check console logs** for errors during development
3. **Test on simple pages** first (like `test.html`)
4. **Reload extension** after making changes
5. **Use the test pages** to verify functionality

## Still Having Issues?

### Try This Debug Sequence:

1. **Open `test-background.html`**
2. **Click all test buttons**
3. **Check console for errors**
4. **If tests fail, reload extension**
5. **Try again**

### Check These Files:

1. **Background Script:** `dist/background.js` (should be large, ~19KB)
2. **Content Script:** `dist/content.js` (should be ~11KB)
3. **Manifest:** `dist/manifest.json` (should be ~755 bytes)

### Get Help:

1. Copy the exact error message
2. Note which test buttons fail
3. Check the console logs
4. Verify the extension is loaded correctly

The enhanced error handling should now provide more specific error messages to help identify the exact issue!
