# Going live: Supabase setup (≈ 10 minutes)

This portal now uses **Supabase** for a real database, magic-link login, real-time
updates, and access control (clients only ever see their own portal; the admin
dashboard is hidden behind login and only visible to admins).

You do these one-time steps; everything else is already built.

---

## 1. Create a free Supabase project
1. Go to **https://supabase.com** → sign in → **New project**.
2. Give it a name (e.g. `orbit-portal`), set a database password, pick a region near you.
3. Wait ~1 minute for it to provision.

## 2. Run the database script
1. In your project, open **SQL Editor** → **New query**.
2. Open **`supabase/schema.sql`** from this repo, copy everything, paste it in, click **Run**.
   - This creates the tables, security rules, real-time, and the auto-provisioning
     that gives every new client their own portal.
3. At the bottom of that file, your email (`hello.theorbit@gmail.com`) is already added as an
   **admin**. To add teammates, edit the `admin_allowlist` INSERT (uncomment the line and add
   their emails) before running — or run it again later with their emails.

## 3. Turn on email (magic link)
1. **Authentication → Providers → Email**: make sure it's **enabled**.
2. **Authentication → URL Configuration**: set **Site URL** to your app URL
   (for local dev: `http://localhost:5173`; for production: your Vercel URL).
   Add both under **Redirect URLs** if you use both.

## 4. Add your keys
1. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
2. Locally: create **`.env.local`** in this folder (copy from `.env.example`) and paste them in.
3. On **Vercel**: Project → **Settings → Environment Variables**, add the same two:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   Then **redeploy**.

## 5. Try it
- Run `npm run dev`, open the app, enter **your admin email** → click the link in your inbox →
  you land in the **admin pipeline** (empty until a client signs up).
- In a private window, enter a **different email** (a test "client") → click its link →
  you get a fresh client portal on **Phase 1**.
- Submit Phase 1 as the client → watch it appear in the admin view **in real time** →
  approve it → the client's next phase unlocks **live**.

---

### How the security works
- Every write goes through server-side functions (`submit_phase`, `approve_phase`,
  `toggle_lock`) that enforce the rules — a client **cannot** approve their own phase,
  unlock phases, or read anyone else's data.
- Row Level Security makes clients' data invisible to each other; only allow-listed
  admins can see the pipeline.
- Admins are decided by the `admin_allowlist` table — no one can self-promote.
