"use client";

import React, { memo } from "react";
import { TANK_PRESETS, type ValveType } from "../lib/constants";
import { formatInches, formatInchesToFeetInches } from "../lib/calculations";
import { useDropTube } from "../lib/tab-contexts";

interface DropTubeTabProps {
  triggerToast: (msg: string) => void;
}

function DropTubeTabComponent({ triggerToast }: DropTubeTabProps) {
  const { state, updateState, d_tank, h_riser, dtResults } = useDropTube();
  const {
    selectedPreset,
    customDiameter,
    riserHeight,
    valveType,
    customValveOffset,
    tankClearance,
  } = state;

  const { upperDropTubeLength, overallDropTubeLength, valveOffset } = dtResults;

  const handlePresetChange = (presetId: string) => {
    const preset = TANK_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      updateState({
        selectedPreset: presetId,
        customDiameter: preset.diameter,
      });
      triggerToast(`Loaded preset ${preset.name}`);
    } else {
      updateState({ selectedPreset: presetId });
    }
  };

  const handleManualDiameterChange = (val: string) => {
    updateState({
      customDiameter: val,
      selectedPreset: "custom",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Workflow Header */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg font-bold">
            ⛽
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              OPW 71SO Overfill Prevention Drop Tube Cut Builder
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold border border-emerald-500/30">
                EPA Overfill Standard
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact cut lengths for Upper &amp; Lower drop tubes based on tank diameter, riser height, and OPW 71SO valve offsets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tank Preset & Dimensions Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>01</span> Tank &amp; Riser Geometry
              </h2>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Preset Specs
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Select Tank Model Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  {TANK_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Tank Inside Diameter (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customDiameter}
                    onChange={(e) => handleManualDiameterChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="92"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Equivalent: <strong className="text-slate-300">{formatInchesToFeetInches(d_tank)}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Riser Pipe Height (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={riserHeight}
                    onChange={(e) => updateState({ riserHeight: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="36"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    From top of tank shell to rim of adapter.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Valve Type & Clearance Settings Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>02</span> Overfill Valve &amp; Clearance Options
              </h2>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Valve Spec
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  OPW 71SO Valve Assembly Model
                </label>
                <select
                  value={valveType}
                  onChange={(e) => updateState({ valveType: e.target.value as ValveType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                >
                  <option value="standard">Standard OPW 71SO (+5.5&quot; Offset)</option>
                  <option value="testable">Testable OPW 71SO-T (+7.25&quot; Offset)</option>
                  <option value="custom">Custom Valve Assembly Offset</option>
                </select>
              </div>

              {valveType === "custom" ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Custom Valve Offset (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customValveOffset}
                    onChange={(e) => updateState({ customValveOffset: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-sm font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Bottom Tank Clearance (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={tankClearance}
                    onChange={(e) => updateState({ tankClearance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Standard EPA/PEI spec is 6.0&quot; clearance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cut Sheet Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upper Drop Tube Cut Length */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-4 shadow-md glow-card-emerald">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Upper Drop Tube Cut Length
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-extrabold">
                  + {valveOffset}&quot; Valve Offset
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatInches(upperDropTubeLength)}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-400 font-mono mt-0.5">
                  {upperDropTubeLength.toFixed(2)}&quot; ({formatInchesToFeetInches(upperDropTubeLength)})
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Formula: Riser Height ({h_riser}&quot;) + Valve Offset ({valveOffset}&quot;)
              </div>
            </div>

            {/* Overall Assembly Length */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-cyan-500/40 p-4 shadow-md glow-card-cyan">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Overall Assembly Length
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono font-extrabold">
                  -{parseFloat(tankClearance) || 6.0}&quot; Clearance
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatInches(overallDropTubeLength)}
                </span>
                <span className="block text-[10px] font-semibold text-cyan-400 font-mono mt-0.5">
                  {overallDropTubeLength.toFixed(2)}&quot; ({formatInchesToFeetInches(overallDropTubeLength)})
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Formula: Riser ({h_riser}&quot;) + Diameter ({d_tank}&quot;) - Clearance ({parseFloat(tankClearance) || 6.0}&quot;)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual SVG Diagram (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live OPW 71SO Drop Tube Diagram
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Field Blueprint
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 400 500" className="w-full h-full">
                {/* Surface / Grade */}
                <line x1="20" y1="50" x2="380" y2="50" stroke="#334155" strokeWidth="3" />
                <text x="30" y="42" fill="#64748b" fontSize="10" fontWeight="bold">Grade Surface</text>

                {/* Manhole & Riser Pipe */}
                <rect x="170" y="50" width="60" height="90" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <text x="238" y="95" fill="#94a3b8" fontSize="10" className="font-mono">Riser: {h_riser}&quot;</text>

                {/* Tank Shell Top */}
                <path d="M 40 140 Q 200 120 360 140" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <text x="300" y="130" fill="#38bdf8" fontSize="10" fontWeight="bold">Tank Shell</text>

                {/* Tank Inside */}
                <rect x="40" y="140" width="320" height="310" rx="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

                {/* Upper Drop Tube */}
                <rect x="185" y="55" width="30" height="120" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <text x="135" y="115" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="end" className="font-mono">
                  Upper: {upperDropTubeLength.toFixed(1)}&quot;
                </text>

                {/* OPW 71SO Valve Mechanism */}
                <rect x="175" y="175" width="50" height="40" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="200" y="198" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">OPW 71SO</text>

                {/* Lower Drop Tube */}
                <rect x="188" y="215" width="24" height="205" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                
                {/* Bottom Clearance Zone */}
                <line x1="180" y1="420" x2="220" y2="420" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="180" y1="440" x2="220" y2="440" stroke="#f59e0b" strokeWidth="2" />
                <text x="230" y="433" fill="#f59e0b" fontSize="10" fontWeight="bold" className="font-mono">
                  Clearance: {tankClearance}&quot;
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DropTubeTabComponent);
