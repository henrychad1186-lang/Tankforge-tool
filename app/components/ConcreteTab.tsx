"use client";

import React, { memo } from "react";
import { ConcreteShape } from "../lib/constants";
import { useConcrete } from "../lib/tab-contexts";

export interface ConcreteTabProps {
  triggerToast: (msg: string) => void;
}

function ConcreteTabComponent({ triggerToast }: ConcreteTabProps) {
  const {
    state,
    updateState,
    concreteVolume,
    rebarResults: rebarCalculations,
    gravelResults: gravelCalculations,
    costSummary,
    buoyancyResults,
    turnbuckleLayout,
  } = useConcrete();

  const {
    concreteShape,
    flatLength,
    flatWidth,
    flatThickness,
    flatQuantity,
    circDiameter,
    circThickness,
    circQuantity,
    sonoDiameter,
    sonoHeight,
    sonoQuantity,
    footLength,
    footWidth,
    footDepth,
    footQuantity,
    deadmanLength,
    deadmanWidth,
    deadmanHeight,
    deadmanQuantity,
    ballastLength,
    ballastWidth,
    ballastThickness,
    ballastQuantity,
    curbLength,
    curbHeight,
    curbWidth,
    gutterThickness,
    gutterWidth,
    curbQuantity,
    stepCount,
    stepWidth,
    stepRise,
    stepRun,
    stepQuantity,
    wallLength,
    wallWidth,
    wallDepth,
    wallQuantity,
    wastePct,
    rebarSpacing,
    rebarSize,
    wireMesh,
    gravelDepth,
    showCostEstimator,
    pricePerCy,
    pricePerBag80,
    pricePerGravelTon,
    pricePerRebarStick,
  } = state;

  const { adjustedVolumeCy, adjustedVolumeCf, bags80lb, bags60lb, bags40lb, truckLoads, isShortLoad } = concreteVolume;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* User Friendly Workflow Header */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-lg font-bold">
            🏗️
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Complete Concrete, Rebar, Mesh &amp; Material Cost Calculator
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold border border-amber-500/30">
                9 Job Geometries
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Calculate cubic yards, pre-mixed bag counts, ready-mix truckloads, rebar sticks/ties, wire mesh, sub-base aggregate, and cost comparison.
            </p>
          </div>
        </div>

        {/* Quick Presets Shortcuts Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "ballast",
                ballastLength: "30",
                ballastWidth: "12",
                ballastThickness: "8",
                ballastQuantity: "1",
              });
              triggerToast("Loaded UST Ballast Hold-Down Slab Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            UST Ballast (30&apos;x12&apos;x8&quot;)
          </button>
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "deadman",
                deadmanLength: "20",
                deadmanWidth: "18",
                deadmanHeight: "18",
                deadmanQuantity: "2",
              });
              triggerToast("Loaded UST Deadman Anchor Beams Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            Deadman (2x 20&apos;x18&quot;)
          </button>
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "footer",
                footLength: "6",
                footWidth: "6",
                footDepth: "3.5",
                footQuantity: "4",
              });
              triggerToast("Loaded Canopy Column Footer Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            Canopy (4x 6&apos;x6&apos;)
          </button>
        </div>
      </div>

      {/* Shape Selector Bar */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-md space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Select Job Geometry / Form Shape:
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {[
            { id: "flatwork", label: "Pad / Slab", icon: "🟧" },
            { id: "circular", label: "Circular", icon: "⭕" },
            { id: "sonotube", label: "Sonotube", icon: "💈" },
            { id: "footer", label: "Footer Box", icon: "📦" },
            { id: "deadman", label: "Deadman", icon: "⚓" },
            { id: "ballast", label: "UST Ballast", icon: "⚖️" },
            { id: "curb", label: "Curb & Gutter", icon: "🛣️" },
            { id: "steps", label: "Stairs / Steps", icon: "🪜" },
            { id: "wallfooting", label: "Wall Footing", icon: "🧱" },
          ].map((shape) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => updateState({ concreteShape: shape.id as ConcreteShape })}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                concreteShape === shape.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-1 ring-amber-300"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span className="text-base">{shape.icon}</span>
              <span className="text-[10px] font-bold mt-0.5 text-center leading-tight">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Inputs & Mix Options (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Inputs Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>01</span> Form Dimensions &amp; Quantity
              </h2>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                {concreteShape.toUpperCase()}
              </span>
            </div>

            {/* Dynamic Inputs per Shape */}
            {concreteShape === "flatwork" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={flatLength} onChange={(e) => updateState({ flatLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={flatWidth} onChange={(e) => updateState({ flatWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={flatThickness} onChange={(e) => updateState({ flatThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={flatQuantity} onChange={(e) => updateState({ flatQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "circular" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Diameter (Ft)</label>
                  <input type="number" step="any" value={circDiameter} onChange={(e) => updateState({ circDiameter: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={circThickness} onChange={(e) => updateState({ circThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={circQuantity} onChange={(e) => updateState({ circQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "sonotube" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Diameter (Inches)</label>
                  <input type="number" step="any" value={sonoDiameter} onChange={(e) => updateState({ sonoDiameter: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Height/Depth (Ft)</label>
                  <input type="number" step="any" value={sonoHeight} onChange={(e) => updateState({ sonoHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity (Piers)</label>
                  <input type="number" min="1" value={sonoQuantity} onChange={(e) => updateState({ sonoQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "footer" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={footLength} onChange={(e) => updateState({ footLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={footWidth} onChange={(e) => updateState({ footWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Depth (Ft)</label>
                  <input type="number" step="any" value={footDepth} onChange={(e) => updateState({ footDepth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={footQuantity} onChange={(e) => updateState({ footQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "deadman" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                    <input type="number" step="any" value={deadmanLength} onChange={(e) => updateState({ deadmanLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Inches)</label>
                    <input type="number" step="any" value={deadmanWidth} onChange={(e) => updateState({ deadmanWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Height (Inches)</label>
                    <input type="number" step="any" value={deadmanHeight} onChange={(e) => updateState({ deadmanHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity (Beams)</label>
                    <input type="number" min="1" value={deadmanQuantity} onChange={(e) => updateState({ deadmanQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Turnbuckle Hardware Spec</label>
                    <select
                      value={state.turnbuckleModelId || "5_8_x_6"}
                      onChange={(e) => updateState({ turnbuckleModelId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      <option value="5_8_x_6">5/8&quot; x 6&quot; Take-Up Jaw Turnbuckle (3,500 lbs WLL)</option>
                      <option value="3_4_x_9">3/4&quot; x 9&quot; Heavy Duty Turnbuckle (5,200 lbs WLL)</option>
                      <option value="7_8_x_12">7/8&quot; x 12&quot; Extreme Duty Turnbuckle (7,200 lbs WLL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Deadman Clearance from Tank (In)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={state.deadmanClearanceInches || "12"}
                      onChange={(e) => updateState({ deadmanClearanceInches: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Anchor Strap Sets Count</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={state.strapCount || "2"}
                      onChange={(e) => updateState({ strapCount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-base font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {concreteShape === "ballast" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={ballastLength} onChange={(e) => updateState({ ballastLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={ballastWidth} onChange={(e) => updateState({ ballastWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={ballastThickness} onChange={(e) => updateState({ ballastThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={ballastQuantity} onChange={(e) => updateState({ ballastQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "curb" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Total Length (Ft)</label>
                  <input type="number" step="any" value={curbLength} onChange={(e) => updateState({ curbLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Curb Height (In)</label>
                  <input type="number" step="any" value={curbHeight} onChange={(e) => updateState({ curbHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Curb Width (In)</label>
                  <input type="number" step="any" value={curbWidth} onChange={(e) => updateState({ curbWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gutter Thick (In)</label>
                  <input type="number" step="any" value={gutterThickness} onChange={(e) => updateState({ gutterThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gutter Width (In)</label>
                  <input type="number" step="any" value={gutterWidth} onChange={(e) => updateState({ gutterWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={curbQuantity} onChange={(e) => updateState({ curbQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "steps" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Number of Steps</label>
                  <input type="number" min="1" value={stepCount} onChange={(e) => updateState({ stepCount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Stair Width (Ft)</label>
                  <input type="number" step="any" value={stepWidth} onChange={(e) => updateState({ stepWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Step Rise (In)</label>
                  <input type="number" step="any" value={stepRise} onChange={(e) => updateState({ stepRise: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Step Run (In)</label>
                  <input type="number" step="any" value={stepRun} onChange={(e) => updateState({ stepRun: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={stepQuantity} onChange={(e) => updateState({ stepQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "wallfooting" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Total Length (Ft)</label>
                  <input type="number" step="any" value={wallLength} onChange={(e) => updateState({ wallLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Footing Width (In)</label>
                  <input type="number" step="any" value={wallWidth} onChange={(e) => updateState({ wallWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Footing Depth (In)</label>
                  <input type="number" step="any" value={wallDepth} onChange={(e) => updateState({ wallDepth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={wallQuantity} onChange={(e) => updateState({ wallQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {/* Waste Buffer Slider */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Waste &amp; Spillage Buffer Factor
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{wastePct}% Added Buffer
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={wastePct}
                onChange={(e) => updateState({ wastePct: parseInt(e.target.value) || 0 })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0% (Exact)</span>
                <span>+10% (Std Jobsite Buffer)</span>
                <span>+20% (High Flex)</span>
              </div>
            </div>
          </div>

          {/* Volume & Mix Output Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total CY */}
            <div className="bg-slate-900/90 rounded-3xl border border-amber-500/40 p-5 shadow-xl glow-card-amber">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                Total Concrete Needed
              </span>
              <span className="block text-3xl font-black tracking-tight text-white font-mono mt-2">
                {adjustedVolumeCy.toFixed(2)} CY
              </span>
              <span className="block text-xs font-semibold text-amber-400 font-mono mt-1">
                {adjustedVolumeCf.toFixed(2)} CF (+{wastePct}% buffer)
              </span>
            </div>

            {/* 80lb Bags */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                Pre-Mixed 80lb Bags
              </span>
              <span className="block text-3xl font-black tracking-tight text-cyan-300 font-mono mt-2">
                {bags80lb} Bags
              </span>
              <span className="block text-[11px] text-slate-400 font-mono mt-1">
                60lb: {bags60lb} | 40lb: {bags40lb}
              </span>
            </div>

            {/* Ready Mix Truckloads */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                Ready-Mix Truckloads
              </span>
              <span className="block text-3xl font-black tracking-tight text-emerald-300 font-mono mt-2">
                {truckLoads.toFixed(1)} Trucks
              </span>
              <span className="block text-[11px] text-slate-400 font-mono mt-1">
                {isShortLoad ? "⚠️ Volume < 6 CY (Short-load fee)" : "Standard 10 CY Truckloads"}
              </span>
            </div>
          </div>

          {/* PEI RP100 §5 Comprehensive Buoyancy & Hold-Down Sizing Module */}
          {(concreteShape === "deadman" || concreteShape === "ballast") && (
            <div className={`p-6 rounded-3xl border shadow-2xl space-y-5 ${
              buoyancyResults.isSafe
                ? "bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 text-emerald-200"
                : "bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 text-amber-200"
            }`}>
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚓</span>
                    <h3 className="font-black text-sm uppercase tracking-wide text-white">
                      PEI RP100 §5 Tank Buoyancy &amp; Hold-Down Safety Analysis
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      buoyancyResults.isSafe
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {buoyancyResults.isSafe ? "PEI RP100 Compliant (SF ≥ 1.20x)" : "Warning: Below PEI 1.20x Target"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates submerged deadman weight, soil overburden prism, and empty tank dry weight against upward water displacement.
                  </p>
                </div>

                <div className="text-right self-end sm:self-auto font-mono bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Factor</span>
                  <span className={`text-3xl font-black ${buoyancyResults?.isSafe ? "text-emerald-400" : "text-amber-400"}`}>
                    {(buoyancyResults?.safetyFactor ?? 0).toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">PEI Min: 1.20x</span>
                </div>
              </div>

              {/* Force Summary Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Upward Buoyancy (F_B)</span>
                  <span className="text-lg font-black text-red-400 block mt-0.5">
                    {(buoyancyResults?.buoyantUpliftLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.estimatedTankGallons ?? 10000).toLocaleString()} gal × 8.34 lbs/gal
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Downward (F_D)</span>
                  <span className="text-lg font-black text-emerald-400 block mt-0.5">
                    {(buoyancyResults?.totalDownwardForceLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Deadmen + Soil + Tank Weight
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Submerged Deadmen</span>
                  <span className="text-lg font-black text-white block mt-0.5">
                    {(buoyancyResults?.deadmanSubmergedLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.deadmanVolumeCf ?? 0).toFixed(1)} CF × 87.6 lbs/cf
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Soil Overburden Prism</span>
                  <span className="text-lg font-black text-white block mt-0.5">
                    {(buoyancyResults?.overburdenSubmergedLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.overburdenVolumeCf ?? 0).toFixed(1)} CF × 47.6 lbs/cf
                  </span>
                </div>
              </div>

              {/* Strap & Turnbuckle Tension Engineering */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-white">
                    <span>🪢 Hold-Down Strap &amp; Turnbuckle Tension Analysis</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      buoyancyResults?.isStrapAdequate
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}>
                      {buoyancyResults?.isStrapAdequate ? "Strap Tension OK" : "OVERLOAD: Add More Straps"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Net upward load on straps: <strong className="font-mono text-white">{(buoyancyResults?.netUpliftForceLbs ?? 0).toLocaleString()} lbs</strong> | Distributed across <strong className="font-mono text-white">{buoyancyResults?.strapCount ?? 2} strap sets</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Load / Strap Set</span>
                    <span className={`text-base font-black ${buoyancyResults?.isStrapAdequate ? "text-cyan-300" : "text-red-400"}`}>
                      {Math.round(buoyancyResults?.loadPerStrapLbs ?? 0).toLocaleString()} lbs
                    </span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase block">Strap WLL</span>
                    <span className="text-base font-black text-slate-300">
                      {(buoyancyResults?.strapWllLbs ?? 5200).toLocaleString()} lbs
                    </span>
                  </div>
                </div>
              </div>

              {/* Engineering Inputs */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Adjust Site Buoyancy Engineering Variables
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Tank Capacity (gal)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyTankGallons || "10000"}
                      onChange={(e) => updateState({ buoyancyTankGallons: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      {["6000", "10000", "12000", "15000", "20000"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateState({ buoyancyTankGallons: g })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                        >
                          {parseInt(g) / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Empty Tank Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyTankWeightLbs || "4500"}
                      onChange={(e) => updateState({ buoyancyTankWeightLbs: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => updateState({ buoyancyTankWeightLbs: "4500" })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                      >
                        FRP (~4.5k)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateState({ buoyancyTankWeightLbs: "10500" })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                      >
                        Steel (~10.5k)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Burial Cover over Deadmen (ft)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={state.buoyancyBurialDepthFt || "3.5"}
                      onChange={(e) => updateState({ buoyancyBurialDepthFt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.buoyancyIncludeOverburden ?? true}
                        onChange={(e) => updateState({ buoyancyIncludeOverburden: e.target.checked })}
                        className="rounded accent-cyan-500"
                      />
                      <span>Credit Backfill Prism</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Strap Working Load Limit (lbs)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyStrapWllLbs || "5200"}
                      onChange={(e) => updateState({ buoyancyStrapWllLbs: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Std 3/4&quot; Turnbuckle = 5,200 lbs WLL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reinforcement & Sub-Base Controls */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>02</span> Reinforcement &amp; Sub-Base Aggregate Options
              </h2>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Rebar &amp; Mesh
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Rebar Spacing</label>
                <select
                  value={rebarSpacing}
                  onChange={(e) => updateState({ rebarSpacing: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None / Plain</option>
                  <option value="6">6&quot; Grid</option>
                  <option value="12">12&quot; Grid (Standard)</option>
                  <option value="18">18&quot; Grid</option>
                  <option value="24">24&quot; Grid</option>
                  <option value="36">36&quot; Grid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Rebar Bar Size</label>
                <select
                  value={rebarSize}
                  onChange={(e) => updateState({ rebarSize: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="#3">#3 (3/8&quot; Bar)</option>
                  <option value="#4">#4 (1/2&quot; Bar Std)</option>
                  <option value="#5">#5 (5/8&quot; Heavy)</option>
                  <option value="#6">#6 (3/4&quot; Heavy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Wire Mesh Fabric</label>
                <select
                  value={wireMesh}
                  onChange={(e) => updateState({ wireMesh: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="roll_750">6x6 W1.4 Roll (5&apos;x150&apos;)</option>
                  <option value="sheet_120">6x6 Sheets (8&apos;x15&apos;)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gravel Sub-Base</label>
                <select
                  value={gravelDepth}
                  onChange={(e) => updateState({ gravelDepth: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-emerald-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="2">2&quot; Base</option>
                  <option value="4">4&quot; Base (Standard)</option>
                  <option value="6">6&quot; Base</option>
                  <option value="8">8&quot; Heavy Base</option>
                  <option value="12">12&quot; Base</option>
                </select>
              </div>
            </div>

            {/* Reinforcement Output Grid */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Total Rebar LF</span>
                <span className="font-bold text-cyan-300 text-sm">{rebarCalculations.totalLf.toFixed(1)} LF</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">20ft Rebar Sticks</span>
                <span className="font-bold text-cyan-300 text-sm">{rebarCalculations.pieces20} Sticks</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Tie Wire Rolls</span>
                <span className="font-bold text-slate-300 text-sm">{rebarCalculations.tieWireRolls} Roll(s)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Rebar Chairs</span>
                <span className="font-bold text-slate-300 text-sm">{rebarCalculations.chairsCount} Chairs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Interactive Diagram & Material Cost Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          {/* Dynamic SVG Visual Diagram */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live Form Geometry Cross-Section
              </h3>
              <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                Dynamic Render
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Gravel Base */}
                {gravelDepth !== "none" && (
                  <rect x="40" y="220" width="320" height="40" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                )}
                {gravelDepth !== "none" && (
                  <text x="200" y="245" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Gravel Sub-Base ({gravelDepth}&quot; Depth: {gravelCalculations.tons.toFixed(1)} Tons)
                  </text>
                )}

                {/* Shape Visual */}
                {concreteShape === "flatwork" || concreteShape === "ballast" ? (
                  <g>
                    <rect x="40" y="100" width="320" height="120" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    {rebarSpacing !== "none" && (
                      <line x1="60" y1="160" x2="340" y2="160" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,4" />
                    )}
                    <text x="200" y="155" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {concreteShape === "flatwork" ? "Concrete Slab" : "UST Ballast Slab"}
                    </text>
                    <text x="200" y="175" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(1)} CF)
                    </text>
                  </g>
                ) : concreteShape === "circular" ? (
                  <g>
                    <ellipse cx="200" cy="150" rx="140" ry="60" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="150" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Circular Base ({circDiameter}&apos; Dia x {circThickness}&quot; T)
                    </text>
                    <text x="200" y="170" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY
                    </text>
                  </g>
                ) : concreteShape === "sonotube" ? (
                  <g>
                    <rect x="140" y="60" width="120" height="160" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <line x1="160" y1="70" x2="160" y2="210" stroke="#06b6d4" strokeWidth="2" />
                    <line x1="240" y1="70" x2="240" y2="210" stroke="#06b6d4" strokeWidth="2" />
                    <text x="200" y="130" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Sonotube Column ({sonoDiameter}&quot; Dia)
                    </text>
                    <text x="200" y="150" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      Qty: {sonoQuantity} | {adjustedVolumeCy.toFixed(2)} CY
                    </text>
                  </g>
                ) : concreteShape === "deadman" ? (
                  <g>
                    {/* Pit Excavation Walls */}
                    <polygon points="20,20 40,260 360,260 380,20" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                    
                    {/* Pea Gravel Pit Bedding */}
                    <rect x="40" y="240" width="320" height="20" fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="200" y="253" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Pea Gravel Bedding Layer (12&quot; Depth)
                    </text>

                    {/* Left & Right Concrete Deadman Beams */}
                    <rect x="75" y="205" width="50" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
                    <rect x="275" y="205" width="50" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="100" y="226" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Deadman</text>
                    <text x="300" y="226" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Deadman</text>

                    {/* Embedded Eye Rods / D-Rings */}
                    <circle cx="100" cy="205" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="300" cy="205" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

                    {/* Galvanized Turnbuckle Assemblies */}
                    {/* Left Turnbuckle */}
                    <rect x="96" y="155" width="8" height="35" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1="100" y1="190" x2="100" y2="200" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="100" y1="145" x2="100" y2="155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="65" y="175" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="end">Turnbuckle</text>

                    {/* Right Turnbuckle */}
                    <rect x="296" y="155" width="8" height="35" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1="300" y1="190" x2="300" y2="200" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="300" y1="145" x2="300" y2="155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="335" y="175" fill="#38bdf8" fontSize="9" fontWeight="bold">Turnbuckle</text>

                    {/* Cylindrical Tank Shell Section */}
                    <ellipse cx="200" cy="130" rx="80" ry="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="125" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                      UST Tank Section
                    </text>
                    <text x="200" y="142" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {turnbuckleLayout.tankDiameterInches}&quot; Dia ({turnbuckleLayout.tankRadiusInches}&quot; Radius)
                    </text>

                    {/* Rubber Cushion Anchor Strap over top semi-circle */}
                    <path d="M 120 130 A 80 80 0 0 1 280 130" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="5,2" />
                    <line x1="120" y1="130" x2="100" y2="145" stroke="#22c55e" strokeWidth="3" />
                    <line x1="280" y1="130" x2="300" y2="145" stroke="#22c55e" strokeWidth="3" />
                    <text x="200" y="42" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Anchor Strap Arc Wrap ({turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot;)
                    </text>

                    {/* Dimension Line: Deadman Clearance */}
                    <line x1="200" y1="210" x2="275" y2="210" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="237" y="203" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Clearance: {turnbuckleLayout.deadmanClearanceInches}&quot;
                    </text>
                  </g>
                ) : (
                  <g>
                    <rect x="60" y="100" width="280" height="120" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="155" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Custom Concrete Structure
                    </text>
                    <text x="200" y="175" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(1)} CF)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Turnbuckle & Strap Cut Sheet Callout Card (When deadman shape active) */}
            {concreteShape === "deadman" && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-sans">
                  <span className="font-extrabold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
                    <span>⛓️</span> Turnbuckle &amp; Strap Cut Sheet
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded font-bold border border-cyan-500/30">
                    {turnbuckleLayout.strapCount} Strap Sets Required
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Strap Top Arc Wrap</span>
                    <span className="font-bold text-slate-200">{turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot;</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Perimeter Assembly</span>
                    <span className="font-bold text-slate-200">{turnbuckleLayout.totalAssemblyLengthInches.toFixed(1)}&quot;</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Turnbuckles Total</span>
                    <span className="font-bold text-cyan-300">{turnbuckleLayout.turnbuckleCount} Turnbuckles</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Net Strap Cut Length</span>
                    <span className="font-bold text-emerald-400">{turnbuckleLayout.netStrapCutLengthInches.toFixed(1)}&quot; / strap</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Estimator Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>💰</span> Material Cost Comparison
              </h3>
              <button
                type="button"
                onClick={() => updateState({ showCostEstimator: !showCostEstimator })}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                {showCostEstimator ? "Hide Pricing" : "Show Pricing"}
              </button>
            </div>

            {showCostEstimator && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-b border-slate-800/80 pb-3">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Ready-Mix $/CY</label>
                  <input type="number" step="5" value={pricePerCy} onChange={(e) => updateState({ pricePerCy: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">80lb Bag $/ea</label>
                  <input type="number" step="0.5" value={pricePerBag80} onChange={(e) => updateState({ pricePerBag80: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Rebar $/Stick</label>
                  <input type="number" step="1" value={pricePerRebarStick} onChange={(e) => updateState({ pricePerRebarStick: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Gravel $/Ton</label>
                  <input type="number" step="5" value={pricePerGravelTon} onChange={(e) => updateState({ pricePerGravelTon: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
              {/* Ready-Mix Truck Cost Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">
                  Option A: Ready-Mix Truck
                </span>
                <span className="text-xl font-black text-white font-mono block">
                  ${costSummary.totalWithReadyMix.toFixed(2)}
                </span>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-800">
                  <p>Ready-Mix: ${costSummary.readyMix.toFixed(2)}</p>
                  <p>Rebar &amp; Mesh: ${(costSummary.rebar + costSummary.mesh).toFixed(2)}</p>
                  <p>Gravel Base: ${costSummary.gravel.toFixed(2)}</p>
                </div>
              </div>

              {/* Pre-mix Bagged Cost Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide block">
                  Option B: Pre-mixed Bags
                </span>
                <span className="text-xl font-black text-cyan-300 font-mono block">
                  ${costSummary.totalWith80lbBags.toFixed(2)}
                </span>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-800">
                  <p>80lb Bags ({bags80lb}): ${costSummary.bags80.toFixed(2)}</p>
                  <p>Rebar &amp; Mesh: ${(costSummary.rebar + costSummary.mesh).toFixed(2)}</p>
                  <p>Gravel Base: ${costSummary.gravel.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ConcreteTabComponent);
