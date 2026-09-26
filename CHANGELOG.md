# Changelog — audit & fix pass

## Root cause of "Add Player / Add Fixture buttons don't work"
`js/config.js` was a blank placeholder (`{ url: '', publishableKey: '' }`). With no Supabase credentials, `js/supabase.js` sets `window.SB = null`, so:
- the admin guard (`js/admin-guard.js`) couldn't verify an admin session and bounced the page back to login, and/or
- every button's click handler ran and opened its modal fine, but the actual `SB.insert(...)` / `SB.update(...)` call on submit had nothing to call.

This was not a bug in the button wiring — every Add/Edit/Delete handler in `players.html`, `fixtures.html`, `results.html`, `news.html`, `gallery.html`, `dues.html`, `settings.html` was already correctly implemented against the real Supabase JS client, with error handling, loading (disabled-button) states, and list refresh on success.

## Fixed
1. **`js/config.js`** — now contains the real, provided Supabase project URL and publishable key (`bsjobgfjavajuzqfwecx.supabase.co`). This is the fix that unblocks every admin CRUD screen.
2. **`scripts/build-config.mjs`** — the "fail the build if credentials are missing" safety check was Vercel-only (`process.env.VERCEL === '1'`). Generalized to also cover Render, Netlify, and generic CI, since this project is deployed on Render. Also added a clearer console message and comments.
3. **`contact.html` — broken WhatsApp CTA.** `js/public-ui.js` has always looked for `#clubWhatsApp` to wire up the `wa.me` link and disabled-state handling, but no element with that id existed in the page — the WhatsApp section only rendered a decorative icon with no button, heading, or link. Restored the missing `.whatsapp-content` block (heading, copy, and a real `#clubWhatsApp` button) so the existing JS logic now has something to attach to.
4. **`contact.html` — dead "Phone / Email" placeholder text.** The coach-contact block printed static "📞 Phone: " and "✉️ Email: " labels with no value and nothing binding them to data — a label that looks real but never does anything. Replaced with `#coachContact` (hidden by default) containing an email line and a training-location line, populated from `club_settings` (`contact_email`, `training_location`) by `js/public-ui.js`, and hidden automatically if the club hasn't set that value yet. There's no `phone` field in the schema, so a fake phone line wasn't reintroduced.
5. **`js/public-ui.js`** — extended `initContact()` to populate the new coach-contact fields above.
6. **`css/style.css`** — added the few small rules the restored WhatsApp button/heading needed (`.whatsapp-content h2 span` accent color, `.whatsapp-button.is-disabled` state, `.coach-contact strong` weight). No existing rules were changed or removed.
7. **`README.md`** — rewritten for Render (build command, publish directory, env vars) instead of Vercel-only instructions, plus a full walkthrough of the Supabase setup, RLS model, and a testing checklist.

## Audited and found already correct (no changes made)
- **Database schema & RLS** (`supabase/schema.sql`): one table per entity, `updated_at` triggers, a non-recursive `public.is_admin()` policy function, public read-only policies scoped to `status='active'` / `published=true` / a settings key whitelist, admin-only write policies on every table, and storage policies restricting `gallery` bucket writes to admins. This was already a solid, production-grade design — nothing here needed rebuilding, and no duplicate tables were created.
- **Admin authentication** (`js/supabase.js`, `js/admin-guard.js`): real Supabase Auth (`signInWithPassword`), session persistence, `requireAdmin()` checking the `profiles` table server-side (not a frontend flag), redirect-to-login for unauthenticated/non-admin users, a loading state (`eb-admin-checking` class hides the shell until the check resolves), and real logout (`SB.signOut()`).
- **All CRUD screens** (Players, Fixtures, Results, News, Gallery, Dues, Settings): every submit handler validates required fields via native HTML `required`, disables the submit button during the request, checks `.error` on every Supabase call, shows a success/error toast, and reloads the list — no silent "looks successful" states, no double-submit risk.
- **Gallery Storage integration**: uploads validate file type and a 5 MB size cap client-side (defense in depth; the real boundary is the RLS/storage policy), generate collision-resistant file names, and store the `storage_path` so deletes also remove the underlying file — no orphaned files, no giant base64 blobs in the database.
- **Public pages** (`js/sb-renderers.js`): players/fixtures/results/news/gallery are all fetched live from Supabase with proper empty-states, `esc()`-escaped output (no unsafe `innerHTML` injection of user data), and `loading="lazy"` images with `onerror` fallbacks.

## Known, intentional limitation (not changed)
The "Contact the Team" grid on `contact.html` (Cyrus, Daniel, Joshua, etc.) is static markup, not backed by the `players` table. It reads as a curated staff/contacts directory rather than the official roster (which does come from Supabase, on `team.html`). Left as-is per "do not remove/rebuild things unnecessarily" — flagging it here in case you'd rather it pull from `players` too, which would need each player row to carry contact info the schema doesn't currently have.
