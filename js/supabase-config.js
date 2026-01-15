
// Supabase Configuration
// IMPORTANT: Replace the placeholders below with your actual Supabase URL and Anon Key.

const SUPABASE_URL = 'https://akilbvimqcmwwtkmssaq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraWxidmltcWNtd3d0a21zc2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTgxNjQsImV4cCI6MjA4MzkzNDE2NH0.hne78-NsHUR4gNx7PmrpxNsa7aNDb-lc7S9S5N5Tb-o';

// Check if the Supabase SDK is loaded
if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded. Make sure to include the CDN link in your HTML.');
}

// Initialize Supabase client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Export the client for use in other scripts
// Since we are not using modules in the main html (likely), we attach it to window or just let it be global if this script is loaded after SDK.
// But to be safe and modular-ish:
window.supabaseClient = _supabase;
