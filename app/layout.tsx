import type { Metadata } from 'next'
import { Quicksand, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
    <html lang="en" className={`${quicksand.variable} ${inter.variable}`}>
      <head>
        {/* Add Atkinson Hyperlegible font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/atkinson-hyperlegible@1.0.2/stylesheet.min.css"
        />
      </head>
      <body className="font-body bg-cream text-gray-800">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
