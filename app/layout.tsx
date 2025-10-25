import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apeit Admin Dashboard',
  description: 'Tax Monitor Management System with Cashback Program',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}



