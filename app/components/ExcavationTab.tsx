'use client';

import React, { memo } from 'react';
import { FRACTIONS, type SlopeStartMode } from '../lib/constants';
import { formatFeetInches } from '../lib/calculations';
import { useExcavation } from '../lib/tab-contexts';

function ExcavationTabComponent() {
  const {
    state,
    updateState,
    transitShot,
    beddingDepth,
    excResults,
    slopeResults,
  } = useExcavation();

  const {
    excInputMode,
    decTransitShot,
    excFeet,
    excInches,
    excSixteenths,
    beddingDepthFt,
    slopeRun,
    slopeStartMode,
    customSlopeStart,
  } = state;

  const { tankHoleNoBedding, tankHoleWithBedding, trenchDepth } = excResults;
  const { slopeStartDecimal, totalSlopeFallInches, slopeEndDecimal } = slopeResults;

  // Sync decimal shot when switching modes
  const handleSetInputModeExc = (mode: "decimal" | "fractions") => {
    if (mode === "decimal" && excInputMode === "fractions") {
      updateState({ excInputMode: mode, decTransitShot: transitShot.toFixed(2) });
    } else if (mode === "fractions" && excInputMode === "decimal") {
      const feet = Math.floor(transitShot);
      const totalInches = (transitShot - feet) * 12;
      const inches = Math.floor(totalInches);
      const sixteenths = Math.round((totalInches - inches) * 16);
      updateState({
        excInputMode: mode,
        excFeet: feet,
        excInches: inches,
        excSixteenths: sixteenths === 16 ? 0 : sixteenths,
      });
    } else {
      updateState({ excInputMode: mode });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* User Friendly Workflow Card */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-lg font-bold">
            🎯
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Excavation Pit Benchmark &amp; Laser Rod Calculator
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-extrabold border border-cyan-500/30">
                +15.5&apos; Constant Rule
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Calculate target rod readings for raw pit depth, pea gravel bedding top, trenching, and vent line pitch fall.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => handleSetInputModeExc("decimal")}
            className={`flex-1 md:flex-none px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              excInputMode === "decimal"
                ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Decimal Feet (4.50&apos;)
          </button>
          <button
            onClick={() => handleSetInputModeExc("fractions")}
            className={`flex-1 md:flex-none px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              excInputMode === "fractions"
                ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Feet, Inches &amp; 1/16ths
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Inputs & Calculations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Finish Grade Shot Input Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>01</span> Finish Grade (FG) Laser Transit Shot
              </h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Reference Rod Reading
              </span>
            </div>

            {excInputMode === "decimal" ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Finish Grade Shot (Decimal Feet)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={decTransitShot}
                    onChange={(e) => updateState({ decTransitShot: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
                    placeholder="4.50"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-500 pointer-events-none font-mono">
                    FT
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-slate-500 font-mono">
                    Equivalent format: <strong className="text-slate-300">{formatFeetInches(transitShot)}</strong>
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Presets:</span>
                    {["4.50", "5.00", "5.25", "6.00"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateState({ decTransitShot: preset })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          decTransitShot === preset
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {preset}&apos;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Feet
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={excFeet}
                    onChange={(e) => updateState({ excFeet: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Inches
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={excInches}
                    onChange={(e) => updateState({ excInches: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    1/16ths
                  </label>
                  <select
                    value={excSixteenths}
                    onChange={(e) => updateState({ excSixteenths: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 font-mono text-cyan-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                  >
                    {FRACTIONS.map((frac, idx) => (
                      <option key={idx} value={idx}>
                        {idx === 0 ? "0 (Exact)" : `${idx}/16"`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Bedding Thickness Input */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                  Pea Gravel Bedding Depth (Feet)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {beddingDepth.toFixed(2)} ft ({formatFeetInches(beddingDepth)})
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="3"
                value={beddingDepthFt}
                onChange={(e) => updateState({ beddingDepthFt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-emerald-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="1.0"
              />
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Bedding Presets:</span>
                {[
                  { label: "6\" (0.5')", val: "0.5" },
                  { label: "12\" Std (1.0')", val: "1.0" },
                  { label: "18\" (1.5')", val: "1.5" }
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => updateState({ beddingDepthFt: b.val })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      beddingDepthFt === b.val
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Benchmark Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bottom of Tank Hole (Raw Pit, No Bedding) */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-cyan-500/40 p-4 shadow-md glow-card-cyan">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Bottom of Hole (Raw Dirt)
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono font-extrabold">
                  +15.5&apos; Constant
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatFeetInches(tankHoleNoBedding)}
                </span>
                <span className="block text-[10px] font-semibold text-cyan-400 font-mono mt-0.5">
                  {tankHoleNoBedding.toFixed(2)} ft decimal (FG Shot + 15.50&apos;)
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Target rod reading at un-bedded dirt pit base.
              </div>
            </div>

            {/* Bottom of Hole (With Bedding / Top of Gravel) */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-4 shadow-md glow-card-emerald">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Top of Pea Gravel Bedding
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-extrabold">
                  +{(15.5 - beddingDepth).toFixed(1)}&apos; Bedded
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatFeetInches(tankHoleWithBedding)}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-400 font-mono mt-0.5">
                  {tankHoleWithBedding.toFixed(2)} ft decimal (FG + 15.5&apos; - {beddingDepth.toFixed(1)}&apos;)
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Target rod reading on top of pea gravel bed.
              </div>
            </div>
          </div>

          {/* Vent Line Slope Calculator Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>02</span> Vent &amp; Product Line Slope Calculator
              </h2>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                1/8&quot; Per Foot Pitch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Trench Run Length (Feet)
                </label>
                <input
                  type="number"
                  min="1"
                  value={slopeRun}
                  onChange={(e) => updateState({ slopeRun: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Slope Rate Pitch
                </label>
                <select
                  value={state.slopeRateInchesPerFoot || "0.125"}
                  onChange={(e) => updateState({ slopeRateInchesPerFoot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="0.125">1/8&quot; per foot (Standard Fuel/Vent)</option>
                  <option value="0.250">1/4&quot; per foot (Steep Drainage)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  High Point Shot Mode
                </label>
                <select
                  value={slopeStartMode}
                  onChange={(e) => updateState({ slopeStartMode: e.target.value as SlopeStartMode })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="trench">Standard Trench (FG + 3.0&apos;)</option>
                  <option value="custom">Custom High Point Shot</option>
                </select>
              </div>
            </div>

            {slopeStartMode === "custom" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Custom High Point Transit Shot (Feet)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customSlopeStart}
                  onChange={(e) => updateState({ customSlopeStart: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-sm font-bold"
                />
              </div>
            )}

            {/* Slope Output Summary */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Total Fall</span>
                <span className="font-mono font-bold text-amber-400 text-sm">+{totalSlopeFallInches.toFixed(2)}&quot;</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">High Point Shot</span>
                <span className="font-mono font-bold text-slate-200 text-xs">{formatFeetInches(slopeStartDecimal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Low Point at Tank</span>
                <span className="font-mono font-bold text-amber-300 text-xs">{formatFeetInches(slopeEndDecimal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Interactive SVG Diagram & Laser Reference Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          {/* Interactive SVG Diagram */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live Laser Benchmark Cross-Section
              </h3>
              <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                +15.5&apos; Baseline
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                {/* Sky & Surface */}
                <rect x="0" y="0" width="800" height="80" fill="#090d16" />
                
                {/* Laser Transmitter */}
                <rect x="50" y="25" width="24" height="35" rx="3" fill="#06b6d4" />
                <line x1="62" y1="25" x2="62" y2="10" stroke="#06b6d4" strokeWidth="3" />
                <circle cx="62" cy="8" r="4" fill="#22d3ee" />
                
                {/* Laser Beam Line */}
                <line x1="74" y1="40" x2="750" y2="40" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,4" className="animate-pulse" />
                
                {/* Surface Grade Line (FG) */}
                <line x1="0" y1="80" x2="800" y2="80" stroke="#334155" strokeWidth="4" />
                <text x="15" y="70" fill="#94a3b8" fontSize="12" fontWeight="bold">Finish Grade (FG)</text>

                {/* Dirt Excavation Pit */}
                <polygon points="120,80 180,440 620,440 680,80" fill="#1e1b18" stroke="#44403c" strokeWidth="3" />
                
                {/* Pea Gravel Bedding Layer */}
                <polygon points="175,410 180,440 620,440 625,410" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="400" y="430" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Pea Gravel Bedding ({beddingDepth.toFixed(1)}&apos;)
                </text>

                {/* UST Tank Outline */}
                <ellipse cx="400" cy="270" rx="190" ry="130" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <text x="400" y="275" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Underground Storage Tank (UST)
                </text>

                {/* Transit Grade Rod */}
                <line x1="550" y1="40" x2="550" y2="440" stroke="#f59e0b" strokeWidth="3" />
                <rect x="542" y="32" width="16" height="16" fill="#f59e0b" rx="2" />

                {/* Dimension: Raw Pit Bottom (+15.5' Constant) */}
                <g>
                  <line x1="710" y1="40" x2="710" y2="440" stroke="#06b6d4" strokeWidth="2" />
                  <path d="M 705 40 L 715 40 M 705 440 L 715 440" stroke="#06b6d4" strokeWidth="2" />
                  <text x="725" y="230" fill="#22d3ee" fontSize="12" fontWeight="bold" className="font-mono">
                    Raw Pit Bottom:
                  </text>
                  <text x="725" y="248" fill="#ffffff" fontSize="13" fontWeight="extrabold" className="font-mono">
                    {tankHoleNoBedding.toFixed(2)}&apos;
                  </text>
                  <text x="725" y="264" fill="#06b6d4" fontSize="10" className="font-mono font-bold">
                    [FG + 15.5&apos; Constant]
                  </text>
                </g>

                {/* Dimension: Bedding Top */}
                <g>
                  <line x1="650" y1="40" x2="650" y2="410" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />
                  <path d="M 645 40 L 655 40 M 645 410 L 655 410" stroke="#10b981" strokeWidth="1.5" />
                  <text x="655" y="160" fill="#34d399" fontSize="11" fontWeight="bold" className="font-mono" textAnchor="end">
                    Top of Gravel: {tankHoleWithBedding.toFixed(2)}&apos;
                  </text>
                </g>

                {/* Callout */}
                <text x="62" y="55" fill="#06b6d4" fontSize="10" fontWeight="bold">Shot S = {transitShot.toFixed(2)}&apos;</text>
              </svg>
            </div>
          </div>

          {/* Laser Rod Benchmark Quick Citing Table */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>📋 Benchmark Laser Rod Summary Table</span>
              <span className="text-[9px] font-mono text-cyan-400">Field Reference</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1 px-1.5">Benchmark Target</th>
                    <th className="py-1 px-1.5">Constant</th>
                    <th className="py-1 px-1.5 text-right">Rod Shot (Ft-In)</th>
                    <th className="py-1 px-1.5 text-right">Decimal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-1.5 px-1.5 font-semibold text-slate-300 font-sans">Finish Grade (FG) Shot</td>
                    <td className="py-1.5 px-1.5 text-slate-500">Ref</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-white">{formatFeetInches(transitShot)}</td>
                    <td className="py-1.5 px-1.5 text-right text-slate-400">{transitShot.toFixed(2)}&apos;</td>
                  </tr>
                  <tr className="bg-cyan-950/30">
                    <td className="py-1.5 px-1.5 font-semibold text-cyan-300 font-sans">Bottom of Hole (Raw Pit)</td>
                    <td className="py-1.5 px-1.5 text-cyan-400 font-bold">+15.5&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-cyan-300 text-xs">{formatFeetInches(tankHoleNoBedding)}</td>
                    <td className="py-1.5 px-1.5 text-right text-cyan-400 font-bold">{tankHoleNoBedding.toFixed(2)}&apos;</td>
                  </tr>
                  <tr className="bg-emerald-950/20">
                    <td className="py-1.5 px-1.5 font-semibold text-emerald-300 font-sans">Top of Pea Gravel Bedding</td>
                    <td className="py-1.5 px-1.5 text-emerald-400">+{(15.5 - beddingDepth).toFixed(1)}&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-emerald-300">{formatFeetInches(tankHoleWithBedding)}</td>
                    <td className="py-1.5 px-1.5 text-right text-emerald-400">{tankHoleWithBedding.toFixed(2)}&apos;</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-semibold text-amber-300 font-sans">Trenching Depth</td>
                    <td className="py-1.5 px-1.5 text-amber-400">+3.0&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-amber-300">{formatFeetInches(trenchDepth)}</td>
                    <td className="py-1.5 px-1.5 text-right text-amber-400">{trenchDepth.toFixed(2)}&apos;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExcavationTabComponent);
