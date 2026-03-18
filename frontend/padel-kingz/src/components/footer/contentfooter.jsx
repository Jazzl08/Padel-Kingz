'use client'

import Link from 'next/link'
import './contentfooter.css'
import React from 'react'

export default function ContentFooter() {
  return (
    <div className='content'>
      <Section1 />
      <Section2 />
    </div>
  )
}

const Section1 = () => {
  return (
    <div>
      <Nav />
    </div>
  )
}

const Section2 = () => {
  return (
    <div className='content__bottom'>
      <h1 className='content__title'>Padel Kingz</h1>
      <p>©copyright</p>
    </div>
  )
}

const Nav = () => {
  return (
    <div className='nav'>
      <div className='nav__group'>
        <Link href="#"><h3 className='nav__heading'>About</h3></Link>
        <Link href="#"><p>Home</p></Link>
        <Link href="#"><p>Projects</p></Link>
        <Link href="#"><p>Our Mission</p></Link>
        <Link href="#"><p>Contact Us</p></Link>
      </div>
      <div className='nav__group'>
        <Link href="#"><h3 className='nav__heading'>Education</h3></Link>
        <Link href="#"><p>News</p></Link>
        <Link href="#"><p>Learn</p></Link>
        <Link href="#"><p>Certification</p></Link>
        <Link href="#"><p>Publications</p></Link>
      </div>
    </div>
  )
}