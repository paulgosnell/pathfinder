# ADHD AI Coach - Documentation Index

Welcome to the ADHD AI Coach documentation. This directory contains all project documentation organized by category.

## 📚 Quick Navigation

### 🚀 Getting Started
- **[Quick Start Guide](development/quick-start.md)** - Get the app running in 5 minutes
- **[API Documentation](API-DOCUMENTATION.md)** - Complete API reference
- **[Technical Specification](technical/technical-specification.md)** - System design and architecture

---

## 📂 Documentation Structure

### 🏗️ Implementation Guides
**Location:** `docs/implementation/`

Detailed guides for implemented features:
- **[Discovery Phase](implementation/discovery-phase.md)** - Context-gathering conversation flow
- **[Voice Integration](implementation/voice-integration.md)** - Speech-to-text and text-to-speech
- **[System Implementation](implementation/system-implementation.md)** - Complete system overview
- **[UI Fixes](implementation/ui-fixes.md)** - UI/UX improvements and fixes
- **[Database Fixes](implementation/database-fixes.md)** - Database schema updates and fixes

### 🚢 Deployment
**Location:** `docs/deployment/`

Production deployment guides:
- **[Deployment Guide](deployment/deployment-guide.md)** - Step-by-step deployment instructions
- **[Production Checklist](deployment/production-checklist.md)** - Pre-launch verification checklist
- **[Production Readiness](deployment/production-readiness.md)** - Production readiness assessment
- **[GitHub Actions](deployment/github-actions.md)** - CI/CD pipeline setup

### 💻 Development
**Location:** `docs/development/`

Developer resources:
- **[Quick Start](development/quick-start.md)** - Local development setup
- **[Test Scenarios](development/test-scenarios.md)** - Testing guidelines and scenarios

### 🏛️ Architecture
**Location:** `docs/architecture/`

System architecture documentation:
- **[System Architecture](architecture/system-architecture.md)** - High-level system design

### 🔧 Technical
**Location:** `docs/technical/`

Technical specifications:
- **[Technical Specification](technical/technical-specification.md)** - Detailed technical documentation
- **[Data Model](technical/comprehensive-data-model.md)** - Database schema and relationships
- **[Voice Integration](technical/voice-integration.md)** - Voice API implementation details

### 🎨 Design
**Location:** `docs/design/`

Design system and UI/UX:
- **[Design System](design/design-system.md)** - Component library and style guide
- **[Design System (Interactive)](design/design-system.html)** - Interactive component showcase
- **[UI/UX Design Plan](design/ui-ux-design-plan.md)** - Design principles and patterns

### 👥 Client Updates
**Location:** `docs/client-updates/`

Progress reports and updates:
- **[AI Therapeutic Approach](client-updates/ai-therapeutic-approach.md)** - Therapeutic AI methodology
- **[Progress Update (2025-01-25)](client-updates/progress-update-2025-01-25.md)** - Development milestones

### 🗺️ Planning
**Location:** `docs/planning/`

Future development:
- **[Roadmap](planning/roadmap.md)** - Upcoming features and enhancements

---

## 🗄️ Related Resources

### Database Migrations
**Location:** `migrations/`

All database schema changes are versioned:
- `01-initial-schema.sql` - Base tables and RLS policies
- `02-performance-schema.sql` - Performance tracking tables
- `03-user-profiles-discovery.sql` - User profiles and discovery phase

**Migration Guide:** Apply migrations in numerical order via Supabase Dashboard SQL Editor.

### Scripts
**Location:** `scripts/`

Utility scripts:
- `apply-discovery-migration.sh` - Helper for applying discovery phase migration
- `create-noise-texture.js` - Generate noise textures for UI
- `generate-noise-browser.js` - Browser-based noise generation
- `generate-noise.js` - Node.js noise generation

---

## 🔍 Finding What You Need

### I want to...

**...set up the project locally**
→ Start with [Quick Start Guide](development/quick-start.md)

**...understand how the system works**
→ Read [System Architecture](architecture/system-architecture.md) and [Technical Specification](technical/technical-specification.md)

**...deploy to production**
→ Follow [Deployment Guide](deployment/deployment-guide.md) and [Production Checklist](deployment/production-checklist.md)

**...understand a specific feature**
→ Check [Implementation Guides](implementation/) for detailed feature documentation

**...customize the design**
→ Review [Design System](design/design-system.md) and [UI/UX Design Plan](design/ui-ux-design-plan.md)

**...see what's coming next**
→ Check the [Roadmap](planning/roadmap.md)

**...use the API**
→ Read [API Documentation](API-DOCUMENTATION.md)

**...run tests**
→ Follow [Test Scenarios](development/test-scenarios.md)

---

## 📝 Documentation Standards

### File Naming
- Use kebab-case: `feature-name.md`
- Be descriptive: `voice-integration.md` not `voice.md`
- Include dates for progress updates: `progress-update-2025-01-25.md`

### Structure
All documentation should include:
1. **Title** - Clear H1 heading
2. **Overview** - Brief summary of what this doc covers
3. **Table of Contents** - For docs longer than 3 sections
4. **Sections** - Organized with clear H2/H3 headings
5. **Examples** - Code samples or screenshots where appropriate
6. **References** - Links to related documentation

---

## 🤝 Contributing to Documentation

When adding new features:
1. Create implementation guide in `docs/implementation/`
2. Update API docs if endpoints added
3. Add test scenarios to `docs/development/test-scenarios.md`
4. Update this README with new document links

---

## 📮 Questions?

If you can't find what you're looking for:
1. Check the [Quick Start Guide](development/quick-start.md)
2. Review the [Technical Specification](technical/technical-specification.md)
3. Search the codebase for relevant comments

---

**Last Updated:** October 1, 2025  
**Project Version:** 1.0.0  
**Documentation Coverage:** Complete
