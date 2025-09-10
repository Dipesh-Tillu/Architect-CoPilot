// Simple background script for testing connection issues

class SimpleAssistant {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://api.openai.com/v1';
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      console.log('SimpleAssistant: Initializing...');
      
      // Set up message listener immediately
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('SimpleAssistant: Received message:', request.action);
        this.handleMessage(request, sender, sendResponse);
        return true; // Keep message channel open for async response
      });

      // Load API key from storage asynchronously
      this.loadApiKey();
      
      console.log('SimpleAssistant: Initialization complete');
      this.initialized = true;
    } catch (error) {
      console.error('SimpleAssistant: Initialization failed:', error);
    }
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get(['apiKey', 'baseUrl']);
      this.apiKey = result.apiKey;
      if (result.baseUrl) {
        this.baseUrl = result.baseUrl;
      }
      console.log('SimpleAssistant: API key loaded:', this.apiKey ? 'Yes' : 'No');
    } catch (error) {
      console.error('SimpleAssistant: Failed to load API key:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('SimpleAssistant: Handling message:', request.action);
      
      switch (request.action) {
        case 'test':
          sendResponse({ 
            success: true, 
            message: 'Simple background script is working',
            initialized: this.initialized,
            apiKeyLoaded: !!this.apiKey
          });
          break;
        
        case 'analyzePage':
          const analysis = await this.analyzePage(request.data);
          sendResponse({ summary: analysis });
          break;
        
        case 'setApiKey':
          try {
            await this.setApiKey(request.apiKey, request.baseUrl);
            sendResponse({ success: true });
          } catch (error) {
            console.error('Error setting API key:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
        
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error in simple background script:', error);
      sendResponse({ error: error.message });
    }
  }

  async analyzePage(pageData) {
    if (!this.apiKey) {
      return 'Please configure your API key in the extension settings.';
    }

    const prompt = `Analyze the following webpage and provide a concise summary:

URL: ${pageData.url}
Title: ${pageData.title}
Content: ${pageData.content}

Please provide:
1. A brief summary of what this page is about
2. Key topics or themes
3. Any notable information or insights
4. Suggestions for what the user might want to know more about

Keep the response concise and helpful.`;

    try {
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error analyzing page:', error);
      return 'Sorry, I encountered an error while analyzing this page. Please check your API key and try again.';
    }
  }

  async callOpenAI(prompt) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful browser assistant that analyzes web pages and answers questions about their content. Be concise, helpful, and accurate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async setApiKey(apiKey, baseUrl) {
    try {
      console.log('Setting API key:', { apiKey: apiKey ? '***' + apiKey.slice(-4) : 'empty', baseUrl });
      
      this.apiKey = apiKey;
      if (baseUrl) {
        this.baseUrl = baseUrl;
      }
      
      // Save to Chrome storage
      await chrome.storage.sync.set({
        apiKey: apiKey,
        baseUrl: baseUrl || this.baseUrl
      });
      
      console.log('API key saved successfully');
    } catch (error) {
      console.error('Error in setApiKey:', error);
      throw new Error(`Failed to save API key: ${error.message}`);
    }
  }
}

// Initialize the simple assistant
console.log('Starting simple background script...');
new SimpleAssistant();
