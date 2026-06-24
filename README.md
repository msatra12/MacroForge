# MacroForge 🏋️

A full-stack fitness tracking web app for hybrid and strength athletes. Track macros, log workouts, and monitor personal records.

## Features

- **Auth** — Sign up / log in with local accounts (client-side, no backend required)
- **Profile setup** — Age, weight, height, gender, goal (bulk/cut/maintain/recomp), athlete type, activity level
- **Calorie & macro tracker** — Auto-calculated daily targets using Mifflin-St Jeor + TDEE. Log meals, quick-add presets, real-time progress bars, over/under alerts
- **Workout logger** — Strength, cardio, and hybrid sessions. Log sets, reps, and weight per exercise
- **Personal record tracking** — Auto-detects new PRs when you log a new best. 1RM estimator included
- **History** — Full workout history log

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- `localStorage` for data persistence (no backend/database needed to get started)

## Getting Started Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (when you're ready)

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial MacroForge commit"
   git remote add origin https://github.com/YOUR_USERNAME/macroforge.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo

3. Vercel auto-detects Next.js — just click **Deploy**. No environment variables needed.

## Upgrading to a Real Database (Future)

When you're ready to go production with real user accounts and persistent data, swap `localStorage` in `lib/storage.ts` for:
- **Supabase** (Postgres + Auth, free tier) — recommended
- **PlanetScale** (MySQL)
- **MongoDB Atlas**

And add **NextAuth.js** or **Clerk** for secure authentication.

## Folder Structure

```
app/
  page.tsx          # Entry point, auth gate
  layout.tsx        # Root layout + fonts
  globals.css       # Dark theme CSS variables
components/
  AuthPage.tsx      # Login / signup
  ProfileSetup.tsx  # 3-step onboarding wizard
  Dashboard.tsx     # Main shell + nav
  CalorieTracker.tsx # Macro tracking
  WorkoutTracker.tsx # Workout logging + PRs
lib/
  types.ts          # TypeScript interfaces
  storage.ts        # localStorage data layer
  macros.ts         # TDEE + macro calculations
```
