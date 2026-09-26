# Elite Ballers FC — Supabase + Vercel setup

## 1. Database
Open Supabase → SQL Editor and run:

`supabase/schema.sql`

Then create the first admin under Authentication → Users. Copy the UUID and run:

```sql
insert into public.profiles (id, full_name, role)
values ('YOUR_AUTH_USER_UUID', 'Your Name', 'admin')
on conflict (id) do update set role = 'admin';
```

Do not expose a service-role/secret key in the browser.

## 2. Storage
The schema creates a public `gallery` bucket and restricts uploads/updates/deletes to admins.

## 3. Vercel
Add:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

The Vercel build generates `js/config.js`. If those variables are missing on Vercel, the build fails instead of silently shipping a broken backend.

## 4. Club settings
Admin → Settings lets you configure:
- club name
- weekly dues
- contact email
- WhatsApp number
- training location
- head coach
- coach profile

These public settings are protected by a key whitelist in the database policy.

## 5. Dues
The dues screen is a player-by-week matrix. Payments are unique per player/week and keep the amount that was actually recorded.

## 6. Local testing
Copy `js/config.example.js` to `js/config.js` and enter browser-safe Supabase credentials.
