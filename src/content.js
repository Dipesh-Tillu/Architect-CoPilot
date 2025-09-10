// Content script for injecting the assistant panel
class BrowserAssistant {
  constructor() {
    this.isOpen = false;
    this.assistantPanel = null;
    this.threadId = null;
    this.init();
  }

  init() {
    console.log('BrowserAssistant: Initializing...');
    
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('BrowserAssistant: Received message:', request);
      if (request.action === 'toggleAssistant') {
        console.log('BrowserAssistant: Toggling assistant...');
        this.toggleAssistant();
        sendResponse({ success: true });
      } else if (request.action === 'analyzePage') {
        console.log('BrowserAssistant: Analyzing page...');
        this.analyzeCurrentPage();
        sendResponse({ success: true });
      }
      return true; // Keep message channel open for async response
    });

    // Create the assistant panel
    this.createAssistantPanel();
    console.log('BrowserAssistant: Initialization complete');
  }

  createAssistantPanel() {
    // Create the main container
    this.assistantPanel = document.createElement('div');
    this.assistantPanel.id = 'browser-assistant-panel';
    this.assistantPanel.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: #ffffff;
      border-left: 1px solid #e0e0e0;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 10000;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create the header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; color: #333; font-size: 16px;">Browser Assistant</h3>
      <button id="close-assistant" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">&times;</button>
    `;

    // Create the chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Create the input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    `;
    inputArea.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <input type="text" id="message-input" placeholder="Ask me about this page..." 
               style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; outline: none;">
        <button id="send-message" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;">Send</button>
      </div>
    `;

    // Assemble the panel
    this.assistantPanel.appendChild(header);
    this.assistantPanel.appendChild(chatContainer);
    this.assistantPanel.appendChild(inputArea);

    // Add to page first
    document.body.appendChild(this.assistantPanel);

    // Add event listeners after elements are in the DOM
    const closeButton = document.getElementById('close-assistant');
    const sendButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');

    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggleAssistant());
    } else {
      console.error('BrowserAssistant: Close button not found');
    }

    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    } else {
      console.error('BrowserAssistant: Send button not found');
    }

    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    } else {
      console.error('BrowserAssistant: Message input not found');
    }
  }

  toggleAssistant() {
    console.log('BrowserAssistant: Toggle called, current state:', this.isOpen);
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      console.log('BrowserAssistant: Opening panel...');
      this.assistantPanel.style.right = '0';
      this.analyzeCurrentPage();
    } else {
      console.log('BrowserAssistant: Closing panel...');
      this.assistantPanel.style.right = '-400px';
    }
  }

  async analyzeCurrentPage() {
    const chatContainer = document.getElementById('chat-container');
    
    // Add loading message
    this.addMessage('assistant', 'Analyzing this page...', true);
    
    try {
      // Check if Chrome runtime is available
      if (!chrome.runtime) {
        throw new Error('Chrome runtime not available');
      }

      // Get page content
      const pageData = {
        url: window.location.href,
        title: document.title,
        content: document.body.innerText.substring(0, 5000), // Limit content size
        timestamp: new Date().toISOString()
      };

      console.log('Content script: Sending analyzePage message', pageData);

      // Send to background script for processing
      const response = await chrome.runtime.sendMessage({
        action: 'analyzePage',
        data: pageData
      });

      console.log('Content script: Received response', response);

      // Remove loading message and add analysis
      chatContainer.removeChild(chatContainer.lastChild);
      this.addMessage('assistant', response.summary || 'Page analysis complete!');
      
    } catch (error) {
      console.error('Error analyzing page:', error);
      chatContainer.removeChild(chatContainer.lastChild);
      
      // Provide more specific error messages
      let errorMessage = 'Sorry, I encountered an error while analyzing the page.';
      
      if (error.message.includes('Could not establish connection')) {
        errorMessage = 'Unable to connect to the background service. Please reload the extension and try again.';
      } else if (error.message.includes('Chrome runtime not available')) {
        errorMessage = 'Extension runtime not available. Please check if the extension is properly loaded.';
      } else if (error.message.includes('Receiving end does not exist')) {
        errorMessage = 'Background script not running. Please reload the extension.';
      }
      
      this.addMessage('assistant', errorMessage);
    }
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message to chat
    this.addMessage('user', message);
    input.value = '';

    // Add loading message
    this.addMessage('assistant', 'Thinking...', true);

    try {
      // Check if Chrome runtime is available
      if (!chrome.runtime) {
        throw new Error('Chrome runtime not available');
      }

      // Get or create thread ID for this conversation
      if (!this.threadId) {
        this.threadId = 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      console.log('Content script: Sending chat message', { message, threadId: this.threadId });

      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'chatMessage',
        message: message,
        threadId: this.threadId,
        pageData: {
          url: window.location.href,
          title: document.title,
          content: document.body.innerText.substring(0, 5000)
        }
      });

      console.log('Content script: Received chat response', response);

      // Remove loading message and add response
      const chatContainer = document.getElementById('chat-container');
      chatContainer.removeChild(chatContainer.lastChild);
      this.addMessage('assistant', response.response || 'Sorry, I couldn\'t process your message.');
      
    } catch (error) {
      console.error('Error sending message:', error);
      const chatContainer = document.getElementById('chat-container');
      chatContainer.removeChild(chatContainer.lastChild);
      
      // Provide more specific error messages
      let errorMessage = 'Sorry, I encountered an error processing your message.';
      
      if (error.message.includes('Could not establish connection')) {
        errorMessage = 'Unable to connect to the background service. Please reload the extension and try again.';
      } else if (error.message.includes('Chrome runtime not available')) {
        errorMessage = 'Extension runtime not available. Please check if the extension is properly loaded.';
      } else if (error.message.includes('Receiving end does not exist')) {
        errorMessage = 'Background script not running. Please reload the extension.';
      }
      
      this.addMessage('assistant', errorMessage);
    }
  }

  addMessage(sender, content, isLoading = false) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    
    messageDiv.style.cssText = `
      padding: 12px;
      border-radius: 12px;
      max-width: 80%;
      word-wrap: break-word;
      ${sender === 'user' 
        ? 'background: #007bff; color: white; align-self: flex-end; margin-left: auto;' 
        : 'background: #f1f3f4; color: #333; align-self: flex-start;'
      }
    `;

    if (isLoading) {
      messageDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; border: 2px solid #ccc; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span>${content}</span>
        </div>
      `;
    } else {
      messageDiv.textContent = content;
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Initialize the assistant when the page loads
function initializeAssistant() {
  console.log('Content script: Initializing assistant...');
  try {
    window.browserAssistant = new BrowserAssistant();
    console.log('Content script: Assistant initialized successfully');
  } catch (error) {
    console.error('Content script: Error initializing assistant:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAssistant);
} else {
  initializeAssistant();
}

// Also try to initialize after a short delay as a fallback
setTimeout(() => {
  if (!window.browserAssistant) {
    console.log('Content script: Fallback initialization...');
    initializeAssistant();
  }
}, 1000);

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
