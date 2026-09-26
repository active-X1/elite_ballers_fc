# Elite Ballers FC

A mobile-first football club website and admin dashboard powered by Supabase (Postgres + Auth + Storage), deployed as a static site on Render.

## What this is
- **Public site**: Home, About, Team, Fixtures, Results, News, Gallery, Contact — all pulling live data from Supabase (no hard-coded rosters/fixtures).
- **Admin dashboard** (`/admin`): Supabase-authenticated CRUD for Players, Fixtures, Results, News, Gallery, Weekly Dues, and Club Settings.
- **Security model**: the frontend never decides who is an admin. Every table has Row Level Security; a `profiles.role = 'admin'` row, checked server-side by Postgres policies, is what actually authorizes writes.

Plain HTML/CSS/JS — no framework, no build tool beyond one small script that injects your Supabase credentials at build time.

## 1. Configure Supabase
1. Create a project at supabase.com (or use an existing one).
2. Open **SQL Editor** and run the entire `supabase/schema.sql` file. This creates all tables (`players`, `fixtures`, `results`, `news`, `gallery`, `dues`, `club_settings`, `profiles`), triggers, RLS policies, the public `gallery` storage bucket, and storage policies.
3. Create your first admin login under **Authentication → Users → Add user**.
4. Copy that user's UUID and run in SQL Editor:
   ```sql
   insert into public.profiles (id, full_name, role)
   values ('YOUR_AUTH_USER_UUID', 'Your Name', 'admin')
   on conflict (id) do update set role = 'admin';
   ```
   Without this row, login succeeds but the admin guard immediately signs the account back out — `profiles.role = 'admin'` is what Postgres actually checks (`public.is_admin()`), not anything in the browser.
5. Under **Project Settings → API**, copy the **Project URL** and the **anon / publishable key** (never the `service_role` / secret key — that must never appear anywhere in this codebase).

## 2. Environment variables
| Variable | Where | Notes |
|---|---|---|
| `SUPABASE_URL` | Render → your Static Site → Environment | `https://YOUR-PROJECT.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Render → your Static Site → Environment | The anon/publishable key. Safe for the browser — it's designed for this and is meaningless without RLS, which this project has. |

`npm run build` (see `package.json`) runs `scripts/build-config.mjs`, which writes `js/config.js` from those two variables. On Render, Vercel, Netlify, or any CI, the build now **fails loudly** if the variables are missing, instead of silently shipping a broken backend.

For convenience this repo currently ships `js/config.js` with real values already filled in for the connected project (`bsjobgfjavajuzqfwecx.supabase.co`, publishable key only). Setting the env vars above is still recommended so the file is regenerated correctly if the project is ever forked, moved, or the key is rotated.

## 3. Deploy on Render
1. **New → Static Site**, connect this repository.
2. **Build Command**: `npm install && npm run build`
3. **Publish Directory**: `.` (the repo root — `index.html` lives there)
4. Add the two environment variables above under the service's **Environment** tab.
5. Deploy. Every subsequent deploy re-runs the build and regenerates `js/config.js`.

`vercel.json` is also still present and harmless if you ever deploy the same repo to Vercel instead.

## 4. Local development
```
cp js/config.example.js js/config.js   # then fill in your project's URL + publishable key
```
Open the HTML files directly, or serve the folder with any static server (e.g. `npx serve`). No bundler is required.

## 5. Database design (already in `supabase/schema.sql`)
- `players`, `fixtures`, `results`, `news`, `gallery`, `dues`, `club_settings`, `profiles` — one table per real entity, no duplicates.
- `updated_at` triggers on every mutable table.
- A unique index on `dues(player_id, week_start)` so a payment cell can't be duplicated.
- `public.is_admin()` — a `security definer` SQL function — avoids recursive RLS policies while centralizing the admin check.

## 6. Row Level Security (RLS) — already enabled on every table
- **Public (anon + authenticated) can only SELECT**: active players, all fixtures, all results, published news, all gallery rows, and an explicit whitelist of `club_settings` keys (never the whole settings table).
- **Only rows where `public.is_admin()` is true can INSERT/UPDATE/DELETE** on players, fixtures, results, news, gallery, dues, and settings.
- `profiles` is private; a user can read their own row, admins can read all.
- Storage: the `gallery` bucket is public for *reading* (so `<img>` tags work), but `INSERT`/`UPDATE`/`DELETE` on `storage.objects` in that bucket require `public.is_admin()`.

This means even if someone bypasses the UI entirely and calls the Supabase REST/JS API directly with the publishable key, they still can't write anything without an authenticated session tied to an admin `profiles` row.

## 7. What each admin screen does
| Screen | Backed by | Notes |
|---|---|---|
| Dashboard | `players`, `fixtures`, `results`, `dues`, `news` | KPIs + recent activity, read-only |
| Players | `players` | Add/Edit/Archive (soft-delete via `status`), image via URL |
| Fixtures | `fixtures` | Add/Edit/Delete, date+time combined into `match_date` |
| Results | `results` | Add/Edit/Delete, auto win/draw/loss badge |
| News | `news` | Add/Edit/Delete, Published/Draft toggle |
| Gallery | `gallery` + Storage | Upload file (goes to the `gallery` bucket) **or** paste a URL; Delete removes the row and, if it was an upload, the stored file |
| Dues | `dues`, `players`, `club_settings` | Spreadsheet-style weekly grid, CSV/Excel export, native Share |
| Settings | `club_settings`, Supabase Auth | Public club info + change-your-own-password |

Every write path (`SB.insert` / `SB.update` / `SB.remove` / `SB.upload`) checks `.error` and shows a toast on failure — no silent "looks like it worked" states.

## 8. Manual actions you still need to do in the Supabase Dashboard
I cannot do these for you without dashboard access — do them once:
1. Confirm `supabase/schema.sql` ran without errors (SQL Editor → check for a success message, or query each table under Table Editor).
2. Create the admin Auth user and its `profiles` row (Section 1, steps 3–4).
3. Under **Storage**, confirm a bucket named `gallery` exists and is public (the schema creates it, but double-check if you ran the script on an existing project).
4. If email/password recovery is used, confirm **Authentication → URL Configuration** has your live site's URL in the allow-list, or the "Forgot password" reset link will redirect to the wrong domain.
5. Rotate the publishable key from the Dashboard if it was ever shared somewhere untrusted before reaching you (routine hygiene, not required for it to work).

## 9. Testing checklist (code-level — verified by reading the source; use this to smoke-test the live site since I can't run your Supabase project myself)
- [ ] Admin login with correct/incorrect credentials, and with a non-admin account (should be rejected by `requireAdmin`, not just hidden buttons).
- [ ] Add / Edit / Archive a player; confirm it appears/disappears on the public Team page.
- [ ] Add / Edit / Delete a fixture; confirm it appears on the public Fixtures page and the homepage "Upcoming" card.
- [ ] Add / Edit / Delete a result; confirm the homepage result card and stats update.
- [ ] Publish a news story as Draft, confirm it's hidden publicly; switch to Published, confirm it appears.
- [ ] Upload a gallery photo (file) and add one via URL; delete both.
- [ ] Mark a few dues cells paid/unpaid across two weeks; export CSV and Excel.
- [ ] Save Club Settings (name, dues amount, contact email, WhatsApp number, training location, coach name/bio) and confirm the Contact and Home pages reflect it.
- [ ] Contact page: confirm the WhatsApp button opens `wa.me` with the configured number, and the contact form opens WhatsApp or a mailto with the message pre-filled.
- [ ] Change your own admin password from Settings, then log out and back in with the new password.
- [ ] Resize to a small phone width: check the admin sidebar collapses into the bottom nav, and the dues table scrolls horizontally without breaking the page layout.

## 10. What changed in this pass
See `CHANGELOG.md`.

## Never do this
Do not put a Supabase **secret / service-role key** anywhere in this repository, in `js/config.js`, in an environment variable read by the browser, or in any admin page. Every privileged operation in this app goes through RLS policies checked by Postgres, not through a trusted server-side key — that's the whole point of the `public.is_admin()` design above.
