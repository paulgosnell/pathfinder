# Admin Dashboard Setup Guide

The **Coaching Intelligence Center** is now installed! This comprehensive admin dashboard gives you real-time visibility into your coaching sessions, user activity, and system performance.

## 🚀 Quick Start

### 1. Database Migration (REQUIRED)

The admin system requires new database tables. Run this migration in your Supabase SQL Editor:

**Migration Name:** `add_admin_system`

Already applied automatically via MCP! ✅

Tables created:
- `admins` - Stores admin user access control
- `admin_audit_log` - Logs all admin actions for security

### 2. Grant Yourself Admin Access

You need to grant admin access to your user account. First, find your user ID:

```sql
-- Run this in Supabase SQL Editor to find your user ID
SELECT id, created_at FROM users ORDER BY created_at DESC LIMIT 10;
```

Then grant admin access using the script:

```bash
cd adhd-support-agent
npx tsx scripts/grant-admin.ts "YOUR_USER_ID" "your-email@example.com"
```

**Example:**
```bash
npx tsx scripts/grant-admin.ts "12311a6c-a1f0-4330-82fc-d19117bb55a6" "paul@example.com"
```

### 3. Access the Dashboard

Navigate to: **`/admin`**

You'll now see the full Coaching Intelligence Center with 5 tabs:
- 📊 **Overview** - Executive metrics, quality scores, 7-day trends
- 🔥 **Live Monitor** - Active sessions in real-time
- 💬 **Sessions** - All sessions with filters
- 👥 **Users** - User management and profiles
- 📝 **Waitlist** - Email signup management

---

## 📊 Dashboard Features

### Overview Tab

**Key Metrics Cards:**
- Active Sessions (currently ongoing)
- Total Users
- Total Messages
- Crisis Alerts

**Mode Distribution:**
- Chat vs Voice session percentages

**Today's Activity:**
- Sessions, tokens, cost, avg response time

**Coaching Quality Metrics:**
- % Reached Options Phase (target: >50%)
- Avg Reality Depth (target: ≥10)
- % Emotions Reflected (target: >70%)
- Avg Parent Ideas Generated (target: ≥2)

**7-Day Trends Table:**
- Daily API calls, tokens, cost, response time, crises

### Live Monitor Tab

Real-time table of active sessions showing:
- User ID (anonymized)
- Mode (chat/voice)
- Current GROW phase
- Reality exploration depth (color-coded)
- Message count
- Session duration
- Last activity timestamp
- "View Details" link

### Sessions Tab

**Filters:**
- Mode (all/chat/voice)
- GROW Phase (goal/reality/options/will/closing)
- Crisis Level (none/low/medium/high)

**Session Cards:**
- Mode, phase, crisis indicators
- Start time & message count
- Therapeutic goal
- "View Details" button

### Users Tab

**User Table:**
- User ID (truncated)
- Total sessions
- Total cost
- Last active date
- GDPR consent status
- "View Profile" link

### Waitlist Tab

**Waitlist Signups Table:**
- Email address
- Early tester opt-in
- Signup date
- Contacted status
- Source (landing_page, etc.)

---

## 🔍 Drill-Down Pages

### Session Details (`/admin/session/[id]`)

**Left Sidebar:**
- Session metadata (user, mode, dates, status, crisis level)
- GROW phase progression indicator
- Coaching state metrics:
  - Reality depth (X/10)
  - Emotions reflected (yes/no)
  - Exceptions explored (yes/no)
  - Ready for options (yes/no)
  - Strengths identified (chips)
  - Parent-generated ideas (list)
- Performance metrics (tokens, cost, response time)

**Main Content:**
- Full conversation transcript
- Color-coded by role (user/assistant/tool)
- Timestamps
- Tool calls with arguments (JSON)

### User Profile (`/admin/user/[id]`)

**Left Sidebar:**
- Account info (user ID, join date, GDPR consent)
- Usage stats (sessions, messages, tokens, cost)
- Learned context:
  - Child age range
  - Parent stress level
  - Common triggers
  - Home constraints
  - Successful strategies
  - Failed strategies

**Main Content:**
- Session history timeline
- Session cards with:
  - Mode, phase, crisis indicators
  - Timestamp
  - Therapeutic goal
  - Mini-stats (messages, depth, strategies, ideas)
  - "View Details" button

---

## 🔐 Security Features

**Access Control:**
- Admin-only routes protected by `AdminProtectedRoute` component
- RLS policies on `admins` and `admin_audit_log` tables
- Only admins can view admin data

**Audit Trail:**
- All admin actions logged to `admin_audit_log`
- Tracks: action type, target type/id, details, IP, user agent
- Actions logged:
  - `view_dashboard`
  - `view_session_details`
  - `view_user_profile`

**GDPR Compliance:**
- User data anonymized (User#12345678)
- GDPR consent status visible
- Scheduled deletion dates shown
- No PII in URLs

---

## 🎨 Design System

**Colors:**
- `teal` (#4FD1C5) - Primary actions, active states
- `lavender` (#D7CDEC) - Secondary, voice mode
- `sage` (#B5C99A) - Success, strengths
- `coral` (#F9A8A8) - Alerts, errors, crisis
- `navy` (#1E293B) - Text primary
- `slate` (#586C8E) - Text secondary
- `cream` (#F9F7F3) - Background

**Components:**
- Rounded 2xl cards with shadow-sm
- Hover states on interactive elements
- Color-coded badges for status/mode/phase
- Responsive grid layouts

---

## 🔄 Auto-Refresh

Dashboard auto-refreshes every **30 seconds** to keep data current.

Manual refresh button available in header.

---

## 📈 Coaching Quality Score (Concept)

Future enhancement: Calculate a 0-100 coaching quality score based on:
- Reality depth achieved / 10 (40 points)
- Emotions reflected (15 points)
- Exceptions explored (15 points)
- Parent ideas generated (20 points)
- Session completed to Will phase (10 points)

---

## 🚨 Crisis Management

Sessions with `crisis_level != 'none'` are:
- Highlighted in red on Live Monitor
- Shown in Crisis Alerts metric
- Tracked in 7-day trends
- Visible in session details

---

## 🎯 Next Steps

**Recommended Enhancements:**
1. **Export functionality** - CSV export for sessions/users
2. **Charts** - Visual trends with Recharts/Chart.js
3. **Real-time subscriptions** - Live updates via Supabase subscriptions
4. **Email notifications** - Alert on crisis detection
5. **Strategy effectiveness heatmap** - Visual matrix of strategy performance
6. **Coaching quality score** - Automated scoring algorithm
7. **User search** - Search by email/ID
8. **Bulk actions** - Mark waitlist as contacted

---

## 📝 Files Created

**Library:**
- `lib/admin/auth.ts` - Admin authentication utilities
- `lib/admin/queries.ts` - Database query functions

**Components:**
- `components/AdminProtectedRoute.tsx` - Admin route protection

**Pages:**
- `app/admin/page.tsx` - Main dashboard with 5 tabs
- `app/admin/session/[id]/page.tsx` - Session details
- `app/admin/user/[id]/page.tsx` - User profile

**Scripts:**
- `scripts/grant-admin.ts` - Grant admin access script

**Docs:**
- `ADMIN-DASHBOARD-SETUP.md` - This file

---

## 🐛 Troubleshooting

**Can't access /admin:**
- Check you've granted yourself admin access via script
- Verify user ID matches your account
- Check browser console for errors

**Data not loading:**
- Verify Supabase connection
- Check RLS policies are enabled
- Check browser console for errors
- Try manual refresh

**Queries failing:**
- Verify all migrations applied
- Check Supabase table structure matches schema
- Use Supabase SQL Editor to test queries

---

## 🎉 You're Done!

The Coaching Intelligence Center is ready to use. Navigate to `/admin` and explore your coaching data!

**Questions?** Check the code comments or database schema for details.
