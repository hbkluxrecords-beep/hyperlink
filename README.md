# HYPERLINK

A homepage for streamers, musicians, creators, and developers. One link, every thing.

Editorial / risograph design. React + Vite + Tailwind on the frontend, Supabase (Postgres) on the backend, deployed free on Vercel.

---

## What's in the box

- **5 pages** — Landing, Create flow (3 steps), Profile (`/:handle`), Directory, Lookup
- **Real persistence** — Supabase Postgres so profiles save forever and work across devices
- **Real URLs** — `yoursite.com/yourname` works as a shareable link
- **Free hosting** — Vercel free tier auto-deploys on every `git push`
- **Free database** — Supabase free tier covers ~50k profiles

---

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Without a `.env` file the app uses `localStorage` as a fallback so you can preview the UI, but profiles won't sync between devices.

---

## Deploy in ~10 minutes

You'll create a Supabase project (the database), a GitHub repo (the code), and a Vercel project (the hosting). All three are free.

### 1. Create the Supabase database

1. Go to <https://supabase.com> and sign in with GitHub.
2. Click **New project**. Name it `hyperlink`, set a database password (save it somewhere), pick a region close to you, click **Create**.
3. Wait ~2 minutes for it to provision.
4. In the left sidebar click **SQL Editor** → **New query**.
5. Open `supabase/schema.sql` from this repo, paste the entire contents into the editor, click **Run**. You should see "Success. No rows returned."
6. In the left sidebar click **Project Settings** (gear icon) → **API**.
7. Copy two values somewhere — you'll need them in step 3:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (a long string starting with `eyJ…`)

### 2. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create hyperlink --public --source=. --push
```

If you don't have the `gh` CLI, create an empty repo on GitHub.com manually, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/hyperlink.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to <https://vercel.com> and sign in with GitHub.
2. Click **Add New → Project**.
3. Find your `hyperlink` repo in the list, click **Import**.
4. Under **Environment Variables**, add two variables:
   - `VITE_SUPABASE_URL` — the Project URL from Supabase step 7
   - `VITE_SUPABASE_ANON_KEY` — the anon key from Supabase step 7
5. Click **Deploy**.

Two minutes later you'll have a live URL like `hyperlink-abc.vercel.app`. Every future `git push` redeploys automatically.

### 4. (Optional) Custom domain

In Vercel → your project → **Settings → Domains**, add a domain you own. Vercel walks you through the DNS records. Free SSL is automatic.

---

## Project structure

```
hyperlink/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Marketing homepage
│   │   ├── Create.jsx        # 3-step profile builder
│   │   ├── Profile.jsx       # Public /:handle page
│   │   ├── Explore.jsx       # Directory of all profiles
│   │   ├── Lookup.jsx        # Find a handle
│   │   └── NotFound.jsx
│   ├── components/
│   │   └── Primitives.jsx    # Grain, Halftone, Stamp
│   ├── lib/
│   │   ├── design.js         # Tokens (colors, categories, presets)
│   │   └── storage.js        # Supabase client + localStorage fallback
│   ├── main.jsx              # React Router entry
│   └── index.css             # Tailwind + globals
├── supabase/
│   └── schema.sql            # Database schema (run this in Supabase)
├── index.html
├── vercel.json               # SPA rewrites so /handle works
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## How the storage layer works

`src/lib/storage.js` exposes four functions: `loadProfile`, `isHandleTaken`, `saveProfile`, `loadRecentProfiles`. They use Supabase when env vars are set, and fall back to `localStorage` when they aren't (useful for local UI tweaks without spinning up the DB).

Handle uniqueness is enforced by a Postgres `UNIQUE` constraint on the `handle` column, so even if two people publish at the exact same moment, only one wins — the other gets a clean error.

---

## Adding features later

A few obvious next steps when you're ready:

- **Auth + edit** — wire up Supabase Auth (email or GitHub OAuth) so people can sign in and edit their own profile. Right now profiles are write-once.
- **Click tracking** — add a `clicks` table; route outgoing links through `/r/:profile/:linkId` to count them.
- **Custom themes** — let users pick a color palette (riso orange, riso blue, riso green) per profile.
- **Open Graph images** — generate per-profile share cards with `@vercel/og`.
- **Analytics** — Vercel Analytics is one click in the dashboard.

---

## License

MIT. Do whatever you want.
