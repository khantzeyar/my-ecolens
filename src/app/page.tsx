/** 
 * This is landing page for our website.
 * - Hero Section: website intro + 2 buttons (Camp, Why Campeco)
 * - Overview Section: site pages introduction
 * - Activities Section: camping activities with images
 * - Chatbot Section: chatbot prompt
*/

"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  // 点击按钮 → 触发全局事件，通知 Chatbot 打开
  const handleOpenChatbot = () => {
    window.dispatchEvent(new Event("openChatbot"));
  };

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
              Find Campsites
            </Link>
            <Link
              href="/why"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full 
              font-semibold text-base transition-all shadow-2xl flex items-center justify-center"
            >
              Why Campeco Matters
            </Link>
          </div>
        </div>
      </section>

      {/* Overview Section: site pages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Website
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn what you can do on Campeco — each page is designed to help
              you camp responsibly and discover Malaysia&apos;s forests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg">
              <h3 className="text-lg font-bold mb-2">Camping Sites</h3>
              <p className="text-gray-600">
                Find campsites across Malaysia with interactive maps and filters.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg">
              <h3 className="text-lg font-bold mb-2">Forest Insights</h3>
              <p className="text-gray-600">
                Explore data on forest cover, loss trends, and sustainability insights.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg">
              <h3 className="text-lg font-bold mb-2">Guide</h3>
              <p className="text-gray-600">
                Learn eco-friendly camping tips and do&apos;s & don&apos;ts for responsible camping.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg">
              <h3 className="text-lg font-bold mb-2">Animal Identifier</h3>
              <p className="text-gray-600">
                Identify animals you encounter while camping using our recognition tool.
              </p>
            </div>

            {/* New card for Why Campeco Matters */}
            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg">
              <h3 className="text-lg font-bold mb-2">Why Campeco Matters</h3>
              <p className="text-gray-600">
                Learn why responsible camping is important for protecting Malaysia&apos;s forests and biodiversity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section: camping fun */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Activities You Can Enjoy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Camping is more than staying outdoors – enjoy fun activities and discover nature.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Camping", img: "/images/camping.jpg", desc: "Experience nights under the stars in Malaysia's forests." },
              { name: "Hiking", img: "/images/hiking.jpg", desc: "Explore trails and enjoy Malaysia's diverse landscapes." },
              { name: "Swimming", img: "/images/swimming.jpg", desc: "Cool off in rivers and lakes during your camping trip." },
              { name: "Wading", img: "/images/wading.jpg", desc: "Walk through shallow rivers and streams while exploring." },
              { name: "Kayaking", img: "/images/kayaking.jpg", desc: "Paddle across lakes and rivers for an unforgettable adventure." },
              { name: "Bird Watching", img: "/images/birdwatching.jpg", desc: "Observe exotic bird species in their natural habitats." },
            ].map((activity) => (
              <div
                key={activity.name}
                className="rounded-xl overflow-hidden shadow hover:shadow-lg"
              >
                <Image
                  src={activity.img}
                  alt={activity.name}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{activity.name}</h3>
                  <p className="text-gray-600">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Prompt Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Want to learn more?</h2>
          <p className="mb-8 text-lg opacity-90">
            Click the button below to start chatting with our bot and get more information.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleOpenChatbot}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition-all"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
