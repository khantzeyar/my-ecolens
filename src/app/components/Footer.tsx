/**
 * Unified Footer (Epic-1 logic + Epic-3 UI)
 * - Keeps Epic-1 routes and sources
 * - Applies Epic-3 style improvements (glassmorphism, gradients, hover effects)
 */
'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="relative bg-gray-900 text-white py-14">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Site Information */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl backdrop-blur-sm">
                <Image
                  src="/icons/ecolens-icon.svg"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-lg"
                />
              </div>
              <span className="text-2xl font-bold tracking-wide">MYEcoLens</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md text-sm md:text-base">
              Finding the perfect campsite in Malaysia can be tricky — and doing it responsibly can be even harder. <br />
              <br />
              <span className="text-gray-300">
                MYEcoLens brings campsites, eco-guidance, and forest insights all in one place — so you can camp smart and enjoy Malaysia&apos;s forests like never before.
              </span>
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-emerald-400">Quick Navigation</h3>
            <ul className="space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <Link href="/camp" className="hover:text-white transition-colors duration-200">
                  Camping Sites
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-white transition-colors duration-200">
                  Action Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-emerald-400">Sources</h3>
            <ul className="space-y-3 text-gray-400 text-sm md:text-base">
              <li>
                <Link
                  className="hover:text-white transition-colors duration-200"
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
        <div className="mt-12 border-t border-white/10"></div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 <span className="text-emerald-400 font-semibold">MYEcoLens</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
