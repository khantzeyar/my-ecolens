/**
 * Navbar (Epic-1 + Epic-2 with Epic-3 UI)
 * - Epic-1 routes: Home, Camping Sites, Guide
 * - Epic-2: Forest Insights (/insights)
 * - UI: Epic-3 glassmorphism
 */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getPageTheme = () => {
    if (pathname === '/') return 'dark';
    if (pathname.startsWith('/camp')) return 'light';
    if (pathname.startsWith('/guide')) return 'dark';
    if (pathname.startsWith('/insights')) return 'light';
    if (pathname.startsWith('/recommend')) return 'light';
    return 'light';
  };

  const pageTheme = getPageTheme();
  const isDarkBackground = pageTheme === 'dark';

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

  const getTextStyles = (isActive: boolean) => {
    if (isActive) {
      return {
        className:
          'bg-white/90 text-emerald-700 font-bold shadow-md backdrop-blur-sm',
        style: {},
      };
    }
    if (isDarkBackground) {
      return {
        className:
          'text-white hover:bg-white/30 hover:text-emerald-200 font-semibold',
        style: { textShadow: '0 1px 3px rgba(0,0,0,0.7)' },
      };
    } else {
      return {
        className:
          'text-gray-800 hover:bg-white/50 hover:text-emerald-700 font-semibold',
        style: { textShadow: '0 1px 2px rgba(255,255,255,0.8)' },
      };
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 p-4 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
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
        <Link href="/" className="cursor-pointer group">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
              style={{ height: '50px', width: 'auto' }}
            />
          </div>
        </Link>

        <div
          className="flex items-center backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${
              Math.max(0.2, styles.bgOpacity + 0.1)
            })`,
            border: isDarkBackground
              ? `1px solid rgba(255, 255, 255, ${styles.borderOpacity})`
              : `1px solid rgba(0, 0, 0, ${Math.min(styles.borderOpacity, 0.1)})`,
          }}
        >
          {[
            { href: '/', label: 'Home', active: pathname === '/' },
            { href: '/camp', label: 'Camping Sites', active: pathname.startsWith('/camp') },
            { href: '/recommender', label: 'Campsite Recommender', active: pathname.startsWith('/recommender') },
            { href: '/insights', label: 'Forest Insights', active: pathname.startsWith('/insights') },
            { href: '/guide', label: 'Guide', active: pathname.startsWith('/guide') },
          ].map((link, idx, arr) => (
            <React.Fragment key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap ${
                  getTextStyles(link.active).className
                }`}
                style={getTextStyles(link.active).style}
              >
                {link.label}
              </Link>
              {idx < arr.length - 1 && (
                <div
                  className="w-px h-4 mx-1 shadow-sm"
                  style={{
                    backgroundColor: isDarkBackground
                      ? `rgba(255, 255, 255, 0.4)`
                      : `rgba(0, 0, 0, 0.2)`,
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
