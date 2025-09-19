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
          Choose phrases, images and templates to generate your own eco-friendly cards!
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
              className="relative w-full h-40 rounded-2xl shadow-md border flex items-center justify-center bg-white"
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
        <div className="flex flex-col space-y-6 w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-200">
          {/* Phrase */}
          <div>
            <label className="block font-semibold mb-2">Choose a Phrase</label>
            <select
              value={phrase}
              onChange={(e) => {
                saveHistory();
                setPhrase(e.target.value);
              }}
              className="w-full border rounded-lg p-3 text-lg shadow-sm focus:ring-2 focus:ring-green-400"
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
            <label className="block font-semibold mb-2">Choose an Image</label>
            <div className="flex flex-wrap gap-5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    saveHistory();
                    setSelectedImage(img.value);
                  }}
                  className={`w-20 h-20 border rounded-xl flex items-center justify-center bg-gray-50 shadow-sm hover:shadow-md transition ${
                    selectedImage === img.value
                      ? "ring-2 ring-green-600"
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
                    <span className="text-xs text-gray-500">(none)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size only */}
          <div>
            <label className="block font-semibold mb-1">Font Size</label>
            <input
              type="range"
              min="16"
              max="60"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-6 flex-wrap">
            <div>
              <label className="block font-semibold mb-1">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  saveHistory();
                  setBgColor(e.target.value);
                }}
                className="w-14 h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Text</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  saveHistory();
                  setTextColor(e.target.value);
                }}
                className="w-14 h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Actions in one row */}
          <div className="flex items-center space-x-6 mt-4">
            <button
              onClick={handleUndo}
              className="p-3 hover:bg-gray-100 rounded-full"
              title="Undo"
            >
              <i className="ri-arrow-go-back-line text-2xl text-gray-600"></i>
            </button>
            <button
              onClick={handleReset}
              className="p-3 hover:bg-gray-100 rounded-full"
              title="Reset"
            >
              <i className="ri-refresh-line text-2xl text-gray-600"></i>
            </button>
            <button
              onClick={handleDownload}
              className="p-3 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <i className="ri-download-line text-2xl text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Right - Preview */}
        <div
          ref={cardRef}
          className="relative w-[600px] h-[400px] flex rounded-2xl shadow-xl hover:shadow-2xl transition p-6 border border-gray-200 bg-white"
          style={{
            background: `${bgColor} url('/images/paper-texture.png')`,
            backgroundSize: "cover",
            color: textColor,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="font-bold text-center"
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
