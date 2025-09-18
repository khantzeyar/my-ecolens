"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Image from "next/image";

const phrases = [
  "", // empty option
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

const defaultBg = "#ffffff"; // white background
const defaultText = "#222";

const CardGenerator = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [phrase, setPhrase] = useState(phrases[0]);
  const [bgColor, setBgColor] = useState(defaultBg);
  const [textColor, setTextColor] = useState(defaultText);
  const [history, setHistory] = useState<
    { phrase: string; bg: string; text: string }[]
  >([]);

  const saveHistory = () => {
    setHistory((prev) => [...prev, { phrase, bg: bgColor, text: textColor }]);
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
      setHistory([...history]);
    }
  };

  const handleReset = () => {
    setPhrase(""); // empty phrase
    setBgColor(defaultBg); // white background
    setTextColor(defaultText);
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

          {/* Undo icon button */}
          <button
            onClick={handleUndo}
            className="p-2 rounded hover:text-gray-300"
            title="Undo"
          >
            <i className="ri-arrow-go-back-line text-xl"></i>
          </button>

          {/* Reset icon button */}
          <button
            onClick={handleReset}
            className="p-2 rounded hover:text-gray-300"
            title="Reset"
          >
            <i className="ri-refresh-line text-xl"></i>
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

        {/* Bottom-right icon */}
        <Image
          src="/icons/camp-eco.svg"
          alt="Eco Camping Icon"
          className="absolute bottom-4 right-4 opacity-80"
          width={64}
          height={64}
        />
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
      >
        Download as PNG
      </button>
    </div>
  );
};

export default CardGenerator;
