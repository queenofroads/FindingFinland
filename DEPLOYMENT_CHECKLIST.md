# ✅ Deployment Checklist

## Before Deploying

- [x] Code pushed to GitHub ✅
- [ ] Run `ADD_XP_TO_QUESTS.sql` in Supabase
- [ ] Run `SEED_BADGES_NOW.sql` in Supabase
- [ ] Verify badges: `SELECT COUNT(*) FROM badges;` returns 11
- [ ] Test app locally at `http://localhost:3000`
- [ ] Verify XP system works
- [ ] Verify badges show up (0/11 instead of 0/0)

## Deploy to Vercel

- [ ] Go to https://vercel.com
- [ ] Log in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import "FindingFinland" repository
- [ ] Add environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Check all three environment checkboxes (Production, Preview, Development)
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes for build

## After Deployment

- [ ] Visit production URL
- [ ] Test signup/login
- [ ] Test quest completion
- [ ] Verify XP gain
- [ ] Test badge unlock
- [ ] Test daily spin wheel
- [ ] Check leaderboard

## If Something Breaks

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check Supabase RLS policies
4. Run migrations again if needed
5. Hard refresh browser (Cmd+Shift+R)

---

**Current Status**: Ready to deploy! 🚀

**Next Step**: Follow `DEPLOY_TO_VERCEL.md` guide
