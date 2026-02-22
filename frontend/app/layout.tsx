import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/cookie-consent'
import { GoogleAnalytics } from '@/components/google-analytics'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

export const metadata: Metadata = {
  title: {
    default: 'Ian Ronk | Head of Data | Real Estate AI & Analytics',
    template: '%s | Ian Ronk',
  },
  description: 'Head of Data delivering AI-powered insights for European real estate investment. Specializing in machine learning, geospatial analysis, and alternative data for REITs and funds.',
  keywords: ['Data Science', 'Machine Learning', 'Real Estate', 'AI', 'Geospatial', 'Europe', 'FinTech', 'Alternative Data', 'Amsterdam', 'Ian Ronk', 'Data Engineer', 'Real Estate Analytics'],
  authors: [{ name: 'Ian Ronk' }],
  creator: 'Ian Ronk',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'nl': '/nl',
      'it': '/it',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Ian Ronk',
    title: 'Ian Ronk | Head of Data | Real Estate AI & Analytics',
    description: 'Head of Data delivering AI-powered insights for European real estate investment. Specializing in machine learning, geospatial analysis, and alternative data for REITs and funds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ian Ronk | Head of Data | Real Estate AI & Analytics',
    description: 'Head of Data delivering AI-powered insights for European real estate investment.',
    creator: '@ianronk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  )
}
