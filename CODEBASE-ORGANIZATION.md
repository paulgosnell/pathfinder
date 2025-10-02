# 🗂️ Codebase Organization

**Date:** October 1, 2025  
**Status:** ✅ Organized and Clean

---

## 📂 Directory Structure

```
adhd-support-agent/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── sessions/                 # Session management pages
│   └── page.tsx                  # Main chat interface
│
├── components/                   # React components
│   ├── AccessibilityPanel.tsx
│   ├── ErrorBoundary.tsx
│   └── VoiceInput.tsx
│
├── lib/                          # Core application logic
│   ├── agents/                   # AI agent implementations
│   │   ├── crisis-tools-agent.ts
│   │   ├── proper-tools-agent.ts
│   │   └── strategy-agent.ts
│   ├── database/                 # Database operations
│   ├── monitoring/               # Performance tracking
│   ├── session/                  # Session management
│   └── supabase/                 # Supabase clients
│
├── docs/                         # 📚 All documentation
│   ├── README.md                 # Documentation index
│   ├── API-DOCUMENTATION.md      # API reference
│   │
│   ├── implementation/           # ✅ Completed features
│   │   ├── discovery-phase.md
│   │   ├── voice-integration.md
│   │   ├── system-implementation.md
│   │   ├── ui-fixes.md
│   │   └── database-fixes.md
│   │
│   ├── deployment/               # 🚀 Deployment guides
│   │   ├── deployment-guide.md
│   │   ├── production-checklist.md
│   │   ├── production-readiness.md
│   │   └── github-actions.md
│   │
│   ├── development/              # 💻 Developer guides
│   │   ├── quick-start.md
│   │   └── test-scenarios.md
│   │
│   ├── planning/                 # 🗺️ Future work
│   │   └── roadmap.md
│   │
│   ├── architecture/             # 🏛️ System design
│   │   └── system-architecture.md
│   │
│   ├── technical/                # 🔧 Technical specs
│   │   ├── technical-specification.md
│   │   ├── comprehensive-data-model.md
│   │   └── voice-integration.md
│   │
│   ├── design/                   # 🎨 UI/UX design
│   │   ├── design-system.md
│   │   ├── design-system.html
│   │   └── ui-ux-design-plan.md
│   │
│   └── client-updates/           # 👥 Progress reports
│       ├── ai-therapeutic-approach.md
│       └── progress-update-2025-01-25.md
│
├── migrations/                   # 🗄️ Database migrations
│   ├── README.md                 # Migration guide
│   ├── 01-initial-schema.sql
│   ├── 02-performance-schema.sql
│   └── 03-user-profiles-discovery.sql
│
├── scripts/                      # 🛠️ Utility scripts
│   ├── apply-discovery-migration.sh
│   ├── create-noise-texture.js
│   ├── generate-noise-browser.js
│   └── generate-noise.js
│
├── public/                       # Static assets
│   ├── images/
│   └── textures/
│
├── __tests__/                    # Test suites
│
├── .archive/                     # 📦 Archived files (gitignored)
│   ├── DISCOVERY-PHASE-IMPLEMENTATION.md (superseded)
│   ├── VOICE-IMPLEMENTATION-SUMMARY.md (superseded)
│   ├── TODAYS-WORK-SUMMARY.md (temporary)
│   └── dev.log (temporary)
│
├── .gitignore                    # Git ignore rules
├── README.md                     # 👈 START HERE
├── package.json
└── tsconfig.json
```

---

## 🎯 Key Changes Made

### 1. Documentation Reorganization ✅

**Before:**
- 16 markdown files scattered at root level
- Hard to find relevant documentation
- Mix of completed work, temporary notes, and planning docs

**After:**
- Clean root directory (only `README.md` remains)
- Organized into logical categories:
  - `docs/implementation/` - Completed features
  - `docs/deployment/` - Production deployment
  - `docs/development/` - Developer guides
  - `docs/planning/` - Future roadmap
  - `docs/technical/` - Technical specifications
  - `docs/design/` - UI/UX design system

### 2. Database Migrations ✅

**Before:**
- `supabase-schema.sql` at root
- `performance-schema.sql` at root
- `migrations/add-user-profile-columns.sql`
- No clear ordering or documentation

**After:**
- All migrations in `migrations/` directory
- Numbered for clear ordering:
  - `01-initial-schema.sql`
  - `02-performance-schema.sql`
  - `03-user-profiles-discovery.sql`
- Comprehensive `migrations/README.md` guide

### 3. Temporary Files Archived ✅

**Before:**
- `TODAYS-WORK-SUMMARY.md` - temporary notes
- `dev.log` - development log
- Duplicate documentation files

**After:**
- Moved to `.archive/` directory
- `.archive/` added to `.gitignore`
- Won't clutter version control

### 4. Documentation Index Created ✅

**New:** `docs/README.md` serves as complete navigation guide
- Quick links to common tasks
- "I want to..." section for goal-based navigation
- Clear categorization of all documentation

---

## 📋 File Mapping (Old → New)

| Old Location | New Location |
|-------------|-------------|
| `DISCOVERY-PHASE-COMPLETE.md` | `docs/implementation/discovery-phase.md` |
| `DISCOVERY-PHASE-IMPLEMENTATION.md` | `.archive/` (superseded) |
| `VOICE-INTEGRATION-GUIDE.md` | `docs/implementation/voice-integration.md` |
| `VOICE-IMPLEMENTATION-SUMMARY.md` | `.archive/` (superseded) |
| `UI-FIXES-APPLIED.md` | `docs/implementation/ui-fixes.md` |
| `DATABASE-FIX-SUMMARY.md` | `docs/implementation/database-fixes.md` |
| `IMPLEMENTATION-COMPLETE.md` | `docs/implementation/system-implementation.md` |
| `PRODUCTION-DEPLOYMENT-CHECKLIST.md` | `docs/deployment/production-checklist.md` |
| `PRODUCTION-READINESS-REPORT.md` | `docs/deployment/production-readiness.md` |
| `GITHUB-ACTIONS-SETUP.md` | `docs/deployment/github-actions.md` |
| `README-DEPLOYMENT.md` | `docs/deployment/deployment-guide.md` |
| `QUICK-START.md` | `docs/development/quick-start.md` |
| `TEST-SCENARIOS.md` | `docs/development/test-scenarios.md` |
| `WHAT-TO-BUILD-NEXT.md` | `docs/planning/roadmap.md` |
| `TODAYS-WORK-SUMMARY.md` | `.archive/` (temporary) |
| `dev.log` | `.archive/` (temporary) |
| `supabase-schema.sql` | `migrations/01-initial-schema.sql` |
| `performance-schema.sql` | `migrations/02-performance-schema.sql` |
| `migrations/add-user-profile-columns.sql` | `migrations/03-user-profiles-discovery.sql` |

---

## 🧭 Navigation Guide

### For Developers

**Getting Started:**
1. Read `README.md` (project overview)
2. Follow `docs/development/quick-start.md` (setup guide)
3. Review `docs/API-DOCUMENTATION.md` (API reference)

**Understanding the System:**
1. `docs/architecture/system-architecture.md` (high-level design)
2. `docs/technical/technical-specification.md` (detailed specs)
3. `docs/technical/comprehensive-data-model.md` (database schema)

**Working with Features:**
- Discovery Phase: `docs/implementation/discovery-phase.md`
- Voice Integration: `docs/implementation/voice-integration.md`
- Database: `docs/technical/comprehensive-data-model.md`

### For Deployment

**Deploying to Production:**
1. `docs/deployment/deployment-guide.md` (step-by-step instructions)
2. `docs/deployment/production-checklist.md` (pre-flight checks)
3. `docs/deployment/github-actions.md` (CI/CD setup)

**Database Migrations:**
1. `migrations/README.md` (migration guide)
2. Apply migrations in numerical order
3. Verify with provided SQL queries

### For Design

**UI/UX:**
- `docs/design/design-system.md` (component library)
- `docs/design/design-system.html` (interactive preview)
- `docs/design/ui-ux-design-plan.md` (design principles)

---

## ✅ Benefits of New Organization

1. **Easier Onboarding**
   - New developers can find what they need quickly
   - Clear path from setup → understanding → contribution

2. **Better Maintenance**
   - Related docs grouped together
   - Easy to update feature documentation
   - Clear migration history

3. **Cleaner Git History**
   - `.archive/` ignored from version control
   - No more temporary files in commits
   - Clear separation of docs vs code

4. **Improved Discoverability**
   - Logical folder structure
   - Comprehensive docs/README.md index
   - Consistent naming conventions

5. **Scalable Structure**
   - Easy to add new documentation
   - Clear patterns to follow
   - Room for future growth

---

## 📝 Documentation Standards

### File Naming
- Use **kebab-case**: `feature-name.md`
- Be **descriptive**: `voice-integration.md` not `voice.md`
- **Date progress updates**: `progress-update-2025-01-25.md`

### Migration Naming
- Use **numbered prefixes**: `01-feature.sql`
- Be **descriptive**: `03-user-profiles-discovery.sql`
- **Sequential order**: Always increment from last migration

### Folder Structure
- **Keep it flat**: Max 2-3 levels deep
- **Group by purpose**: implementation, deployment, planning
- **Use README.md**: Add index files for complex directories

---

## 🚨 Important Notes

### Don't Break These Rules

1. **Never commit to `.archive/`**
   - It's gitignored for a reason
   - These are temporary/superseded files

2. **Keep root directory clean**
   - Only essential config files at root
   - All docs go in `docs/`
   - All migrations go in `migrations/`

3. **Number migrations sequentially**
   - Don't skip numbers
   - Don't reuse numbers
   - Update migrations/README.md

4. **Update the docs index**
   - When adding new documentation
   - Update `docs/README.md`
   - Add to appropriate category

---

## 🔄 Maintenance Tasks

### Monthly
- [ ] Review `.archive/` - delete truly obsolete files
- [ ] Update `docs/planning/roadmap.md` with completed items
- [ ] Archive any temporary documentation

### When Adding Features
- [ ] Create implementation doc in `docs/implementation/`
- [ ] Update `docs/README.md` with new doc link
- [ ] Add migration if database changes (numbered!)
- [ ] Update API docs if new endpoints

### Before Release
- [ ] Review all documentation for accuracy
- [ ] Check all links work
- [ ] Update version numbers
- [ ] Archive old progress updates

---

## 📞 Questions?

**Can't find a document?**
→ Check `docs/README.md` first

**Need to add documentation?**
→ Follow the folder structure and naming conventions

**Unsure where something goes?**
→ Refer to this document's structure diagram

---

**Organization Status:** ✅ Complete  
**Last Reviewed:** October 1, 2025  
**Maintainer:** Paul Gosnell

