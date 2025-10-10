# Production Cleanup Plan

## Files to Remove

### Duplicate Landing Page
- **Remove**: `app/landing/page.tsx`
- **Reason**: Landing page is at `app/page.tsx` (root), `/landing` route is unused
- **Impact**: None - no references found

### Test/Development Files
- **Keep**: `app/api/test/route.ts` - Useful for health checks and debugging
- **Mark**: Add production guard to prevent exposure

### Analytics Dashboard
- **Keep**: `app/admin/page.tsx` - Useful for monitoring
- **Action**: Add authentication guard before production

### Unused Documentation
- **Archive**: Old progress updates and outdated planning docs
- **Keep**: Current technical docs and implementation guides

---

## Documentation Reorganization

### Current Structure (29 files, messy)
```
docs/
├── API-DOCUMENTATION.md
├── COACHING-METHODOLOGY.md
├── README.md
├── VOICE-MODE-INTEGRATION-PLAN.md  # OUTDATED - Voice already implemented
├── VOICE-MODE-SETUP.md
├── architecture/
│   └── system-architecture.md
├── client-updates/  # 4 files - mostly historical
├── deployment/  # 4 files - some overlap
├── design/  # 2 files
├── development/  # 2 files
├── implementation/  # 4 files - some outdated
├── planning/  # 2 files - roadmap vs feature-roadmap overlap
└── technical/  # 3 files - some duplication with architecture/
```

### Proposed Structure (Cleaner)
```
docs/
├── README.md  # Table of contents
├── getting-started/
│   ├── quick-start.md
│   ├── environment-setup.md
│   └── database-setup.md
├── features/
│   ├── coaching-methodology.md
│   ├── voice-mode.md
│   ├── crisis-detection.md
│   └── strategy-database.md
├── api/
│   ├── endpoints.md
│   ├── authentication.md
│   └── rate-limiting.md
├── architecture/
│   ├── system-overview.md
│   ├── data-model.md
│   └── agent-design.md
├── deployment/
│   ├── production-checklist.md
│   ├── vercel-deployment.md
│   └── environment-variables.md
├── design/
│   ├── design-system.md
│   └── accessibility.md
├── maintenance/
│   ├── database-cleanup.md  # Our new doc
│   ├── monitoring.md
│   └── troubleshooting.md
└── archive/  # Historical docs for reference
    ├── client-updates/
    ├── implementation-logs/
    └── deprecated/
```

---

## Code Cleanup Tasks

### 1. Remove TODOs
- [x] `/components/ErrorBoundary.tsx:49` - TODO: Send to error tracking service
  - Decision: Remove comment or add Sentry integration
- [x] `/app/landing/page.tsx:17` - TODO: Integrate with backend
  - Decision: File will be deleted (duplicate)

### 2. Secure Admin Routes
- `/app/admin/page.tsx` - Add authentication check
- `/app/sessions/page.tsx` - Verify authentication
- `/app/api/analytics/route.ts` - Add API key or auth

### 3. Production Guards
- `/app/api/test/route.ts` - Add `if (process.env.NODE_ENV !== 'production')` guard

### 4. Environment Variables Audit
Required for production:
```env
# Core
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# Voice Mode (Optional)
NEXT_PUBLIC_ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=

# Production Only
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 5. Remove Unused Imports/Exports
- Audit all files for unused imports
- Remove dead code branches
- Clean up console.logs in production

---

## Security Checklist

- [ ] All API keys in environment variables (not hardcoded)
- [ ] Service role key only used server-side
- [ ] RLS policies enabled on all Supabase tables
- [ ] Admin routes require authentication
- [ ] Rate limiting enabled on public endpoints
- [ ] CORS configured for production domain only
- [ ] Error messages don't expose sensitive info
- [ ] No console.logs with user data

---

## Performance Checklist

- [ ] Next.js optimizations enabled
- [ ] Images optimized (using next/image)
- [ ] Fonts preloaded
- [ ] API routes use edge runtime where possible
- [ ] Database queries optimized (indexes created)
- [ ] Response caching where appropriate
- [ ] Bundle size analyzed and optimized

---

## Testing Checklist

- [ ] All Jest tests passing
- [ ] Manual testing of critical paths:
  - [ ] Landing page signup
  - [ ] User authentication (login/register)
  - [ ] Chat conversation flow
  - [ ] Crisis detection triggers
  - [ ] Voice mode connection
  - [ ] Strategy retrieval
  - [ ] Session persistence
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.1)

---

## Deployment Checklist

- [ ] Database migrations applied in correct order
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics configured (optional)
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## Post-Launch Monitoring

### Week 1
- Monitor error rates daily
- Check database growth
- Review token usage and costs
- Gather user feedback

### Week 2-4
- Analyze conversation quality
- Review crisis detection accuracy
- Optimize slow queries
- Address user-reported issues

### Ongoing
- Monthly cost review
- Quarterly security audit
- User feedback incorporation
- Strategy database updates
