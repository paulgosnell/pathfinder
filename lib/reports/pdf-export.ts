'use client';

/**
 * PDF Export Module
 *
 * Generates professional PDF reports from report data using jsPDF.
 *
 * IMPORTANT: This module is currently disabled due to build compatibility issues
 * with jsPDF in Next.js 15. PDF export functionality will be re-enabled once
 * a compatible solution is found.
 *
 * TODO: Re-implement PDF export using a Next.js 15 compatible library
 */

import { GeneratedReport } from './generator';

/**
 * Generate a PDF document from a report
 *
 * @param report - The generated report to convert to PDF
 * @returns Promise<Blob> - PDF file as a Blob
 *
 * @throws Error - Currently disabled, will throw error if called
 */
export async function generatePDF(report: GeneratedReport): Promise<Blob> {
  throw new Error('PDF export is currently disabled due to build compatibility issues. Feature coming soon!');
}

/**
 * Upload PDF to Supabase storage
 *
 * @param pdfBlob - The PDF blob to upload
 * @param report - The report metadata
 * @returns Promise<string> - Public URL of uploaded PDF
 *
 * @throws Error - Currently disabled, will throw error if called
 */
export async function uploadPDFToSupabase(
  pdfBlob: Blob,
  report: GeneratedReport
): Promise<string> {
  throw new Error('PDF upload is currently disabled due to build compatibility issues. Feature coming soon!');
}
