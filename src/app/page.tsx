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
import React, { useEffect } from "react";

export default function Home() {
  // Dispatch a global event for your chatbot to listen to
  const handleOpenChatbot = () => {
    window.dispatchEvent(new Event("openChatbot"));
  };

  // Optional: open with keyboard (Alt/Command + /)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ok =
        (isMac && e.metaKey && e.key === "/") ||
        (!isMac && e.altKey && e.key === "/");
      if (ok) handleOpenChatbot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // NEW: scroll to overview when clicking the down arrow
  const scrollToOverview = () => {
    const el = document.querySelector("#overview-section");
    el?.scrollIntoView({ behavior: "smooth" });
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

        {/* Vignette + center highlight (keeps text readable) */}
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

            {/* NEW: Recommendation button */}
            <Link
              href="/recommender"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold
                         bg-emerald-500/95 text-white shadow-[0_15px_30px_-12px_rgba(16,185,129,0.7)]
                         hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-all"
            >
              Get Recommendations
            </Link>
          </div>
        </div>

        {/* NEW: Down arrow indicator (click to scroll) */}
        <button
          onClick={scrollToOverview}
          aria-label="Scroll down"
          className="absolute bottom-8 z-10 text-white/95 hover:text-emerald-300 transition-colors animate-bounce"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Decorative bottom wave — symmetric + brand color */}
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
      <section id="overview-section" className="relative pt-10 pb-20 bg-gradient-to-b from-[#F5FBF8] to-white">
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

          {/* Use responsive columns so adding cards won’t break layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8 items-stretch">
            <OverviewCard
              href="/camp"
              title="Discover Camping Sites"
              desc="Find campsites across Malaysia with interactive maps and filters."
            />
            <OverviewCard
              href="/insights"
              title="Forest Insights"
              desc="Explore data on forest cover, loss trends, and sustainability insights."
            />
            <OverviewCard
              href="/guide"
              title="Camping Guide"
              desc="Learn eco-friendly camping tips and do's & don'ts for responsible camping."
            />
            <OverviewCard
              href="/plant"
              title="Plant Identifier"
              desc="Identify plants you encounter while camping using our recognition tool."
            />
            <OverviewCard
              href="/why"
              title="Why Eco Camping Matters"
              desc="Learn why responsible camping is important for protecting Malaysia's forests and biodiversity."
            />
            <OverviewCard
              href="/recommender"
              title="Campsite Recommender"
              desc="Get suggestions based on your preferences and predicted weather."
            />
            <OverviewCard
              href="/footprints"
              title="My Eco Footprints"
              desc="Track favorites, identified plants, visit history, and your map."
            />

            {/* ===== Chatbot introduction card (aligned with the row) ===== */}
            <div
              onClick={handleOpenChatbot}
              role="button"
              tabIndex={0}
              aria-label="Open Chatbot"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600
                         h-full flex flex-col justify-center cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                Chatbot Assistant
              </h3>
              <p className="text-gray-600">
                Get quick answers about eco-friendly camping, find tips and site info, and chat anytime.
              </p>
            </div>
            {/* ===== end chatbot card ===== */}
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
            ].map((a) => (
              <div
                key={a.name}
                className="rounded-2xl bg-gradient-to-br from-emerald-200/40 via-white to-white p-[1px] shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={a.img}
                    alt={a.name}
                    width={600}
                    height={400}
                    className="h-80 sm:h-96 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2">{a.name}</h3>
                    <p className="text-gray-600">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Chatbot CTA ===== */}
      <section className="relative py-16">
        {/* Dark gradient background (brand colors) */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800" />
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(900px_240px_at_10%_0%,white,transparent),radial-gradient(900px_240px_at_90%_100%,white,transparent)]" />

        <div className="max-w-5xl mx-auto px-6">
          {/* Solid white card + dark text */}
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

      {/* ===== Floating Chatbot Button ===== */}
      <button
        onClick={handleOpenChatbot}
        aria-label="Open Chatbot"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-600 text-white shadow-lg
                   hover:bg-green-700 active:bg-green-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
      >
        {/* Attention ping */}
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-green-400/60" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center">
          {/* Inline SVG icon (chat bubble with sparkles) */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 14.5C3.447 14.5 3 14.947 3 15.5V20.25C3 20.664 3.336 21 3.75 21H8.5C9.053 21 9.5 20.553 9.5 20V19.5H14C18.418 19.5 22 16.366 22 12.75C22 9.134 18.418 6 14 6H8C4.686 6 2 8.239 2 10.75C2 12.261 2.87 13.592 4 14.5Z" fill="currentColor"/>
            <path d="M17 3.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 17 3.75v-.5ZM20.5 4.25a.75.75 0 0 1 .75-.75h.25a.75.75 0 0 1 .75.75v.25a.75.75 0 0 1-.75.75H21.25a.75.75 0 0 1-.75-.75v-.25Z" fill="currentColor"/>
          </svg>
        </span>
      </button>
    </main>
  );
}

/* ===== Reusable card component ===== */
function OverviewCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 shadow-sm
                 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600
                 h-full flex flex-col justify-center"
      aria-label={`Go to ${title}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
      <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </Link>
  );
}
