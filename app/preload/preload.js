const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Window control
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // Text processing functions
  translateText: (text, targetLanguage, tone) => 
    ipcRenderer.invoke('translate-text', { text, targetLanguage, tone }),
  
  correctGrammar: (text) => 
    ipcRenderer.invoke('correct-grammar', { text }),
  
  summarizeText: (text) => 
    ipcRenderer.invoke('summarize-text', { text }),
  
  adjustTone: (text, tone) => 
    ipcRenderer.invoke('adjust-tone', { text, tone }),
  
  // Event listeners
  onSelectedText: (callback) => {
    ipcRenderer.on('selected-text', (event, data) => callback(data));
    
    // Return a function to remove the listener
    return () => {
      ipcRenderer.removeAllListeners('selected-text');
    };
  },
  
  // Text selection detection
  getSelectedText: () => {
    return window.getSelection().toString();
  },
  
  // API key management
  saveApiKeys: (keys) => 
    ipcRenderer.invoke('save-api-keys', keys),
  
  getApiKeys: () => 
    ipcRenderer.invoke('get-api-keys')
}); 