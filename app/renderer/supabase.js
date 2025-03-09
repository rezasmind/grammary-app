// Supabase client for authentication and data storage

// Import the Supabase client
const { createClient } = require('@supabase/supabase-js');

// Supabase URL and anon key (these would be environment variables in production)
const SUPABASE_URL = 'https://fnnmylbhlandnvrffzsp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubm15bGJobGFuZG52cmZmenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDQyNTksImV4cCI6MjA1NzEyMDI1OX0.uyJ8kWR42PMCpU4yLuVpRrcK-v7oJZfCimLUoUoueuI';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication functions
async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
}

// User data functions
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    return null;
  }
}

async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw error;
  }
}

// API key management
async function saveApiKeys(userId, keys) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: userId,
        ...keys
      }, { onConflict: 'user_id' });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving API keys:', error.message);
    throw error;
  }
}

async function getApiKeys(userId) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    return data || {};
  } catch (error) {
    console.error('Error getting API keys:', error.message);
    return {};
  }
}

// Subscription management
async function getSubscriptionStatus(userId) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data ? data.status : 'free';
  } catch (error) {
    console.error('Error getting subscription status:', error.message);
    return 'free';
  }
}

// Export the functions
module.exports = {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  saveApiKeys,
  getApiKeys,
  getSubscriptionStatus
}; 