import { writeFileSync } from 'node:fs';

const url = (process.env.SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

if (process.env.VERCEL === '1' && (!url || !key)) {
  console.error('[Elite Ballers] Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in Vercel.');
  process.exit(1);
}

if (url && key) {
  writeFileSync('js/config.js', `window.EB_SUPABASE_CONFIG = ${JSON.stringify({ url, publishableKey: key })};\n`);
  console.log('[Elite Ballers] Generated browser-safe Supabase config.');
} else {
  writeFileSync('js/config.js', 'window.EB_SUPABASE_CONFIG = { url: "", publishableKey: "" };\n');
}
