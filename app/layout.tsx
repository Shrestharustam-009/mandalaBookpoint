import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import siteConfig from '@/config/siteConfig'
import { AuthProvider } from '@/app/auth-context'
import { CartProvider } from '@/app/cart-context'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: `${siteConfig.siteName} - Digital Library`,
  description: siteConfig.siteDescription,
  generator: 'v0.app',
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    url: siteConfig.siteUrl,
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: siteConfig.primaryColor,
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} style={{ '--primary-color': siteConfig.primaryColor, '--accent-color': siteConfig.accentColor }}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Analytics />
            <Toaster 
              position="top-center" 
              richColors 
              toastOptions={{
                style: {
                  fontSize: '16px',
                  padding: '18px 24px',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  fontWeight: '500',
                }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
