import './layout.css'
import './globals.css'
import { Manrope } from 'next/font/google'
import { Navbar } from '@/components/navbar/navbar'
import Footer from '@/components/footer/footer'
import CookieBanner from '@/components/cookiebanner/CookieBanner'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata = {
  title: 'Padel Website',
  description: 'Welcome to our Padel Website',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className={manrope.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer/>
        <CookieBanner />
      </body>
    </html>
  )
}