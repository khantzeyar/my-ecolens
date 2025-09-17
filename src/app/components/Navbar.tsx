/** 
 * This is the main nav bar for our website.
 * - The logo will be displayed on the left
 * - The navigation links ("Home", "Camping Sites", "Guide") will be on the right.
 * Enhanced with 5120-ui inspired glass morphism design with auto-hide functionality
*/
'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动且滚动距离超过100px时隐藏
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // 向上滚动时显示
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-0 w-full z-50 p-4 bg-gradient-to-b from-gray-900/20 to-transparent transition-transform duration-300 ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      <div className="flex items-center justify-between py-3 px-6 mx-auto max-w-7xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl hover:bg-white/20 transition-all duration-300">
        
        {/* Logo */}
        <Link href='/' className="cursor-pointer group">
          <div className="flex items-center">
            <div className="relative overflow-hidden rounded-xl">
              <Image 
                src='/logo.svg' 
                alt='Logo'
                width={50} 
                height={50} 
                className="transition-transform duration-300 group-hover:scale-110"
                style={{ height: '50px', width: 'auto' }} 
              />
            </div>
          </div>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
          <Link 
            href='/' 
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              pathname === '/'
                ? 'bg-white/80 text-emerald-700 font-bold shadow-sm'
                : 'text-gray-700 hover:bg-white/40 hover:text-emerald-700'
            }`}
          >
            Home
          </Link>
          
          <div className="w-px h-4 bg-white/30 mx-1"></div>
          
          <Link 
            href='/camp' 
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              pathname.startsWith('/camp')
                ? 'bg-white/80 text-emerald-700 font-bold shadow-sm'
                : 'text-gray-700 hover:bg-white/40 hover:text-emerald-700'
            }`}
          >
            Camping Sites
          </Link>
          
          <div className="w-px h-4 bg-white/30 mx-1"></div>
          
          <Link 
            href='/guide' 
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              pathname.startsWith('/guide')
                ? 'bg-white/80 text-emerald-700 font-bold shadow-sm'
                : 'text-gray-700 hover:bg-white/40 hover:text-emerald-700'
            }`}
          >
            Guide
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar