# Daily Check-ins Feature Specification

**Status**: Ready for Implementation
**Priority**: High
**Estimated Effort**: 5-7 days
**Dependencies**: `child_profiles` table (already exists)

---

## Overview

Daily Check-ins is a lightweight tracking feature that allows parents to record their child's daily state across four key dimensions: sleep quality, attention/focus, emotional regulation, and behavior. The feature uses simple sliders (1-10 scale) for quick data entry and provides trend visualization over time.

**Design Philosophy**: Fast data entry (under 60 seconds), clear pattern recognition, child-specific tracking.

---

## User Stories

1. **As a parent**, I want to quickly log how my child's day went so I can spot patterns over time
2. **As a parent with multiple children**, I want to easily switch between children when logging check-ins
3. **As a parent**, I want to see trends in my child's sleep/attention/emotions/behavior so I can identify what's working
4. **As a parent**, I want to add optional notes to check-ins for context (e.g., "bad night - sibling conflict")
5. **As a parent**, I want to see correlations between dimensions (e.g., does poor sleep predict low attention?)

---

## Database Schema

### New Table: `daily_checkins`

```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- The date this check-in is for (NOT when it was submitted - allows backdating)
  checkin_date DATE NOT NULL,

  -- Four core dimensions (1-10 scale, NULL if not answered)
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  attention_focus INTEGER CHECK (attention_focus >= 1 AND attention_focus <= 10),
  emotional_regulation INTEGER CHECK (emotional_regulation >= 1 AND emotional_regulation <= 10),
  behavior_quality INTEGER CHECK (behavior_quality >= 1 AND behavior_quality <= 10),

  -- Optional context
  notes TEXT,

  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one check-in per child per date
  UNIQUE(child_id, checkin_date)
);

-- Indexes for performance
CREATE INDEX idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX idx_daily_checkins_child_id ON daily_checkins(child_id);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(checkin_date DESC);
CREATE INDEX idx_daily_checkins_child_date ON daily_checkins(child_id, checkin_date DESC);

-- RLS Policies
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-ins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own check-ins"
  ON daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## UI/UX Design

### Page Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ [☰] Daily Check-ins             │ ← AppHeader
│     Track daily patterns         │
├─────────────────────────────────┤
│                                  │
│ ┌─────────────────────────────┐ │ ← Child Selector (if multiple children)
│ │ [👦 Alex ▼] [👧 Emma  ]    │ │   Horizontal scroll tabs
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │ ← Today's Check-in Card
│ │ Today - Oct 26, 2025         │ │
│ │                              │ │
│ │ 😴 Sleep Quality             │ │
│ │ [━━━━━━━━━━━] 7/10          │ │   Interactive slider
│ │                              │ │
│ │ 🎯 Attention & Focus         │ │
│ │ [━━━━━━━━━━━] 5/10          │ │
│ │                              │ │
│ │ 😊 Emotional Regulation      │ │
│ │ [━━━━━━━━━━━] 8/10          │ │
│ │                              │ │
│ │ ✨ Behavior                  │ │
│ │ [━━━━━━━━━━━] 6/10          │ │
│ │                              │ │
│ │ 📝 Notes (optional)          │ │
│ │ [Text area...]               │ │
│ │                              │ │
│ │     [Save Check-in]          │ │   Primary button
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │ ← Last 7 Days Card
│ │ Last 7 Days                  │ │
│ │                              │ │
│ │ Oct 25  ●●●●●●●●●○  9/10   │ │   Visual mini-chart per day
│ │ Oct 24  ●●●●●●●○○○  7/10   │ │   Shows overall daily score
│ │ Oct 23  ●●●●●●○○○○  6/10   │ │   (average of 4 dimensions)
│ │ Oct 22  ●●●●●●●●○○  8/10   │ │
│ │ Oct 21  ●●●●●●●○○○  7/10   │ │
│ │ Oct 20  ●●●●●●●●●○  9/10   │ │   [Tap to view detail]
│ │ Oct 19  ●●●●●○○○○○  5/10   │ │
│ │                              │ │
│ │ [View Full History →]        │ │   Link to chart view
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │ ← Pattern Insights Card
│ │ 💡 Pattern Insights          │ │   (Only shows if >7 check-ins)
│ │                              │ │
│ │ • Sleep improving over       │ │   Auto-generated insights
│ │   last week (+15%)           │ │
│ │                              │ │
│ │ • Attention lowest on        │ │
│ │   weekends (avg 4.5/10)      │ │
│ │                              │ │
│ │ • Best days: Tue & Thu       │ │
│ │   (avg 8.2/10)               │ │
│ └─────────────────────────────┘ │
│                                  │
└─────────────────────────────────┘
```

### Slider Design (Component Detail)

```typescript
// Each slider shows:
// - Icon + label
// - Interactive range slider (1-10)
// - Live value display
// - Color gradient based on value (red → yellow → green)

<div style={{ marginBottom: '20px' }}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  }}>
    <label style={{
      fontSize: '14px',
      fontWeight: 600,
      color: '#2A3F5A',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{ fontSize: '20px' }}>😴</span>
      Sleep Quality
    </label>
    <span style={{
      fontSize: '18px',
      fontWeight: 700,
      color: getColorForValue(value), // Red (1-3), Yellow (4-7), Green (8-10)
      minWidth: '50px',
      textAlign: 'right'
    }}>
      {value || '—'}/10
    </span>
  </div>

  <input
    type="range"
    min="1"
    max="10"
    value={value || 5}
    onChange={(e) => setValue(parseInt(e.target.value))}
    style={{
      width: '100%',
      height: '8px',
      borderRadius: '4px',
      background: `linear-gradient(to right,
        #E6A897 0%,
        #FFD93D 50%,
        #6BCF7F 100%
      )`,
      cursor: 'pointer'
    }}
  />

  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '11px',
    color: '#7F8FA6'
  }}>
    <span>Poor</span>
    <span>Great</span>
  </div>
</div>
```

### Color System for Scores

```typescript
const getColorForValue = (value: number | null): string => {
  if (!value) return '#D1D8E0'; // Gray for unset
  if (value <= 3) return '#E6A897'; // Red (crisis/coral from design system)
  if (value <= 7) return '#FFD93D'; // Yellow (warning)
  return '#6BCF7F'; // Green (success)
};

const getBackgroundForValue = (value: number | null): string => {
  if (!value) return 'rgba(209, 216, 224, 0.1)';
  if (value <= 3) return 'rgba(230, 168, 151, 0.1)';
  if (value <= 7) return 'rgba(255, 217, 61, 0.1)';
  return 'rgba(107, 207, 127, 0.1)';
};
```

---

## Component Structure

### File Organization

```
app/(protected)/check-ins/
├── page.tsx                    # Main check-ins page
├── history/
│   └── page.tsx                # Full history view with charts

components/
├── CheckInSlider.tsx           # Reusable slider component
├── CheckInHistoryList.tsx      # Last 7 days list
├── CheckInPatternInsights.tsx  # Auto-generated insights
├── CheckInChart.tsx            # Line chart for trends
└── ChildSelector.tsx           # Horizontal scroll child tabs (reusable)

lib/
├── database/
│   └── checkins.ts             # Supabase queries
└── analytics/
    └── checkin-insights.ts     # Pattern detection logic
```

### TypeScript Interfaces

```typescript
// lib/supabase/client.ts
export interface DailyCheckIn {
  id: string;
  user_id: string;
  child_id: string;
  checkin_date: string; // YYYY-MM-DD format
  sleep_quality: number | null; // 1-10
  attention_focus: number | null; // 1-10
  emotional_regulation: number | null; // 1-10
  behavior_quality: number | null; // 1-10
  notes: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckInStats {
  averageScore: number; // Average of 4 dimensions
  trend: 'improving' | 'declining' | 'stable';
  bestDay: string | null; // Day of week
  worstDay: string | null; // Day of week
  dimensionAverages: {
    sleep: number;
    attention: number;
    emotional: number;
    behavior: number;
  };
}
```

---

## API Endpoints

### POST `/api/checkins`
**Create or update today's check-in**

```typescript
// Request
{
  child_id: string;
  checkin_date: string; // YYYY-MM-DD
  sleep_quality?: number;
  attention_focus?: number;
  emotional_regulation?: number;
  behavior_quality?: number;
  notes?: string;
}

// Response 200
{
  id: string;
  message: "Check-in saved successfully"
}

// Error 400
{
  error: "Invalid date format"
}
```

### GET `/api/checkins?child_id=xxx&days=7`
**Fetch recent check-ins for a child**

```typescript
// Response 200
{
  checkins: DailyCheckIn[];
  stats: CheckInStats;
}
```

### GET `/api/checkins/history?child_id=xxx&start_date=xxx&end_date=xxx`
**Fetch check-ins for date range (for charts)**

---

## Database Query Functions

```typescript
// lib/database/checkins.ts

/**
 * Get today's check-in for a child (if exists)
 */
export async function getTodayCheckIn(
  childId: string
): Promise<DailyCheckIn | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Save check-in (upsert)
 */
export async function saveCheckIn(
  checkInData: Partial<DailyCheckIn>
): Promise<DailyCheckIn> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        ...checkInData,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'child_id,checkin_date'
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get last N days of check-ins
 */
export async function getRecentCheckIns(
  childId: string,
  days: number = 7
): Promise<DailyCheckIn[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('child_id', childId)
    .gte('checkin_date', startDate.toISOString().split('T')[0])
    .order('checkin_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Calculate average score for a check-in
 */
export function calculateAverageScore(checkIn: DailyCheckIn): number {
  const scores = [
    checkIn.sleep_quality,
    checkIn.attention_focus,
    checkIn.emotional_regulation,
    checkIn.behavior_quality
  ].filter((score): score is number => score !== null);

  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
```

---

## Pattern Insights Logic

```typescript
// lib/analytics/checkin-insights.ts

export interface Insight {
  type: 'trend' | 'correlation' | 'day-of-week' | 'dimension';
  message: string;
  severity: 'positive' | 'neutral' | 'negative';
}

/**
 * Generate insights from check-in history (requires minimum 7 check-ins)
 */
export function generateInsights(checkIns: DailyCheckIn[]): Insight[] {
  if (checkIns.length < 7) return [];

  const insights: Insight[] = [];

  // 1. Trend Analysis (first 3 days vs last 3 days)
  const recentAvg = calculateAverage(checkIns.slice(0, 3));
  const olderAvg = calculateAverage(checkIns.slice(-3));
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (Math.abs(change) > 10) {
    insights.push({
      type: 'trend',
      message: `Overall ${change > 0 ? 'improving' : 'declining'} over last week (${Math.abs(Math.round(change))}%)`,
      severity: change > 0 ? 'positive' : 'negative'
    });
  }

  // 2. Day of Week Patterns
  const dayAverages = calculateDayOfWeekAverages(checkIns);
  const bestDay = Object.entries(dayAverages).sort((a, b) => b[1] - a[1])[0];
  const worstDay = Object.entries(dayAverages).sort((a, b) => a[1] - b[1])[0];

  if (bestDay[1] - worstDay[1] > 2) {
    insights.push({
      type: 'day-of-week',
      message: `Best days: ${bestDay[0]} (avg ${bestDay[1].toFixed(1)}/10)`,
      severity: 'positive'
    });
    insights.push({
      type: 'day-of-week',
      message: `Challenges on ${worstDay[0]} (avg ${worstDay[1].toFixed(1)}/10)`,
      severity: 'negative'
    });
  }

  // 3. Dimension-Specific Insights
  const dimensionTrends = calculateDimensionTrends(checkIns);
  Object.entries(dimensionTrends).forEach(([dimension, trend]) => {
    if (Math.abs(trend) > 15) {
      insights.push({
        type: 'dimension',
        message: `${dimension} ${trend > 0 ? 'improving' : 'declining'} (${Math.abs(Math.round(trend))}%)`,
        severity: trend > 0 ? 'positive' : 'negative'
      });
    }
  });

  return insights.slice(0, 4); // Max 4 insights to avoid overwhelm
}
```

---

## User Flow

### First-Time User (No Check-ins Yet)
1. User navigates to `/check-ins`
2. If multiple children: Child selector shows (defaults to primary child)
3. Empty state shows: "Start tracking [child]'s daily patterns"
4. Today's check-in form is visible with all sliders at default
5. User adjusts sliders, optionally adds notes
6. Clicks "Save Check-in"
7. Success message appears, "Last 7 Days" section shows first entry
8. Insights card hidden (requires 7+ check-ins)

### Returning User (Has Check-ins)
1. User navigates to `/check-ins`
2. Page loads today's check-in (if exists) OR empty form for today
3. "Last 7 Days" shows recent history
4. If 7+ check-ins exist: Insights card shows patterns
5. User can update today's check-in anytime
6. User can tap "View Full History →" to see charts

### Multi-Child Family
1. Child selector shows horizontal scroll tabs at top
2. Active child highlighted with gradient background
3. Switching child loads that child's check-in data
4. Each child's data is isolated

---

## Edge Cases & Validation

### Validations
- ✅ At least one dimension must be filled to save check-in
- ✅ Date cannot be in the future
- ✅ Can only backdate up to 7 days
- ✅ Sliders validate 1-10 range (enforced by input type)
- ✅ Notes limited to 500 characters

### Edge Cases
- **No children in profile**: Show prompt to add child first
- **Check-in already exists for today**: Load existing values, allow update
- **Parent changes check-in date**: Upsert handles conflicts
- **Less than 7 check-ins**: Hide insights, show encouragement message
- **Child deleted**: Cascade delete check-ins (ON DELETE CASCADE)

---

## Performance Considerations

- **Index on `(child_id, checkin_date DESC)`** for fast recent queries
- **Limit history queries to 30 days by default** to avoid large payloads
- **Cache today's check-in in component state** to avoid re-fetching
- **Debounce slider onChange** to avoid excessive re-renders (update on release, not drag)

---

## Future Enhancements (V2)

- **Medication correlation**: Mark days with medication changes, show impact on dimensions
- **Export to PDF**: Generate printable reports for doctors/school
- **Reminders**: Optional push notification at 8pm to complete check-in
- **Photo logging**: Attach photo to check-in (e.g., child's artwork, report card)
- **Multi-dimensional charts**: Line chart showing all 4 dimensions over time
- **Comparison view**: Compare two children side-by-side (for siblings)

---

## Testing Checklist

- [ ] Can create check-in for today
- [ ] Can update today's check-in multiple times
- [ ] Can switch between children (multi-child family)
- [ ] Last 7 days list shows correct data
- [ ] Insights generate correctly (with 7+ check-ins)
- [ ] Empty state shows when no check-ins exist
- [ ] Slider colors change based on value (red/yellow/green)
- [ ] Notes field saves correctly
- [ ] RLS policies prevent access to other users' data
- [ ] Average score calculation is correct
- [ ] Pattern insights are accurate

---

## Migration File

```sql
-- File: migrations/add-daily-checkins.sql

-- Create daily_checkins table
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  attention_focus INTEGER CHECK (attention_focus >= 1 AND attention_focus <= 10),
  emotional_regulation INTEGER CHECK (emotional_regulation >= 1 AND emotional_regulation <= 10),
  behavior_quality INTEGER CHECK (behavior_quality >= 1 AND behavior_quality <= 10),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, checkin_date)
);

-- Indexes
CREATE INDEX idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX idx_daily_checkins_child_id ON daily_checkins(child_id);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(checkin_date DESC);
CREATE INDEX idx_daily_checkins_child_date ON daily_checkins(child_id, checkin_date DESC);

-- RLS Policies
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-ins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own check-ins"
  ON daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE daily_checkins IS 'Daily check-ins tracking sleep, attention, emotions, and behavior for each child';
```

---

## Design System Compliance

**Colors Used:**
- Primary Gradient: `#D7CDEC` → `#B7D3D8` (child selector active state)
- Text Primary: `#2A3F5A` (labels, headers)
- Text Secondary: `#586C8E` (values, descriptions)
- Text Muted: `#7F8FA6` (helper text)
- Background: `#F9F7F3` (page background)
- Card Background: `white`
- Success: `#6BCF7F` (high scores 8-10)
- Warning: `#FFD93D` (medium scores 4-7)
- Error: `#E6A897` (low scores 1-3)

**Components:**
- `Card` with `padding="large"`
- `Button` variant="primary"
- `SPACING.cardGap` between sections
- `BORDER_RADIUS.medium` for cards
- `SHADOWS.card` for elevation
