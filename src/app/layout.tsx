import type { Metadata } from 'next'
import { Poppins, Nunito, Comic_Neue } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-comic',
})

export const metadata: Metadata = {
  title: 'OzSheepTight - Premium Baby Products',
  description: 'Discover our curated collection of premium baby products. Designed with love, crafted for comfort, and made to last.',
  keywords: 'baby products, premium baby gear, nursery, baby clothing, toys',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${nunito.variable} ${comicNeue.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
