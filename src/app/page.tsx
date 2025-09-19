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
        style={{ backgroundImage: "url('/images/forest-fallback.png')" }}
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
            Campeco
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
              <i className="ri-rocket-line mr-2"></i>
              Start Exploring
            </Link>
            <Link
              href="/guide"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all border-2 border-white/30 hover:border-white/50 
              whitespace-nowrap flex items-center justify-center"
            >
              <i className="ri-dashboard-3-line mr-2"></i>
              View Our Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Promoting environmental awareness through technology and contributing to Malaysia&apos;s forest conservation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Camping Sites */}
            <Link href="/camp" className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-green-400 to-emerald-500 relative overflow-hidden">
                  <Image 
                    src="/images/camp.jpg"
                    alt="Eco Camping"
                    className="w-full h-full object-cover object-top"
                    width={200} height={20}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <i className="ri-tent-line text-3xl text-white mb-2"></i>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Eco Camping Sites</h3>
                  <p className="text-gray-600 mb-4">Discover Malaysia&apos;s best sustainable camping locations while protecting the environment.</p>
                  <div className="flex items-center text-green-600 font-semibold">
                    <span>Explore Sites</span>
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </div>
            </Link>
            {/* Guide */}
            <Link href="/guide" className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-500 relative overflow-hidden">
                  <Image 
                    src="/images/guide.jpg"
                    alt="Action Guide"
                    className="w-full h-full object-cover object-top"
                    width={200} height={20}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <i className="ri-book-open-line text-3xl text-white mb-2"></i>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Environmental Action Guide</h3>
                  <p className="text-gray-600 mb-4">Learn sustainable practices and participate in forest conservation through concrete actions</p>
                  <div className="flex items-center text-blue-600 font-semibold">
                    <span>Learn Guide</span>
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}