'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './navbar.css'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import TransitionLink from '../TransitionLink' // Import transition link
import { animatePageOut } from '../../utils/animations'

export const Navbar = () => {
  const [authUser, setAuthUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  const handleMenuNav = (e, href) => {
    e.preventDefault();
    if (pathname === href) {
      document.querySelector('.menu-toggle')?.click(); // Just close if on same page
      return;
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const links = document.querySelectorAll('.link1, .link');
    const socialLinks = document.querySelectorAll('.socials p');

    // Signal to animations.js NOT to run the 4-banner intro.
    sessionStorage.setItem('skipBannerIn', 'true');

    // Manually trigger the close animation exactly like the menu does, 
    // but navigate only when the animation completes!
    menuToggle.classList.remove('opened');
    menuToggle.classList.add('closed');

    gsap.to(menu, {
      duration: 1.5,
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      ease: "hop",
      onComplete: () => {
        menu.style.pointerEvents = 'none';
        document.body.classList.remove('menu-open');
        gsap.set(menu, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
        gsap.set(links, { y: 20, opacity: 0 });
        gsap.set(socialLinks, { y: 20, opacity: 0 });
        gsap.set('.video-wrapper', { clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)' });
        gsap.set('.header h1 span', { y: 200, rotateY: 90, scale: 0.75 });
        router.push(href);
      },
    });
  };

  const [prevPathname, setPrevPathname] = useState(pathname)

  // Haal auth status op
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
      credentials: 'include',
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setAuthUser(d.user) })
      .catch(() => { })
  }, [pathname]) // opnieuw checken bij route-wissel

  // Sluit dropdown bij klik buiten
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sluit dropdown bij route-wissel op de correcte React manier
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setDropdownOpen(false)
  }

  useEffect(() => {
    gsap.registerPlugin(CustomEase)

    CustomEase.create(
      "hop",
      "M0,0 C0.126,0.382 0.232,0.382 0.358,0 C0.484,-0.382 0.59,-0.382 0.716,0 C0.842,0.382 0.948,0.382 1,1"
    )

    const menuToggle = document.querySelector('.menu-toggle')
    const menu = document.querySelector('.menu')
    const links = document.querySelectorAll('.link1, .link')
    const socialLinks = document.querySelectorAll('.socials p')
    let isAnimating = false

    const splitTextIntoSpans = (selector) => {
      let elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        let text = element.innerText
        let splitText = text.split("").map(function (char) {
          return `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`
        }).join("")
        element.innerHTML = splitText
      })
    }
    splitTextIntoSpans(".header h1")

    if (!menuToggle) return

    const handleClick = () => {
      if (isAnimating) return

      if (menuToggle.classList.contains('closed')) {
        menuToggle.classList.remove('closed')
        menuToggle.classList.add('opened')
        isAnimating = true

        gsap.to(menu, {
          duration: 1.5,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: "hop",
          onStart: () => { 
            menu.style.pointerEvents = 'all'
            document.body.classList.add('menu-open') 
          },
          onComplete: () => { isAnimating = false },
        })
        gsap.to(links, { y: 0, opacity: 1, duration: 1, stagger: 0.2, delay: 1.2, ease: "power3.out" })
        gsap.to(socialLinks, { y: 0, opacity: 1, duration: 1, stagger: 0.2, delay: 1.4, ease: "power3.out" })
        gsap.to('.video-wrapper', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1, delay: 1.2, ease: "power2.out" })
        gsap.to('.header h1 span', { rotateY: 0, opacity: 1, duration: 1, stagger: 0.05, delay: 1.6, ease: "power4.out" })
      } else {
        menuToggle.classList.remove('opened')
        menuToggle.classList.add('closed')
        isAnimating = true

        gsap.to(menu, {
          duration: 1.5,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          ease: "hop",
          onComplete: () => {
            menu.style.pointerEvents = 'none'
            document.body.classList.remove('menu-open')
            gsap.set(menu, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' })
            gsap.set(links, { y: 20, opacity: 0 })
            gsap.set(socialLinks, { y: 20, opacity: 0 })
            gsap.set('.video-wrapper', { clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)' })
            gsap.set('.header h1 span', { y: 200, rotateY: 90, scale: 0.75 })
            isAnimating = false
          },
        })
      }
    }

    menuToggle.addEventListener('click', handleClick)
    return () => menuToggle.removeEventListener('click', handleClick)
  }, [])

  const handleSmartNav = (e, href) => {
    e.preventDefault();
    setDropdownOpen(false); // sluit de dropdown direct

    if (pathname === href) {
      if (document.body.classList.contains('menu-open')) {
        document.querySelector('.menu-toggle')?.click();
      }
      return;
    }

    if (document.body.classList.contains('menu-open')) {
      // Het hamburgermenu staat al open! We gebruiken de menu sluit-transitie in plaats van het zwarte gordijn:
      handleMenuNav(e, href);
    } else {
      // Menu is dicht, gebruik het standaard page-transition zwarte gordijn
      animatePageOut(href, router);
    }
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/logout`, {
      method: 'POST', credentials: 'include',
    })
    setAuthUser(null)
    window.location.href = '/'
  }

  return (
    <div className="navbar-wrapper">
      <div className="logo"><Link href="/" onClick={(e) => handleSmartNav(e, '/')}>Padel Kingz</Link></div>

      {/* Dynamische account link */}
      <div className="account-link" ref={dropdownRef}>
        {authUser ? (
          <div className="account-dropdown-wrapper">
            <button
              className="account-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Account
              <span className={`account-dropdown-arrow ${dropdownOpen ? 'arrow-open' : ''}`}>&#9662;</span>
            </button>
            {dropdownOpen && (
              <div className="account-dropdown-menu">
                <Link 
                  href="/dashboard" 
                  className="account-dropdown-item" 
                  onClick={(e) => handleSmartNav(e, '/dashboard')}
                >
                  Account
                </Link>
                {authUser.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="account-dropdown-item account-dropdown-admin" 
                    onClick={(e) => handleSmartNav(e, '/admin')}
                  >
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="account-dropdown-item account-dropdown-logout">
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" onClick={(e) => handleSmartNav(e, '/login')} className="transition-link">Account</Link>
        )}
      </div>

      <div className="menu-toggle closed">
        <div className="menu-toggle-icon">
          <div className="hamburger">
            <div className="menu-bar" data-position="top"></div>
            <div className="menu-bar" data-position="bottom"></div>
          </div>
        </div>
        <div className="menu-copy"></div>
      </div>

      <div className="menu">
        <div className="col col-1">
          <div className="menu-logo"><Link href="/" onClick={(e) => handleSmartNav(e, '/')}>Padel Kingz</Link></div>
          <div className="links">
            <div className="link1"><Link href="/" onClick={(e) => handleMenuNav(e, '/')}>Home</Link></div>
            <div className="link1"><Link href="/leaderboard" onClick={(e) => handleMenuNav(e, '/leaderboard')}>Ranglijst</Link></div>
            <div className="link"><Link href="/schema" onClick={(e) => handleMenuNav(e, '/schema')}>Schema</Link></div>
            <div className="link"><Link href="/finale" onClick={(e) => handleMenuNav(e, '/finale')}>Finale</Link></div>
            {authUser && (
              <div className="link"><Link href="/dashboard" onClick={(e) => handleMenuNav(e, '/dashboard')}>Dashboard</Link></div>
            )}
          </div>
          <div className="video-wrapper">
            <video autoPlay loop muted playsInline>
              <source src="/padel.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="col col-2">
          <div className="socials">
            <div className="sub-col">
              <p>Contact@gmail.com</p>
              <p>+31 6 12345678</p>
            </div>
            <div className="sub-col">
              <p><Link className='insta a' href="#" target="_blank" rel="noopener noreferrer">Instagram</Link></p>
              <p><Link className='tikok a' href="#" target="_blank" rel="noopener noreferrer">Tiktok</Link></p>
              <p><Link className='facebook a' href="#" target="_blank" rel="noopener noreferrer">Facebook</Link></p>
            </div>
          </div>
        </div>
        <div className="header">
          <h1><span>Padel</span></h1>
        </div>
      </div>
    </div>
  )
}