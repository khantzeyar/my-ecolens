/** 
 * This is the main nav bar for our website.
 * - The logo will be displayed on the left
 * - The navigation links ("Guide" and "Camping Sites") will be on the right.
*/

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <nav className='fixed top-0 w-full flex items-center 
    justify-between py-4 px-24 border-b border-gray-300 bg-white z-10'>
        {/* Logo */}
        <Link href='/'>
            <Image src='/logo.svg' alt='Logo'
            width={430} height={147} style={{ height: '50px', width: 'auto'}}/>
        </Link>
        {/* Navigation Links */}
        <ul className='flex gap-12 text-lg font-medium'>
            <Link href='/camp'>
                Camping Sites
            </Link>
            <Link href='/guide'>
                Guide
            </Link>
        </ul>
    </nav>
  )
}

export default Navbar