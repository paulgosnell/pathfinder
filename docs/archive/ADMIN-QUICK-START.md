# Admin Dashboard - Quick Start ⚡

## 1️⃣ Find Your User ID

```sql
-- Run in Supabase SQL Editor
SELECT id, created_at FROM users ORDER BY created_at DESC LIMIT 5;
```

Copy your user ID (looks like: `12311a6c-a1f0-4330-82fc-d19117bb55a6`)

## 2️⃣ Grant Admin Access

```bash
cd adhd-support-agent
npx tsx scripts/grant-admin.ts "YOUR_USER_ID" "your-email@example.com"
```

Example:
```bash
npx tsx scripts/grant-admin.ts "12311a6c-a1f0-4330-82fc-d19117bb55a6" "paul@example.com"
```

## 3️⃣ Access Dashboard

Navigate to: **`http://localhost:3000/admin`**

(or your deployed URL + `/admin`)

## 4️⃣ Explore

**5 Tabs Available:**
- 📊 **Overview** - Metrics & trends
- 🔥 **Live Monitor** - Active sessions
- 💬 **Sessions** - All sessions with filters
- 👥 **Users** - User management
- 📝 **Waitlist** - Email signups

**Click "View Details" on any session or user to drill down!**

---

## Troubleshooting

**Can't access /admin?**
```bash
# Verify you're in the admins table
SELECT * FROM admins;
```

**Need to grant admin to someone else?**
```bash
npx tsx scripts/grant-admin.ts "THEIR_USER_ID" "their-email@example.com"
```

---

## What You Can See

✅ Active coaching sessions in real-time
✅ Full conversation transcripts
✅ GROW phase progression
✅ Coaching quality metrics (depth, emotions, ideas)
✅ User profiles with learned context
✅ Cost & performance tracking
✅ 7-day trend analysis

---

**That's it! You're ready to go.** 🎉

For full documentation, see [ADMIN-DASHBOARD-SETUP.md](ADMIN-DASHBOARD-SETUP.md)
