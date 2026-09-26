# Elite Ballers FC

A mobile-first football club website and admin dashboard powered by Supabase.

## Public app
Responsive Home, Team, Fixtures, Results, News, Gallery, About and Contact pages, with an app-style bottom navigation, installable PWA shell, and System/Light/Dark appearance settings.

## Admin
Secure Supabase-authenticated admin area for players, fixtures, results, news, gallery and Excel-style weekly dues. Dues can be exported to CSV/Excel and shared from a phone.

## Deploy on Vercel
1. Import this repository.
2. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to Vercel Project Settings → Environment Variables.
3. Deploy. `vercel.json` runs the build script and creates the browser config automatically.
4. Run `supabase/schema.sql` in Supabase SQL Editor, create the admin Auth user, and add its `profiles` row with `role = 'admin'`.

See `SUPABASE_SETUP.md` and `RELEASE_CHECKLIST.md`. Never use a Supabase secret/service-role key in browser code.
