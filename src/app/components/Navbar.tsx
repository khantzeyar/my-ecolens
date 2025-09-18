/**
 * 智能自适应导航栏组件
 * - 根据页面路径和背景自动调整文字颜色
 * - 增强了在任何背景下的可读性
 * - 保持优雅的玻璃态效果
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 根据页面路径判断背景类型
  const getPageTheme = () => {
    if (pathname === '/') {
      return 'dark'; // 首页是深色背景
    } else if (pathname.startsWith('/camp')) {
      return 'light'; // camping sites 页面是浅色背景
    } else if (pathname.startsWith('/guide')) {
      return 'dark'; // guide 页面是深色背景
    }
    return 'light'; // 默认浅色
  };

  const pageTheme = getPageTheme();
  const isDarkBackground = pageTheme === 'dark';

  // 根据滚动位置和背景类型动态调整样式
  const getNavbarStyles = () => {
    const scrollProgress = Math.min(scrollY / 200, 1);
    
    if (isDarkBackground) {
      return {
        backdropOpacity: Math.max(0.1, scrollProgress * 0.3),
        bgOpacity: Math.max(0.15, scrollProgress * 0.25),
        borderOpacity: Math.max(0.2, scrollProgress * 0.4),
      };
    } else {
      return {
        backdropOpacity: Math.max(0.05, scrollProgress * 0.2),
        bgOpacity: Math.max(0.25, scrollProgress * 0.4),
        borderOpacity: Math.max(0.3, scrollProgress * 0.5),
      };
    }
  };

  const styles = getNavbarStyles();

  // 获取文字样式
  const getTextStyles = (isActive: boolean) => {
    if (isActive) {
      return {
        className: 'bg-white/90 text-emerald-700 font-bold shadow-md backdrop-blur-sm',
        style: {}
      };
    }

    if (isDarkBackground) {
      return {
        className: 'text-white hover:bg-white/30 hover:text-emerald-200 font-semibold',
        style: { textShadow: '0 1px 3px rgba(0,0,0,0.7)' }
      };
    } else {
      return {
        className: 'text-gray-800 hover:bg-white/50 hover:text-emerald-700 font-semibold',
        style: { textShadow: '0 1px 2px rgba(255,255,255,0.8)' }
      };
    }
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 p-4 transition-all duration-300 ${
        isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
      }`}
      style={{
        background: isDarkBackground 
          ? `linear-gradient(to bottom, rgba(0,0,0,${styles.backdropOpacity}), transparent)`
          : `linear-gradient(to bottom, rgba(255,255,255,${styles.backdropOpacity}), transparent)`,
      }}
    >
      <div 
        className="flex items-center justify-between py-3 px-6 mx-auto max-w-7xl backdrop-blur-xl rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${styles.bgOpacity})`,
          border: isDarkBackground 
            ? `1px solid rgba(255, 255, 255, ${styles.borderOpacity})`
            : `1px solid rgba(0, 0, 0, ${Math.min(styles.borderOpacity, 0.15)})`,
        }}
      >
        {/* Logo */}
        <Link href='/' className="cursor-pointer group">
          <div className="flex items-center">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src='/logo.svg'
                alt='Logo'
                width={50}
                height={50}
                className="transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                style={{ height: '50px', width: 'auto' }}
              />
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div 
          className="flex items-center backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${Math.max(0.2, styles.bgOpacity + 0.1)})`,
            border: isDarkBackground 
              ? `1px solid rgba(255, 255, 255, ${styles.borderOpacity})`
              : `1px solid rgba(0, 0, 0, ${Math.min(styles.borderOpacity, 0.1)})`,
          }}
        >
          <Link
            href='/'
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              getTextStyles(pathname === '/').className
            }`}
            style={getTextStyles(pathname === '/').style}
          >
            Home
          </Link>

          <div 
            className="w-px h-4 mx-1 shadow-sm"
            style={{
              backgroundColor: isDarkBackground 
                ? `rgba(255, 255, 255, 0.4)` 
                : `rgba(0, 0, 0, 0.2)`
            }}
          ></div>

          <Link
            href='/camp'
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              getTextStyles(pathname.startsWith('/camp')).className
            }`}
            style={getTextStyles(pathname.startsWith('/camp')).style}
          >
            Camping Sites
          </Link>

          <div 
            className="w-px h-4 mx-1 shadow-sm"
            style={{
              backgroundColor: isDarkBackground 
                ? `rgba(255, 255, 255, 0.4)` 
                : `rgba(0, 0, 0, 0.2)`
            }}
          ></div>

          <Link
            href='/guide'
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              getTextStyles(pathname.startsWith('/guide')).className
            }`}
            style={getTextStyles(pathname.startsWith('/guide')).style}
          >
            Guide
          </Link>

          <Link
            href='/forest'
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap font-inter ${
              getTextStyles(pathname.startsWith('/forest')).className
            }`}
            style={getTextStyles(pathname.startsWith('/forest')).style}
          >
            Dashboard
          </Link>

        </div>
      </div>
    </nav>
  )
}

export default Navbar