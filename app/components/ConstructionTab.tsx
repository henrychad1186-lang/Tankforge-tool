'use client';

import React, { memo } from 'react';
import { formatFeetInches } from '../lib/calculations';
import { ConstructionTool, ConvCategory } from '../lib/constants';
import { useConstruction } from '../lib/tab-contexts';

function ConstructionTabComponent() {
  const { state, updateState, triCalc, aggCalc, lumberCalc, convCalc } = useConstruction();
  const {
    constTool,
    triA,
    triB,
    aggLength,
    aggWidth,
    aggDepth,
    aggMat,
    aggWaste,
    aggPriceTon,
    lumberSubTool,
    bfThickness,
    bfWidth,
    bfLength,
    bfQuantity,
    formPerimeter,
    formStakeSpacing,
    convCategory,
    convFromUnit,
    convInputVal,
  } = state;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tool Selector Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        {[
          { id: "triangle", label: "Right Triangles (3-4-5)", icon: "📐" },
          { id: "aggregate", label: "Aggregates & Fill", icon: "🪨" },
          { id: "lumber", label: "Lumber & Formwork", icon: "🪵" },
          { id: "converter", label: "Unit Converter", icon: "🔄" }
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => updateState({ constTool: tool.id as ConstructionTool })}
            className={`flex items-center gap-2 p-2.5 rounded-lg transition-all cursor-pointer font-bold text-xs ${
              constTool === tool.id
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TRIANGLE TOOL ─── */}
      {constTool === "triangle" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <h2 className="text-xs font-extrabold uppercase text-indigo-400">Right-Angle &amp; Slope Math</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Side A (Run Ft)</label>
                <input
                  type="number"
                  value={triA}
                  onChange={(e) => updateState({ triA: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-indigo-300 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Side B (Rise Ft)</label>
                <input
                  type="number"
                  value={triB}
                  onChange={(e) => updateState({ triB: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-indigo-300 text-sm font-bold"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs text-slate-400">Hypotenuse (Side C)</span>
                <span className="text-lg font-bold text-indigo-300">{formatFeetInches(triCalc.sideC)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs text-slate-400">Pitch Angle</span>
                <span className="text-base font-bold text-white">{triCalc.angleDeg.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Fall Rate</span>
                <span className="text-base font-bold text-indigo-400">{triCalc.fallPerFoot.toFixed(2)}&quot; per Foot</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-center">
            <svg viewBox="0 0 300 200" className="w-full h-full max-h-48">
              <polygon points="40,160 260,160 260,40" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />
              <text x="150" y="180" fill="#94a3b8" fontSize="12" textAnchor="middle">Side A: {triA}&apos;</text>
              <text x="275" y="100" fill="#94a3b8" fontSize="12" textAnchor="start">Side B: {triB}&apos;</text>
              <text x="130" y="90" fill="#818cf8" fontSize="12" fontWeight="bold">Hyp: {triCalc.sideC.toFixed(2)}&apos;</text>
            </svg>
          </div>
        </div>
      )}

      {/* ─── AGGREGATE TOOL ─── */}
      {constTool === "aggregate" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <h2 className="text-xs font-extrabold uppercase text-indigo-400">Aggregates &amp; Sub-Base Tonnage</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Length (Ft)</label>
                <input type="number" value={aggLength} onChange={(e) => updateState({ aggLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Width (Ft)</label>
                <input type="number" value={aggWidth} onChange={(e) => updateState({ aggWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Depth (In)</label>
                <input type="number" value={aggDepth} onChange={(e) => updateState({ aggDepth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Material Type</label>
                <select value={aggMat} onChange={(e) => updateState({ aggMat: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-indigo-300">
                  <option value="crushed_stone">Crushed Stone (#57 / ABC)</option>
                  <option value="pea_gravel">Pea Gravel (UST Spec)</option>
                  <option value="sand">Coarse Sand</option>
                  <option value="topsoil">Topsoil / Dirt</option>
                  <option value="asphalt">Hot Mix Asphalt</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Price per Ton ($)</label>
                <input type="number" value={aggPriceTon} onChange={(e) => updateState({ aggPriceTon: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3 font-mono">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30">
              <span className="text-xs text-indigo-400 block font-sans uppercase font-bold">Total Tonnage Required</span>
              <span className="text-2xl font-black text-white">{aggCalc.totalTons.toFixed(2)} Tons</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{aggCalc.adjCY.toFixed(2)} CY (Includes +{aggWaste}% Waste)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase block">Est. Material Cost</span>
                <span className="text-lg font-bold text-emerald-400">${aggCalc.cost.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase block">15-Ton Truckloads</span>
                <span className="text-lg font-bold text-indigo-300">{aggCalc.truckloads15Ton} Loads</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── LUMBER TOOL ─── */}
      {constTool === "lumber" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => updateState({ lumberSubTool: "formwork" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lumberSubTool === "formwork" ? "bg-indigo-500 text-white" : "text-slate-400"}`}
              >
                Concrete Formwork
              </button>
              <button
                onClick={() => updateState({ lumberSubTool: "boardfeet" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lumberSubTool === "boardfeet" ? "bg-indigo-500 text-white" : "text-slate-400"}`}
              >
                Board Feet Calculator
              </button>
            </div>

            {lumberSubTool === "formwork" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Form Perimeter (Ft)</label>
                  <input type="number" value={formPerimeter} onChange={(e) => updateState({ formPerimeter: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Stake Spacing (Ft)</label>
                  <input type="number" value={formStakeSpacing} onChange={(e) => updateState({ formStakeSpacing: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Thick (In)</label>
                  <input type="number" value={bfThickness} onChange={(e) => updateState({ bfThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Width (In)</label>
                  <input type="number" value={bfWidth} onChange={(e) => updateState({ bfWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Length (Ft)</label>
                  <input type="number" value={bfLength} onChange={(e) => updateState({ bfLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Quantity</label>
                  <input type="number" value={bfQuantity} onChange={(e) => updateState({ bfQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3 font-mono">
            {lumberSubTool === "formwork" ? (
              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between">
                  <span className="text-xs text-slate-400 font-sans">16ft Form Boards</span>
                  <span className="text-base font-bold text-indigo-300">{lumberCalc.boards16ft} Boards</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between">
                  <span className="text-xs text-slate-400 font-sans">Form Stakes Needed</span>
                  <span className="text-base font-bold text-white">{lumberCalc.stakesCount} Stakes</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
                <span className="text-xs text-indigo-400 font-sans block uppercase">Total Board Feet (BF)</span>
                <span className="text-2xl font-black text-white">{lumberCalc.totalBf.toFixed(2)} BF</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CONVERTER TOOL ─── */}
      {constTool === "converter" && (
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Category</label>
              <select value={convCategory} onChange={(e) => updateState({ convCategory: e.target.value as ConvCategory })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-indigo-300">
                <option value="length">Length / Distance</option>
                <option value="area">Area</option>
                <option value="volume">Volume</option>
                <option value="weight">Weight / Mass</option>
                <option value="pressure">Pressure (PSI / Bar)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">From Unit</label>
              <input type="text" value={convFromUnit} onChange={(e) => updateState({ convFromUnit: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Value</label>
              <input type="number" value={convInputVal} onChange={(e) => updateState({ convInputVal: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {Object.entries(convCalc).map(([k, item]) => (
              <div key={k} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans uppercase block">{item.label}</span>
                <span className="text-base font-bold text-indigo-300">{item.value.toFixed(2)} {item.unitStr}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ConstructionTabComponent);
