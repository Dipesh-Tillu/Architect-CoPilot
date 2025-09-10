# Debug "Unable to connect to background service" Issue

## Quick Fix Steps

### Step 1: Test with Simple Version

I've created a simplified version without LangGraph to isolate the issue:

```bash
# Build the simple version
npm run build-simple

# This creates a dist-simple folder with a working background script
```

**Load the simple version:**
1. Go to `chrome://extensions/`
2. Remove the current extension
3. Click "Load unpacked"
4. Select the `dist-simple` folder
5. Test with `test-init.html`

### Step 2: Check Background Script Console

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Inspect views: background page"
4. Look for these messages:
   - `"Starting simple background script..."`
   - `"SimpleAssistant: Initializing..."`
   - `"SimpleAssistant: Initialization complete"`

### Step 3: Test Connection

1. Open `test-init.html` in Chrome
2. Click "Test Initialization"
3. Should show: `"Simple background script is working"`

## Common Issues and Solutions

### Issue 1: LangGraph Import Failing

**Symptoms:**
- Background script doesn't start
- No console messages
- "Receiving end does not exist" error

**Solution:**
- Use the simple version first (`dist-simple`)
- Check if LangGraph imports are causing issues
- Look for import errors in background script console

### Issue 2: Extension Not Loading

**Symptoms:**
- Extension appears but doesn't work
- No background script console available

**Solution:**
1. Check you're loading the correct folder (`dist` or `dist-simple`)
2. Verify all files are present
3. Check manifest.json is valid

### Issue 3: Chrome Storage Issues

**Symptoms:**
- Background script starts but can't save API key
- Configuration errors

**Solution:**
1. Try in regular Chrome window (not incognito)
2. Check storage permissions
3. Clear extension storage and reconfigure

## Debugging Commands

### Check Extension Status
```javascript
// In any console
chrome.runtime.getManifest();
chrome.runtime.id;
```

### Test Message Sending
```javascript
// In content script console
chrome.runtime.sendMessage({action: 'test'}, (response) => {
  console.log('Response:', response);
});
```

### Check Background Script
```javascript
// In background script console
console.log('Background script running');
console.log('Chrome runtime:', chrome.runtime);
```

## File Structure Check

Make sure your extension folder contains:

**For simple version (`dist-simple`):**
```
dist-simple/
├── background-simple.js
├── content.js
├── popup.js
├── manifest.json
├── popup.html
├── content.css
└── test-init.html
```

**For full version (`dist`):**
```
dist/
├── background.js
├── content.js
├── popup.js
├── vendors.js
├── manifest.json
├── popup.html
├── content.css
└── test-init.html
```

## Step-by-Step Debugging

### 1. Test Simple Version First
```bash
npm run build-simple
# Load dist-simple folder in Chrome
# Test with test-init.html
```

### 2. If Simple Version Works
The issue is with LangGraph imports. Check:
- Background script console for import errors
- Webpack build output for warnings
- LangGraph dependencies

### 3. If Simple Version Fails
The issue is more fundamental. Check:
- Chrome extension loading
- File permissions
- Manifest.json validity
- Chrome storage access

### 4. Check Console Logs

**Background Script Console:**
- Look for initialization messages
- Check for JavaScript errors
- Verify message listener setup

**Content Script Console:**
- Look for connection attempts
- Check for error messages
- Verify Chrome runtime availability

## Still Having Issues?

### Try This Debug Sequence:

1. **Load simple version** (`dist-simple`)
2. **Test with `test-init.html`**
3. **Check background script console**
4. **If simple works, try full version**
5. **Compare console logs between versions**

### Get Detailed Error Info:

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed requests
5. Check Application tab for storage issues

The simple version should work immediately and help identify if the issue is with LangGraph or the basic extension setup.
