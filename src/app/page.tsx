/** 
 * Landing page (refined UI, keep structure & copy)
 * - Symmetric hero wave (Q/T curve) + matched color
 * - Center highlight so hero text is always readable
 * - Seamless gradient into Overview
 * - CTA: solid light card + dark text + green filled button
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Discover Camping Sites */}
            <Link
              href="/camp"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Go to Discover Camping Sites page"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Discover Camping Sites
              </h3>
              <p className="text-gray-600">
                Find campsites across Malaysia with interactive maps and filters.
              </p>
            </Link>

            {/* Forest Insights */}
            <Link
              href="/insights"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Go to Forest Insights page"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Forest Insights
              </h3>
              <p className="text-gray-600">
                Explore data on forest cover, loss trends, and sustainability insights.
              </p>
            </Link>

            {/* Camping Guide */}
            <Link
              href="/guide"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Go to Camping Guide page"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Camping Guide
              </h3>
              <p className="text-gray-600">
                Learn eco-friendly camping tips and do&apos;s & don&apos;ts for responsible camping.
              </p>
            </Link>

            {/* Plant Identifier（如路由改为 /plant，自行替换 href） */}
            <Link
              href="/animal"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Go to Plant Identifier page"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Plant Identifier
              </h3>
              <p className="text-gray-600">
                Identify plants you encounter while camping using our recognition tool.
              </p>
            </Link>

            {/* Why Eco Camping Matters */}
            <Link
              href="/why"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="Go to Why Eco Camping Matters page"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Why Eco Camping Matters
              </h3>
              <p className="text-gray-600">
                Learn why responsible camping is important for protecting
                Malaysia&apos;s forests and biodiversity.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Activities ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight">Activities You Can Enjoy</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="rounded-2xl bg-gradient-to-br from-emerald-200/40 via-white to-white p-[1px] shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={activity.img}
                    alt={activity.name}
                    width={600}
                    height={400}
                    className="h-80 sm:h-96 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2">{activity.name}</h3>
                    <p className="text-gray-600">{activity.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Chatbot CTA ===== */}
      <section className="relative py-16">
        {/* 深色背景渐变（保持品牌色） */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800" />
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(900px_240px_at_10%_0%,white,transparent),radial-gradient(900px_240px_at_90%_100%,white,transparent)]" />

        <div className="max-w-5xl mx-auto px-6">
          {/* 改为实体白卡 + 深色文字 */}
          <div className="rounded-3xl bg-white shadow-[0_24px_80px_-24px_rgba(16,185,129,0.55)] ring-1 ring-black/5">
            <div className="px-8 py-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 mb-2">
                Want to learn more?
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                Click the button below to start chatting with our bot and get more information.
              </p>
              <button
                onClick={handleOpenChatbot}
                className="inline-flex items-center justify-center rounded-xl px-8 py-3 font-semibold
                           bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800
                           shadow-[0_14px_36px_-14px_rgba(16,185,129,0.7)]
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
