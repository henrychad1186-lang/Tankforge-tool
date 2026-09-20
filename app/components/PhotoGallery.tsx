// encoding: utf-8
"use client";

import React, { useState, useRef } from "react";
import { PreBuryPhoto, PhotoCategory } from "../lib/tab-types";

interface PhotoGalleryProps {
  photos: PreBuryPhoto[];
  onAddPhoto: (photo: Omit<PreBuryPhoto, "id" | "timestamp">) => void;
  onDeletePhoto: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  triggerToast?: (msg: string) => void;
}

const CATEGORIES: { id: PhotoCategory; label: string; emoji: string }[] = [
  { id: "gauge", label: "Air Gauge & Pressure", emoji: "⏱️" },
  { id: "bedding", label: "Bedding & Hole", emoji: "🪨" },
  { id: "piping", label: "Piping & Sumps", emoji: "🔧" },
  { id: "deflection", label: "Deflection & Shell", emoji: "📐" },
  { id: "general", label: "Site & Anchors", emoji: "🏗️" },
];

/**
 * Client-side canvas compression: scales max dimension to 1024px at 0.72 JPEG quality.
 * Shrinks 3–8 MB camera photos down to ~70–120 KB without noticeable inspection quality loss.
 */
async function compressImageFile(file: File): Promise<{ dataUrl: string; originalKb: number; compressedKb: number }> {
  const originalKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Add subtle timestamp watermark to the corner of compressed image
        const dateStamp = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(10, height - 32, 175, 24);
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`UST HUB • ${dateStamp}`, 16, height - 16);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        const compressedKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, originalKb, compressedKb });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoGallery({
  photos = [],
  onAddPhoto,
  onDeletePhoto,
  onUpdateCaption,
  triggerToast,
}: PhotoGalleryProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>("gauge");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<PreBuryPhoto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl, originalKb, compressedKb } = await compressImageFile(file);
        const categoryMeta = CATEGORIES.find((c) => c.id === selectedCategory);
        const defaultCaption = `${categoryMeta?.label || "Inspection Photo"} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

        onAddPhoto({
          category: selectedCategory,
          caption: defaultCaption,
          dataUrl,
        });

        triggerToast?.(`Photo saved! Compressed ${originalKb}KB → ${compressedKb}KB`);
      } catch (err) {
        console.error("Image processing error:", err);
        triggerToast?.("Failed to process photo.");
      }
    }

    setIsProcessing(false);
    if (e.target) e.target.value = "";
  };

  const filteredPhotos = filterCategory === "all"
    ? photos
    : photos.filter((p) => p.category === filterCategory);

  const handleStartEditCaption = (photo: PreBuryPhoto) => {
    setEditingId(photo.id);
    setEditCaption(photo.caption);
  };

  const handleSaveCaption = (id: string) => {
    onUpdateCaption(id, editCaption.trim() || "Inspection Photo");
    setEditingId(null);
    triggerToast?.("Caption updated");
  };

  const handleDownload = (photo: PreBuryPhoto) => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `ust-inspection-${photo.category}-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hidden file inputs: one for direct camera, one for photo library */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action Header Card */}
      <div className="bg-slate-900/90 p-4 md:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Field Inspection Photo Evidence ({photos.length} Captured)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap the camera to capture live pit photos or attach from your library. Photos are auto-compressed for offline storage and included in PDF submittals.
          </p>
        </div>

        {/* Capture Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PhotoCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-teal-300 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>📸</span>
            <span>{isProcessing ? "Processing..." : "Take Photo"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>📁</span>
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === "all"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Photos ({photos.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = photos.filter((p) => p.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === c.id
                    ? "bg-teal-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl text-teal-400">
            📸
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {filterCategory === "all" ? "No Inspection Photos Captured Yet" : "No Photos in This Category"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Take photos of the 5.0 psig gauge hold, tank bedding, containment sumps, deflection measurements, and anchor straps for the pre-bury sign-off submittal.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              📸 Open Camera Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const cat = CATEGORIES.find((c) => c.id === photo.category);
            return (
              <div
                key={photo.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group"
              >
                {/* Photo Thumbnail */}
                <div
                  className="relative h-44 bg-slate-950 cursor-pointer overflow-hidden"
                  onClick={() => setActivePhoto(photo)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    <span>{cat?.emoji}</span>
                    <span>{cat?.label}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400">
                    {photo.timestamp.split(",")[1] || photo.timestamp}
                  </div>
                </div>

                {/* Photo Card Footer */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  {editingId === photo.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveCaption(photo.id)}
                        className="flex-1 bg-slate-950 border border-teal-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCaption(photo.id)}
                        className="px-2 py-1 bg-teal-500 text-slate-950 font-bold text-[10px] rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer group/cap"
                      onClick={() => handleStartEditCaption(photo)}
                      title="Click to edit caption"
                    >
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                        {photo.caption}
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-0.5 group-hover/cap:text-teal-400">
                        {photo.timestamp} • ✏️ Edit
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setActivePhoto(photo)}
                      className="text-teal-400 hover:text-teal-300 text-[11px] font-bold cursor-pointer"
                    >
                      🔍 Full View
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(photo)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Download photo"
                      >
                        💾
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this inspection photo?")) {
                            onDeletePhoto(photo.id);
                            triggerToast?.("Photo deleted");
                          }
                        }}
                        className="text-slate-400 hover:text-red-400 text-xs cursor-pointer"
                        title="Delete photo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activePhoto.caption}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{activePhoto.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activePhoto)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  💾 Download
                </button>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black p-2 flex items-center justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.dataUrl}
                alt={activePhoto.caption}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
