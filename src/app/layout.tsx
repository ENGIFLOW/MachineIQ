import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UniversalHeader } from '@/components/layout/UniversalHeader'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Toolpath Academy',
  description:
    'AI-powered CNC training for students, instructors, and advanced manufacturing teams.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-surface text-ink`}>
        <UniversalHeader />
        {children}
      </body>
    </html>
  )
}

