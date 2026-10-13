// encoding: utf-8
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { type ActiveTab, TANK_PRESETS } from "../lib/constants";
import { playClickSound, playSuccessChime } from "../lib/soundEffects";

export interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Tank Presets" | "AI Copilot" | "Job Sites";
  title: string;
  subtitle?: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAiAssistant: (prompt?: string) => void;
  onOpenBackupModal: () => void;
  onCopyCutSheet: () => void;
  onPrint: () => void;
  onToggleSplitScreen: () => void;
  onToggleSunlightMode: () => void;
  onOpenFieldTools: () => void;
  onResetTab: () => void;
  jobList: Array<{ id: string; name: string }>;
  onSelectJob: (jobId: string) => void;
  onSelectTankPreset?: (presetId: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAiAssistant,
  onOpenBackupModal,
  onCopyCutSheet,
  onPrint,
  onToggleSplitScreen,
  onToggleSunlightMode,
  onOpenFieldTools,
  onResetTab,
  jobList,
  onSelectJob,
  onSelectTankPreset,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command registry
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: "nav-excavation",
        category: "Navigation",
        title: "Excavation & Laser Benchmark",
        subtitle: "Transit shot calculation, pit depths (cover + tank OD + bedding), vent slope",
        icon: "🚜",
        shortcut: "1",
        action: () => {
          onSelectTab("excavation");
          onClose();
        },
      },
      {
        id: "nav-droptube",
        category: "Navigation",
        title: "OPW 71SO Drop Tube Cut Length",
        subtitle: "Overfill valve cut lengths, clearance offsets, blueprint diagram",
        icon: "📏",
        shortcut: "2",
        action: () => {
          onSelectTab("droptube");
          onClose();
        },
      },
      {
        id: "nav-concrete",
        category: "Navigation",
        title: "Complete Concrete & Buoyancy",
        subtitle: "PEI RP100 safety factors, deadman anchors, rebar, gravel",
        icon: "🧱",
        shortcut: "3",
        action: () => {
          onSelectTab("concrete");
          onClose();
        },
      },
      {
        id: "nav-construction",
        category: "Navigation",
        title: "Construction Math & Squaring",
        subtitle: "3-4-5 right triangle solver, lumber board feet, unit conversions",
        icon: "📐",
        shortcut: "4",
        action: () => {
          onSelectTab("construction");
          onClose();
        },
      },
      {
        id: "nav-dailyreport",
        category: "Navigation",
        title: "Daily Job Report & Safety",
        subtitle: "Crew hours, equipment logs, materials received, safety checklist",
        icon: "📋",
        shortcut: "5",
        action: () => {
          onSelectTab("dailyreport");
          onClose();
        },
      },
      {
        id: "nav-prebury",
        category: "Navigation",
        title: "Pre-Bury Inspector & Air Tests",
        subtitle: "5.0 psig 60-min hold timer, checklists, inspector signature",
        icon: "🔍",
        shortcut: "6",
        action: () => {
          onSelectTab("prebury");
          onClose();
        },
      },
      {
        id: "nav-blueprints",
        category: "Navigation",
        title: "Blueprints Plan Viewer & SOW",
        subtitle: "Civil drawings, piping specs, Scope of Work item generator",
        icon: "📑",
        shortcut: "7",
        action: () => {
          onSelectTab("blueprints");
          onClose();
        },
      },

      // Actions
      {
        id: "act-copy-cut-sheet",
        category: "Actions",
        title: "Copy Current Cut Sheet",
        subtitle: "Format and copy active tab's calculations to clipboard",
        icon: "📋",
        shortcut: "Ctrl+Shift+C",
        action: () => {
          onCopyCutSheet();
          onClose();
        },
      },
      {
        id: "act-print-pdf",
        category: "Actions",
        title: "Print Submittal PDF",
        subtitle: "Export clean print-ready engineering submittal packet",
        icon: "🖨️",
        shortcut: "Ctrl+P",
        action: () => {
          onPrint();
          onClose();
        },
      },
      {
        id: "act-toggle-split",
        category: "Actions",
        title: "Toggle Split-Screen Dual Workspace",
        subtitle: "View two tabs side-by-side (e.g. Blueprints + Math)",
        icon: "🗂️",
        shortcut: "Ctrl+\\",
        action: () => {
          onToggleSplitScreen();
          onClose();
        },
      },
      {
        id: "act-toggle-sunlight",
        category: "Actions",
        title: "Toggle Outdoor Sunlight High-Vis Mode",
        subtitle: "High contrast mode for direct bright job site sunlight",
        icon: "☀️",
        action: () => {
          onToggleSunlightMode();
          onClose();
        },
      },
      {
        id: "act-field-tools",
        category: "Actions",
        title: "Open Field OS Tools Drawer",
        subtitle: "Fast unit converter, air test hold countdown timer, persistent memo",
        icon: "🧰",
        action: () => {
          onOpenFieldTools();
          onClose();
        },
      },
      {
        id: "act-backup-sync",
        category: "Actions",
        title: "Backup & Cloud Sync",
        subtitle: "JSON site export, device migration, offline state restoration",
        icon: "☁️",
        action: () => {
          onOpenBackupModal();
          onClose();
        },
      },
      {
        id: "act-reset-tab",
        category: "Actions",
        title: "Reset Current Tab Inputs",
        subtitle: "Restore default factory values for the active screen",
        icon: "🔄",
        action: () => {
          onResetTab();
          onClose();
        },
      },

      // AI Copilot
      {
        id: "ai-open",
        category: "AI Copilot",
        title: "Open UST Field Copilot",
        subtitle: "Chat with multimodal AI assistant aware of all site calculations",
        icon: "🤖",
        shortcut: "Ctrl+Shift+A",
        action: () => {
          onOpenAiAssistant();
          onClose();
        },
      },
      {
        id: "ai-buoyancy",
        category: "AI Copilot",
        title: "AI: Verify PEI RP100 §5 Buoyancy",
        subtitle: "Review water table, soil surcharge, and deadman hold-down forces",
        icon: "🌊",
        action: () => {
          onOpenAiAssistant("Please analyze our current tank buoyancy calculations and verify whether the safety factor meets PEI RP100 section 5 guidelines under full submersion.");
          onClose();
        },
      },
      {
        id: "ai-sow",
        category: "AI Copilot",
        title: "AI: Draft Installation Scope of Work",
        subtitle: "Generate division-by-division contractor work tasks and hours",
        icon: "📝",
        action: () => {
          onOpenAiAssistant("Draft a complete CSI-formatted Scope of Work (SOW) for this UST installation site, including excavation, tank setting, deadman anchoring, piping fall, and pre-bury inspection.");
          onClose();
        },
      },
      {
        id: "ai-drop-tube",
        category: "AI Copilot",
        title: "AI: Verify Drop Tube Cut Sheet",
        subtitle: "Check 95% overfill shutoff tolerances and valve offsets",
        icon: "🔍",
        action: () => {
          onOpenAiAssistant("Verify my OPW 71SO drop tube cut lengths and ensure the 6-inch bottom clearance aligns with NFPA 30 / PEI RP100 overfill prevention requirements.");
          onClose();
        },
      },
    ];

    // Tank Presets
    TANK_PRESETS.filter((p) => p.id !== "custom").forEach((preset) => {
      list.push({
        id: `preset-${preset.id}`,
        category: "Tank Presets",
        title: preset.name,
        subtitle: `Diameter: ${preset.diameter}"`,
        icon: "⛽",
        action: () => {
          onSelectTab("droptube");
          onSelectTankPreset?.(preset.id);
          onClose();
        },
      });
    });

    // Job Sites
    jobList.forEach((job) => {
      list.push({
        id: `job-${job.id}`,
        category: "Job Sites",
        title: `Switch to: ${job.name}`,
        subtitle: `Job ID: ${job.id}`,
        icon: "📍",
        action: () => {
          onSelectJob(job.id);
          onClose();
        },
      });
    });

    return list;
  }, [
    onSelectTab,
    onClose,
    onCopyCutSheet,
    onPrint,
    onToggleSplitScreen,
    onToggleSunlightMode,
    onOpenFieldTools,
    onOpenBackupModal,
    onResetTab,
    onOpenAiAssistant,
    onSelectTankPreset,
    jobList,
    onSelectJob,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allCommands;
    const q = searchQuery.toLowerCase().trim();
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q))
    );
  }, [allCommands, searchQuery]);

  // Adjust selection bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredCommands.length === 0) return 0;
      return Math.min(prev, filteredCommands.length - 1);
    });
  }, [filteredCommands]);

  // Keyboard navigation inside modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        playClickSound();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        playClickSound();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          playSuccessChime();
          selected.action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        playClickSound();
        onClose();
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    const activeItem = items[selectedIndex] as HTMLElement | undefined;
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] ring-1 ring-cyan-500/20"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <span className="text-xl text-cyan-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command, tab, tank preset, or question..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl block">🔎</span>
              <p className="text-sm font-bold text-slate-300">No commands found</p>
              <p className="text-xs text-slate-500">
                Try searching for &quot;laser&quot;, &quot;concrete&quot;, &quot;OPW&quot;, &quot;Xerxes&quot;, or &quot;SOW&quot;.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-command-item
                  onClick={() => {
                    playSuccessChime();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-medium shadow-md shadow-cyan-500/20"
                      : "text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{cmd.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-slate-950" : "text-white"}`}>
                          {cmd.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-semibold ${
                            isSelected
                              ? "bg-slate-950/20 text-slate-900"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? "text-slate-900/80 font-medium" : "text-slate-400"
                          }`}
                        >
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0 ${
                        isSelected
                          ? "bg-slate-950 text-cyan-300 border border-slate-900"
                          : "bg-slate-800 border border-slate-700 text-slate-400"
                      }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-slate-500 font-mono">
            {filteredCommands.length} command{filteredCommands.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
