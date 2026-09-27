// encoding: utf-8
"use client";

import React from "react";
import { playClickSound } from "../lib/soundEffects";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "Navigation & Tabs",
      items: [
        { keys: ["1"], desc: "Switch to Excavation & Laser Benchmark" },
        { keys: ["2"], desc: "Switch to OPW 71SO Drop Tube Cut" },
        { keys: ["3"], desc: "Switch to Complete Concrete & Buoyancy" },
        { keys: ["4"], desc: "Switch to Construction Math & Squaring" },
        { keys: ["5"], desc: "Switch to Daily Job Report" },
        { keys: ["6"], desc: "Switch to Pre-Bury Inspector" },
        { keys: ["7"], desc: "Switch to Blueprints & Scope of Work" },
      ],
    },
    {
      category: "Field OS System Controls",
      items: [
        { keys: ["Ctrl", "K"], desc: "Open Global Command Palette (or ⌘K)" },
        { keys: ["Ctrl", "\\"], desc: "Toggle Split-Screen Dual Workspace Mode" },
        { keys: ["Ctrl", "Shift", "A"], desc: "Toggle UST Field AI Copilot" },
        { keys: ["Ctrl", "Shift", "C"], desc: "Copy Current Tab Cut Sheet to Clipboard" },
        { keys: ["Ctrl", "P"], desc: "Print Submittal PDF Package" },
        { keys: ["Ctrl", "B"], desc: "Open Backup & Cloud Sync Modal" },
        { keys: ["?"], desc: "Show this Keyboard Shortcuts Cheat Sheet" },
        { keys: ["Esc"], desc: "Close any open modal, drawer, or dialog" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 ring-1 ring-cyan-500/20">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">⌨️</span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Field OS Keyboard Shortcuts
              </h2>
              <p className="text-[10px] text-slate-400">
                Speed up field calculations and plan navigation
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {group.category}
              </h3>
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="text-slate-300 font-medium">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-cyan-300 font-bold shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Press ESC anytime to dismiss</span>
          <span className="font-mono text-cyan-400/80">UST Field OS</span>
        </div>
      </div>
    </div>
  );
}
