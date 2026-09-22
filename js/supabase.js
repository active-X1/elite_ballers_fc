// Supabase helper (client-side, attaches helpers to window.SB)
// IMPORTANT: add your Supabase values via environment injection when deploying.
(function () {
  const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.warn('Supabase library not loaded. Include the supabase CDN before js/supabase.js');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function signIn(email, password) {
    const { user, session, error } = await client.auth.signIn({ email, password });
    return { user, session, error };
  }

  async function signOut() {
    await client.auth.signOut();
  }

  function getUser() {
    return client.auth.user();
  }

  async function insert(table, payload) {
    const { data, error } = await client.from(table).insert([payload]);
    return { data, error };
  }

  async function fetchAll(table) {
    const { data, error } = await client.from(table).select('*').order('id', { ascending: false });
    return { data, error };
  }

  window.SB = { client, signIn, signOut, getUser, insert, fetchAll };

})();
(function () {
  const url = window.SUPABASE_URL || '';
  const anonKey = window.SUPABASE_ANON_KEY || '';

  if (!window.supabase && typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.__ELITE_SUPABASE__ = {
    ready: !!(window.supabase && url && anonKey && !url.includes('your-project')),
    url,
    anonKey
  };

  if (!window.__ELITE_SUPABASE__.ready) {
    console.warn('Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_ANON_KEY before deployment.');
  }
})();
