/** 
 * This is landing page for our website.
 * - Hero Section: website intro + 3 buttons (Camp, Page A, Page B)
 * - Fun Section: activities + flora & fauna highlights
 * - Responsibility Section: quick links to Page A and Page B
*/

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center pt-20"
        style={{ backgroundImage: "url('/images/forest-fallback.png')" }}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
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
            Providing campsite locations, eco-friendly tips, and forest insights
            so that you can explore responsibly and enjoy the forests with
            confidence.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/camp"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all shadow-2xl flex items-center justify-center"
            >
              <i className="ri-tent-line mr-2"></i>
              Find Campsites
            </Link>
            <Link
              href="/why"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all border-2 border-white/30 hover:border-white/50 
              flex items-center justify-center"
            >
              <i className="ri-line-chart-line mr-2"></i>
              Why Responsible Camping Matters
            </Link>
            <Link
              href="/guide"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all border-2 border-white/30 hover:border-white/50 
              flex items-center justify-center"
            >
              <i className="ri-book-open-line mr-2"></i>
              How to Camp Responsibly
            </Link>
          </div>
        </div>
      </section>

      {/* Fun Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover & Enjoy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Camping is more than staying outdoors – enjoy activities and
              discover local wildlife.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Activity Cards */}
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow hover:shadow-lg">
              <i className="ri-footprint-line text-4xl text-green-600 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">Hiking</h3>
              <p className="text-gray-600">
                Explore trails and enjoy Malaysia&apos;s diverse landscapes.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center shadow hover:shadow-lg">
              <i className="ri-sailboat-line text-4xl text-blue-600 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">Kayaking</h3>
              <p className="text-gray-600">
                Paddle across lakes and rivers for an unforgettable adventure.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center shadow hover:shadow-lg">
              <i className="ri-star-line text-4xl text-yellow-500 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">Stargazing</h3>
              <p className="text-gray-600">
                Enjoy the night sky away from city lights.
              </p>
            </div>

            {/* Flora & Fauna with fallback image */}
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow hover:shadow-lg">
              <Image
                src="/images/forest-fallback.png"
                alt="Rafflesia"
                width={80}
                height={80}
                className="mx-auto mb-3 rounded-full"
              />
              <h3 className="text-lg font-bold mb-2">Rafflesia</h3>
              <p className="text-gray-600">
                World&apos;s largest flower, unique to Malaysian rainforests.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center shadow hover:shadow-lg">
              <Image
                src="/images/forest-fallback.png"
                alt="Hornbill"
                width={80}
                height={80}
                className="mx-auto mb-3 rounded-full"
              />
              <h3 className="text-lg font-bold mb-2">Hornbill</h3>
              <p className="text-gray-600">
                Symbol of Sarawak, known for its large colorful beak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsibility Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Responsible Camping</h2>
          <p className="mb-8 text-lg opacity-90">
            Camping responsibly helps protect Malaysia’s forests and wildlife.
            Learn more here:
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/why"
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100"
            >
              Why Responsible Camping Matters
            </Link>
            <Link
              href="/guide"
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100"
            >
              Do&apos;s & Don&apos;ts of Camping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
