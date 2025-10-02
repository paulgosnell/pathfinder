# 🚀 Quick Deployment Guide

**Get your ADHD Support Agent live in 15 minutes!**

---

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Supabase account (free tier for testing, Pro for production)
- ✅ OpenAI API key with billing enabled

---

## Step 1: Environment Setup (5 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "adhd-support-agent"
4. Choose a region close to your users
5. Set a database password (save it!)

### 1.2 Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase-schema.sql`
4. Paste and click **Run**
5. Repeat with `performance-schema.sql`

### 1.3 Get API Keys

**Supabase Keys:**
- Go to **Settings → API**
- Copy:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI Key:**
- Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Click **Create new secret key**
- Copy and save → `OPENAI_API_KEY`

---

## Step 2: GitHub Setup (3 minutes)

### 2.1 Push Code to GitHub

```bash
cd adhd-support-agent

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - production ready"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/adhd-support-agent.git
git push -u origin main
```

### 2.2 Configure GitHub Secrets (Optional - for CI/CD)

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Vercel Deployment (5 minutes)

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Click **Import**

### 3.2 Configure Environment Variables

In the deployment configuration, add these environment variables:

```bash
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Optional (for voice features):**
```bash
ELEVENLABS_API_KEY=your_key_here
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build
3. Visit your production URL!

---

## Step 4: Verification (2 minutes)

### 4.1 Test Basic Functionality

1. Visit your Vercel URL
2. Send a message: "Help with morning routines"
3. Verify you get a response with strategies

### 4.2 Check Database

1. Go to Supabase Dashboard → **Table Editor**
2. Check `agent_sessions` table
3. Should see your session data

### 4.3 View Analytics

1. Visit: `https://your-app.vercel.app/api/analytics`
2. Should see JSON with session stats

### 4.4 Check Admin Dashboard

1. Visit: `https://your-app.vercel.app/admin`
2. Should see metrics and charts

---

## Step 5: Configure Custom Domain (Optional)

### In Vercel Dashboard:

1. Go to **Project Settings** → **Domains**
2. Add your domain
3. Configure DNS as instructed
4. Wait for SSL certificate (automatic)
5. Update `NEXTAUTH_URL` env var if using auth

---

## Common Issues & Fixes

### "Missing environment variables"
**Fix:** Double-check all env vars in Vercel dashboard, redeploy

### "Database connection failed"
**Fix:** Verify Supabase keys are correct, check project is not paused

### "OpenAI API error"
**Fix:** Ensure API key is valid and has billing enabled

### Build fails
**Fix:** Check Vercel build logs, ensure `npm run build` works locally

### 429 Rate Limit errors
**Fix:** Normal during testing, wait 60 seconds or adjust in `middleware.ts`

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Test all main features
- [ ] Send test crisis message
- [ ] Check error logging works
- [ ] Verify voice features (if enabled)
- [ ] Share URL with test users

### First Week
- [ ] Monitor `/api/analytics` daily
- [ ] Check Supabase database growth
- [ ] Review Vercel logs for errors
- [ ] Collect initial user feedback
- [ ] Adjust rate limits if needed

### First Month
- [ ] Review OpenAI costs
- [ ] Optimize based on usage patterns
- [ ] Add missing strategies
- [ ] Improve prompts based on feedback
- [ ] Plan next iteration

---

## Useful Commands

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Test production build
npm test            # Run tests
npm run lint        # Check code quality
```

### Vercel CLI
```bash
vercel               # Deploy to preview
vercel --prod       # Deploy to production
vercel logs         # View production logs
vercel env ls       # List environment variables
```

### Database
```bash
# Backup database
# In Supabase Dashboard → Database → Backups

# Reset database (careful!)
# Re-run SQL migrations
```

---

## Monitoring URLs

Save these for quick access:

- **Production App**: `https://your-app.vercel.app`
- **Admin Dashboard**: `https://your-app.vercel.app/admin`
- **Analytics API**: `https://your-app.vercel.app/api/analytics`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://app.supabase.com`
- **OpenAI Usage**: `https://platform.openai.com/usage`

---

## Support Resources

- 📖 **Full Docs**: See `/docs` directory
- 🔧 **Technical Spec**: `docs/technical/technical-specification.md`
- ✅ **Deployment Checklist**: `PRODUCTION-DEPLOYMENT-CHECKLIST.md`
- 🚀 **CI/CD Setup**: `GITHUB-ACTIONS-SETUP.md`
- 📊 **Production Report**: `PRODUCTION-READINESS-REPORT.md`

---

## 🎉 You're Live!

Your ADHD Support Agent is now in production. Monitor it, iterate based on feedback, and help parents worldwide! 

**Need help?** Check the comprehensive docs or review the code comments.

---

**Last Updated:** September 30, 2025  
**Deployment Time:** ~15 minutes  
**Difficulty:** Easy

