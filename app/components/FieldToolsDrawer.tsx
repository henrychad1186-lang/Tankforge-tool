// encoding: utf-8
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { playClickSound, playAlarmSound, playSuccessChime } from "../lib/soundEffects";
import { usePersistedState } from "../hooks/usePersistedState";

interface FieldToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast?: (msg: string) => void;
  onAppendToDailyReport?: (notes: string) => void;
}

export default function FieldToolsDrawer({
  isOpen,
  onClose,
  triggerToast,
  onAppendToDailyReport,
}: FieldToolsDrawerProps) {
  const [activeTool, setActiveTool] = useState<"converter" | "timer" | "scratchpad">("converter");

  // ─── 1. Unit Converter State ───────────────────────────────────────────────
  const [convCategory, setConvCategory] = useState<"length" | "pressure" | "volume" | "weight">("pressure");
  const [convInput, setConvInput] = useState<string>("5.0");

  // Calculations for converter
  const numVal = parseFloat(convInput) || 0;

  // Pressure conversions (assuming base is PSIG)
  const pressureResults = {
    psig: numVal,
    inHg: numVal * 2.03602,
    bar: numVal * 0.0689476,
    kpa: numVal * 6.89476,
    psiA: numVal + 14.696,
  };

  // Length conversions (assuming base is Inches)
  const lengthResults = {
    inches: numVal,
    feet: numVal / 12,
    feetInches: `${Math.floor(numVal / 12)}' ${(numVal % 12).toFixed(2)}"`,
    surveyFeet: (numVal / 12).toFixed(3),
    mm: numVal * 25.4,
    cm: numVal * 2.54,
  };

  // Volume conversions (assuming base is Cubic Yards)
  const volumeResults = {
    cuYds: numVal,
    cuFt: numVal * 27,
    gallons: numVal * 201.974,
    liters: numVal * 764.555,
    bags80lb: Math.ceil(numVal * 45), // ~45 bags of 80lb per CY
  };

  // Weight conversions (assuming base is US Tons)
  const weightResults = {
    tons: numVal,
    lbs: numVal * 2000,
    kg: numVal * 907.185,
    metricTons: numVal * 0.907185,
  };

  // ─── 2. Air Test & Slump Hold Timer ─────────────────────────────────────────
  const [timerDurationSec, setTimerDurationSec] = useState<number>(3600); // 60 min standard
  const [remainingSec, setRemainingSec] = useState<number>(3600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerPresetLabel, setTimerPresetLabel] = useState<string>("60m (PEI Tank Test)");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && remainingSec > 0) {
      interval = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            playAlarmSound();
            setIsTimerRunning(false);
            triggerToast?.("⏰ Field Hold Timer Complete! Verify pressure gauge.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, remainingSec, triggerToast]);

  const setTimerPreset = (sec: number, label: string) => {
    playClickSound();
    setIsTimerRunning(false);
    setTimerDurationSec(sec);
    setRemainingSec(sec);
    setTimerPresetLabel(label);
  };

  const toggleTimer = () => {
    playClickSound();
    if (remainingSec === 0) {
      setRemainingSec(timerDurationSec);
    }
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    playClickSound();
    setIsTimerRunning(false);
    setRemainingSec(timerDurationSec);
  };

  const timerMin = Math.floor(remainingSec / 60);
  const timerSec = remainingSec % 60;
  const timerProgressPct = timerDurationSec > 0 ? ((timerDurationSec - remainingSec) / timerDurationSec) * 100 : 0;

  // ─── 3. Persistent Scratchpad ───────────────────────────────────────────────
  const [scratchpadText, setScratchpadText] = usePersistedState<string>(
    "ust-hub-field-scratchpad",
    "• Elevation transit shot at FG: 4.25'\n• 10,000 gal Xerxes tank arrived 07:30\n• Bedding pea gravel compacted to 12\" layer"
  );

  const handleCopyScratchpad = () => {
    navigator.clipboard.writeText(scratchpadText);
    playSuccessChime();
    triggerToast?.("Copied Scratchpad to Clipboard!");
  };

  const handleAppendReport = () => {
    if (onAppendToDailyReport && scratchpadText.trim()) {
      onAppendToDailyReport(scratchpadText);
      playSuccessChime();
      triggerToast?.("Appended Scratchpad to Daily Report Notes!");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-slide-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧰</span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white uppercase">
                Field OS Tools
              </h2>
              <p className="text-[10px] text-slate-400">
                Converter, Hold Timer &amp; Site Scratchpad
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTool("converter");
            }}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTool === "converter"
                ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Converter
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTool("timer");
            }}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTool === "timer"
                ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>Timer</span>
            {isTimerRunning && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />}
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTool("scratchpad");
            }}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTool === "scratchpad"
                ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Scratchpad
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TOOL 1: UNIT CONVERTER */}
          {activeTool === "converter" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Category
                </span>
                <div className="flex gap-1 text-[11px]">
                  {(["pressure", "length", "volume", "weight"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setConvCategory(cat);
                        if (cat === "pressure") setConvInput("5.0");
                        else if (cat === "length") setConvInput("92");
                        else if (cat === "volume") setConvInput("10");
                        else if (cat === "weight") setConvInput("15");
                      }}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                        convCategory === cat
                          ? "bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Input Value ({convCategory === "pressure" ? "PSIG" : convCategory === "length" ? "Inches" : convCategory === "volume" ? "Cubic Yards" : "Tons"})
                </label>
                <input
                  type="number"
                  step="any"
                  value={convInput}
                  onChange={(e) => setConvInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              {/* Conversion Output Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {convCategory === "pressure" && (
                  <>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Inches Mercury</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{pressureResults.inHg.toFixed(2)} inHg</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Bar</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{pressureResults.bar.toFixed(3)} bar</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Kilopascals</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{pressureResults.kpa.toFixed(1)} kPa</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Absolute PSI (psia)</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{pressureResults.psiA.toFixed(2)} psia</span>
                    </div>
                  </>
                )}

                {convCategory === "length" && (
                  <>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Feet &amp; Inches</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{lengthResults.feetInches}</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Decimal Survey Feet</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{lengthResults.surveyFeet} ft</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Millimeters</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{lengthResults.mm.toFixed(1)} mm</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Centimeters</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{lengthResults.cm.toFixed(1)} cm</span>
                    </div>
                  </>
                )}

                {convCategory === "volume" && (
                  <>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Cubic Feet (ft³)</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{volumeResults.cuFt.toFixed(1)} CF</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">US Gallons</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{Math.round(volumeResults.gallons).toLocaleString()} gal</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">80-lb Concrete Bags</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">~{volumeResults.bags80lb} bags</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Liters</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{Math.round(volumeResults.liters).toLocaleString()} L</span>
                    </div>
                  </>
                )}

                {convCategory === "weight" && (
                  <>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Pounds (lbs)</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{Math.round(weightResults.lbs).toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Kilograms</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{Math.round(weightResults.kg).toLocaleString()} kg</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Metric Tonnes</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{weightResults.metricTons.toFixed(2)} MT</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TOOL 2: HOLD TIMER */}
          {activeTool === "timer" && (
            <div className="space-y-4 text-center">
              <div className="flex flex-wrap gap-1.5 justify-center text-[10px]">
                <button
                  type="button"
                  onClick={() => setTimerPreset(3600, "60m (PEI Tank Test)")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium cursor-pointer"
                >
                  60m Tank Hold (5.0 psig)
                </button>
                <button
                  type="button"
                  onClick={() => setTimerPreset(900, "15m (Piping Test)")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium cursor-pointer"
                >
                  15m Piping Test
                </button>
                <button
                  type="button"
                  onClick={() => setTimerPreset(300, "5m (Slump Test)")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium cursor-pointer"
                >
                  5m Slump
                </button>
              </div>

              {/* Big Countdown Display */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 transition-all duration-300"
                  style={{ width: `${timerProgressPct}%` }}
                />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">
                  {timerPresetLabel}
                </span>
                <div className="font-mono text-5xl font-black text-white tracking-wider my-2">
                  {String(timerMin).padStart(2, "0")}:{String(timerSec).padStart(2, "0")}
                </div>
                <span className="text-xs text-slate-400">
                  {isTimerRunning ? "⏱️ Timer Running..." : remainingSec === 0 ? "🔔 Hold Finished!" : "Paused"}
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-lg transition-transform active:scale-95 ${
                    isTimerRunning
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  }`}
                >
                  {isTimerRunning ? "Pause" : remainingSec === 0 ? "Restart" : "Start Timer"}
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm cursor-pointer transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* TOOL 3: SCRATCHPAD */}
          {activeTool === "scratchpad" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Quick Field Memo</span>
                <span className="text-[10px] text-cyan-400 font-mono">Auto-Saved</span>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                rows={12}
                placeholder="Jot down quick field observations, transit benchmarks, truck ticket numbers, inspector names..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:border-cyan-400 focus:outline-hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyScratchpad}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  📋 Copy Memo
                </button>
                {onAppendToDailyReport && (
                  <button
                    type="button"
                    onClick={handleAppendReport}
                    className="flex-1 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ➡️ Send to Daily Report
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
