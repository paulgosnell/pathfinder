# Reports Module

This module provides report generation and PDF export functionality for Pathfinder.

## Installation

The PDF export functionality requires additional packages that are **not yet installed**:

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf @types/jspdf-autotable
```

## Files

- **`generator.ts`** - Core report generation logic (aggregates data from database)
- **`pdf-export.ts`** - PDF generation and Supabase Storage upload

## Usage

### Generate a Monthly Progress Report

```typescript
import { generateMonthlyProgressReport } from '@/lib/reports/generator';

const reportContent = await generateMonthlyProgressReport(
  userId,
  childId,
  '2025-10-01',
  '2025-10-31',
  {
    include_checkins: true,
    include_sessions: true,
    include_strategies: true,
  }
);
```

### Generate and Upload PDF

```typescript
import { generateAndUploadPDF } from '@/lib/reports/pdf-export';

// Assuming you have a GeneratedReport object from the database
const pdfUrl = await generateAndUploadPDF(report);

console.log('PDF available at:', pdfUrl);
```

### Manual PDF Generation (without upload)

```typescript
import { generatePDF } from '@/lib/reports/pdf-export';

const pdfBlob = await generatePDF(report);

// Download in browser
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = `${report.title}.pdf`;
link.click();
```

## PDF Formatting

The generated PDFs include:

- **Header**: Pathfinder branding, report title
- **Child Info**: Name, age, date range, generation date
- **Check-ins Section**: Averages table, insights, trends
- **Sessions Section**: List of coaching sessions with dates, topics, goals, strategies
- **Strategies Section**: Successful, unsuccessful, and in-progress strategies
- **Next Steps**: Recommendations based on data analysis
- **Footer**: Branding and page numbers on all pages

### Design System Compliance

Colors used match the Pathfinder design system:
- Primary Text: `#2A3F5A`
- Secondary Text: `#586C8E`
- Muted Text: `#7F8FA6`
- Primary Accent: `#D7CDEC`
- Success: `#6BCF7F`
- Warning: `#FFD93D`
- Error: `#E6A897`

## Database Requirements

PDF upload requires the Supabase Storage bucket `reports` to be configured. Run the migration:

```sql
-- File: migrations/add-reports.sql (section on storage bucket)

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false);

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

## API Integration Example

```typescript
// app/api/reports/[id]/pdf/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateAndUploadPDF } from '@/lib/reports/pdf-export';
import { supabase } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch report from database
    const { data: report, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate and upload PDF
    const pdfUrl = await generateAndUploadPDF(report);

    return NextResponse.json({
      pdf_url: pdfUrl,
      message: 'PDF generated successfully'
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

## Error Handling

The PDF export module includes comprehensive error handling:

- ✅ Validates report data before generation
- ✅ Handles missing sections gracefully (e.g., no check-ins)
- ✅ Automatic page breaks for long content
- ✅ Storage upload retry logic built into Supabase client
- ✅ Logs errors without exposing sensitive data

## Page Break Logic

PDFs automatically add new pages when:
- Content reaches bottom margin (20px from page bottom)
- Tables exceed remaining page space
- Section headers would be orphaned at page bottom

## Future Enhancements

- [ ] Add charts/visualizations to PDFs (check-in trends)
- [ ] Support custom branding (user-uploaded logos)
- [ ] Email delivery integration
- [ ] PDF compression for faster downloads
- [ ] Multi-language support
