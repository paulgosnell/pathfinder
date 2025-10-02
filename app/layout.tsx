import type { Metadata } from 'next'
import { Quicksand, Inter } from 'next/font/google'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

// Import Quicksand font for headings
const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
})

// Fallback sans-serif font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ADHD Support Agent',
  description: 'AI-powered support for parents of children with ADHD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${inter.variable}`} style={{ fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif" }}>
      <head>
        {/* Add Atkinson Hyperlegible font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/atkinson-hyperlegible@1.0.2/stylesheet.min.css"
        />
      </head>
      <body style={{ fontFamily: "'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif" }} className="bg-cream text-navy antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}