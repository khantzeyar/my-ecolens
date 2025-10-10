/** 
 * Landing page (refined UI, keep structure & copy)
 * - Symmetric hero wave (Q/T curve) + matched color
 * - Center highlight so hero text is always readable
 * - Seamless gradient into Overview
 * - CTA: solid light card + dark text + green filled button
 * - Enhanced card design with icons and gradients
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Home() {
  // 点击按钮 → 触发全局事件，通知 Chatbot 打开
  const handleOpenChatbot = () => {
    window.dispatchEvent(new Event("openChatbot"));
  };

  return (
    <main className="bg-white text-gray-900">
      {/* ===== Hero ===== */}
      <section className="relative flex items-center justify-center h-[88vh] sm:h-screen overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/forest-video.mp4" type="video/mp4" />
        </video>

        {/* Vignette + Center highlight（不遮字） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_35%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-1/3 h-[40rem] w-[40rem] rounded-full bg-green-400/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 px-6 text-center text-white max-w-6xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            Campeco
            <span className="mt-3 block text-2xl sm:text-3xl font-semibold text-emerald-300">
              Malaysian Forest Protection for Campers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg sm:text-xl opacity-95 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            Providing campsite locations, eco-friendly tips, and forest insights
            so that you can explore responsibly and enjoy the forests with
            confidence.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/camp"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold
                         bg-emerald-600 text-white shadow-[0_15px_30px_-12px_rgba(16,185,129,0.7)]
                         hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-all"
            >
              Find Campsites
            </Link>

            <Link
              href="/why"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold
                         bg-white/95 text-emerald-800 shadow-[0_10px_25px_-15px_rgba(255,255,255,0.9)]
                         hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-all"
            >
              Why Eco Camping Matters
            </Link>
          </div>
        </div>

        {/* Decorative bottom wave — 对称 + 统一色 + 轻微上移 */}
        <svg
          className="pointer-events-none absolute -bottom-2 left-0 w-full h-[120px] text-[#F5FBF8]"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 Q 360 60 720 120 T 1440 120 L 1440 160 L 0 160 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* ===== Overview ===== */}
      <section className="relative pt-10 pb-20 bg-gradient-to-b from-[#F5FBF8] to-white">
        {/* soft pattern lights */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-200/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-green-200/25 blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Explore Our Website
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Learn what you can do on Campeco — each page is designed to help
              you camp responsibly and discover Malaysia&apos;s forests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Discover Camping Sites */}
            <Link
              href="/camp"
              className="group relative overflow-hidden rounded-2xl bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              aria-label="Go to Discover Camping Sites page"
            >
              {/* Gradient Top Border */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
              
              {/* Card Content */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:bg-white transition-all duration-500">
                {/* Icon Container */}
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  Discover Camping Sites
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Find campsites across Malaysia with interactive maps and filters.
                </p>

                {/* Arrow */}
                <div className="flex items-center justify-center text-emerald-600 font-semibold text-sm group-hover:text-teal-600 transition-colors duration-300">
                  <span className="mr-1">Explore</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* Forest Insights */}
            <Link
              href="/insights"
              className="group relative overflow-hidden rounded-2xl bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              aria-label="Go to Forest Insights page"
            >
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:bg-white transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
                  Forest Insights
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Explore data on forest cover, loss trends, and sustainability insights.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold text-sm group-hover:text-emerald-600 transition-colors duration-300">
                  <span className="mr-1">Learn</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* Camping Guide */}
            <Link
              href="/guide"
              className="group relative overflow-hidden rounded-2xl bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              aria-label="Go to Camping Guide page"
            >
              <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-600" />
              <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 group-hover:bg-white transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-cyan-600 transition-all duration-300">
                  Camping Guide
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Learn eco-friendly camping tips and do&apos;s & don&apos;ts for responsible camping.
                </p>
                <div className="flex items-center justify-center text-teal-600 font-semibold text-sm group-hover:text-cyan-600 transition-colors duration-300">
                  <span className="mr-1">Read</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* Plant Identifier */}
            <Link
              href="/animal"
              className="group relative overflow-hidden rounded-2xl bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              aria-label="Go to Plant Identifier page"
            >
              <div className="h-2 bg-gradient-to-r from-lime-500 to-green-600" />
              <div className="p-6 bg-gradient-to-br from-lime-50 to-green-50 group-hover:bg-white transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-lime-600 group-hover:to-green-600 transition-all duration-300">
                  Plant Identifier
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Identify plants you encounter while camping using our recognition tool.
                </p>
                <div className="flex items-center justify-center text-lime-600 font-semibold text-sm group-hover:text-green-600 transition-colors duration-300">
                  <span className="mr-1">Identify</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* Why Eco Camping Matters */}
            <Link
              href="/why"
              className="group relative overflow-hidden rounded-2xl bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              aria-label="Go to Why Eco Camping Matters page"
            >
              <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-700" />
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:bg-white transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300">
                  Why Eco Camping Matters
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Learn why responsible camping is important for protecting Malaysia&apos;s forests and biodiversity.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold text-sm group-hover:text-emerald-700 transition-colors duration-300">
                  <span className="mr-1">Discover</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Activities ===== */}
      <section className="pt-8 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">Activities You Can Enjoy</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Camping is more than staying outdoors – enjoy fun activities and discover nature.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group rounded-2xl bg-gradient-to-br from-emerald-200/40 via-white to-white p-[1px] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="overflow-hidden rounded-2xl bg-white">
                  <div className="relative overflow-hidden">
                    <Image
                      src={activity.img}
                      alt={activity.name}
                      width={600}
                      height={400}
                      className="h-56 w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      style={{ objectPosition: activity.name === "Bird Watching" ? "center 35%" : "center" }}
                    />
                    {/* 悬停渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-emerald-700 transition-colors">{activity.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{activity.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Chatbot CTA ===== */}
      <section className="relative py-12">
        {/* 深色背景渐变（保持品牌色） */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800" />
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(900px_240px_at_10%_0%,white,transparent),radial-gradient(900px_240px_at_90%_100%,white,transparent)]" />

        <div className="max-w-4xl mx-auto px-6">
          {/* 改为实体白卡 + 深色文字 */}
          <div className="rounded-2xl bg-white shadow-[0_20px_60px_-20px_rgba(16,185,129,0.5)] ring-1 ring-black/5">
            <div className="px-8 py-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mb-2">
                Want to learn more?
              </h2>
              <p className="text-base text-gray-700 max-w-xl mx-auto mb-6">
                Click the button below to start chatting with our bot and get more information.
              </p>
              <button
                onClick={handleOpenChatbot}
                className="inline-flex items-center justify-center rounded-xl px-7 py-2.5 text-base font-semibold
                           bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800
                           shadow-[0_12px_28px_-12px_rgba(16,185,129,0.65)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 transition-all"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}