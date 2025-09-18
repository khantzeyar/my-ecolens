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

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pt-24">
      <h1 className="text-2xl font-bold">
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

        {/* Image selector*/}
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
        <div className="flex items-center space-x-6">
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

          {/* Undo */}
          <button onClick={handleUndo} className="p-2 cursor-pointer" title="Undo">
            <i className="ri-arrow-go-back-line text-xl hover:text-gray-300"></i>
          </button>

          {/* Reset */}
          <button onClick={handleReset} className="p-2 cursor-pointer" title="Reset">
            <i className="ri-refresh-line text-xl hover:text-gray-300"></i>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 cursor-pointer"
            title="Download"
          >
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

        {/* Bottom-left image */}
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Selected decoration"
            className="absolute bottom-4 left-4 opacity-90"
            width={80}
            height={80}
          />
        )}

        {/* Bottom-right fixed icon */}
        <Image
          src="/icons/camp-eco.svg"
          alt="Eco Camping Icon"
          className="absolute bottom-4 right-4 opacity-80"
          width={64}
          height={64}
        />
      </div>
    </div>
  );
};

export default CardGenerator;
