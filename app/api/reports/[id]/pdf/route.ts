import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

/**
 * GET /api/reports/[id]/pdf
 * Generate and download PDF for a specific report
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id: reportId } = await params;

  try {
    // Fetch the report from database
    const { data: report, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (error || !report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Dynamically import PDF generation (client-only library)
    const { renderToStream } = await import('@react-pdf/renderer');
    const PDFExport = await import('@/lib/reports/pdf-export');

    // Generate appropriate PDF based on report type
    let pdfDocument;
    switch (report.report_type) {
      case 'monthly_progress':
        pdfDocument = PDFExport.MonthlyProgressPDF({
          report: report.content,
          title: report.title
        });
        break;

      case 'strategy_effectiveness':
        pdfDocument = PDFExport.StrategyEffectivenessPDF({
          report: report.content,
          title: report.title
        });
        break;

      case 'comprehensive':
        pdfDocument = PDFExport.ComprehensivePDF({
          report: report.content,
          title: report.title
        });
        break;

      default:
        return Response.json(
          { error: 'Unsupported report type for PDF generation' },
          { status: 400 }
        );
    }

    // Render PDF to stream
    const stream = await renderToStream(pdfDocument);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Generate filename
    const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Return PDF with appropriate headers
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json(
      {
        error: 'Failed to generate PDF',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
