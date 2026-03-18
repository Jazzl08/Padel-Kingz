'use client'

import React from 'react'
import ContentFooter from './contentfooter.jsx'
import './footer.css'

export default function Footer() {
  return (
    <div className='footer'>
      <div className='footer__scroll-container'>
        <div className='footer__sticky'>
          <ContentFooter />
        </div>
      </div>
    </div>
  )
}
