// Popup window JavaScript

// DOM elements
const popupContainer = document.getElementById('popup-container');

// State
let selectedText = '';
let isEditable = false;
let detectedLanguage = 'auto';
let openRouterReady = false;
let isProcessing = false;

// Available languages for translation
const languages = [
  { code: 'en', name: 'انگلیسی' },
  { code: 'fr', name: 'فرانسوی' },
  { code: 'de', name: 'آلمانی' },
  { code: 'es', name: 'اسپانیایی' },
  { code: 'ar', name: 'عربی' },
  { code: 'tr', name: 'ترکی' },
  { code: 'ru', name: 'روسی' },
  { code: 'zh', name: 'چینی' }
];

// Initialize the popup
function initPopup() {
  console.log('Initializing popup window');
  
  // Load the OpenRouter script
  loadScript('openrouter.js', () => {
    console.log('OpenRouter script loaded in popup');
    openRouterReady = true;
  });
  
  // Listen for selected text from the main process
  window.api.onSelectedText((data) => {
    console.log('Received selected text:', data);
    selectedText = data.text;
    isEditable = data.isEditable;
    detectedLanguage = data.language;
    
    renderPopup();
  });
}

// Load a script dynamically with a callback when loaded
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  
  // Add onload handler if callback is provided
  if (callback) {
    script.onload = callback;
  }
  
  // Add error handler
  script.onerror = (error) => {
    console.error(`Error loading script ${src}:`, error);
  };
  
  document.body.appendChild(script);
}

// Render the popup based on the selected text and context
function renderPopup() {
  // Determine if the text is in Persian
  const isPersian = detectedLanguage === 'fa';
  
  // Create popup content
  popupContainer.innerHTML = `
    <div class="popup-header">
      <span>گرامری</span>
      <button class="close-btn">&times;</button>
    </div>
    
    <div class="popup-content">
      <div class="selected-text">${selectedText}</div>
      
      <div class="action-buttons">
        ${renderActionButtons(isPersian, isEditable)}
      </div>
      
      ${isPersian && isEditable ? renderLanguageSelector() : ''}
      
      <div id="result-container" class="result-container" style="display: none;">
        <div class="result-header">
          <span class="result-title">نتیجه</span>
          <button class="copy-btn" title="کپی در کلیپ‌بورد">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <div id="result-content" class="result-content"></div>
      </div>
    </div>
  `;
  
  // Add event listeners
  addEventListeners(isPersian, isEditable);
}

// Render action buttons based on context
function renderActionButtons(isPersian, isEditable) {
  let buttons = '';
  
  // Common actions for all contexts
  buttons += `<button class="action-btn" data-action="summarize">خلاصه‌سازی</button>`;
  
  if (isPersian) {
    // Persian text actions
    if (isEditable) {
      buttons += `<button class="action-btn primary" data-action="translate">ترجمه</button>`;
    } else {
      buttons += `<button class="action-btn primary" data-action="translate-to-english">ترجمه به انگلیسی</button>`;
    }
  } else {
    // Non-Persian text actions
    buttons += `<button class="action-btn primary" data-action="translate-to-persian">ترجمه به فارسی</button>`;
    
    if (isEditable) {
      buttons += `<button class="action-btn" data-action="fix-grammar">تصحیح گرامر</button>`;
      buttons += `<button class="action-btn" data-action="adjust-tone">تغییر لحن</button>`;
    }
  }
  
  return buttons;
}

// Render language selector for translation
function renderLanguageSelector() {
  let html = `
    <div class="language-selector">
      <div class="language-label">زبان مقصد:</div>
      <div class="language-options">
  `;
  
  languages.forEach(lang => {
    html += `<div class="language-option" data-lang="${lang.code}">${lang.name}</div>`;
  });
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

// Add event listeners to popup elements
function addEventListeners(isPersian, isEditable) {
  // Close button
  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }
  
  // Action buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', handleActionClick);
  });
  
  // Language options
  if (isPersian && isEditable) {
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const langCode = e.target.getAttribute('data-lang');
        handleTranslate(langCode);
      });
    });
  }
  
  // Copy button
  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const resultContent = document.getElementById('result-content');
      if (resultContent && resultContent.textContent.trim()) {
        copyToClipboard(resultContent.textContent);
        showNotification('متن با موفقیت کپی شد');
      }
    });
  }
}

// Handle action button clicks
async function handleActionClick(event) {
  // Prevent multiple processing
  if (isProcessing) return;
  
  const button = event.target;
  const action = button.getAttribute('data-action');
  
  try {
    switch (action) {
      case 'summarize':
        await handleSummarize();
        break;
      case 'translate':
        // Show language selector
        const languageSelector = document.querySelector('.language-selector');
        if (languageSelector) {
          languageSelector.style.display = languageSelector.style.display === 'block' ? 'none' : 'block';
        }
        break;
      case 'translate-to-english':
        await handleTranslate('en');
        break;
      case 'translate-to-persian':
        await handleTranslate('fa');
        break;
      case 'fix-grammar':
        await handleFixGrammar();
        break;
      case 'adjust-tone':
        await showToneSelector();
        break;
    }
  } catch (error) {
    console.error('Action error:', error);
    showResult(`خطا: ${error.message}`, 'error');
  }
}

// Show tone selector
async function showToneSelector() {
  // Create tone selector
  const toneSelector = document.createElement('div');
  toneSelector.className = 'tone-selector';
  toneSelector.innerHTML = `
    <div class="tone-label">انتخاب لحن:</div>
    <div class="tone-options">
      <button class="tone-option" data-tone="formal">رسمی</button>
      <button class="tone-option" data-tone="friendly">دوستانه</button>
      <button class="tone-option" data-tone="professional">حرفه‌ای</button>
      <button class="tone-option" data-tone="academic">علمی</button>
    </div>
  `;
  
  // Add to popup content
  const popupContent = document.querySelector('.popup-content');
  popupContent.appendChild(toneSelector);
  
  // Add event listeners to tone options
  const toneOptions = document.querySelectorAll('.tone-option');
  toneOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      const tone = e.target.getAttribute('data-tone');
      await handleAdjustTone(tone);
    });
  });
}

// Action handlers
async function handleSummarize() {
  try {
    // Set processing state
    isProcessing = true;
    
    // Show processing in result container
    showResult('در حال پردازش...', 'processing');
    
    // Get API keys
    const apiKeys = await window.api.getApiKeys();
    console.log('Got API keys:', apiKeys);
    
    // Check if OpenRouter is ready and API key exists
    if (window.openRouter && apiKeys && apiKeys.openrouter) {
      console.log('Using OpenRouter API for summarization');
      // Use OpenRouter API
      const result = await window.openRouter.summarizeText(selectedText, apiKeys.openrouter);
      showResult(result, 'success');
    } else {
      console.log('Using fallback API for summarization');
      // Use built-in API
      const result = await window.api.summarizeText(selectedText);
      showResult(result, 'success');
    }
  } catch (error) {
    console.error('Summarization error:', error);
    showResult(`خطا در خلاصه‌سازی متن: ${error.message}`, 'error');
  } finally {
    isProcessing = false;
  }
}

async function handleTranslate(targetLang) {
  try {
    // Set processing state
    isProcessing = true;
    
    // Show processing in result container
    showResult('در حال پردازش...', 'processing');
    
    // Get API keys
    const apiKeys = await window.api.getApiKeys();
    console.log('Got API keys for translation:', apiKeys);
    
    // Check if OpenRouter is ready and API key exists
    if (window.openRouter && apiKeys && apiKeys.openrouter) {
      console.log('Using OpenRouter API for translation');
      // Use OpenRouter API
      const result = await window.openRouter.translateText(selectedText, targetLang, 'formal', apiKeys.openrouter);
      showResult(result, 'success');
    } else {
      console.log('Using fallback API for translation');
      // Use built-in API
      const result = await window.api.translateText(selectedText, targetLang, 'formal');
      showResult(result, 'success');
    }
  } catch (error) {
    console.error('Translation error:', error);
    showResult(`خطا در ترجمه متن: ${error.message}`, 'error');
  } finally {
    isProcessing = false;
  }
}

async function handleFixGrammar() {
  try {
    // Set processing state
    isProcessing = true;
    
    // Show processing in result container
    showResult('در حال پردازش...', 'processing');
    
    // Get API keys
    const apiKeys = await window.api.getApiKeys();
    console.log('Got API keys for grammar correction:', apiKeys);
    
    // Check if OpenRouter is ready and API key exists
    if (window.openRouter && apiKeys && apiKeys.openrouter) {
      console.log('Using OpenRouter API for grammar correction');
      // Use OpenRouter API
      const result = await window.openRouter.correctGrammar(selectedText, apiKeys.openrouter);
      showResult(result, 'success');
    } else {
      console.log('Using fallback API for grammar correction');
      // Use built-in API
      const result = await window.api.correctGrammar(selectedText);
      showResult(result, 'success');
    }
  } catch (error) {
    console.error('Grammar correction error:', error);
    showResult(`خطا در تصحیح گرامر: ${error.message}`, 'error');
  } finally {
    isProcessing = false;
  }
}

async function handleAdjustTone(tone) {
  try {
    // Set processing state
    isProcessing = true;
    
    // Show processing in result container
    showResult('در حال پردازش...', 'processing');
    
    // Get API keys
    const apiKeys = await window.api.getApiKeys();
    console.log('Got API keys for tone adjustment:', apiKeys);
    
    // Check if OpenRouter is ready and API key exists
    if (window.openRouter && apiKeys && apiKeys.openrouter) {
      console.log('Using OpenRouter API for tone adjustment');
      // Use OpenRouter API
      const result = await window.openRouter.adjustTone(selectedText, tone, apiKeys.openrouter);
      showResult(result, 'success');
    } else {
      console.log('Using fallback API for tone adjustment');
      // Use built-in API
      const result = await window.api.adjustTone(selectedText, tone);
      showResult(result, 'success');
    }
  } catch (error) {
    console.error('Tone adjustment error:', error);
    showResult(`خطا در تغییر لحن: ${error.message}`, 'error');
  } finally {
    isProcessing = false;
  }
}

// Show result in the result container
function showResult(result, type = 'success') {
  const resultContainer = document.getElementById('result-container');
  const resultContent = document.getElementById('result-content');
  
  if (!resultContainer || !resultContent) return;
  
  // Show the container
  resultContainer.style.display = 'block';
  
  // Set content and style based on type
  resultContent.textContent = result;
  resultContent.className = `result-content ${type}`;
  
  // Resize popup window to fit content
  const popupHeight = document.body.scrollHeight + 20;
  if (window.resizeTo) {
    window.resizeTo(300, Math.min(600, popupHeight));
  }
}

// Copy text to clipboard
function copyToClipboard(text) {
  console.log('Copying to clipboard:', text);
  
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  document.body.appendChild(textarea);
  
  // Select and copy the text
  textarea.select();
  document.execCommand('copy');
  
  // Clean up
  document.body.removeChild(textarea);
  
  // Show a notification
  showNotification('متن در کلیپ‌بورد کپی شد');
}

// Show a notification
function showNotification(message) {
  console.log('Showing notification:', message);
  
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds for all notifications
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded in popup window');
  initPopup();
}); 