/** 
 * This is the footer for our website.
 * - There will be quick navigation links to each of the main pages of the website.
 * - Sources to our datasets will also be included to help provide the validity of our information.
 * - TO DO : Add links to our main dataset sources
*/

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Site Information */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/icons/ecolens-icon.svg" alt="Logo" width={120} height={120}/>
                </div>
                <span className="text-xl font-bold">MYEcoLens</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Finding the perfect campsite in Malaysia can be tricky - and doing it responsibly can be even harder.<br />
                <br />
                MYEcoLens brings campsites, eco-guidance, and forest insights all in one place - so you can camp smart and enjoy Malaysia&apos;s forests like never before.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Navigation</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/camp" className="hover:text-white cursor-pointer">Camping Sites</Link></li>
                <li><Link href="/guide" className="hover:text-white cursor-pointer">Action Guide</Link></li>
              </ul>
            </div>
            {/* Source Links */}
            <div>
              <h3 className="font-semibold mb-4">Sources</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Link className="hover:text-white cursor-pointer" 
                    href="https://www.forestry.gov.my/my/perkhidmatan/info-perhutanan/hutan-lipur-hutan-taman-negeri">
                    Malaysian Forest Sites
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Copyright */}
          <div className="mt-8 pt-6 text-center">
            <p className="text-gray-400">© 2025 MYEcoLens. All rights reserved.</p>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
