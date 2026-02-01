import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Curate',
  description: 'Organize things to check out later',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
