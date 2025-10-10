"use client";
import React, { useState, DragEvent, useRef } from "react";
import Image from "next/image";

export default function PlantIdentifier() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/plant", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to identify plant");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">🌿 Plant Identifier</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full"
      >
        {/* Clickable + Drag & Drop Zone */}
        <div
          onClick={handleClickDropZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center
            ${
              dragActive
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:border-green-400"
            }
          `}
        >
          {file ? (
            <p className="text-gray-800">
              Selected: <strong>{file.name}</strong>
            </p>
          ) : (
            <>
              <i className="ri-image-line text-green-500 text-5xl mb-3"></i>
              <p className="text-gray-700 font-medium">Drag & Drop</p>
              <p className="text-gray-500">
                or <span className="text-gray-400 font-bold">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPEG, JPG, PNG
              </p>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Identifying..." : "Identify Plant"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && result.results && result.results.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Top Match</h2>

          <div className="flex flex-col gap-2">
            <p>
              <strong>Common name:</strong>{" "}
              {result.results[0].species.commonNames?.[0] || "N/A"}
            </p>
            <p>
              <strong>Scientific name:</strong>{" "}
              {result.results[0].species.scientificNameWithoutAuthor}
            </p>
            <p>
              <strong>Score:</strong>{" "}
              {(result.results[0].score * 100).toFixed(1)}%
            </p>

            {result.results[0].images?.length > 0 && (
              <Image
                src={result.results[0].images[0].url.s}
                alt="Plant example"
                width={200}
                height={200}
                className="rounded-md mt-2 object-cover"
              />
            )}
          </div>
        </div>
      )}

      {result && result.results && result.results.length === 0 && (
        <p className="mt-4 text-gray-600">No matches found. Try another photo.</p>
      )}
    </div>
  );
}
