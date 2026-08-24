import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notes Peek',
  description: 'Mentalism utility receiver',
  icons: {
    icon: '/icon.jpg',
    apple: '/apple-icon.jpg',
  },
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
