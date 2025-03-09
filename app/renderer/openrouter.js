// OpenRouter API integration for AI text processing

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default model to use
const DEFAULT_MODEL = 'google/gemma-2-9b-it:free';

console.log('OpenRouter script loaded');

/**
 * Call OpenRouter API to process text
 * @param {string} prompt - The prompt to send to the model
 * @param {string} systemPrompt - Optional system prompt to guide the model
 * @param {string} model - The model to use (defaults to Gemini Pro)
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - The model's response
 */
async function callOpenRouter(prompt, systemPrompt = '', model = DEFAULT_MODEL, apiKey) {
  console.log('Calling OpenRouter API with:', { prompt, systemPrompt, model });
  
  if (!apiKey) {
    console.error('OpenRouter API key is missing');
    throw new Error('OpenRouter API key is required');
  }

  try {
    const messages = [];
    
    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add user message
    messages.push({
      role: 'user',
      content: prompt
    });
    
    console.log('Sending request to OpenRouter API with messages:', messages);
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://grammary.app', // Replace with your actual domain
        'X-Title': 'Grammary App'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error response:', errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OpenRouter API response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    throw error;
  }
}

/**
 * Translate text using OpenRouter
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} tone - Tone for translation (formal, casual, etc.)
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, targetLanguage, tone = 'formal', apiKey) {
  console.log('Translating text to', targetLanguage, 'with tone', tone);
  const targetLanguageName = getLanguageName(targetLanguage);
  const prompt = `Translate the following text to ${targetLanguageName} with a ${tone} tone. Only show the translation without any explanations or additional text: "${text}"`;
  const systemPrompt = `You are a helpful translator. Translate the given text to ${targetLanguageName} accurately with a ${tone} tone and only return the translation without any explanations or additional text.`;
  
  return callOpenRouter(prompt, systemPrompt, DEFAULT_MODEL, apiKey);
}

/**
 * Correct grammar using OpenRouter
 * @param {string} text - Text to correct
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Corrected text
 */
async function correctGrammar(text, apiKey) {
  console.log('Correcting grammar for text');
  // Detect language
  const isPersian = /[\u0600-\u06FF]/.test(text);
  const languageName = isPersian ? 'Persian' : 'English';
  
  const prompt = `Fix the grammar of this ${languageName} text, maintaining ${languageName} language: "${text}"`;
  const systemPrompt = `You are a ${languageName} language expert. Fix any grammatical errors in the text. Only return the corrected ${languageName} text without any explanations.`;
  
  return callOpenRouter(prompt, systemPrompt, DEFAULT_MODEL, apiKey);
}

/**
 * Summarize text using OpenRouter
 * @param {string} text - Text to summarize
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Summarized text
 */
async function summarizeText(text, apiKey) {
  console.log('Summarizing text');
  // Detect input language
  const isPersian = /[\u0600-\u06FF]/.test(text);
  const languageName = isPersian ? 'Persian' : 'English';
  
  const prompt = `Create a concise summary of this ${languageName} text in Persian. Only show the summary without any explanations or additional text: "${text}"`;
  const systemPrompt = `You are a helpful summarizer. Create a concise summary in Persian. Only return the summary without any explanations or additional text.`;
  
  return callOpenRouter(prompt, systemPrompt, DEFAULT_MODEL, apiKey);
}

/**
 * Adjust tone of text using OpenRouter
 * @param {string} text - Text to adjust tone
 * @param {string} tone - Target tone (formal, casual, friendly, professional, etc.)
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Text with adjusted tone
 */
async function adjustTone(text, tone, apiKey) {
  console.log('Adjusting tone of text to', tone);
  // Detect language
  const isPersian = /[\u0600-\u06FF]/.test(text);
  const languageName = isPersian ? 'Persian' : 'English';
  
  const prompt = `Rewrite this ${languageName} text in a ${tone} tone, maintaining ${languageName} language: "${text}"`;
  const systemPrompt = `You are a ${languageName} writing expert. Rewrite the text in a ${tone} tone while maintaining ${languageName} language. Only return the rewritten text without any explanations.`;
  
  return callOpenRouter(prompt, systemPrompt, DEFAULT_MODEL, apiKey);
}

/**
 * Get language name from language code
 * @param {string} langCode - Language code (e.g., 'en', 'fa')
 * @returns {string} - Language name
 */
function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'fa': 'Persian',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'ar': 'Arabic',
    'tr': 'Turkish',
    'ru': 'Russian',
    'zh': 'Chinese'
  };
  
  return languages[langCode] || 'English';
}

// Initialize the OpenRouter module
function init() {
  console.log('Initializing OpenRouter module');
  
  // Export functions to window.openRouter
  window.openRouter = {
    translateText,
    correctGrammar,
    summarizeText,
    adjustTone
  };
  
  console.log('OpenRouter module initialized');
}

// Initialize when the script is loaded
init(); 