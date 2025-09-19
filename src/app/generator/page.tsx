"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Image from "next/image";

const phrases = [
  "",
  "Leave No Trace 🌿",
  "Take Only Memories, Leave Only Footprints 👣",
  "Protect Our Forests 🌲",
  "The Earth is Our Home 🌍",
  "Adventure Awaits ⛺",
  "Keep Nature Wild 🌸",
  "Camp More, Worry Less 🔥",
  "Breathe Deep, Explore Often 🍃",
  "Wilderness is Therapy 🌄",
  "Respect the Outdoors 🏞️",
];

const images = [
  { label: "(none)", value: "" },
  { label: "Flower", value: "/images/card-generator/flower.png" },
  { label: "Monkey", value: "/images/card-generator/monkey.png" },
  { label: "Tiger", value: "/images/card-generator/tiger.png" },
];

const templates = [
  {
    phrase: "Leave No Trace 🌿",
    bg: "#e6ffe6",
    text: "#14532d",
    img: "/images/card-generator/flower.png",
  },
  {
    phrase: "Adventure Awaits ⛺",
    bg: "#fff7e6",
    text: "#7c2d12",
    img: "/images/card-generator/monkey.png",
  },
  {
    phrase: "Protect Our Forests 🌲",
    bg: "#e0f2fe",
    text: "#082f49",
    img: "/images/card-generator/tiger.png",
  },
];

const defaultBg = "#ffffff";
const defaultText = "#222";

const CardGenerator = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [phrase, setPhrase] = useState(phrases[0]);
  const [bgColor, setBgColor] = useState(defaultBg);
  const [textColor, setTextColor] = useState(defaultText);
  const [selectedImage, setSelectedImage] = useState(images[0].value);
  const [fontSize, setFontSize] = useState(32);
  const [textPosition] = useState("center"); // fixed center
  const [history, setHistory] = useState<
    { phrase: string; bg: string; text: string; img: string }[]
  >([]);

  const saveHistory = () => {
    setHistory((prev) => [
      ...prev,
      { phrase, bg: bgColor, text: textColor, img: selectedImage },
    ]);
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "card.png";
      link.click();
    }
  };

  const handleUndo = () => {
    const last = history.pop();
    if (last) {
      setPhrase(last.phrase);
      setBgColor(last.bg);
      setTextColor(last.text);
      setSelectedImage(last.img);
      setHistory([...history]);
    }
  };

  const handleReset = () => {
    setPhrase("");
    setBgColor(defaultBg);
    setTextColor(defaultText);
    setSelectedImage("");
    setFontSize(32);
    setHistory([]);
  };

  return (
    <div className="flex flex-col items-center p-8 pt-28 gap-12 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 min-h-screen">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400 text-transparent bg-clip-text drop-shadow-lg">
          Camping & Environment Card Generator
        </h1>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto text-lg">
          Choose phrases, images and templates to generate your own eco-friendly
          cards!
        </p>
      </div>

      {/* Example Templates */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Example Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {templates.map((tpl, idx) => (
            <div
              key={idx}
              onClick={() => {
                saveHistory();
                setPhrase(tpl.phrase);
                setBgColor(tpl.bg);
                setTextColor(tpl.text);
                setSelectedImage(tpl.img);
              }}
              className="relative w-full h-40 rounded-2xl shadow-md border flex items-center justify-center cursor-pointer hover:scale-105 hover:shadow-xl transition"
              style={{ background: tpl.bg, color: tpl.text }}
            >
              <span className="font-bold text-lg">{tpl.phrase}</span>
              {tpl.img && (
                <Image
                  src={tpl.img}
                  alt="template image"
                  width={48}
                  height={48}
                  className="absolute bottom-3 left-3"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Controls (left) and Preview (right) */}
      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl justify-center">
        {/* Left - Control Panel */}
        <div className="flex flex-col space-y-8 w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100">
          {/* Phrase */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700 text-lg">
              Choose a Phrase
            </label>
            <select
              value={phrase}
              onChange={(e) => {
                saveHistory();
                setPhrase(e.target.value);
              }}
              className="w-full border rounded-xl p-3 text-base shadow-sm focus:ring-2 focus:ring-green-400 transition bg-gray-50 hover:bg-white"
            >
              {phrases.map((p, idx) => (
                <option key={idx} value={p}>
                  {p || "(blank)"}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700 text-lg">
              Choose an Image
            </label>
            <div className="flex flex-wrap gap-5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    saveHistory();
                    setSelectedImage(img.value);
                  }}
                  className={`w-20 h-20 border rounded-2xl flex items-center justify-center bg-gray-50 shadow-sm hover:shadow-lg transition ${
                    selectedImage === img.value
                      ? "ring-4 ring-green-500 scale-105"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={img.label}
                >
                  {img.value ? (
                    <Image
                      src={img.value}
                      alt={img.label}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">(none)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700 text-lg">
              Font Size
            </label>
            <input
              type="range"
              min="16"
              max="60"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          {/* Colors */}
          <div className="flex justify-between items-center">
            {/* Background */}
            <div className="flex flex-col items-center">
              <label className="block font-semibold mb-2 text-gray-700">
                Background
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  saveHistory();
                  setBgColor(e.target.value);
                }}
                className="w-32 h-12 rounded-lg border shadow cursor-pointer"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col items-center">
              <label className="block font-semibold mb-2 text-gray-700">
                Text
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  saveHistory();
                  setTextColor(e.target.value);
                }}
                className="w-32 h-12 rounded-lg border shadow cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-8 mt-6 justify-center">
            <button
              onClick={handleUndo}
              className="p-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full shadow transition"
              title="Undo"
            >
              <i className="ri-arrow-go-back-line text-2xl text-gray-700"></i>
            </button>
            <button
              onClick={handleReset}
              className="p-4 bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 rounded-full shadow transition"
              title="Reset"
            >
              <i className="ri-refresh-line text-2xl text-yellow-700"></i>
            </button>
            <button
              onClick={handleDownload}
              className="p-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-full shadow-lg transition"
              title="Download"
            >
              <i className="ri-download-line text-2xl text-white"></i>
            </button>
          </div>
        </div>

        {/* Right - Preview */}
        <div
          ref={cardRef}
          className="relative w-[600px] h-[400px] flex rounded-3xl shadow-2xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition p-6 border border-gray-200 bg-white"
          style={{
            backgroundColor: bgColor,
            backgroundImage: "url('/images/paper-texture.png')",
            backgroundSize: "cover",
            color: textColor,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="font-bold text-center drop-shadow"
            style={{ fontSize: `${fontSize}px` }}
          >
            {phrase}
          </span>

          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Selected decoration"
              className="absolute bottom-4 left-4 opacity-90"
              width={80}
              height={80}
            />
          )}

          {/* Watermark */}
          <Image
            src="/icons/camp-eco.svg"
            alt="Eco Camping Icon"
            className="absolute bottom-3 right-3 opacity-60"
            width={72}
            height={72}
          />
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
