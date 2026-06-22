import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'وصلني | منصة المشاريع المنزلية',
  description: 'منصة وصلني للمشاريع المنزلية — تصفح منتجات محلية طازجة من مطابخ ومشاريع أسرية قريبة منك، واطلب بسهولة مع تتبع لحظي.',
  keywords: 'مشاريع منزلية، طعام منزلي، توصيل، وصلني',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c27c3a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" dir="rtl" />
      </body>
    </html>
  )
}
