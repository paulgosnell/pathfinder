/**
 * PDF Export Module
 *
 * Generates professional PDF reports from report data using jsPDF.
 *
 * IMPORTANT: Requires `jspdf` and `jspdf-autotable` packages.
 * Install with: npm install jspdf jspdf-autotable
 *
 * Also requires type definitions:
 * npm install --save-dev @types/jspdf @types/jspdf-autotable
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GeneratedReport, MonthlyProgressContent } from './generator';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// PDF Generation Function
// ============================================================================

/**
 * Generate a PDF document from a report
 *
 * @param report - The generated report to convert to PDF
 * @returns Promise<Blob> - PDF file as a Blob
 */
export async function generatePDF(report: GeneratedReport): Promise<Blob> {
  const doc = new jsPDF();
  const content = report.content as MonthlyProgressContent;

  // Track vertical position on page
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // ===== HEADER SECTION =====
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(42, 63, 90); // Primary text color #2A3F5A
  doc.text('PATHFINDER', margin, yPosition);
  yPosition += 10;

  // Report title
  doc.setFontSize(16);
  doc.text(report.title, margin, yPosition);
  yPosition += 15;

  // ===== CHILD INFO SECTION =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(88, 108, 142); // Secondary text color #586C8E

  doc.text(`Child: ${content.child.name}`, margin, yPosition);
  yPosition += 6;

  if (content.child.age !== null) {
    doc.text(`Age: ${content.child.age} years old`, margin, yPosition);
    yPosition += 6;
  }

  doc.text(`Period: ${formatDateRange(content.date_range)}`, margin, yPosition);
  yPosition += 6;

  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, margin, yPosition);
  yPosition += 15;

  // Add horizontal line separator
  doc.setDrawColor(215, 205, 236); // Gradient color #D7CDEC
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // ===== CHECK-INS SECTION =====
  if (content.checkins) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 63, 90);
    doc.text('DAILY CHECK-INS SUMMARY', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(88, 108, 142);
    doc.text(
      `${content.checkins.total_entries} entries (${content.checkins.completion_rate} completion)`,
      margin,
      yPosition
    );
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
        ['Overall', `${content.checkins.averages.overall}/10`],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [215, 205, 236], // #D7CDEC
        textColor: [42, 63, 90], // #2A3F5A
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: [42, 63, 90],
        fontSize: 9
      },
      margin: { left: margin, right: margin }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Insights
    if (content.checkins.insights && content.checkins.insights.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(42, 63, 90);
      doc.text('Key Insights:', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(88, 108, 142);

      content.checkins.insights.forEach((insight) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        const lines = doc.splitTextToSize(`• ${insight}`, contentWidth);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5;
      });

      yPosition += 10;
    }
  }

  // ===== SESSIONS SECTION =====
  if (content.sessions && content.sessions.total > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 63, 90);
    doc.text('COACHING SESSIONS', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(88, 108, 142);
    doc.text(`${content.sessions.total} session${content.sessions.total > 1 ? 's' : ''} this period`, margin, yPosition);
    yPosition += 10;

    // Session details
    content.sessions.summary.forEach((session, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Session date and topic
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(42, 63, 90);
      const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      doc.text(`${sessionDate}: ${session.topic}`, margin, yPosition);
      yPosition += 6;

      // Goal
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(88, 108, 142);
      const goalLines = doc.splitTextToSize(`Goal: ${session.goal}`, contentWidth - 5);
      doc.text(goalLines, margin + 5, yPosition);
      yPosition += goalLines.length * 5;

      // Strategies
      if (session.strategies_discussed && session.strategies_discussed.length > 0) {
        const strategiesText = `Strategies: ${session.strategies_discussed.join(', ')}`;
        const strategyLines = doc.splitTextToSize(strategiesText, contentWidth - 5);
        doc.text(strategyLines, margin + 5, yPosition);
        yPosition += strategyLines.length * 5;
      }

      yPosition += 8; // Space between sessions
    });

    yPosition += 5;
  }

  // ===== STRATEGIES SECTION =====
  if (content.strategies) {
    const hasSuccessful = content.strategies.successful && content.strategies.successful.length > 0;
    const hasUnsuccessful = content.strategies.unsuccessful && content.strategies.unsuccessful.length > 0;
    const hasInProgress = content.strategies.in_progress && content.strategies.in_progress.length > 0;

    if (hasSuccessful || hasUnsuccessful || hasInProgress) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(42, 63, 90);
      doc.text('STRATEGIES TRIED', margin, yPosition);
      yPosition += 12;

      // Successful strategies
      if (hasSuccessful) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 207, 127); // Success color #6BCF7F
        doc.text('✓ What Worked:', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 108, 142);

        content.strategies.successful.forEach((strategy) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const lines = doc.splitTextToSize(`• ${strategy}`, contentWidth - 5);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5;
        });

        yPosition += 8;
      }

      // Unsuccessful strategies
      if (hasUnsuccessful) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(230, 168, 151); // Error color #E6A897
        doc.text("✗ Didn't Work:", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 108, 142);

        content.strategies.unsuccessful.forEach((strategy) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const lines = doc.splitTextToSize(`• ${strategy}`, contentWidth - 5);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5;
        });

        yPosition += 8;
      }

      // In-progress strategies
      if (hasInProgress) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 217, 61); // Warning color #FFD93D
        doc.text('→ In Progress:', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 108, 142);

        content.strategies.in_progress.forEach((strategy) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const lines = doc.splitTextToSize(`• ${strategy}`, contentWidth - 5);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5;
        });

        yPosition += 8;
      }
    }
  }

  // ===== NEXT STEPS SECTION =====
  if (content.next_steps && content.next_steps.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 63, 90);
    doc.text('NEXT STEPS', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(88, 108, 142);

    content.next_steps.forEach((step) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(`• ${step}`, contentWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5;
    });
  }

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = (doc as any).internal.pages.length - 1; // Subtract 1 because pages array includes an empty first element

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(127, 143, 166); // Muted text color #7F8FA6

    // Footer text
    doc.text('Generated by Pathfinder - www.pathfinder-adhd.com', margin, pageHeight - 10);

    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Return as Blob
  return doc.output('blob');
}

// ============================================================================
// Supabase Storage Upload Function
// ============================================================================

/**
 * Upload a PDF blob to Supabase Storage
 *
 * @param blob - The PDF file as a Blob
 * @param reportId - The UUID of the report (used for filename)
 * @returns Promise<string> - Public URL of the uploaded PDF
 */
export async function uploadPDFToStorage(
  blob: Blob,
  reportId: string
): Promise<string> {
  const fileName = `reports/${reportId}.pdf`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true // Overwrite if already exists
    });

  if (error) {
    console.error('PDF upload error:', error);
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to generate public URL for PDF');
  }

  return publicUrlData.publicUrl;
}

// ============================================================================
// Combined Function: Generate and Upload PDF
// ============================================================================

/**
 * Generate a PDF from a report and upload it to storage
 *
 * This is a convenience function that combines generatePDF and uploadPDFToStorage.
 * It also updates the report record with the PDF URL and timestamp.
 *
 * @param report - The generated report to convert to PDF
 * @returns Promise<string> - Public URL of the uploaded PDF
 */
export async function generateAndUploadPDF(report: GeneratedReport): Promise<string> {
  // 1. Generate PDF blob
  const pdfBlob = await generatePDF(report);

  // 2. Upload to Supabase Storage
  const pdfUrl = await uploadPDFToStorage(pdfBlob, report.id);

  // 3. Update report record with PDF URL and timestamp
  const { error: updateError } = await supabase
    .from('generated_reports')
    .update({
      pdf_url: pdfUrl,
      pdf_generated_at: new Date().toISOString()
    })
    .eq('id', report.id);

  if (updateError) {
    console.error('Failed to update report with PDF URL:', updateError);
    // Don't throw - PDF is already uploaded, this is just metadata
  }

  return pdfUrl;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format a date range for display in PDF
 */
function formatDateRange(dateRange: { start: string; end: string; month_label?: string }): string {
  if (dateRange.month_label) {
    return dateRange.month_label;
  }

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
}
