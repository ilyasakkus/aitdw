import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navigation/Navbar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AITDW - Technical Document Writer',
  description: 'A web-based technical document writer following S1000D standard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
