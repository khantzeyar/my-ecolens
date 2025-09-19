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
    setHistory([]);
  };

  const applyTemplate = (tpl: {
    phrase: string;
    bg: string;
    text: string;
    img: string;
  }) => {
    saveHistory();
    setPhrase(tpl.phrase);
    setBgColor(tpl.bg);
    setTextColor(tpl.text);
    setSelectedImage(tpl.img);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center p-8 pt-28 gap-12 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      {/* Generator */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-400 text-transparent bg-clip-text drop-shadow-sm">
          Camping & Environment Card Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col space-y-6 w-full max-w-md bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200">
          {/* Phrase selector */}
          <div>
            <label className="block font-semibold mb-1">Choose a Phrase</label>
            <select
              value={phrase}
              onChange={(e) => {
                saveHistory();
                setPhrase(e.target.value);
              }}
              className="w-full border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-green-400"
            >
              {phrases.map((p, idx) => (
                <option key={idx} value={p}>
                  {p || "(blank)"}
                </option>
              ))}
            </select>
          </div>

          {/* Image selector */}
          <div>
            <label className="block font-semibold mb-1">Choose an Image</label>
            <div className="flex space-x-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    saveHistory();
                    setSelectedImage(img.value);
                  }}
                  className={`w-16 h-16 border rounded-xl flex items-center justify-center bg-gray-50 shadow-sm hover:shadow-md transition ${
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
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">(none)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-6 flex-wrap">
            {/* Background color */}
            <div>
              <label className="block font-semibold mb-1">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  saveHistory();
                  setBgColor(e.target.value);
                }}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>

            {/* Text color */}
            <div>
              <label className="block font-semibold mb-1">Text</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  saveHistory();
                  setTextColor(e.target.value);
                }}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <button onClick={handleUndo} className="p-2 hover:bg-gray-100 rounded-lg" title="Undo">
              <i className="ri-arrow-go-back-line text-xl text-gray-600"></i>
            </button>
            <button onClick={handleReset} className="p-2 hover:bg-gray-100 rounded-lg" title="Reset">
              <i className="ri-refresh-line text-xl text-gray-600"></i>
            </button>
            <button onClick={handleDownload} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
              <i className="ri-download-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Card Preview */}
        <div
          ref={cardRef}
          className="relative w-[600px] h-[400px] flex items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transition p-6 text-center border border-gray-200 bg-white"
          style={{ background: bgColor, color: textColor }}
        >
          <span className="text-3xl font-bold">{phrase}</span>

          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Selected decoration"
              className="absolute bottom-4 left-4 opacity-90"
              width={80}
              height={80}
            />
          )}

          <Image
            src="/icons/camp-eco.svg"
            alt="Eco Camping Icon"
            className="absolute bottom-4 right-4 opacity-80"
            width={64}
            height={64}
          />
        </div>
      </div>

      {/* Template Gallery */}
      <div className="w-2xl max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {templates.map((tpl, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(tpl)}
              className="relative w-full h-40 rounded-2xl shadow-md hover:shadow-xl transition-transform border flex items-center justify-center hover:scale-105 bg-white"
              style={{ background: tpl.bg, color: tpl.text }}
            >
              <span className="font-bold text-lg text-center">{tpl.phrase}</span>
              {tpl.img && (
                <Image
                  src={tpl.img}
                  alt="template image"
                  width={48}
                  height={48}
                  className="absolute bottom-3 left-3"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
