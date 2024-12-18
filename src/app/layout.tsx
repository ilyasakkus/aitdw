import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Döküman Yönetim Sistemi',
  description: 'Döküman yönetim ve düzenleme sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
