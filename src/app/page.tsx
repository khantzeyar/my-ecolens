/**
 * Landing page (merged to match target left design)
 * - Symmetric hero wave (Q/T curve) + matched color
 * - Center highlight so hero text is always readable
 * - Seamless gradient into Overview
 * - CTA: solid light card + dark text + green filled button
 * - Overview cards: pale green gradient, rounded top gradient bar, solid green icon tile, CTA text w/ arrow
 * - Keyboard shortcut (Alt/⌘ + /) to open chatbot
 * - Down-arrow scroll to Overview
 * - Floating chatbot button
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";

/* ---------- Reusable card (matches the left screenshot style) ---------- */
function OverviewCard({
  href,
  title,
  desc,
  cta = "Open",
  topBar = "from-emerald-600 to-teal-600",
  bg = "from-emerald-50 to-white",
  iconTile = "bg-emerald-600",
  ariaLabel,
  onClick,
  children,
}: {
  href: string;
  title: string;
  desc: string;
  cta?: string;
  topBar?: string; // gradient for the top bar
  bg?: string; // subtle card background gradient
  iconTile?: string; // solid color for the icon square
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  children: React.ReactNode; // the icon svg
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel ?? `Go to ${title}`}
      className="group relative rounded-[22px] bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all hover:shadow-[0_24px_60px_-20px_rgba(16,185,129,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      {/* Top rounded gradient bar */}
      <div className={`absolute inset-x-0 top-0 h-3 rounded-t-[22px] bg-gradient-to-r ${topBar}`} />

      {/* Card body with very light green gradient */}
      <div className={`pt-8 pb-6 px-6 rounded-[22px] bg-gradient-to-b ${bg} overflow-hidden`}>
        {/* Icon tile */}
        <div className={`mx-auto mb-4 h-12 w-12 ${iconTile} rounded-xl text-white shadow-md grid place-items-center`}>
          <div className="w-6 h-6">{children}</div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 text-center mb-2">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 text-center leading-relaxed max-w-[28ch] mx-auto">
          {desc}
        </p>

        {/* CTA row */}
        <div className="mt-5 flex items-center justify-center">
          <span className="text-emerald-600 font-semibold">
            {cta}
          </span>
          <svg
            className="ml-2 h-4 w-4 text-emerald-600 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      {/* Subtle white footer strip to match the reference look */}
      <div className="h-6 rounded-b-[22px] bg-white" />
    </Link>
  );
}

export default function Home() {
  // Dispatch a global event for your chatbot to listen to
  const handleOpenChatbot = () => {
    window.dispatchEvent(new Event("openChatbot"));
  };

  // Optional: open with keyboard (Alt/Command + /)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ok = (isMac && e.metaKey && e.key === "/") || (!isMac && e.altKey && e.key === "/");
      if (ok) handleOpenChatbot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll to overview when clicking the down arrow
  const scrollToOverview = () => {
    const el = document.querySelector("#overview-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  // Wrapper to use OverviewCard but prevent navigation for chatbot card
  const openChatbotViaCard = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    handleOpenChatbot();
  };

  return (
    <main className="bg-white text-gray-900">
      {/* ===== Hero ===== */}
      <section className="relative flex items-center justify-center h-[88vh] sm:h-screen overflow-hidden">
        {/* Background video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
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
            Providing campsite locations, eco-friendly tips, and forest insights so that you can explore responsibly and
            enjoy the forests with confidence.
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

        {/* Down arrow indicator (click to scroll) */}
        <button
          onClick={scrollToOverview}
          aria-label="Scroll down"
          className="absolute bottom-8 z-10 text-white/95 hover:text-emerald-300 transition-colors animate-bounce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Decorative bottom wave — symmetric + brand color */}
        <svg className="pointer-events-none absolute -bottom-2 left-0 w-full h-[120px] text-[#F5FBF8]" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path d="M0 120 Q 360 60 720 120 T 1440 120 L 1440 160 L 0 160 Z" fill="currentColor" />
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

          {/* Two rows × four columns from lg and up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 items-stretch">
            {/* Discover Camping Sites */}
            <OverviewCard
              href="/camp"
              title="Discover Camping Sites"
              desc="Find campsites across Malaysia with interactive maps and filters."
              cta="Explore"
              topBar="from-teal-600 to-emerald-700"
              bg="from-emerald-50 to-white"
              iconTile="bg-emerald-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-8 9 8M5 10v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
              </svg>
            </OverviewCard>

            {/* Forest Insights */}
            <OverviewCard
              href="/insights"
              title="Forest Insights"
              desc="Explore data on forest cover, loss trends, and sustainability insights."
              cta="Learn"
              topBar="from-emerald-600 to-green-700"
              bg="from-emerald-50 to-white"
              iconTile="bg-emerald-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M12 3a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            </OverviewCard>

            {/* Camping Guide */}
            <OverviewCard
              href="/guide"
              title="Camping Guide"
              desc="Learn eco-friendly camping tips and do's & don'ts for responsible camping."
              cta="Read"
              topBar="from-teal-600 to-cyan-600"
              bg="from-emerald-50 to-white"
              iconTile="bg-teal-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5C4 5.12 5.12 4 6.5 4H20v14H7.5A3.5 3.5 0 014 14.5v-8z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16" />
              </svg>
            </OverviewCard>

            {/* Plant Identifier */}
            <OverviewCard
              href="/plant"
              title="Plant Identifier"
              desc="Identify plants you encounter while camping using our recognition tool."
              cta="Identify"
              topBar="from-lime-600 to-green-600"
              bg="from-emerald-50 to-white"
              iconTile="bg-green-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c2.5-5 7-4.5 7-4.5S18 13 12 19C6 13 5 8.5 5 8.5S9.5 8 12 13z" />
              </svg>
            </OverviewCard>

            {/* Why Eco Camping Matters */}
            <OverviewCard
              href="/why"
              title="Why Eco Camping Matters"
              desc="Learn why responsible camping is important for protecting Malaysia's forests and biodiversity."
              cta="Discover"
              topBar="from-green-700 to-emerald-700"
              bg="from-emerald-50 to-white"
              iconTile="bg-emerald-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-7-7a5 5 0 117-7 5 5 0 117 7l-7 7z" />
              </svg>
            </OverviewCard>

            {/* Campsite Recommender */}
            <OverviewCard
              href="/recommender"
              title="Campsite Recommender"
              desc="Get suggestions based on your preferences and predicted weather."
              cta="Open"
              topBar="from-emerald-600 to-green-600"
              bg="from-emerald-50 to-white"
              iconTile="bg-emerald-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M6 19h12a2 2 0 002-2v-6H4v6a2 2 0 002 2z" />
              </svg>
            </OverviewCard>

            {/* My Eco Footprints */}
            <OverviewCard
              href="/footprints"
              title="My Eco Footprints"
              desc="Track favorites, identified plants, visit history, and your map."
              cta="Open"
              topBar="from-teal-600 to-emerald-600"
              bg="from-emerald-50 to-white"
              iconTile="bg-teal-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 14a4 4 0 100-8 4 4 0 000 8zm10 0a4 4 0 100-8 4 4 0 000 8zM7 14v6m10-6v6" />
              </svg>
            </OverviewCard>

            {/* Chatbot card — same style; prevent navigation */}
            <OverviewCard
              href="/#open-chatbot"
              onClick={openChatbotViaCard}
              title="Chatbot Assistant"
              desc="Get quick answers about eco-friendly camping, find tips and site info, and chat anytime."
              cta="Open"
              topBar="from-emerald-600 to-green-600"
              bg="from-emerald-50 to-white"
              iconTile="bg-emerald-600"
              ariaLabel="Open Chatbot"
            >
              {/* chat bubble + sparkles icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14.5V20a1 1 0 001 1h5l4 0c4.4 0 8-3.13 8-6.75S18.4 7.5 14 7.5H8C4.7 7.5 2 9.74 2 12.25c0 1.5.88 2.83 2 3.75z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 3.5h1M21 5.25h.75M17.75 5.25h-.75" />
              </svg>
            </OverviewCard>
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
              <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 mb-2">Want to learn more?</h2>
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
            <path
              d="M4 14.5C3.447 14.5 3 14.947 3 15.5V20.25C3 20.664 3.336 21 3.75 21H8.5C9.053 21 9.5 20.553 9.5 20V19.5H14C18.418 19.5 22 16.366 22 12.75C22 9.134 18.418 6 14 6H8C4.686 6 2 8.239 2 10.75C2 12.261 2.87 13.592 4 14.5Z"
              fill="currentColor"
            />
            <path
              d="M17 3.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 17 3.75v-.5ZM20.5 4.25a.75.75 0 0 1 .75-.75h.25a.75.75 0 0 1 .75.75v.25a.75.75 0 0 1-.75.75H21.25a.75.75 0 0 1-.75-.75v-.25Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>
    </main>
  );
}
