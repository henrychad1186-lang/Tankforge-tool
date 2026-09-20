// encoding: utf-8
"use client";

import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">📖</span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">UST Field Reference &amp; Math Formulas</h2>
              <p className="text-xs text-slate-400">Essential field rules, +15.5&apos; laser constants, and OPW drop tube formulas.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* 1. Excavation Rule */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-xs">+15.5&apos;</span>
              Excavation Grade Shots &amp; 15.5&apos; Constant Rule
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              When performing grade checks using an optical laser level or transit rod, all excavation benchmarks are derived directly from the <strong className="text-white">Finish Grade (FG) transit shot</strong>:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5 pt-1">
              <li><strong className="text-cyan-300">Bottom of Tank Hole (Raw Hole, No Bedding):</strong> FG Transit Shot + <strong className="text-cyan-400">15.5 Feet Constant</strong>. This gives the exact target laser rod reading at the base of the dirt pit.</li>
              <li><strong className="text-emerald-300">Bottom of Tank Hole (Top of Pea Gravel Bedding):</strong> FG Transit Shot + <strong className="text-emerald-400">(15.5&apos; Constant - Bedding Thickness)</strong>. With standard 1.0&apos; pea gravel bed, this equals FG Shot + 14.5&apos;.</li>
              <li><strong className="text-amber-300">Trenching Depth:</strong> FG Transit Shot + <strong className="text-amber-400">3.0 Feet Constant</strong>.</li>
              <li><strong className="text-slate-200">Vent Line Slope Drainage:</strong> 1/8&quot; per foot pitch calculation between High Point and Low Point shots across the trench run.</li>
            </ul>
          </div>

          {/* 2. OPW Drop Tube Assembly */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-xs">OPW 71SO</span>
              OPW Drop Tube Assembly Formulas
            </h3>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
              <li><strong className="text-emerald-300">Upper Tube Cut Length:</strong> Riser Height + Valve Offset (+5.5&quot; for standard 71SO, +6.5&quot; for testable 71SO-T).</li>
              <li><strong className="text-emerald-300">Overall Assembly Length:</strong> Riser Height + Tank Inner Diameter - Tank Clearance (default 6.0&quot; EPA std).</li>
              <li><strong className="text-amber-300">Cut Angle:</strong> Always cut lower tube bottom at a 45-degree angle to prevent suction locking against bottom.</li>
            </ul>
          </div>

          {/* 3. Concrete Math */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-xs">Concrete</span>
              Concrete Volume &amp; Material Calculations
            </h3>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
              <li><strong className="text-white">Volume (Cubic Yards):</strong> Total Cubic Feet / 27.</li>
              <li><strong className="text-amber-300">Waste Factor Buffer:</strong> Add +10% standard buffer for site over-excavation, spillage, and form flex.</li>
              <li><strong className="text-amber-300">Pre-mixed Bags Yields:</strong> 80lb bag = 0.60 cu ft | 60lb bag = 0.45 cu ft | 40lb bag = 0.30 cu ft.</li>
              <li><strong className="text-amber-300">Rebar Stick Count:</strong> Total Linear Feet (LF) + 10% lap splice / 20ft per stick.</li>
            </ul>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Got It, Thanks
          </button>
        </div>
      </div>
    </div>
  );
}
