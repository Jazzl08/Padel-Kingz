'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect } from 'react'
import './navbar.css'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

export const Navbar = () => {
    useEffect(() => {
        gsap.registerPlugin(CustomEase);

        CustomEase.create(
            "hop",
            "M0,0 C0.126,0.382 0.232,0.382 0.358,0 C0.484,-0.382 0.59,-0.382 0.716,0 C0.842,0.382 0.948,0.382 1,1"
        );

        const menuToggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.menu');
        const links = document.querySelectorAll('.link');
        const socialLinks = document.querySelectorAll('.socials p');
        let isAnimating = false;

        // Home button in menu
        const homeLink = document.querySelector('.link:first-child');
        const handleHomeClick = () => {
            if (menuToggle && menuToggle.classList.contains('opened')) {
                menuToggle.click();
            }
        };
        if (homeLink) {
            homeLink.addEventListener('click', handleHomeClick);
        }

        const splitTextIntoSpans = (selector) => {
            let elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                let text = element.innerText;
                let splitText = text.split("").map(function (char) {
                    return `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`;
                }).join("");
                element.innerHTML = splitText;
            });
        };
        splitTextIntoSpans(".header h1");

        if (menuToggle) {
            const handleMenuToggle = () => {
                if (isAnimating) return;
                if (menuToggle.classList.contains('closed')) {
                    menuToggle.classList.remove('closed');
                    menuToggle.classList.add('opened');

                    isAnimating = true;

                    gsap.to(menu, {
                        duration: 1.5,
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                        ease: "hop",
                        onStart: () => { menu.style.pointerEvents = 'all'; },
                        onComplete: () => {
                            isAnimating = false;

                        }
                    });

                    gsap.to(links, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.2,
                        delay: 1.2,
                        ease: "power3.out",
                    });

                    gsap.to(socialLinks, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.2,
                        delay: 1.4,
                        ease: "power3.out",
                    });

                    gsap.to('.video-wrapper', {
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                        duration: 1,
                        delay: 1.2,
                        ease: "power2.out",
                    });

                    gsap.to('.header h1 span', {
                        rotateY: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.05,
                        delay: 1.6,
                        ease: "power4.out",
                    });

                    gsap.to('header h1 span', {
                        y: 0,
                        scale: 1,
                        duration: 1,
                        stagger: 0.05,
                        delay: 1.6,
                        ease: "power4.out",
                    });
                } else {
                    menuToggle.classList.remove('opened');
                    menuToggle.classList.add('closed');

                    isAnimating = true;

                    gsap.to(menu, {
                        duration: 1.5,
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                        ease: "hop",
                        onComplete: () => {
                            menu.style.pointerEvents = 'none';
                            gsap.set(menu, {
                                clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                            });

                            gsap.set(links, {
                                y: 20,
                                opacity: 0,
                            });

                            gsap.set(socialLinks, {
                                y: 20,
                                opacity: 0,
                            });

                            gsap.set('.video-wrapper', {
                                clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
                            });

                            gsap.set('.header h1 span', {
                                y: 200,
                                rotateY: 90,
                                scale: 0.75,
                            });

                            isAnimating = false;
                        },
                    });
                }
            };
            menuToggle.addEventListener('click', handleMenuToggle);
            
            return () => {
                menuToggle.removeEventListener('click', handleMenuToggle);
                if (homeLink) {
                    homeLink.removeEventListener('click', handleHomeClick);
                }
            };
        }
    }, []);

    return (
        <div className="navbar-wrapper">
            <div className="logo"><Link href="#">Padel Kingz</Link></div>

            <div className="account-link">
                <Link href="/leaderboard">Leaderboard</Link>
                <Link href="/login">Account</Link>
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
                    <div className="menu-logo"><Link href="/">Padel Kingz</Link></div>

                    <div className="links">
                        <div className="link"><Link href="/">Home</Link></div>
                        <div className="link"><Link href="#">About</Link></div>
                        <div className="link"><Link href="#">Services</Link></div>
                        <div className="link"><Link href="#">Contact</Link></div>
                    </div>

                    <div className="video-wrapper">
                        <video autoPlay loop muted>
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