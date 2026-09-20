// encoding: utf-8
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface SignaturePadProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  signerName?: string;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export default function SignaturePad({
  initialDataUrl = "",
  onSave,
  onClear,
  signerName = "",
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialDataUrl);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  // Initialize canvas resolution & load existing signature
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = 180;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a"; // slate-900 canvas surface
    ctx.fillRect(0, 0, width, height);

    // Draw base guideline
    ctx.strokeStyle = "#334155"; // slate-700
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 35);
    ctx.lineTo(width - 20, height - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  // Redraw all strokes
  const redrawCanvas = useCallback((allStrokes: Point[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Baseline guide
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 35);
    ctx.lineTo(canvas.width - 20, canvas.height - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stroke ink
    ctx.strokeStyle = "#22d3ee"; // cyan-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of allStrokes) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const point = getCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const point = getCoordinates(e);
    if (!point) return;

    setCurrentStroke((prev) => {
      const updated = [...prev, point];
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && prev.length > 0) {
        const last = prev[prev.length - 1];
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      return updated;
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setHasSignature(true);

      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL("image/png"));
      }
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setHasSignature(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, canvas.height - 35);
        ctx.lineTo(canvas.width - 20, canvas.height - 35);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    onClear?.();
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    redrawCanvas(newStrokes);
    setHasSignature(newStrokes.length > 0);

    const canvas = canvasRef.current;
    if (canvas) {
      if (newStrokes.length > 0) {
        onSave(canvas.toDataURL("image/png"));
      } else {
        onClear?.();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold flex items-center gap-1.5">
          <span>✍️</span>
          <span>{signerName ? `${signerName}'s Signature` : "Sign Here (Touch / Stylus / Mouse)"}</span>
        </span>
        <div className="flex items-center gap-2">
          {hasSignature && !disabled && (
            <>
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold disabled:opacity-40 cursor-pointer"
                title="Undo last stroke"
              >
                ↩ Undo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 rounded text-[11px] font-bold cursor-pointer"
                title="Clear signature"
              >
                ✕ Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden border transition-all ${
          isDrawing
            ? "border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
            : hasSignature
            ? "border-emerald-500/50"
            : "border-slate-800"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-crosshair"}`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none w-full block bg-slate-900"
        />

        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 text-xs">
            <span className="text-xl mb-1">✍️</span>
            <span>Sign with finger or stylus inside box</span>
            <span className="text-[10px] text-slate-600 mt-0.5">X ________________________________</span>
          </div>
        )}

        <div className="absolute bottom-2 left-4 pointer-events-none text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          X Signer Baseline
        </div>
      </div>

      {hasSignature && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <span>✓</span>
          <span>Signature recorded &amp; attached to job submittal</span>
        </div>
      )}
    </div>
  );
}
