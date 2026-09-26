# Elite Ballers FC — release checklist

## Supabase
1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Create the first Auth user.
3. Add that user's UUID to `public.profiles` with `role = 'admin'`.
4. Confirm the public `gallery` bucket exists.

## Vercel
1. Add `SUPABASE_URL`.
2. Add `SUPABASE_PUBLISHABLE_KEY`.
3. Deploy.
4. Vercel's build now fails clearly if those variables are missing.

## Smoke test
1. Open the homepage on a phone.
2. Confirm Team / Fixtures / Results / News / Gallery show database data only.
3. Open More → Admin Login.
4. Test wrong password and Forgot password.
5. Test admin dashboard navigation.
6. Add and archive a player.
7. Add a fixture and confirm it appears publicly.
8. Add a result and confirm the homepage result/statistics update.
9. Publish a news story and confirm it appears publicly.
10. Upload/delete a gallery image.
11. In Dues, test at least 2 players across multiple weeks.
12. Change the displayed week range and confirm payments load for that range.
13. Export CSV and Excel and test phone Share.
14. In Settings, set the club's public contact details and weekly dues.
15. Test Light / Dark / System.
16. Test PWA installation on a supported browser.
17. Test a small phone and desktop.
18. Remove all test records before client handoff.
