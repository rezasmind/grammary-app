// Main application JavaScript

// DOM elements
const appContainer = document.getElementById('app');

// Application state
let welcomeStep = 0; // Current welcome step
let hasSeenWelcome = false; // Whether the user has seen the welcome screen

// Initialize the application
function initApp() {
  console.log('Initializing main application');
  
  // Render title bar
  renderTitleBar();
  
  // Check if welcome has been seen before
  hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
  renderApp();
    
  // Load the floating menu script
  loadScript('floating-menu.js');
  
  // Load the OpenRouter script
  loadScript('openrouter.js');
}

// Load a script dynamically
function loadScript(src) {
  console.log(`Loading script: ${src}`);
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  
  script.onload = () => {
    console.log(`Script loaded: ${src}`);
  };
  
  script.onerror = (error) => {
    console.error(`Error loading script ${src}:`, error);
  };
  
  document.body.appendChild(script);
}

// Render title bar
function renderTitleBar() {
  // Create title bar element
  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';
  
  // App title
  const appTitle = document.createElement('div');
  appTitle.className = 'app-title';
  appTitle.textContent = 'گرامری - Grammary';
  titleBar.appendChild(appTitle);
  
  // Window controls
  const windowControls = document.createElement('div');
  windowControls.className = 'window-controls';
  
  // Minimize button
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'control-button minimize';
  minimizeButton.innerHTML = '&#9472;'; // Horizontal line
  minimizeButton.addEventListener('click', () => window.api.minimizeWindow());
  windowControls.appendChild(minimizeButton);
  
  // Maximize button
  const maximizeButton = document.createElement('button');
  maximizeButton.className = 'control-button maximize';
  maximizeButton.innerHTML = '&#9723;'; // Square
  maximizeButton.addEventListener('click', () => window.api.maximizeWindow());
  windowControls.appendChild(maximizeButton);
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.className = 'control-button close';
  closeButton.innerHTML = '&#10005;'; // X
  closeButton.addEventListener('click', () => window.api.closeWindow());
  windowControls.appendChild(closeButton);
  
  titleBar.appendChild(windowControls);
  
  // Insert title bar at the beginning of the body
  document.body.insertBefore(titleBar, document.body.firstChild);
}

// Render the application based on welcome state
function renderApp() {
  // Determine what to render
  if (!hasSeenWelcome) {
    renderWelcome();
  } else {
    renderDashboard();
  }
}

// Render welcome screens
function renderWelcome() {
  // Welcome screen content based on current step
  const welcomeScreens = [
    {
      title: 'به گرامری خوش آمدید',
      description: 'گرامری به شما کمک می‌کند تا متن‌های خود را به زبان‌های مختلف ترجمه کنید، گرامر آن‌ها را تصحیح کنید و لحن آن‌ها را تغییر دهید.',
    },
    {
      title: 'انتخاب متن در هر جایی',
      description: 'به سادگی متن مورد نظر خود را در هر برنامه‌ای انتخاب کنید و از کلید میانبر Ctrl+Shift+G استفاده کنید.',
    },
    {
      title: 'کلیدهای API خود را اضافه کنید',
      description: 'برای استفاده از تمام قابلیت‌های گرامری، کلید API خود را در تنظیمات اضافه کنید یا به اشتراک پرمیوم ارتقا دهید.',
    }
  ];
  
  const currentScreen = welcomeScreens[welcomeStep];
  
  appContainer.innerHTML = `
    <div class="welcome-container">
      <div class="welcome-logo">گرامری</div>
      <h1 class="welcome-title">${currentScreen.title}</h1>
      <p class="welcome-description">${currentScreen.description}</p>
      
      <div class="welcome-steps">
        ${welcomeScreens.map((_, i) => 
          `<div class="step-indicator ${i === welcomeStep ? 'active' : ''}"></div>`
        ).join('')}
      </div>
      
      <div class="welcome-nav">
        ${welcomeStep > 0 
          ? `<button id="prev-btn" class="btn btn-secondary">قبلی</button>` 
          : ''}
        
        ${welcomeStep < welcomeScreens.length - 1 
          ? `<button id="next-btn" class="btn btn-primary">بعدی</button>` 
          : `<button id="start-btn" class="btn btn-primary">شروع کنید</button>`}
      </div>
    </div>
  `;
  
  // Add event listeners
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const startBtn = document.getElementById('start-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      welcomeStep--;
      renderWelcome();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      welcomeStep++;
      renderWelcome();
    });
  }
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // Mark welcome as seen
      hasSeenWelcome = true;
      localStorage.setItem('hasSeenWelcome', 'true');
      
      // Reset welcome step for next time
      welcomeStep = 0;
      
      // Render dashboard directly
      renderDashboard();
    });
  }
}

// Render the dashboard page
function renderDashboard() {
  appContainer.innerHTML = `
    <div class="dashboard-container">
      <div class="header">
        <div class="logo">گرامری</div>
        <div class="header-actions">
          <button id="settings-btn" class="btn btn-secondary">تنظیمات</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">راهنمای استفاده</div>
        
        <div class="instructions">
          <h3>روش استفاده از گرامری:</h3>
          
          <div class="instruction-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>انتخاب متن در هر برنامه</h4>
              <p>متن مورد نظر خود را در هر برنامه‌ای (مرورگر، ورد، ایمیل و...) انتخاب کنید.</p>
            </div>
          </div>

          <div class="instruction-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>استفاده از کلید میانبر</h4>
              <p>کلید میانبر <strong>Ctrl+Shift+G</strong> را فشار دهید تا منوی گرامری باز شود.</p>
            </div>
          </div>

          <div class="instruction-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>انتخاب عملیات</h4>
              <p>یکی از گزینه‌های زیر را برای پردازش متن انتخاب کنید:</p>
              <ul>
                <li>ترجمه به فارسی یا انگلیسی</li>
                <li>تصحیح گرامر و نگارش</li>
                <li>خلاصه‌سازی هوشمند</li>
                <li>تغییر لحن و سبک نوشتار</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div id="result-container" class="card" style="display: none;">
        <div class="card-title">نتیجه</div>
        <div id="result-content"></div>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('settings-btn').addEventListener('click', showSettings);
}

// Show settings page
function showSettings() {
  appContainer.innerHTML = `
    <div class="settings-container">
      <div class="header">
        <div class="logo">گرامری</div>
        <button id="back-btn" class="btn btn-secondary">بازگشت</button>
      </div>
      
      <div class="card">
        <div class="card-title">تنظیمات</div>
        
        <div class="settings-section">
          <div class="settings-title">کلید API</div>
          <p>برای استفاده از گرامری، شما باید کلید API خود را وارد کنید.</p>
          
          <div class="form-group">
            <label class="form-label">کلید API OpenRouter</label>
            <input type="text" id="openrouter-api-key" class="form-input api-key-input" placeholder="کلید API OpenRouter را وارد کنید" />
            <p class="form-help">برای دریافت کلید API به <a href="https://openrouter.ai" target="_blank">OpenRouter.ai</a> مراجعه کنید.</p>
          </div>
          
          <div id="api-key-status" class="form-status" style="display: none;"></div>
          
          <button id="save-api-keys-btn" class="btn btn-primary">ذخیره کلید</button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-btn').addEventListener('click', renderDashboard);
  document.getElementById('save-api-keys-btn').addEventListener('click', saveApiKeys);
  
  // Load API keys
  loadApiKeys();
}

// Load API keys
async function loadApiKeys() {
  try {
    console.log('Loading API keys');
    const keys = await window.api.getApiKeys();
    console.log('API keys loaded:', keys);
    
    if (keys) {
      document.getElementById('openrouter-api-key').value = keys.openrouter || '';
    }
  } catch (error) {
    console.error('Error loading API keys:', error);
    showApiKeyStatus('خطا در بارگذاری کلیدهای API', 'error');
  }
}

// Show API key status message
function showApiKeyStatus(message, type = 'success') {
  const statusElement = document.getElementById('api-key-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `form-status ${type}`;
    statusElement.style.display = 'block';
    
    // Hide the status message after 3 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Simplify API key saving
async function saveApiKeys() {
  const openrouterApiKey = document.getElementById('openrouter-api-key').value;
  const saveButton = document.getElementById('save-api-keys-btn');
  
  // Disable the button and show saving status
  saveButton.disabled = true;
  saveButton.textContent = 'در حال ذخیره...';
  
  try {
    console.log('Saving OpenRouter API key');
    
    await window.api.saveApiKeys({
      openrouter: openrouterApiKey
    });
    
    // Re-enable the button and show success message
    saveButton.disabled = false;
    saveButton.textContent = 'ذخیره کلید';
    showApiKeyStatus('کلید API با موفقیت ذخیره شد');
    
    console.log('API key saved successfully');
  } catch (error) {
    console.error('Error saving API keys:', error);
    
    // Re-enable the button and show error message
    saveButton.disabled = false;
    saveButton.textContent = 'ذخیره کلید';
    showApiKeyStatus('خطا در ذخیره کلید API', 'error');
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 