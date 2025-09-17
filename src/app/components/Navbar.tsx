/** 
 * This is the main nav bar for our website.
 * - The logo will be displayed on the left
 * - The navigation links ("Home", "Camping Sites", "Forest", "Guide") will be on the right.
*/

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <nav className='fixed top-0 w-full flex items-center 
    justify-between py-4 px-24 border-b border-gray-300 bg-white z-50'>
      {/* Logo */}
      <Link href='/'>
        <Image 
          src='/logo.svg' 
          alt='Logo'
          width={430} 
          height={147} 
          style={{ height: '50px', width: 'auto'}} 
        />
      </Link>

      {/* Navigation Links */}
      <ul className='flex gap-12 text-lg font-medium'>
        <Link href='/' className='hover:text-green-600'>
          Home
        </Link>
        <Link href='/camp' className='hover:text-green-600'>
          Camping Sites
        </Link>
        <Link href='/forest' className='hover:text-green-600'>
          Forest
        </Link>
        <Link href='/guide' className='hover:text-green-600'>
          Guide
        </Link>
      </ul>
    </nav>
  )
}

export default Navbar
