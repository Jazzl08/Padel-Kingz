import './layout.css'
import { Navbar } from '@/components/navbar/navbar'
import { Footer } from '@/components/footer/footer'

export const metadata = {
  title: 'Padel Kingz',
  description: 'Welcome to our Padel Website',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        <Navbar />
        {children}
        <Footer/>
      </body>
    </html>
  )
}