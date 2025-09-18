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

  // Apply template
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
  <div className="flex flex-row justify-center p-6 pt-24 space-y-12">
    {/* Generator */}
    <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
      <h1 className="text-2xl font-bold text-center">
        Camping & Environment Card Generator
      </h1>
      {/* Controls */}
      <div className="flex flex-col space-y-4 w-full max-w-md">
        {/* Phrase selector */}
        <div>
          <label className="block font-medium">Choose a Phrase</label>
          <select
            value={phrase}
            onChange={(e) => {
              saveHistory();
              setPhrase(e.target.value);
            }}
            className="w-full border rounded p-2"
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
          <label className="block font-medium mb-1">Choose an Image</label>
          <div className="flex space-x-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  saveHistory();
                  setSelectedImage(img.value);
                }}
                className={`w-16 h-16 border rounded flex items-center justify-center ${
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
            <label className="block font-medium">Background Color</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => {
                saveHistory();
                setBgColor(e.target.value);
              }}
            />
          </div>

          {/* Text color */}
          <div>
            <label className="block font-medium">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                saveHistory();
                setTextColor(e.target.value);
              }}
            />
          </div>

          {/* Buttons */}
          <button onClick={handleUndo} className="p-2 cursor-pointer" title="Undo">
            <i className="ri-arrow-go-back-line text-xl hover:text-gray-300"></i>
          </button>
          <button onClick={handleReset} className="p-2 cursor-pointer" title="Reset">
            <i className="ri-refresh-line text-xl hover:text-gray-300"></i>
          </button>
          <button onClick={handleDownload} className="p-2 cursor-pointer" title="Download">
            <i className="ri-download-line text-xl hover:text-gray-300"></i>
          </button>
        </div>
      </div>

      {/* Card Preview */}
      <div
        ref={cardRef}
        className="relative w-[600px] h-[400px] flex items-center justify-center rounded-lg shadow-lg p-4 text-center"
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
      <h2 className="text-xl font-semibold mb-4 text-center">Templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl, idx) => (
          <button
            key={idx}
            onClick={() => applyTemplate(tpl)}
            className="relative w-full h-40 rounded-lg shadow border flex items-center justify-center hover:scale-105 transition-transform"
            style={{ background: tpl.bg, color: tpl.text }}
          >
            <span className="font-bold text-lg text-center">{tpl.phrase}</span>
            {tpl.img && (
              <Image
                src={tpl.img}
                alt="template image"
                width={48}
                height={48}
                className="absolute bottom-2 left-2"
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
