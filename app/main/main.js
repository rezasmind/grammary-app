const { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { getSelectedText } = require('electron-selected-text');
const isDev = process.argv.includes('--dev');

// Set application name
app.name = 'Grammary';
if (process.platform === 'darwin') {
  // On macOS, the app name in the menu bar is taken from the Info.plist file or package.json
  app.setName('Grammary');
}

// Keep a global reference of the window objects
let mainWindow = null;
let popupWindow = null;
let tray = null;

// API keys state
let apiKeys = {};

// Get icon path, with fallback if file doesn't exist
function getIconPath() {
  // Try multiple possible icon paths
  const possiblePaths = [
    path.join(__dirname, '../assets/icon.png'),
    path.join(__dirname, '../assets/icon.icns'),
    path.join(__dirname, '../assets/icon.ico'),
    path.join(app.getAppPath(), 'assets/icon.png'),
    path.join(app.getAppPath(), 'assets/icon.icns'),
    path.join(app.getAppPath(), 'assets/icon.ico')
  ];

  for (const iconPath of possiblePaths) {
    if (fs.existsSync(iconPath)) {
      console.log('Found icon at:', iconPath);
      return iconPath;
    }
  }

  console.warn('No icon found in any of the expected locations');
  return null;
}

// Create the main application window
function createMainWindow() {
  const windowOptions = {
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    title: 'Grammary',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    trafficLightPosition: { x: -100, y: -100 }, // Move default buttons off-screen
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    backgroundColor: '#ffffff'
  };
  
  // Add icon if it exists
  const iconPath = getIconPath();
  if (iconPath) {
    windowOptions.icon = iconPath;
    console.log('Setting window icon:', iconPath);
  } else {
    console.warn('No icon available for window');
  }
  
  mainWindow = new BrowserWindow(windowOptions);

  // Set window title
  mainWindow.setTitle('Grammary');

  // Load the main application HTML
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Hide the traffic light buttons on macOS
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
  }

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
    
    // Enable hot reloading in development
    try {
      require('electron-reload')(path.join(__dirname, '../'), {
        electron: path.join(__dirname, '../../node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
      });
    } catch (err) {
      console.error('Failed to load electron-reload:', err);
    }
  }

  // Handle window close event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create a popup window for displaying options when text is selected
function createPopupWindow(x, y, selectedText, isEditable, detectedLanguage) {
  // Close existing popup if it exists
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close();
  }

  // Create a new popup window
  popupWindow = new BrowserWindow({
    width: 300,
    height: 250,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  // Load the popup HTML
  popupWindow.loadFile(path.join(__dirname, '../renderer/popup.html'));

  // Send the selected text and context information to the popup window
  popupWindow.webContents.on('did-finish-load', () => {
    popupWindow.webContents.send('selected-text', {
      text: selectedText,
      isEditable,
      language: detectedLanguage
    });
  });

  // Close the popup when it loses focus
  popupWindow.on('blur', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
    }
  });

  // Open DevTools for popup in development mode
  if (isDev) {
    popupWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

// Create the system tray icon
function createTray() {
  try {
    const iconPath = getIconPath();
    
    // Skip tray creation if no icon is available
    if (!iconPath) {
      console.warn('No icon available, skipping tray creation');
      return;
    }
    
    console.log('Creating tray with icon:', iconPath);
    
    // If there's an existing tray, destroy it first
    if (tray) {
      tray.destroy();
    }
    
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Grammary', click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      }},
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    
    tray.setToolTip('Grammary');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      } else {
        createMainWindow();
      }
    });
    
    // Set dock icon on macOS
    if (process.platform === 'darwin') {
      app.dock.setIcon(iconPath);
    }
  } catch (error) {
    console.error('Failed to create tray:', error);
    // Continue without tray if it fails
  }
}

// Handle text selection detection
async function handleTextSelection() {
  try {
    const selectedText = await getSelectedText();
    
    if (selectedText && selectedText.trim().length > 0) {
      // Get cursor position
      const point = screen.getCursorScreenPoint();
      
      // Determine if the selection is in an editable field (this is a simplification)
      // In a real implementation, you would need a more sophisticated way to detect this
      const isEditable = true; // Placeholder - we'll need to improve this
      
      // Detect language (simple implementation)
      const detectedLanguage = detectLanguage(selectedText);
      
      // Create popup at cursor position
      createPopupWindow(point.x, point.y, selectedText, isEditable, detectedLanguage);
    }
  } catch (error) {
    console.error('Error getting selected text:', error);
  }
}

// Simple language detection
function detectLanguage(text) {
  // Check if the text contains Persian characters
  const persianPattern = /[\u0600-\u06FF]/;
  if (persianPattern.test(text)) {
    return 'fa';
  }
  
  // Default to English or other Latin-based languages
  return 'en';
}

// Register global shortcut for text selection
function registerShortcuts() {
  // Register Ctrl+Shift+G (or Command+Shift+G on macOS) to trigger text selection handling
  const shortcutKey = process.platform === 'darwin' ? 'Command+Shift+G' : 'Ctrl+Shift+G';
  
  try {
    const registered = globalShortcut.register(shortcutKey, handleTextSelection);
    if (!registered) {
      console.warn(`Failed to register shortcut: ${shortcutKey}`);
    }
  } catch (error) {
    console.error('Error registering shortcut:', error);
  }
}

// IPC handlers
function setupIPC() {
  // Window control handlers
  ipcMain.on('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  
  ipcMain.on('maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  
  ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
  
  // Text processing handlers
  
  // Handle translation request from renderer
  ipcMain.handle('translate-text', async (event, { text, targetLanguage, tone }) => {
    console.log(`Translation requested: ${text} to ${targetLanguage} with ${tone} tone`);
    
    // Check if user has API key
    if (apiKeys && apiKeys.openrouter) {
      // In a real implementation, this would call an external API
      return `Translated (${targetLanguage}): ${text}`;
    } else {
      return 'Translation requires an API key. Please add your OpenRouter API key in settings.';
    }
  });
  
  // Handle grammar correction request from renderer
  ipcMain.handle('correct-grammar', async (event, { text }) => {
    console.log(`Grammar correction requested: ${text}`);
    
    // Check if user has API key
    if (apiKeys && apiKeys.openrouter) {
      // In a real implementation, this would call an external API
      return `Corrected: ${text}`;
    } else {
      return 'Grammar correction requires an API key. Please add your OpenRouter API key in settings.';
    }
  });
  
  // Handle summarization request from renderer
  ipcMain.handle('summarize-text', async (event, { text }) => {
    console.log(`Summarization requested: ${text}`);
    
    // Check if user has API key
    if (apiKeys && apiKeys.openrouter) {
      // In a real implementation, this would call an external API
      return `Summary: ${text.substring(0, Math.min(text.length, 100))}...`;
    } else {
      return 'Summarization requires an API key. Please add your OpenRouter API key in settings.';
    }
  });
  
  // Handle tone adjustment request from renderer
  ipcMain.handle('adjust-tone', async (event, { text, tone }) => {
    console.log(`Tone adjustment requested: ${text} to ${tone} tone`);
    
    // Check if user has API key
    if (apiKeys && apiKeys.openrouter) {
      // In a real implementation, this would call an external API
      return `Adjusted tone (${tone}): ${text}`;
    } else {
      return 'Tone adjustment requires an API key. Please add your OpenRouter API key in settings.';
    }
  });
  
  // API key management handlers
  
  // Handle save API keys request
  ipcMain.handle('save-api-keys', async (event, keys) => {
    console.log('Save API keys requested:', keys);
    
    // Save API keys
    apiKeys = { ...apiKeys, ...keys };
    
    return true;
  });
  
  // Handle get API keys request
  ipcMain.handle('get-api-keys', async () => {
    return apiKeys;
  });
}

// Initialize the app
app.whenReady().then(() => {
  createMainWindow();
  createTray();
  setupIPC();
  registerShortcuts();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
}); 