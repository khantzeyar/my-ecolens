"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Image from "next/image";

const phrases = [
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

const CardGenerator = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [phrase, setPhrase] = useState(phrases[0]);
  const [bgColor, setBgColor] = useState("#a8d5ba");
  const [textColor, setTextColor] = useState("#222");

  const handleDownload = async () => {
    if (cardRef.current) {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "card.png";
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pt-24">
      <h1 className="text-2xl font-bold">Camping & Environment Card Generator</h1>

      {/* Controls */}
      <div className="flex flex-col space-y-4 w-full max-w-md">
        {/* Phrase selector */}
        <div>
          <label className="block font-medium">Choose a Phrase</label>
          <select
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="w-full border rounded p-2"
          >
            {phrases.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Colors row */}
        <div className="flex space-x-6">
          {/* Background color */}
          <div>
            <label className="block font-medium">Background Color</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>

          {/* Text color */}
          <div>
            <label className="block font-medium">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
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
