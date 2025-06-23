import './globals.css'
import { Inter } from 'next/font/google'
import { initializeDB } from '@/lib/db'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Todo App',
  description: 'A todo app powered by AI toolcalls',
}

// Initialize database connection at startup
if (typeof window === 'undefined') {
  initializeDB().catch(console.error)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 