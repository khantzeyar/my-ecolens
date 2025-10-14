/**
 * Navbar (with grouped menu)
 * - Left logo, right menu (glassmorphism)
 * - "Discover Camping Sites" as a dropdown:
 *     • All Camping Sites  (/camp)
 *     • Campsite Recommender  (/recommender)
 *     • My Camping Log  (/footprints)
 * - Replace single "Camping Guide" button with:
 *     • Knowledge Hub (dropdown)
 *         - Why Eco Camping Matters (/why)
 *         - Camping Guide (/guide)
 * - Keep others: Plant Identifier (/plant), Forest Insights (/insights)
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const [open, setOpen] = useState(false); // desktop: Discover dropdown
  const [openHub, setOpenHub] = useState(false); // desktop: Knowledge Hub dropdown
  const [isMobileOpen, setIsMobileOpen] = useState(false); // mobile menu
  const [openHubMobile, setOpenHubMobile] = useState(false); // mobile: Knowledge Hub submenu
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverHubTimer = useRef<NodeJS.Timeout | null>(null);

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
    if (pathname.startsWith('/recommender')) return 'light';
    if (pathname.startsWith('/footprints')) return 'light';
    if (pathname.startsWith('/plant')) return 'light';
    if (pathname.startsWith('/why')) return 'light'; // 新增：Knowledge Hub 的 /why
    return 'light';
  };

  const pageTheme = getPageTheme();
  const isDarkBackground = pageTheme === 'dark';

  const styles = (() => {
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
  })();

  const getTextStyles = (isActive: boolean) => {
    if (isActive) {
      return {
        className: 'bg-white/90 text-emerald-700 font-bold shadow-md backdrop-blur-sm',
        style: {},
      };
    }
    if (isDarkBackground) {
      return {
        className: 'text-white hover:bg-white/30 hover:text-emerald-200 font-semibold',
        style: { textShadow: '0 1px 3px rgba(0,0,0,0.7)' },
      };
    } else {
      return {
        className: 'text-gray-800 hover:bg-white/50 hover:text-emerald-700 font-semibold',
        style: { textShadow: '0 1px 2px rgba(255,255,255,0.8)' },
      };
    }
  };

  const Divider = () => (
    <div
      className="w-px h-4 mx-1 shadow-sm"
      style={{
        backgroundColor: isDarkBackground
          ? `rgba(255, 255, 255, 0.4)`
          : `rgba(0, 0, 0, 0.2)`,
      }}
    />
  );

  const onEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpen(true);
  };
  const onLeave = () => {
    hoverTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const onEnterHub = () => {
    if (hoverHubTimer.current) clearTimeout(hoverHubTimer.current);
    setOpenHub(true);
  };
  const onLeaveHub = () => {
    hoverHubTimer.current = setTimeout(() => setOpenHub(false), 120);
  };

  const isDiscoverActive =
    pathname.startsWith('/camp') ||
    pathname.startsWith('/recommender') ||
    pathname.startsWith('/footprints');

  // Knowledge Hub 激活（guide 或 why）
  const isHubActive =
    pathname.startsWith('/guide') || pathname.startsWith('/why');

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
        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Campeco Logo"
              width={150}
              height={50}
              priority
              className="drop-shadow-lg"
              style={{
                width: '150px',
                height: '50px',
                flexShrink: 0,
                objectFit: 'contain',
              }}
            />
          </div>
        </Link>

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-2 rounded-md hover:bg-white/30 transition"
        >
          <i
            className={`ri-${isMobileOpen ? 'close-line' : 'menu-line'} text-2xl ${
              isDarkBackground ? 'text-white' : 'text-gray-800'
            }`}
          />
        </button>

        {/* Desktop menu */}
        <div
          className="relative hidden md:flex items-center backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${
              Math.max(0.2, styles.bgOpacity + 0.1)
            })`,
            border: isDarkBackground
              ? `1px solid rgba(255, 255, 255, ${styles.borderOpacity})`
              : `1px solid rgba(0, 0, 0, ${Math.min(styles.borderOpacity, 0.1)})`,
          }}
        >
          <Link
            href="/"
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap ${
              getTextStyles(pathname === '/').className
            }`}
            style={getTextStyles(pathname === '/').style}
          >
            Home
          </Link>
          <Divider />

          {/* Discover dropdown (保持不变) */}
          <div
            className="relative"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <button
              aria-haspopup="menu"
              aria-expanded={open}
              className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm whitespace-nowrap flex items-center gap-1 ${
                getTextStyles(isDiscoverActive).className
              }`}
              style={getTextStyles(isDiscoverActive).style}
              onClick={() => setOpen((v) => !v)}
            >
              Discover Camping Sites
              <i className="ri-arrow-down-s-line text-xs" />
            </button>

            {open && (
              <div
                className="absolute left-0 top-[110%] min-w=[220px] rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden z-50"
                style={{
                  backgroundColor: `rgba(255,255,255,${
                    isDarkBackground ? 0.98 : 0.96
                  })`,
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                <div className="flex flex-col py-2">
                  <Link href="/camp" className="px-4 py-2 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700">
                    All Camping Sites
                  </Link>
                  <Link href="/recommender" className="px-4 py-2 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700">
                    Campsite Recommender
                  </Link>
                  <Link href="/footprints" className="px-4 py-2 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700">
                    My Camping Log
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* 新增：Knowledge Hub 下拉（替代原单个 Camping Guide 按钮） */}
          <div
            className="relative"
            onMouseEnter={onEnterHub}
            onMouseLeave={onLeaveHub}
          >
            <button
              aria-haspopup="menu"
              aria-expanded={openHub}
              className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm whitespace-nowrap flex items-center gap-1 ${
                getTextStyles(isHubActive).className
              }`}
              style={getTextStyles(isHubActive).style}
              onClick={() => setOpenHub((v) => !v)}
            >
              Knowledge Hub
              <i className="ri-arrow-down-s-line text-xs" />
            </button>

            {openHub && (
              <div
                className="absolute left-0 top-[110%] min-w-[240px] rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden z-50"
                style={{
                  backgroundColor: `rgba(255,255,255,${
                    isDarkBackground ? 0.98 : 0.96
                  })`,
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={onEnterHub}
                onMouseLeave={onLeaveHub}
              >
                <div className="flex flex-col py-2">
                  <Link href="/why" className="px-4 py-2 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700">
                    Why Eco Camping Matters
                  </Link>
                  <Link href="/guide" className="px-4 py-2 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700">
                    Camping Guide
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* 其余按钮保持不变 */}
          <Link
            href="/plant"
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap ${
              getTextStyles(pathname.startsWith('/plant')).className
            }`}
            style={getTextStyles(pathname.startsWith('/plant')).style}
          >
            Plant Identifier
          </Link>
          <Divider />
          <Link
            href="/insights"
            className={`px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm cursor-pointer whitespace-nowrap ${
              getTextStyles(pathname.startsWith('/insights')).className
            }`}
            style={getTextStyles(pathname.startsWith('/insights')).style}
          >
            Forest Insights
          </Link>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileOpen && (
        <div
          className="md:hidden mt-2 mx-4 rounded-xl shadow-lg ring-1 ring-black/10 backdrop-blur-lg overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: isDarkBackground
              ? 'rgba(20, 20, 20, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            border: isDarkBackground
              ? '1px solid rgba(255,255,255,0.2)'
              : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div className={`flex flex-col ${isDarkBackground ? 'text-white' : 'text-gray-800'}`}>
            <Link
              href="/"
              className={`px-5 py-3 transition hover:bg-emerald-600/20 ${
                isDarkBackground ? 'hover:text-emerald-300' : 'hover:text-emerald-700'
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              Home
            </Link>

            {/* Discover (mobile，保持不变) */}
            <button
              onClick={() => setOpen(!open)}
              className={`px-5 py-3 text-left flex justify-between items-center transition ${
                isDarkBackground
                  ? 'hover:bg-white/10 hover:text-emerald-300'
                  : 'hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              Discover Camping Sites
              <i className={`ri-arrow-${open ? 'up' : 'down'}-s-line`} />
            </button>

            {open && (
              <div
                className={`flex flex-col transition-all ${
                  isDarkBackground ? 'bg-white/10' : 'bg-white/70'
                }`}
              >
                <Link
                  href="/camp"
                  className={`px-7 py-2 ${
                    isDarkBackground
                      ? 'hover:bg-white/20 hover:text-emerald-300'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  All Camping Sites
                </Link>
                <Link
                  href="/recommender"
                  className={`px-7 py-2 ${
                    isDarkBackground
                      ? 'hover:bg-white/20 hover:text-emerald-300'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Campsite Recommender
                </Link>
                <Link
                  href="/footprints"
                  className={`px-7 py-2 ${
                    isDarkBackground
                      ? 'hover:bg-white/20 hover:text-emerald-300'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  My Camping Log
                </Link>
              </div>
            )}

            {/* 新增：Knowledge Hub (mobile) */}
            <button
              onClick={() => setOpenHubMobile(!openHubMobile)}
              className={`px-5 py-3 text-left flex justify-between items-center transition ${
                isDarkBackground
                  ? 'hover:bg-white/10 hover:text-emerald-300'
                  : 'hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              Knowledge Hub
              <i className={`ri-arrow-${openHubMobile ? 'up' : 'down'}-s-line`} />
            </button>

            {openHubMobile && (
              <div
                className={`flex flex-col transition-all ${
                  isDarkBackground ? 'bg-white/10' : 'bg-white/70'
                }`}
              >
                <Link
                  href="/why"
                  className={`px-7 py-2 ${
                    isDarkBackground
                      ? 'hover:bg-white/20 hover:text-emerald-300'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Why Eco Camping Matters
                </Link>
                <Link
                  href="/guide"
                  className={`px-7 py-2 ${
                    isDarkBackground
                      ? 'hover:bg-white/20 hover:text-emerald-300'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Camping Guide
                </Link>
              </div>
            )}

            {/* 其余入口保持不变 */}
            <Link
              href="/plant"
              className={`px-5 py-3 transition ${
                isDarkBackground
                  ? 'hover:bg-white/10 hover:text-emerald-300'
                  : 'hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              Plant Identifier
            </Link>
            <Link
              href="/insights"
              className={`px-5 py-3 transition ${
                isDarkBackground
                  ? 'hover:bg-white/10 hover:text-emerald-300'
                  : 'hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              Forest Insights
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
