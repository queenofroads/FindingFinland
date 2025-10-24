# 🚀 Deploy Finding Finland to Vercel

## Prerequisites
✅ Code is pushed to GitHub: `https://github.com/queenofroads/FindingFinland`
✅ Supabase database is set up with migrations
✅ Badge data is seeded

---

## Step 1: Log into Vercel

1. Go to **https://vercel.com**
2. Click **"Log In"**
3. Sign in with your **GitHub account**

---

## Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"FindingFinland"** in the list
4. Click **"Import"**

---

## Step 3: Configure Project Settings

Vercel will auto-detect it's a Next.js project. You should see:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

---

## Step 4: Add Environment Variables

This is **CRITICAL** - your app won't work without these!

Click **"Environment Variables"** section and add:

### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL
  - Find this in Supabase → Project Settings → API → Project URL
  - Example: `https://xyzabcdef.supabase.co`

### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key
  - Find this in Supabase → Project Settings → API → Project API keys → `anon` `public`
  - It's a long string starting with `eyJ...`

### Important:
- Add these for **Production**, **Preview**, and **Development** environments
- Check all three checkboxes for each variable

---

## Step 5: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build your app (`npm run build`)
   - Deploy to production

3. Wait 2-3 minutes for the build to complete

You'll see:
```
Building...
→ Installing dependencies
→ Running build command
→ Uploading build output
→ Deployment ready!
```

---

## Step 6: Get Your Production URL

Once deployed, you'll see:

**🎉 Congratulations! Your project has been deployed.**

Your production URL will be something like:
```
https://finding-finland.vercel.app
```

Click **"Visit"** to open your live app!

---

## Step 7: Test Your Production App

1. Visit your production URL
2. Create a new account or log in
3. Test the gamification features:
   - ✅ XP bar should show
   - ✅ Badges button should show (0/11)
   - ✅ Daily Spin should work
   - ✅ Complete a quest and see XP gain
   - ✅ Check if badge unlocks work

---

## Troubleshooting

### Build Fails with "Environment variables not found"
**Solution**: Go back to Project Settings → Environment Variables and add both Supabase variables

### App loads but shows "Failed to fetch"
**Solution**:
1. Check Supabase RLS policies are enabled
2. Verify environment variables are correct
3. Check Supabase API keys haven't expired

### "Hydration error" in console
**Solution**: Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

### Badge data missing (shows 0/0)
**Solution**:
1. Go to Supabase SQL Editor
2. Run `SEED_BADGES_NOW.sql`
3. Verify: `SELECT COUNT(*) FROM badges;` should return 11

### TypeScript build errors
**Solution**:
1. Run locally first: `npm run build`
2. Fix any TypeScript errors
3. Commit and push
4. Redeploy on Vercel

---

## Post-Deployment

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Monitor Deployments
1. Go to Vercel dashboard → Your project
2. Click "Deployments" tab
3. See logs and status for each deployment

### Automatic Deployments
Every time you push to `main` branch, Vercel will automatically:
- Build your app
- Run tests
- Deploy to production

---

## 🎉 You're Done!

Your Finding Finland app is now live with:
- ✅ XP system
- ✅ 11 badges with auto-unlock
- ✅ Daily spin wheel
- ✅ Enhanced quest cards
- ✅ Nordic design
- ✅ Confetti celebrations
- ✅ Leaderboard
- ✅ Authentication

**Share your app with users! 🇫🇮✨**

Production URL: `https://finding-finland.vercel.app` (or your custom domain)
