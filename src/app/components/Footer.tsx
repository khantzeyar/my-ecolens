/**
 * Unified Footer (final spacing-tuned version)
 * - Brand on left, three columns (Learning / Hub / Sources) slightly shifted right
 * - Cleaner spacing balance between brand and navigation
 */
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="relative bg-gray-900 text-white py-14">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main grid: brand + right-side sections */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12">
          {/* Brand / Summary */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl backdrop-blur-sm">
                <Image
                  src="/icons/ecolens-icon.svg"
                  alt="Campeco Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-lg"
                />
              </div>
              <span className="text-2xl font-bold tracking-wide">Campeco</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md text-sm md:text-base">
              Campeco brings campsites, eco-guidance, and forest insights all in one place —
              so you can camp smart and enjoy Malaysia&apos;s forests like never before.
            </p>
          </div>

          {/* Learning */}
          <div className="pl-4 lg:pl-12">
            <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg text-emerald-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h14v14H7a3 3 0 01-3-3V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16" />
              </svg>
              Learning
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm md:text-base">
              <li><Link href="/guide" className="hover:text-white transition-colors">Camping Guide</Link></li>
              <li><Link href="/why" className="hover:text-white transition-colors">Why Eco Camping Matters</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Forest Insights</Link></li>
            </ul>
          </div>

          {/* Hub */}
          <div className="pl-4 lg:pl-12">
            <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg text-emerald-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l3-6 3 6-3 1.5L9 13z" />
              </svg>
              Hub
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm md:text-base">
              <li><Link href="/camp" className="hover:text-white transition-colors">Camping Sites</Link></li>
              <li><Link href="/plant" className="hover:text-white transition-colors">Plant Identifier</Link></li>
              <li><Link href="/recommender" className="hover:text-white transition-colors">Campsite Recommender</Link></li>
              <li><Link href="/footprints" className="hover:text-white transition-colors">My Eco Footprints</Link></li>
            </ul>
          </div>

          {/* Sources */}
          <div className="pl-4 lg:pl-12">
            <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg text-emerald-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 10-7.07-7.07L10 5M14 11a5 5 0 01-7.07 0L5.5 9.57a5 5 0 017.07-7.07L14 4" />
              </svg>
              Sources
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="https://www.forestry.gov.my/my/perkhidmatan/info-perhutanan/hutan-lipur-hutan-taman-negeri"
                  target="_blank"
                >
                  Malaysian Forest Sites
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10" />

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} <span className="text-emerald-400 font-semibold">Campeco</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
