import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agentic UI',
  description: 'Animated AI chat with Gemini',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased selection:bg-brand-400/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}
