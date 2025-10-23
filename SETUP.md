# Quick Setup Guide

Follow these steps to get Finding Finland running locally in 10 minutes!

## Step 1: Install Dependencies (1 minute)

```bash
cd finding-finland-app
npm install
```

## Step 2: Create Supabase Project (2 minutes)

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Fill in:
   - Project name: `finding-finland`
   - Database password: (save this somewhere)
   - Region: Choose closest to you
4. Wait ~2 minutes for project to initialize

## Step 3: Get Supabase Credentials (30 seconds)

1. In Supabase dashboard, click the gear icon (Settings)
2. Go to "API" section
3. Copy these two values:
   - Project URL
   - anon public key

## Step 4: Configure Environment Variables (30 seconds)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Set Up Database (3 minutes)

1. In Supabase dashboard, click "SQL Editor" in sidebar
2. Click "New query"
3. Open `supabase/migrations/001_initial_schema.sql` in your editor
4. Copy ALL the contents and paste into Supabase SQL Editor
5. Click "Run" (bottom right)
6. Wait for "Success" message

7. Click "New query" again
8. Open `supabase/migrations/002_seed_quests.sql`
9. Copy ALL the contents and paste into SQL Editor
10. Click "Run"
11. Wait for "Success" message

## Step 6: Start the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 7: Create an Account

1. Click "Start Your Journey" or go to `/signup`
2. Fill in:
   - Full name
   - Email
   - Password (min 6 characters)
   - Arrival date (optional)
3. Click "Create Account"

You're all set! Start completing quests!

## Troubleshooting

### "Invalid API credentials"
- Make sure you copied the FULL URL and key from Supabase
- Check there are no extra spaces in `.env.local`
- Restart the dev server: Ctrl+C and run `npm run dev` again

### "Failed to fetch"
- Check your internet connection
- Verify the Supabase project is running (green status in dashboard)
- Make sure you ran BOTH migration files

### Page keeps redirecting
- Clear your browser cookies
- Try in an incognito/private window
- Check that the middleware.ts file exists

### SQL errors
- Make sure you ran the migrations in order (001 then 002)
- Check the error message in Supabase for line numbers
- Try running the migrations again (it's safe to re-run)

## Next Steps

- Complete your first quest to earn points!
- Check the leaderboard to see your ranking
- Read the main README.md for deployment instructions
- Customize quests in the Supabase dashboard

Need more help? Check the full README.md file!
