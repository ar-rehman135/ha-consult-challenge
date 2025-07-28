import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ProtectedLayout from '@/components/AuthWrapper'
import { PostHogProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Strategy Backtester',
  description: 'A fullstack application for backtesting rule-based stock trading strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
            <div className="min-h-screen bg-gray-50">
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProtectedLayout>
                {children}
                </ProtectedLayout>
              </main>
            </div>
        </PostHogProvider>
      </body>
    </html>
  )
} 