# Configuration Error Troubleshooting Guide

## "Error saving configuration" - Common Solutions

If you're getting an "Error saving configuration" error when trying to save your OpenAI API key, follow these steps:

### Step 1: Check Extension Installation

1. **Verify Extension is Loaded:**
   - Go to `chrome://extensions/`
   - Make sure "Browser Assistant" is listed and enabled
   - If not, reload the extension by clicking the refresh button

2. **Check for Errors:**
   - Look for any error messages in the extension list
   - Click "Details" on the extension if there are warnings

### Step 2: Check Console for Detailed Errors

1. **Open Chrome DevTools:**
   - Press F12 or right-click → "Inspect"
   - Go to the "Console" tab

2. **Look for Error Messages:**
   - Try saving the configuration again
   - Look for red error messages in the console
   - Common errors to look for:
     - "Chrome runtime not available"
     - "Failed to save API key"
     - "Extension context invalidated"

### Step 3: Verify API Key Format

1. **Check API Key:**
   - Make sure your OpenAI API key starts with `sk-`
   - Ensure there are no extra spaces or characters
   - The key should be about 50+ characters long

2. **Test API Key:**
   - Go to https://platform.openai.com/api-keys
   - Verify the key is active and has credits
   - Try creating a new key if the current one doesn't work

### Step 4: Check Chrome Storage Permissions

1. **Verify Storage Access:**
   - Go to `chrome://extensions/`
   - Click "Details" on Browser Assistant
   - Make sure "Storage" permission is granted

2. **Clear Storage if Needed:**
   - In the extension details, click "Inspect views: background page"
   - In the console, run: `chrome.storage.sync.clear()`
   - Reload the extension

### Step 5: Manual Storage Test

1. **Test Storage Manually:**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Run this command:
   ```javascript
   chrome.storage.sync.set({test: 'value'}, function() {
     console.log('Storage test:', chrome.runtime.lastError);
   });
   ```

2. **If Storage Fails:**
   - Check if Chrome is in incognito mode (extensions may have limited storage)
   - Try in a regular Chrome window
   - Check if other extensions are interfering

### Step 6: Extension Reload

1. **Reload the Extension:**
   - Go to `chrome://extensions/`
   - Find "Browser Assistant"
   - Click the refresh/reload button
   - Try saving configuration again

2. **Restart Chrome:**
   - Close all Chrome windows
   - Reopen Chrome
   - Try the extension again

### Step 7: Check Network Issues

1. **Test Internet Connection:**
   - Make sure you have internet access
   - Try visiting https://platform.openai.com

2. **Check Firewall/Proxy:**
   - Ensure Chrome can access external APIs
   - Check if corporate firewall is blocking requests

### Step 8: Debug Mode

1. **Enable Debug Logging:**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Look for messages starting with "Setting API key:" or "Save config response:"

2. **Check Background Script:**
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page" on Browser Assistant
   - Look for error messages in the console

### Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "Chrome runtime not available" | Extension not properly loaded, reload it |
| "Failed to save API key" | Check storage permissions, try incognito mode |
| "Extension context invalidated" | Reload the extension |
| "Invalid API key" | Check your OpenAI API key format |
| "Network error" | Check internet connection and firewall |

### Still Having Issues?

1. **Try the Debug Page:**
   - Open `debug.html` in Chrome
   - Use the test buttons to check extension functionality

2. **Check Extension Logs:**
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page"
   - Look for detailed error messages

3. **Verify File Structure:**
   - Make sure you're loading the `dist` folder, not the root folder
   - Check that all files are present in the `dist` folder

4. **Test with Simple API Key:**
   - Try with a minimal API key first
   - Use the "Test" button before saving

### Getting Help

If you're still having issues:

1. Copy the exact error message from the console
2. Note which step you're on when the error occurs
3. Check if the error happens on all websites or just specific ones
4. Try the extension in a different Chrome profile

The improved error handling should now provide more specific error messages to help identify the exact issue!
