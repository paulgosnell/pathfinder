# Reports Feature Specification

**Status**: Ready for Implementation
**Priority**: Medium-High
**Estimated Effort**: 7-10 days
**Dependencies**: `daily_checkins` (recommended), `agent_sessions`, `child_profiles`, `user_profiles`

---

## Overview

The Reports feature generates professional, shareable summaries of a child's progress, challenges, and strategy effectiveness. Reports are designed to be shared with schools, doctors, therapists, and other professionals supporting the child.

**Design Philosophy**: Evidence-based, professional formatting, parent-controlled sharing, multiple export formats.

---

## User Stories

1. **As a parent**, I want to generate a monthly progress report to share with my child's teacher at parent-teacher conferences
2. **As a parent**, I want to export assessment results to PDF to bring to my child's psychiatrist appointment
3. **As a parent**, I want to show which strategies worked/didn't work so therapists can build on what's effective
4. **As a parent**, I want a comprehensive report covering everything (sessions, check-ins, strategies) for annual IEP meetings
5. **As a parent**, I want to customize what gets included in each report (privacy control)

---

## Report Types

### 1. **Monthly Progress Report**
**Purpose**: General update on child's well-being and parenting journey
**Audience**: Teachers, school counselors, therapists
**Frequency**: Monthly (auto-generated on 1st of each month)

**Includes:**
- Check-in trends (average scores, charts)
- Number of coaching sessions
- Top challenges identified
- Strategies tried this month
- Notable improvements
- Parent observations/notes

### 2. **Strategy Effectiveness Report**
**Purpose**: Evidence on what's working and what's not
**Audience**: Therapists, behavior specialists
**Frequency**: On-demand

**Includes:**
- Strategies marked as "successful" vs "failed" in child profile
- Strategies discussed in coaching sessions
- Implementation timeline
- Quantitative data (check-in scores before/after strategy implementation)
- Parent notes on each strategy
- Recommendations for next steps

### 3. **Assessment History Report**
**Purpose**: Track formal assessments over time
**Audience**: Doctors, psychiatrists, educational psychologists
**Frequency**: On-demand (typically before medical appointments)

**Includes:**
- All completed assessments with scores
- Trend over time (are scores improving?)
- Comparison to clinical cutoffs
- Date of each assessment
- Links to full assessment details

### 4. **Comprehensive Family Report**
**Purpose**: Full picture for major meetings (IEP, diagnosis appointments)
**Audience**: Multi-disciplinary teams (school + medical)
**Frequency**: On-demand (typically 1-2x per year)

**Includes:**
- Child profile summary
- Parent profile & family context
- Check-in data (if available)
- Session history
- Strategy history
- Assessment results
- Professional support network
- Current medication/therapy details

---

## Database Schema

### New Table: `generated_reports`

```sql
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE, -- NULL for multi-child reports

  -- Report metadata
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly_progress', 'strategy_effectiveness', 'assessment_history', 'comprehensive')),
  title TEXT NOT NULL,

  -- Date range covered by this report
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Report content (JSON structure - allows flexibility for different report types)
  content JSONB NOT NULL,

  -- Export formats generated
  pdf_url TEXT, -- Supabase Storage URL for PDF
  pdf_generated_at TIMESTAMP WITH TIME ZONE,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE, -- For public link sharing (optional)
  shared_at TIMESTAMP WITH TIME ZONE,
  share_expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_reports_user_id ON generated_reports(user_id);
CREATE INDEX idx_generated_reports_child_id ON generated_reports(child_id);
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_generated_reports_date_range ON generated_reports(start_date, end_date);

-- RLS Policies
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON generated_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON generated_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Public access for shared reports (via share_token)
CREATE POLICY "Anyone can view shared reports via token"
  ON generated_reports FOR SELECT
  USING (
    is_shared = true
    AND share_expires_at > NOW()
  );

-- Trigger
CREATE TRIGGER update_generated_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE generated_reports IS 'Generated reports for sharing with schools, doctors, and therapists';
COMMENT ON COLUMN generated_reports.content IS 'JSON structure containing all report data sections';
COMMENT ON COLUMN generated_reports.share_token IS 'Unique token for secure public link sharing';
```

---

## UI/UX Design

### Page Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ [☰] Reports                      │ ← AppHeader
│     Share progress with pros     │
├─────────────────────────────────┤
│                                  │
│ ┌─────────────────────────────┐ │ ← Create New Report Card
│ │ 📊 Generate New Report       │ │
│ │                              │ │
│ │ [Monthly Progress]           │ │   Quick action buttons
│ │ [Strategy Report]            │ │
│ │ [Assessment History]         │ │
│ │ [Comprehensive Report]       │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │ ← Recent Reports Card
│ │ Recent Reports               │ │
│ │                              │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📄 October 2025 Progress │ │ │   Saved report card
│ │ │    Alex • Monthly        │ │ │
│ │ │    Oct 1-31, 2025        │ │ │
│ │ │                          │ │ │
│ │ │ [📥 PDF] [🔗 Share]     │ │ │   Action buttons
│ │ └─────────────────────────┘ │ │
│ │                              │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📄 Strategy Summary      │ │ │
│ │ │    Emma • Strategies     │ │ │
│ │ │    Sep 15-Oct 15, 2025   │ │ │
│ │ │                          │ │ │
│ │ │ [📥 PDF] [🔗 Share]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                              │ │
│ │ [View All Reports →]         │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │ ← Info Card
│ │ 💡 About Reports             │ │
│ │                              │ │
│ │ Reports help you share       │ │
│ │ progress with schools,       │ │
│ │ doctors, and therapists.     │ │
│ │                              │ │
│ │ • Professional formatting    │ │
│ │ • Download as PDF            │ │
│ │ • Secure sharing links       │ │
│ │ • You control what's shared  │ │
│ └─────────────────────────────┘ │
│                                  │
└─────────────────────────────────┘
```

### Report Generation Modal

```
┌─────────────────────────────────┐
│ ✕  Generate Monthly Progress    │ ← Modal Header
├─────────────────────────────────┤
│                                  │
│ Child                            │
│ [👦 Alex ▼]                     │ ← Child selector dropdown
│                                  │
│ Date Range                       │
│ [Oct 2025 ▼]                    │ ← Month picker (default: last month)
│                                  │
│ Include in Report                │
│ ☑ Check-in trends (7 entries)   │ ← Checkboxes with data counts
│ ☑ Coaching sessions (3)         │
│ ☑ Strategies tried (5)          │
│ ☑ Child profile summary         │
│ ☐ Parent notes (optional)       │
│                                  │
│ Report Title (optional)          │
│ [October 2025 Progress...]      │ ← Custom title input
│                                  │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ This report will include: │ │   Preview summary
│ │                              │ │
│ │ • Child's name, age, diagnosis│ │
│ │ • Daily check-in data        │ │
│ │ • Session topics discussed   │ │
│ │ • Strategies tried           │ │
│ │                              │ │
│ │ Review carefully before      │ │
│ │ sharing with professionals.  │ │
│ └─────────────────────────────┘ │
│                                  │
│     [Cancel]  [Generate Report] │ ← Action buttons
│                                  │
└─────────────────────────────────┘
```

### Report Preview Screen

```
┌─────────────────────────────────┐
│ [← Back]  October 2025 Progress │ ← Preview Header
│           [📥 Download PDF]      │
│           [🔗 Get Share Link]    │
├─────────────────────────────────┤
│                                  │   Scrollable preview
│ ┌─────────────────────────────┐ │   (white background, PDF-like)
│ │                              │ │
│ │  PATHFINDER                  │ │   ← Report Header
│ │  Progress Report             │ │
│ │                              │ │
│ │  Child: Alex Johnson         │ │
│ │  Age: 8 years old            │ │
│ │  Period: Oct 1-31, 2025      │ │
│ │  Generated: Oct 26, 2025     │ │
│ │                              │ │
│ │  ───────────────────────────  │ │
│ │                              │ │
│ │  DAILY CHECK-INS SUMMARY     │ │   ← Section headers
│ │                              │ │
│ │  Average Scores:             │ │
│ │  • Sleep Quality: 7.2/10     │ │
│ │  • Attention: 6.5/10         │ │
│ │  • Emotions: 8.1/10          │ │
│ │  • Behavior: 7.8/10          │ │
│ │                              │ │
│ │  [Mini trend chart]          │ │   ← Visual chart
│ │                              │ │
│ │  Insights:                   │ │
│ │  • Sleep improving (+12%)    │ │
│ │  • Attention challenges on   │ │
│ │    weekends (avg 4.5/10)     │ │
│ │                              │ │
│ │  ───────────────────────────  │ │
│ │                              │ │
│ │  COACHING SESSIONS           │ │
│ │                              │ │
│ │  3 sessions this month       │ │
│ │                              │ │
│ │  Oct 5: Morning routine      │ │
│ │  • Goal: Reduce morning      │ │
│ │    conflicts                 │ │
│ │  • Strategies: Visual        │ │
│ │    schedule, choice-giving   │ │
│ │                              │ │
│ │  Oct 12: Homework battles    │ │
│ │  • Goal: Calm homework time  │ │
│ │  • Strategies: Body breaks,  │ │
│ │    chunking tasks            │ │
│ │                              │ │
│ │  ───────────────────────────  │ │
│ │                              │ │
│ │  STRATEGIES TRIED            │ │
│ │                              │ │
│ │  ✓ What Worked:              │ │
│ │  • Visual schedule           │ │
│ │  • 5-minute warnings         │ │
│ │  • Body break reminders      │ │
│ │                              │ │
│ │  ✗ Didn't Work:              │ │
│ │  • Reward charts             │ │
│ │                              │ │
│ │  ───────────────────────────  │ │
│ │                              │ │
│ │  NEXT STEPS                  │ │
│ │                              │ │
│ │  • Continue visual schedule  │ │
│ │  • Try fidget tools for      │ │
│ │    homework time             │ │
│ │  • Parent to practice calm   │ │
│ │    voice during transitions  │ │
│ │                              │ │
│ │  ───────────────────────────  │ │
│ │                              │ │
│ │  Generated by Pathfinder     │ │   ← Footer
│ │  www.pathfinder-adhd.com     │ │
│ │                              │ │
│ └─────────────────────────────┘ │
│                                  │
└─────────────────────────────────┘
```

---

## Report Content Structure (JSON)

### Monthly Progress Report

```json
{
  "report_type": "monthly_progress",
  "child": {
    "name": "Alex Johnson",
    "age": 8,
    "diagnosis_status": "diagnosed"
  },
  "date_range": {
    "start": "2025-10-01",
    "end": "2025-10-31",
    "month_label": "October 2025"
  },
  "checkins": {
    "total_entries": 22,
    "completion_rate": "71%",
    "averages": {
      "sleep_quality": 7.2,
      "attention_focus": 6.5,
      "emotional_regulation": 8.1,
      "behavior_quality": 7.8,
      "overall": 7.4
    },
    "trends": {
      "sleep": { "direction": "improving", "change_percent": 12 },
      "attention": { "direction": "stable", "change_percent": -2 },
      "emotional": { "direction": "improving", "change_percent": 8 },
      "behavior": { "direction": "stable", "change_percent": 3 }
    },
    "insights": [
      "Sleep improving over the month (+12%)",
      "Attention challenges on weekends (avg 4.5/10)",
      "Best days: Tuesdays & Thursdays (avg 8.2/10)"
    ],
    "chart_data": [
      { "date": "2025-10-01", "score": 6.5 },
      { "date": "2025-10-02", "score": 7.0 }
      // ... more entries
    ]
  },
  "sessions": {
    "total": 3,
    "summary": [
      {
        "date": "2025-10-05",
        "topic": "Morning routine challenges",
        "goal": "Reduce morning conflicts and get to school calmly",
        "strategies_discussed": [
          "Visual morning schedule",
          "Choice-giving (shirt A or B?)",
          "5-minute warnings before transitions"
        ]
      },
      {
        "date": "2025-10-12",
        "topic": "Homework battles",
        "goal": "Create calm homework environment",
        "strategies_discussed": [
          "Body break every 15 minutes",
          "Chunking tasks into smaller steps",
          "Fidget tool during reading"
        ]
      }
    ]
  },
  "strategies": {
    "successful": [
      "Visual morning schedule",
      "5-minute warnings",
      "Body break reminders"
    ],
    "unsuccessful": [
      "Reward charts (lost interest after 3 days)"
    ],
    "in_progress": [
      "Fidget tools for homework"
    ]
  },
  "next_steps": [
    "Continue visual schedule - working well",
    "Try fidget tools for homework time",
    "Parent to practice calm voice during transitions"
  ]
}
```

### Strategy Effectiveness Report

```json
{
  "report_type": "strategy_effectiveness",
  "child": {
    "name": "Emma Wilson",
    "age": 10
  },
  "date_range": {
    "start": "2025-09-15",
    "end": "2025-10-15"
  },
  "strategies_analyzed": [
    {
      "strategy_name": "Token economy system",
      "category": "Behavior management",
      "implementation_date": "2025-09-20",
      "status": "unsuccessful",
      "duration_days": 10,
      "parent_notes": "Initially excited but lost interest after a week. Stickers didn't motivate her.",
      "checkin_correlation": {
        "before_avg": 6.2,
        "during_avg": 6.0,
        "change": -0.2,
        "conclusion": "No measurable improvement"
      }
    },
    {
      "strategy_name": "Movement breaks during homework",
      "category": "Attention support",
      "implementation_date": "2025-09-25",
      "status": "successful",
      "duration_days": 20,
      "parent_notes": "Game changer! She can focus much better after jumping jacks or a quick walk.",
      "checkin_correlation": {
        "before_avg": 5.5,
        "during_avg": 7.2,
        "change": +1.7,
        "conclusion": "Significant improvement in attention scores"
      }
    }
  ],
  "summary": {
    "total_strategies_tried": 8,
    "successful": 5,
    "unsuccessful": 3,
    "success_rate": "62%"
  },
  "recommendations": [
    "Continue movement breaks - strong positive effect",
    "Try intrinsic motivation instead of token systems",
    "Consider visual schedules for homework routine"
  ]
}
```

---

## Component Structure

### File Organization

```
app/(protected)/reports/
├── page.tsx                          # Main reports page
├── generate/page.tsx                 # Report generation wizard
├── [reportId]/page.tsx               # Individual report preview
└── [reportId]/share/page.tsx         # Public share view (no auth)

components/
├── ReportCard.tsx                    # Saved report card component
├── ReportPreview.tsx                 # Web-based report preview
├── ReportGenerationWizard.tsx        # Multi-step generation flow
├── ReportSectionCheckbox.tsx         # Checkbox for including sections
└── reports/
    ├── MonthlyProgressReport.tsx     # Template for monthly report
    ├── StrategyEffectivenessReport.tsx
    ├── AssessmentHistoryReport.tsx
    └── ComprehensiveReport.tsx

lib/
├── reports/
│   ├── generator.ts                  # Main report generation logic
│   ├── pdf-export.ts                 # PDF generation (using jsPDF or similar)
│   ├── templates/                    # Report templates
│   │   ├── monthly-progress.ts
│   │   ├── strategy-effectiveness.ts
│   │   └── comprehensive.ts
│   └── data-aggregation.ts           # Collect data from multiple sources
└── database/
    └── reports.ts                    # Supabase queries for reports
```

### TypeScript Interfaces

```typescript
// lib/reports/types.ts

export type ReportType =
  | 'monthly_progress'
  | 'strategy_effectiveness'
  | 'assessment_history'
  | 'comprehensive';

export interface GeneratedReport {
  id: string;
  user_id: string;
  child_id: string | null;
  report_type: ReportType;
  title: string;
  start_date: string;
  end_date: string;
  content: MonthlyProgressContent | StrategyEffectivenessContent | ComprehensiveContent;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  is_shared: boolean;
  share_token: string | null;
  shared_at: string | null;
  share_expires_at: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyProgressContent {
  report_type: 'monthly_progress';
  child: ChildSummary;
  date_range: DateRange;
  checkins?: CheckInSummary;
  sessions?: SessionSummary;
  strategies?: StrategySummary;
  next_steps?: string[];
}

export interface ChildSummary {
  name: string;
  age: number;
  diagnosis_status?: string;
}

export interface DateRange {
  start: string;
  end: string;
  month_label?: string;
}

export interface CheckInSummary {
  total_entries: number;
  completion_rate: string;
  averages: {
    sleep_quality: number;
    attention_focus: number;
    emotional_regulation: number;
    behavior_quality: number;
    overall: number;
  };
  trends: Record<string, { direction: 'improving' | 'declining' | 'stable'; change_percent: number }>;
  insights: string[];
  chart_data: Array<{ date: string; score: number }>;
}

export interface SessionSummary {
  total: number;
  summary: Array<{
    date: string;
    topic: string;
    goal: string;
    strategies_discussed: string[];
  }>;
}

export interface StrategySummary {
  successful: string[];
  unsuccessful: string[];
  in_progress: string[];
}
```

---

## API Endpoints

### POST `/api/reports/generate`
**Generate a new report**

```typescript
// Request
{
  report_type: ReportType;
  child_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  title?: string;
  sections: {
    include_checkins: boolean;
    include_sessions: boolean;
    include_strategies: boolean;
    include_child_profile: boolean;
    include_parent_notes: boolean;
  };
}

// Response 200
{
  report_id: string;
  message: "Report generated successfully"
}

// Error 400
{
  error: "No data found for selected date range"
}
```

### GET `/api/reports`
**Fetch all reports for current user**

```typescript
// Response 200
{
  reports: GeneratedReport[];
}
```

### GET `/api/reports/[id]`
**Fetch single report by ID**

```typescript
// Response 200
{
  report: GeneratedReport;
}
```

### POST `/api/reports/[id]/pdf`
**Generate PDF for report**

```typescript
// Response 200
{
  pdf_url: string;
  message: "PDF generated successfully"
}
```

### POST `/api/reports/[id]/share`
**Create shareable link**

```typescript
// Request
{
  expires_in_days: number; // e.g., 7, 30, 90
}

// Response 200
{
  share_url: string; // https://pathfinder.com/reports/share/{token}
  expires_at: string;
}
```

### DELETE `/api/reports/[id]`
**Delete report**

---

## Report Generation Logic

```typescript
// lib/reports/generator.ts

import { supabase } from '@/lib/supabase/client';
import { getRecentCheckIns } from '@/lib/database/checkins';

export async function generateMonthlyProgressReport(
  userId: string,
  childId: string,
  startDate: string,
  endDate: string,
  includeSections: {
    include_checkins: boolean;
    include_sessions: boolean;
    include_strategies: boolean;
  }
): Promise<MonthlyProgressContent> {
  // 1. Fetch child profile
  const { data: child } = await supabase
    .from('child_profiles')
    .select('child_name, child_age, diagnosis_status')
    .eq('id', childId)
    .single();

  // 2. Fetch check-ins (if included)
  let checkins: CheckInSummary | undefined;
  if (includeSections.include_checkins) {
    const checkinsData = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('child_id', childId)
      .gte('checkin_date', startDate)
      .lte('checkin_date', endDate)
      .order('checkin_date', { ascending: true });

    checkins = aggregateCheckIns(checkinsData.data || []);
  }

  // 3. Fetch sessions (if included)
  let sessions: SessionSummary | undefined;
  if (includeSections.include_sessions) {
    const sessionsData = await supabase
      .from('agent_sessions')
      .select('started_at, therapeutic_goal, strategies_discussed, current_challenge')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: true });

    sessions = aggregateSessions(sessionsData.data || []);
  }

  // 4. Fetch strategies (if included)
  let strategies: StrategySummary | undefined;
  if (includeSections.include_strategies) {
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('successful_strategies, failed_strategies')
      .eq('id', childId)
      .single();

    strategies = {
      successful: childProfile?.successful_strategies || [],
      unsuccessful: childProfile?.failed_strategies || [],
      in_progress: []
    };
  }

  // 5. Compile report content
  return {
    report_type: 'monthly_progress',
    child: {
      name: child?.child_name || '',
      age: child?.child_age || 0,
      diagnosis_status: child?.diagnosis_status
    },
    date_range: {
      start: startDate,
      end: endDate,
      month_label: formatMonthLabel(startDate)
    },
    checkins,
    sessions,
    strategies,
    next_steps: generateNextSteps(checkins, sessions, strategies)
  };
}

function aggregateCheckIns(checkins: DailyCheckIn[]): CheckInSummary {
  const totalEntries = checkins.length;

  // Calculate averages
  const sumScores = checkins.reduce((acc, c) => ({
    sleep: acc.sleep + (c.sleep_quality || 0),
    attention: acc.attention + (c.attention_focus || 0),
    emotional: acc.emotional + (c.emotional_regulation || 0),
    behavior: acc.behavior + (c.behavior_quality || 0)
  }), { sleep: 0, attention: 0, emotional: 0, behavior: 0 });

  const averages = {
    sleep_quality: round(sumScores.sleep / totalEntries, 1),
    attention_focus: round(sumScores.attention / totalEntries, 1),
    emotional_regulation: round(sumScores.emotional / totalEntries, 1),
    behavior_quality: round(sumScores.behavior / totalEntries, 1),
    overall: round((sumScores.sleep + sumScores.attention + sumScores.emotional + sumScores.behavior) / (totalEntries * 4), 1)
  };

  // Calculate trends (first half vs second half)
  const midpoint = Math.floor(totalEntries / 2);
  const firstHalf = checkins.slice(0, midpoint);
  const secondHalf = checkins.slice(midpoint);

  const trends = calculateTrends(firstHalf, secondHalf);

  // Generate insights
  const insights = generateInsights(checkins, averages, trends);

  // Chart data
  const chart_data = checkins.map(c => ({
    date: c.checkin_date,
    score: calculateAverageScore(c)
  }));

  return {
    total_entries: totalEntries,
    completion_rate: `${Math.round((totalEntries / 30) * 100)}%`,
    averages,
    trends,
    insights,
    chart_data
  };
}

function generateNextSteps(
  checkins?: CheckInSummary,
  sessions?: SessionSummary,
  strategies?: StrategySummary
): string[] {
  const steps: string[] = [];

  // Based on check-ins
  if (checkins) {
    Object.entries(checkins.trends).forEach(([dimension, trend]) => {
      if (trend.direction === 'declining' && trend.change_percent < -10) {
        steps.push(`Address declining ${dimension} (down ${Math.abs(trend.change_percent)}%)`);
      }
    });
  }

  // Based on strategies
  if (strategies && strategies.successful.length > 0) {
    steps.push(`Continue successful strategies: ${strategies.successful.slice(0, 2).join(', ')}`);
  }

  // Default next step
  if (steps.length === 0) {
    steps.push('Continue tracking daily check-ins to identify patterns');
  }

  return steps;
}
```

---

## PDF Export

```typescript
// lib/reports/pdf-export.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePDF(report: GeneratedReport): Promise<Blob> {
  const doc = new jsPDF();
  const content = report.content as MonthlyProgressContent;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PATHFINDER', 20, 20);
  doc.setFontSize(16);
  doc.text(report.title, 20, 30);

  // Child info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Child: ${content.child.name}`, 20, 40);
  doc.text(`Age: ${content.child.age} years old`, 20, 45);
  doc.text(`Period: ${formatDateRange(content.date_range)}`, 20, 50);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);

  let yPosition = 70;

  // Check-ins section
  if (content.checkins) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DAILY CHECK-INS SUMMARY', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${content.checkins.total_entries} entries (${content.checkins.completion_rate} completion)`, 20, yPosition);
    yPosition += 10;

    // Averages table
    autoTable(doc, {
      startY: yPosition,
      head: [['Dimension', 'Average Score']],
      body: [
        ['Sleep Quality', `${content.checkins.averages.sleep_quality}/10`],
        ['Attention & Focus', `${content.checkins.averages.attention_focus}/10`],
        ['Emotional Regulation', `${content.checkins.averages.emotional_regulation}/10`],
        ['Behavior', `${content.checkins.averages.behavior_quality}/10`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [215, 205, 236] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Sessions section
  if (content.sessions && content.sessions.total > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COACHING SESSIONS', 20, yPosition);
    yPosition += 10;

    content.sessions.summary.forEach(session => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${new Date(session.date).toLocaleDateString()}: ${session.topic}`, 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(`Goal: ${session.goal}`, 25, yPosition);
      yPosition += 6;

      if (session.strategies_discussed.length > 0) {
        doc.text(`Strategies: ${session.strategies_discussed.join(', ')}`, 25, yPosition);
        yPosition += 10;
      }
    });
  }

  // Strategies section
  if (content.strategies) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STRATEGIES TRIED', 20, yPosition);
    yPosition += 10;

    if (content.strategies.successful.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ What Worked:', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      content.strategies.successful.forEach(s => {
        doc.text(`• ${s}`, 25, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (content.strategies.unsuccessful.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("✗ Didn't Work:", 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      content.strategies.unsuccessful.forEach(s => {
        doc.text(`• ${s}`, 25, yPosition);
        yPosition += 5;
      });
    }
  }

  // Footer
  const pageCount = doc.internal.pages.length;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by Pathfinder - www.pathfinder-adhd.com', 20, 280);

  return doc.output('blob');
}

export async function uploadPDFToStorage(
  blob: Blob,
  reportId: string
): Promise<string> {
  const fileName = `reports/${reportId}.pdf`;

  const { data, error } = await supabase.storage
    .from('reports')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
```

---

## Security & Privacy Considerations

1. **RLS Policies**: Only users can see their own reports
2. **Share Token Security**:
   - Cryptographically secure random tokens (UUID v4)
   - Expiration dates enforced (7-90 days max)
   - Can be revoked by deleting share_token
3. **Data Minimization**: Reports only include what parent selects
4. **No PII in URLs**: Report IDs are UUIDs, not sequential
5. **PDF Storage**: Stored in Supabase Storage with RLS policies
6. **Audit Trail**: Track when reports are shared (shared_at timestamp)

---

## Edge Cases & Validation

- ✅ No data for selected date range → Show helpful message, suggest different range
- ✅ Child has no check-ins → Offer to generate report without check-ins section
- ✅ Report already exists for same params → Offer to regenerate or view existing
- ✅ Share link expired → Show "This link has expired" message with contact info
- ✅ PDF generation fails → Retry mechanism, fallback to web view
- ✅ Large date range (>1 year) → Warn about performance, suggest shorter range

---

## Future Enhancements (V2)

- **Email delivery**: Auto-send PDF to parent's email
- **Scheduled reports**: Auto-generate monthly reports on 1st of each month
- **Multi-child comparison**: Compare siblings side-by-side
- **Custom branding**: Upload logo/letterhead for professional reports
- **Collaborative reports**: Share edit access with co-parent
- **Professional templates**: Different templates for schools vs medical pros
- **Data visualization**: Interactive charts in web view (not just PDF)

---

## Migration File

```sql
-- File: migrations/add-reports.sql

-- Create generated_reports table
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly_progress', 'strategy_effectiveness', 'assessment_history', 'comprehensive')),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  content JSONB NOT NULL,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  shared_at TIMESTAMP WITH TIME ZONE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_reports_user_id ON generated_reports(user_id);
CREATE INDEX idx_generated_reports_child_id ON generated_reports(child_id);
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_generated_reports_date_range ON generated_reports(start_date, end_date);

-- RLS Policies
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON generated_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON generated_reports FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared reports via token"
  ON generated_reports FOR SELECT
  USING (
    is_shared = true
    AND share_expires_at > NOW()
  );

-- Trigger
CREATE TRIGGER update_generated_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE generated_reports IS 'Generated reports for sharing with schools, doctors, and therapists';
COMMENT ON COLUMN generated_reports.content IS 'JSON structure containing all report data sections';
COMMENT ON COLUMN generated_reports.share_token IS 'Unique token for secure public link sharing';

-- Create Supabase Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false);

-- Storage policies
CREATE POLICY "Users can upload own report PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own report PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Design System Compliance

**Colors Used:**
- Primary Gradient: `#D7CDEC` → `#B7D3D8` (headers, accents)
- Text Primary: `#2A3F5A` (body text)
- Text Secondary: `#586C8E` (metadata, labels)
- Text Muted: `#7F8FA6` (helper text)
- Background: `#F9F7F3` (page background)
- Card Background: `white`
- Success: `#6BCF7F` (positive insights)
- Warning: `#FFD93D` (neutral insights)
- Error: `#E6A897` (negative insights)

**Typography:**
- Headers: Quicksand, 600 weight
- Body: System fonts, 400 weight
- PDF: Helvetica (jsPDF default)

**Components:**
- `Card` with `padding="large"`
- `Button` variant="primary" for main actions
- `SPACING` system for consistent margins
- `BORDER_RADIUS.medium` for cards
- `SHADOWS.card` for elevation
