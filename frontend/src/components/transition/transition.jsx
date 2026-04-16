'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import './transition.css'

export default function PageTransition() {
  const overlayRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(CustomEase)
    CustomEase.create(
      "hop",
      "M0,0 C0.126,0.382 0.232,0.382 0.358,0 C0.484,-0.382 0.59,-0.382 0.716,0 C0.842,0.382 0.948,0.382 1,1"
    )

    const handleLinkClick = (e) => {
      const target = e.target.closest('a')
      if (!target || !target.href || target.target === '_blank') return
      
      const currentUrl = new URL(window.location.href)
      const targetUrl = new URL(target.href)
      
      if (currentUrl.origin !== targetUrl.origin) return
      if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) return

      // Extra toetsen check
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return

      e.preventDefault()
      
      if (isAnimating) return
      setIsAnimating(true)

      const overlay = overlayRef.current
      
      // Animatie zakt omlaag
      gsap.set(overlay, { 
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        visibility: 'visible',
      })
      
      gsap.to(overlay, {
        duration: 1.2,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        ease: "hop",
        onComplete: () => {
          router.push(targetUrl.pathname + targetUrl.search)
          setTimeout(() => {
            if (window.location.pathname !== targetUrl.pathname) {
               window.location.href = targetUrl.href
            }
          }, 500)
        }
      })
    }

    document.addEventListener('click', handleLinkClick)
    return () => document.removeEventListener('click', handleLinkClick)
  }, [router, isAnimating])

  // Start na laden pagina
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    // Animatie gaat omhoog
    gsap.set(overlay, { visibility: 'visible', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }) 
    
    gsap.to(overlay, {
      duration: 1.2,
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      ease: "hop",
      onComplete: () => {
        gsap.set(overlay, { visibility: 'hidden' })
        setIsAnimating(false)
      }
    })
  }, [pathname])

  return (
    <div 
      ref={overlayRef} 
      className="page-transition-overlay"
    ></div>
  )
}

