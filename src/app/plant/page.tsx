"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

export default function PlantIdentifier() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
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
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: `url('/images/plant-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1
        }}
      />
      
      {/* Content layer */}
      <div className="relative min-h-screen flex items-center justify-center p-4 pt-32" style={{ zIndex: 2 }}>
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Plant Identifier
            </h1>
            <p className="text-white/80 text-base">
              Upload a plant photo to instantly identify the species
            </p>
          </div>

          {/* Main Content - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Panel - Upload & Image */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/40" style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>
                <span>📸</span>
                Upload Image
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload/Preview area */}
                {!previewUrl ? (
                  <div
                    onClick={handleClickDropZone}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer backdrop-blur-sm
                      ${dragActive 
                        ? "border-green-400 bg-green-100 scale-105 shadow-lg" 
                        : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-green-100 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-green-300">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-1">
                        Drag & Drop Image Here
                      </p>
                      <p className="text-gray-600 text-sm mb-1">
                        or <span className="text-green-600 font-semibold">click to browse</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports: JPEG, JPG, PNG
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm border border-white/20">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-auto max-h-[350px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreviewUrl(null);
                          setResult(null);
                          setError(null);
                        }}
                        className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-md hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all border border-red-300/30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-white/80 text-center bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
                      <strong>{file?.name}</strong>
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base font-semibold py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none backdrop-blur-sm border border-white/20"
                  style={{
                    boxShadow: '0 4px 20px 0 rgba(34, 197, 94, 0.4)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Identifying...
                    </span>
                  ) : (
                    "🔍 Identify Plant"
                  )}
                </button>
              </form>

              {/* Error message */}
              {error && (
                <div className="mt-4 bg-red-500/20 backdrop-blur-md border-l-4 border-red-500 p-3 rounded-lg border border-red-500/30">
                  <p className="text-white flex items-center gap-2 text-sm">
                    <span>⚠️</span>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="bg-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/30" style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                <span>✨</span>
                Identification Results
              </h2>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/20">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <p className="text-white/80 text-base">
                    Upload an image to see results
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-48">
                  <svg className="animate-spin h-12 w-12 text-green-400 mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-white/90 text-base font-medium">Analyzing plant...</p>
                </div>
              )}

              {result && result.results && result.results.length > 0 && (
                <div>
                  {result.results[0].score < 0.2 ? (
                    <div className="bg-yellow-500/20 backdrop-blur-md border-l-4 border-yellow-400 p-4 rounded-lg border border-yellow-400/30">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <h3 className="font-bold text-white text-base mb-1">Unable to Identify</h3>
                          <p className="text-white/80 text-sm">
                            Make sure the image is well-lit, focused, and clearly visible.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Confidence Badge */}
                      <div className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-md rounded-xl p-5 text-white border border-green-400/30" style={{
                        boxShadow: '0 4px 20px 0 rgba(34, 197, 94, 0.3)'
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs opacity-90 mb-1">Match Confidence</p>
                            <p className="text-3xl font-bold">
                              {(result.results[0].score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-5xl">🎯</div>
                        </div>
                      </div>

                      {/* Plant Info Cards */}
                      <div className="space-y-3">
                        <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-4 border border-green-400/30">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">🌸</span>
                            <div className="flex-1">
                              <p className="text-xs text-white/70 mb-1">Common Name</p>
                              <p className="text-xl font-bold text-white">
                                {result.results[0].species.commonNames?.[0] || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-400/30">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">🔬</span>
                            <div className="flex-1">
                              <p className="text-xs text-white/70 mb-1">Scientific Name</p>
                              <p className="text-lg font-semibold text-white italic">
                                {result.results[0].species.scientificNameWithoutAuthor}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                        <p className="text-xs text-white/80 flex items-center gap-2">
                          <span>💡</span>
                          <span>Based on visual analysis and machine learning</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result && result.results && result.results.length === 0 && (
                <div className="bg-gray-500/20 backdrop-blur-md border-l-4 border-gray-400 p-4 rounded-lg border border-gray-400/30">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <h3 className="font-bold text-white text-base mb-1">No Matches Found</h3>
                      <p className="text-white/80 text-sm">
                        Make sure the image is well-lit, focused, and clearly visible.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom tip */}
          <div className="text-center mt-4 text-white/70 text-xs">
            <p>💡 Tip: Clear close-up photos of plants yield more accurate identification results</p>
          </div>
        </div>
      </div>
    </div>
  );
}