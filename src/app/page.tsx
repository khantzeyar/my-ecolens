/** 
 * This is landing page for our website.
 * - There will be 2 main section for iteration 1 :
 * - The main section that introduces the website and provides 2 buttons (camp/guide)
 * - The core features section that highlights the main functionalities of the site
*/

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Introduction Section */}
      <section 
        className="relative h-screen flex items-center justify-center pt-20"
        style={{ backgroundImage: "url('/forest-fallback.png')" }}
      >
        {/* Background Video */}
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="/forest-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Information */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            MYEcoLens
            <span className="block text-3xl text-green-300 mt-3">
              Malaysian Forest Protection for Campers
            </span>
          </h1>
          <p className="text-lg mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Providing campsite locations, eco-friendly tips, and forest insights so that you can explore responsibly and enjoy the forests with confidence.
          </p>
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/camp"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all transform shadow-2xl 
              whitespace-nowrap flex items-center justify-center"
            >
              <Image src="/icons/rocket-icon.svg" alt="Rocket Icon" className="mr-2" width={20} height={20}/>
              Start Exploring
            </Link>
            <Link
              href="/guide"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all border-2 border-white/30 hover:border-white/50 
              whitespace-nowrap flex items-center justify-center"
            >
              <Image src="/icons/time-icon.svg" alt="Time Icon" className="mr-2" width={20} height={20}/>
              View Our Guide
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
