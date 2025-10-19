# Pathfinder ADHD Support Agent - Executive Summary

**Version**: 1.0
**Last Updated**: October 19, 2025
**Status**: Production-Ready
**Full Documentation**: [PROJECT-MASTER-DOC.md](./PROJECT-MASTER-DOC.md)

---

## What is Pathfinder?

**Pathfinder** is an AI-powered therapeutic coaching platform for parents of children with ADHD. Unlike typical chatbots that dispense generic advice, Pathfinder uses **evidence-based coaching methodologies** (GROW Model + OARS Framework) to help parents discover their own solutions through professional therapeutic guidance.

### The Problem We Solve

Parents of ADHD children face:
- **Constant overwhelm** from behavioral challenges (homework battles, emotional meltdowns, school struggles)
- **Limited access** to professional ADHD coaches (expensive, long waitlists, geographic barriers)
- **Generic online advice** that doesn't fit their specific child or family situation
- **Isolation and burnout** without peer support or validation

### Our Solution

A 24/7 AI coaching platform that provides:
- **Professional Coaching** using GROW Model (Goal, Reality, Options, Will) - the same framework used by certified coaches
- **50-Minute Therapeutic Sessions** - real depth, not artificial message limits
- **Crisis-Safe Design** - every message screened for suicidal ideation, violence risk, severe burnout
- **Dual Interface** - text chat for reflection, voice mode for natural conversation
- **Multi-Child Support** - manage multiple children with separate profiles and strategies
- **GDPR-Compliant** - privacy-first architecture with 2-year data retention

---

## How It Works

### The Coaching Approach

**Traditional ADHD Chatbot**:
```
Parent: "My child won't do homework"
Bot: "Here are 5 strategies: visual timer, break tasks into chunks,
      rewards, quiet space, checklist"
```
**Result**: Parent feels overwhelmed, doesn't know where to start.

**Pathfinder Coaching**:
```
Parent: "My child won't do homework"
Agent: "That sounds really frustrating. Tell me what homework time looks like now"
Parent: "He sits at the table, then gets up 100 times..."
Agent: "When does he stay focused better - are there times when this goes
        more smoothly?"
Parent: "Hmm... actually when he does homework right after school he's better"
Agent: "That's a really useful observation. What ideas do you have about using that?"
Parent: "I could make 'homework first, play after' a consistent rule?"
Agent: "How confident do you feel about trying that on a 1-10 scale?"
Parent: "8 - that feels doable"
```
**Result**: Parent discovered their own solution, understands WHY it works, feels empowered.

### The Technology

**Multi-Agent System** (Crisis-First Processing):
1. **Crisis Detection Agent** - Screens every message for safety (suicide, violence, burnout)
2. **Discovery Agent** - Optional 8-10 exchange onboarding to build child profile
3. **Main Coaching Agent** - GROW Model sessions with minimum 10 exchanges in Reality phase
4. **Voice Mode** - ElevenLabs real-time voice AI (~300ms latency)

**Database**: Supabase (PostgreSQL) with Row-Level Security, storing conversations, session state, child profiles, performance metrics

**AI Models**:
- OpenAI GPT-4o-mini (text chat) - $0.01 per session
- ElevenLabs Conversational AI (voice) - $0.40 per session

---

## Key Differentiators

### 1. Evidence-Based Coaching (Not Advice-Giving)

**GROW Model** - Professional coaching framework:
- **Goal** (10%): Set session intention
- **Reality** (60%): Deep exploration - minimum 10-15 exchanges before offering solutions
- **Options** (20%): Parent-generated ideas prioritized
- **Will** (10%): Action planning with confidence check

**OARS Framework** - Motivational interviewing:
- **Open questions** - "What's happening now?" (never yes/no)
- **Affirmations** - "That's really thoughtful" (specific, not generic)
- **Reflective listening** - "That sounds exhausting" (validate emotions)
- **Summaries** - Pull themes together every 5-7 exchanges

### 2. Crisis-Safe by Design

Every message passes through crisis detection BEFORE main conversation:
- **Keywords detected**: "kill myself", "hurt my child", "can't cope anymore"
- **Risk levels**: none/low/medium/high/critical
- **Emergency resources**: 999, Samaritans 116 123, Crisis Text Line, Mind Infoline
- **Action**: If critical/high risk → provide resources, pause conversation

**Current Status**: 0 critical incidents in 162+ messages

### 3. Multi-Child Family Support

Original system supported ONE child per parent (critical limitation for real families).

**New Architecture** (October 2025):
- `child_profiles` table: Many children per parent
- Independent tracking per child: challenges, strengths, strategies, school info, medication
- Family overview page with photos and color-coded information
- Session linking to specific children

**Current**: 5 parents supporting 9 children

### 4. Dual Interface (Chat + Voice)

**Text Chat**: Thoughtful, reflective, can re-read previous exchanges
**Voice Mode**: Natural, hands-free, emotional nuance

**Same therapeutic approach** across both interfaces:
- Both use GROW Model for coaching sessions
- Both track session state (GROW phase, depth counter)
- Both save to same database tables (unified conversation history)

**Innovation**: Voice prompts controlled from code (version controlled), not ElevenLabs dashboard

### 5. Time-Adaptive Sessions

Sessions adapt to parent's available time:
- **5 minutes**: Quick check-in (Reality depth: 2 exchanges)
- **15 minutes**: Standard check-in (Reality depth: 4-6 exchanges)
- **30 minutes**: Short coaching (Reality depth: 6-8 exchanges)
- **50 minutes**: Full coaching (Reality depth: 10-15 exchanges)

No artificial message limits - sessions end when parent has their own action plan.

### 6. ADHD-Friendly Design

**Typography**:
- Atkinson Hyperlegible font (designed for low vision, high legibility)
- Quicksand headings (rounded, friendly, calming)
- Line spacing: 1.6-1.8 (easier scanning)

**Colors**: Calm, low-stimulation palette (navy, cream, lavender, teal, sage)

**Interaction**:
- Large touch targets (minimum 44x44px)
- High contrast ratios (WCAG AAA)
- Mobile-first responsive design
- No flashing animations

---

## Current Status

### Production Metrics (October 19, 2025)

**Users & Sessions**:
- Active Users: 5 parents
- Total Sessions: 10 coaching conversations
- Messages Logged: 162 exchanges (chat + voice)
- Child Profiles: 9 children being supported
- Crisis Incidents: 0 critical events

**Performance**:
- Response Time: ~800ms (text), ~300ms (voice)
- Token Usage: 1050 tokens/session average
- Cost: $0.01/session (text), $0.40/session (voice)
- Current Monthly Cost: $4.10/month (sustainable at scale)
- Error Rate: <0.1%

**Infrastructure**:
- Platform: Vercel (99.9% uptime SLA)
- Database: Supabase PostgreSQL (EU region for GDPR)
- AI Providers: OpenAI (text), ElevenLabs (voice)

### Technical Health

**Strengths**:
- ✅ Solid architecture (Next.js 15, AI SDK v5, Supabase)
- ✅ Evidence-based therapeutic approach
- ✅ Crisis-safe design (0 critical incidents)
- ✅ Multi-child support (critical for real-world use)
- ✅ GDPR-compliant data management
- ✅ Beautiful ADHD-friendly design

**Technical Debt** (Manageable):
- ⚠️ High Priority: Supabase security warnings, rate limiting, env validation (1-2 weeks to fix)
- ⚠️ Medium Priority: 78 console.log statements, unused strategy agent (code quality, non-blocking)
- ⚠️ Low Priority: Hardcoded values, test timeouts (future enhancements)

**Assessment**: Production-ready, no critical blockers for public launch.

---

## Business Model

### Pricing Tiers (Planned - Stripe Integration)

**Free Tier**:
- 5 text chat sessions per month
- No voice mode
- Basic child profile (1 child)
- Community support only

**Plus Tier** ($9.99/month):
- Unlimited text chat sessions
- 10 voice sessions per month
- Multi-child support (unlimited children)
- Priority support
- Strategy library access

**Pro Tier** ($29.99/month):
- Unlimited text + voice sessions
- Multi-child support
- Therapist referral network access
- Group coaching sessions (live, facilitated)
- Advanced analytics dashboard

### Revenue Projections

**Current** (5 users, early testing):
- Monthly Revenue: $0 (pre-launch)
- Monthly Cost: $4.10 (AI + infrastructure)

**Projected at 100 Users** (conservative):
- Monthly Revenue: $1,500 (50 Free, 40 Plus, 10 Pro)
- Monthly Cost: $82 (AI + infrastructure)
- Gross Margin: 95%

**Projected at 1,000 Users** (12 months):
- Monthly Revenue: $15,000 (500 Free, 400 Plus, 100 Pro)
- Monthly Cost: $820 (AI + infrastructure)
- Gross Margin: 95%

### Go-To-Market Strategy

**Phase 1** (Months 1-3): Early Tester Launch
- Activate waitlist email campaign
- Onboard first 50 paying users (Plus tier)
- Collect feedback via in-app surveys
- Iterate on pricing and features

**Phase 2** (Months 4-6): Public Launch
- Content marketing (blog, SEO)
- Partnership with ADHD organizations (CHADD UK, ADDISS)
- Therapist referral network (commission/affiliate)
- Social media advertising (Facebook, Instagram)

**Phase 3** (Months 7-12): Scale & Partnerships
- Insurance integration exploration (NHS, Bupa, AXA PPP)
- Multi-language support (Spanish, French, German)
- Mobile app launch (iOS + Android)
- Group coaching sessions

---

## Roadmap

### Near-Term (Next 3 Months)

1. **Address Security Warnings** - Password leak detection, SQL search_path, rate limiting, env validation
2. **Stripe Integration** - Payment flow, subscription management, usage tracking
3. **Email Marketing** - Mailchimp/SendGrid, welcome sequence, weekly tips, re-engagement
4. **Early Tester Feedback** - In-app surveys, feature voting, bug reporting
5. **Structured Logging** - Replace console.log with winston/pino

### Mid-Term (3-6 Months)

6. **Multi-Language Support** - Spanish, French, German (i18n library)
7. **Mobile App** - React Native (iOS + Android), push notifications, offline mode
8. **Therapist Referral Network** - Directory, in-app referrals, partnerships
9. **Group Coaching** - Live video sessions, topic-based (e.g., "Homework Strategies")
10. **Advanced Analytics** - Cohort analysis, outcome tracking, churn prediction

### Long-Term (6-12 Months)

11. **Insurance Integration** - NHS partnership, private insurance billing (Bupa, AXA PPP)
12. **Outcome Tracking** - Parent-reported outcomes, child behavior tracking, school performance
13. **Parent Community** - Discussion forums, peer matching, success stories
14. **Professional Portal** - Therapist accounts, view client progress (with consent)
15. **RAG System** - Vector database, personalized strategy recommendations
16. **Expanded Crisis Support** - Direct hotline integration, real-time risk scoring

---

## Competitive Landscape

### Direct Competitors

**ADHD AI Chatbots** (e.g., ADHDbot, FocusMate AI):
- ❌ Generic advice, not personalized
- ❌ No therapeutic framework (just tips)
- ❌ No crisis detection
- ❌ Artificial message limits (3-5 exchanges typical)

**Human ADHD Coaches** (e.g., ICF-certified coaches):
- ✅ Professional coaching (GROW Model)
- ✅ Deep personalization
- ❌ Expensive ($100-200 per session)
- ❌ Limited availability (geographic, scheduling)
- ❌ Not 24/7 accessible

### Pathfinder's Position

**"Professional Coaching, AI Scale, Accessible Pricing"**

We combine:
- ✅ Professional therapeutic frameworks (GROW + OARS)
- ✅ 24/7 availability
- ✅ Crisis-safe design
- ✅ Multi-child support
- ✅ $10-30/month (vs $400-800/month for human coach)

**Moat**: Evidence-based methodology + crisis safety + technical execution

---

## Team & Resources

### Current Team
- **1 Lead Developer** (Full-stack, AI integration)
- **AI Assistant** (Claude Code - documentation, code review, architecture)

### Required Roles (Next 6 Months)
- **Marketing Lead** (Content, SEO, partnerships)
- **Clinical Advisor** (ADHD specialist, methodology validation)
- **Customer Success** (Onboarding, support, feedback collection)
- **UX Designer** (Mobile app, accessibility improvements)

### Technical Resources
- **Infrastructure**: Vercel (hosting), Supabase (database), OpenAI (text AI), ElevenLabs (voice AI)
- **Development Tools**: Next.js 15, TypeScript, Tailwind CSS, Jest
- **Monitoring**: Custom performance tracking (planned: Sentry, LogTail)

---

## Key Risks & Mitigation

### Risk 1: Clinical Validation

**Risk**: Platform provides therapeutic support without clinical oversight
**Mitigation**:
- Crisis detection as priority (safety first)
- Clear disclaimer: "Not a replacement for professional care"
- Clinical advisor on team (planned)
- Outcome tracking to validate effectiveness

### Risk 2: User Retention

**Risk**: Parents try once, don't return
**Mitigation**:
- Discovery session creates rich profile (personalization)
- Email re-engagement campaigns
- Weekly tips and content
- Group coaching sessions (community building)

### Risk 3: AI Hallucination

**Risk**: GPT-4o generates inaccurate ADHD advice
**Mitigation**:
- Evidence-based strategy database (curated, not generated)
- Coaching approach (parent discovers solutions, not bot prescribes)
- Tool calling for structured outputs (reduces hallucination)
- Future: RAG system with verified sources

### Risk 4: Regulatory Compliance

**Risk**: GDPR violations, data breaches
**Mitigation**:
- GDPR-first architecture (explicit consent, 2-year retention, RLS policies)
- Supabase DPA signed
- EU data residency (Supabase EU region)
- Regular security audits

### Risk 5: Cost Scaling

**Risk**: AI costs explode at scale
**Mitigation**:
- GPT-4o-mini (cost-efficient model)
- Token usage tracking per session
- Cost alerts (if daily spend > $5)
- Pricing tiers (free users subsidized by Pro users)

---

## Success Metrics

### North Star Metric
**Parent Stress Reduction** - Measured via pre/post session stress levels (1-10 scale)

### Key Performance Indicators (KPIs)

**Product Metrics**:
- Active Users (monthly)
- Sessions per User per Month
- Session Completion Rate (% finishing action plan)
- Net Promoter Score (NPS)

**Business Metrics**:
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate

**Clinical Metrics**:
- Parent Stress Reduction (pre/post session)
- Strategy Success Rate (% strategies parent reports working)
- Crisis Detection Rate (% sessions with crisis detected)
- Parent Satisfaction (1-10 scale, post-session survey)

### Target Metrics (12 Months)

- **Active Users**: 10,000 families
- **Sessions per User**: 4 per month
- **Session Completion**: 80%+
- **NPS**: 50+ (excellent for SaaS)
- **MRR**: $150,000 (10,000 users × $15 avg)
- **Parent Stress Reduction**: -2 points (7/10 → 5/10 average)
- **Strategy Success Rate**: 60%+ (parent reports strategy working)

---

## Why Now?

### Market Trends

1. **ADHD Diagnosis Surge**: +25% increase in ADHD diagnoses (2020-2024, UK NHS data)
2. **Mental Health Crisis**: Parent burnout at all-time high post-pandemic
3. **AI Maturity**: GPT-4 quality + ElevenLabs voice AI make therapeutic AI viable
4. **Telehealth Acceptance**: Parents comfortable with digital mental health support
5. **Coach Shortage**: Limited availability of ADHD-specialist coaches (6-month waitlists common)

### Timing Advantage

- **First-Mover**: No evidence-based ADHD coaching AI exists yet (only generic chatbots)
- **Technology Ready**: AI SDK v5 + ElevenLabs make this feasible now (not 2 years ago)
- **Market Education**: Parents understand AI assistants (ChatGPT mainstream)

---

## Vision

**Mission**: Empower every parent of a child with ADHD with professional-quality coaching support, accessible 24/7, at a fraction of traditional costs.

**3-Year Vision**: Pathfinder becomes the **gold standard for AI-powered ADHD parent coaching**, combining:
- Professional therapeutic frameworks (GROW + OARS)
- Cutting-edge AI technology (GPT-4o, ElevenLabs)
- Beautiful, accessible design (ADHD-optimized)
- Rigorous privacy compliance (GDPR-first)
- Outcome tracking and research partnerships (NHS, universities)

**Impact Goal**: 100,000 families supported, measurable reduction in parent stress, improved child outcomes (behavior, school performance, family quality of life).

---

## Contact & Next Steps

**Documentation**:
- Full Technical Documentation: [PROJECT-MASTER-DOC.md](./PROJECT-MASTER-DOC.md)
- Developer Instructions: [CLAUDE.md](../CLAUDE.md)
- Coaching Methodology: [docs/features/coaching-methodology.md](./features/coaching-methodology.md)

**Repository**: `/Users/paulgosnell/Sites/pathfinder/adhd-support-agent`

**Deployment**: Production-ready on Vercel + Supabase

**Next Steps**:
1. Review executive summary with stakeholders
2. Address high-priority security warnings (1-2 weeks)
3. Integrate Stripe for subscription payments (2-3 weeks)
4. Launch early tester program (50 users, 4-6 weeks)
5. Iterate based on feedback
6. Public launch (3 months)

---

**Document Version**: 1.0
**Last Updated**: October 19, 2025
**Maintained By**: Development Team
**Review Frequency**: Monthly
