import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getLocale } from 'next-intl/server'
import { ChatWidget } from '@/components/chat-widget'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

export const metadata: Metadata = {
  title: {
    default: 'Ian Ronk | Geodata Engineer & ML Researcher',
    template: '%s | Ian Ronk',
  },
  description: 'Ian Ronk builds production spatial systems and ML pipelines — PostGIS, Airflow, LLM automation — for real estate, climate risk and alternative data. Based in Amsterdam.',
  keywords: ['Geodata', 'Data Engineering', 'Geospatial Analysis', 'Machine Learning', 'AI Automation', 'PostGIS', 'LLM', 'Amsterdam', 'Ian Ronk', 'Spatial Systems', 'Real Estate Analytics'],
  authors: [{ name: 'Ian Ronk' }],
  creator: 'Ian Ronk',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'nl': '/nl',
      'de': '/de',
      'it': '/it',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Ian Ronk',
    title: 'Ian Ronk | Geodata Engineer & ML Researcher',
    description: 'Ian Ronk builds production spatial systems and ML pipelines — PostGIS, Airflow, LLM automation — for real estate, climate risk and alternative data.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Ian Ronk — Geospatial · ML · AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ian Ronk | Geodata Engineer & ML Researcher',
    description: 'Ian Ronk builds production spatial systems and ML pipelines for real estate, climate risk and alternative data.',
    creator: '@ianronk',
    images: ['/og.png'],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        {children}
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  )
}
