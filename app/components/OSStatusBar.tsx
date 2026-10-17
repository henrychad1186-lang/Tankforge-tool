// encoding: utf-8
"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { isAudioEnabled, setAudioEnabled, playClickSound, subscribeAudioPreference } from "../lib/soundEffects";

// Browser state read via useSyncExternalStore: server/hydration render uses the
// fallback, then the live value — no setState in effects, no hydration mismatch.
type NetworkConnection = EventTarget & { effectiveType?: string };

function getConnection(): NetworkConnection | undefined {
  return (navigator as unknown as { connection?: NetworkConnection }).connection;
}

function subscribeOnline(notify: () => void) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}

function subscribeConnection(notify: () => void) {
  const conn = getConnection();
  conn?.addEventListener?.("change", notify);
  return () => conn?.removeEventListener?.("change", notify);
}

function getEffectiveType(): string {
  return getConnection()?.effectiveType?.toUpperCase() ?? "Online";
}

interface OSStatusBarProps {
  activeJobName: string;
  onOpenCommandPalette: () => void;
  onToggleSplitScreen: () => void;
  isSplitScreen: boolean;
  onToggleSunlightMode: () => void;
  isSunlightMode: boolean;
  onOpenFieldTools: () => void;
  onOpenShortcuts: () => void;
  triggerToast?: (msg: string) => void;
}

export default function OSStatusBar({
  activeJobName,
  onOpenCommandPalette,
  onToggleSplitScreen,
  isSplitScreen,
  onToggleSunlightMode,
  isSunlightMode,
  onOpenFieldTools,
  onOpenShortcuts,
  triggerToast,
}: OSStatusBarProps) {
  // Clock state
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [showUtc, setShowUtc] = useState<boolean>(false);

  // Network state
  const isOnline = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const effectiveType = useSyncExternalStore(subscribeConnection, getEffectiveType, () => "Online");

  // Storage telemetry
  const [storageUsageMb, setStorageUsageMb] = useState<number | null>(null);
  const [storageQuotaMb, setStorageQuotaMb] = useState<number | null>(null);

  // Battery telemetry
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);

  // Audio feedback toggle
  const audioActive = useSyncExternalStore(subscribeAudioPreference, isAudioEnabled, () => true);

  // Initialize clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      if (showUtc) {
        setTimeStr(now.toUTCString().slice(17, 25) + " UTC");
        setDateStr(now.toUTCString().slice(0, 16));
      } else {
        setTimeStr(
          now.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        );
        setDateStr(
          now.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        );
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [showUtc]);

  // Network status toasts
  useEffect(() => {
    const handleOnline = () => triggerToast?.("System Online: Network Connected");
    const handleOffline = () => triggerToast?.("System Offline: PWA Offline Mode Active");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [triggerToast]);

  // Storage estimation
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage !== undefined) {
          setStorageUsageMb(+(est.usage / (1024 * 1024)).toFixed(1));
        }
        if (est.quota !== undefined) {
          setStorageQuotaMb(+(est.quota / (1024 * 1024)).toFixed(0));
        }
      }).catch(() => {
        // Storage estimate failed or denied
      });
    }
  }, []);

  // Battery estimation
  useEffect(() => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (type: string, fn: () => void) => void }> })
        .getBattery()
        .then((battery) => {
          const updateBattery = () => {
            setBatteryLevel(Math.round(battery.level * 100));
            setIsCharging(battery.charging);
          };
          updateBattery();
          battery.addEventListener("levelchange", updateBattery);
          battery.addEventListener("chargingchange", updateBattery);
        })
        .catch(() => {
          // Battery API not supported or rejected
        });
    }
  }, []);

  const handleToggleAudio = useCallback(() => {
    const nextState = !audioActive;
    setAudioEnabled(nextState);
    if (nextState) {
      playClickSound();
      triggerToast?.("System Sound Feedback: Enabled");
    } else {
      triggerToast?.("System Sound Feedback: Muted");
    }
  }, [audioActive, triggerToast]);

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none sticky top-0 z-30 transition-colors">
      {/* Left: OS Branding & Active Job */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono font-black text-cyan-400 tracking-wider text-[10px]">
            FIELD OS <span className="text-slate-500 font-normal">v2.5</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium border-l border-slate-800 pl-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Site:</span>
          <span className="text-slate-200 font-semibold truncate max-w-[140px] md:max-w-[200px]" title={activeJobName}>
            {activeJobName}
          </span>
        </div>
      </div>

      {/* Middle: Quick Search Command Palette Trigger */}
      <button
        type="button"
        onClick={() => {
          playClickSound();
          onOpenCommandPalette();
        }}
        className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs group"
        title="Open Global Command Palette (Ctrl+K or ⌘K)"
      >
        <span className="text-cyan-400 group-hover:scale-110 transition-transform">🔍</span>
        <span className="font-medium text-[11px] text-slate-300">
          Search tools, presets, tabs...
        </span>
        <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-slate-950 border border-slate-700 rounded text-[9px] font-mono text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-600 transition-colors">
          ⌘K
        </kbd>
      </button>

      {/* Right: Telemetry & OS Utilities */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Network indicator */}
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            isOnline
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
              : "bg-amber-950/40 border-amber-800/60 text-amber-400 animate-pulse"
          }`}
          title={isOnline ? `Online (${effectiveType}) - PWA synced` : "Offline - Running from local PWA cache"}
        >
          <span className="text-[9px]">{isOnline ? "●" : "▲"}</span>
          <span>{isOnline ? effectiveType : "OFFLINE"}</span>
        </div>

        {/* Storage telemetry meter */}
        {storageUsageMb !== null && (
          <div
            className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono"
            title={`Local storage & blueprint cache: ${storageUsageMb} MB used${storageQuotaMb ? ` of ${storageQuotaMb} MB quota` : ""}`}
          >
            <span>💾</span>
            <span>{storageUsageMb} MB</span>
          </div>
        )}

        {/* Battery meter (if available) */}
        {batteryLevel !== null && (
          <div
            className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              batteryLevel < 20
                ? "bg-rose-950/40 border-rose-800/60 text-rose-400 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}
            title={`Battery: ${batteryLevel}% ${isCharging ? "(Charging)" : ""}`}
          >
            <span>{isCharging ? "⚡" : "🔋"}</span>
            <span>{batteryLevel}%</span>
          </div>
        )}

        {/* Clock & UTC toggle */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setShowUtc((prev) => !prev);
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-slate-300 font-mono transition-colors cursor-pointer"
          title={`Click to toggle UTC / Local Time (${dateStr})`}
        >
          <span>🕒</span>
          <span>{timeStr || "12:00:00"}</span>
        </button>

        {/* Split Screen Workspace Mode */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onToggleSplitScreen();
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
            isSplitScreen
              ? "bg-cyan-950 border-cyan-500/70 text-cyan-300 shadow-xs shadow-cyan-500/30"
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Split-Screen Workspace (Ctrl+\)"
        >
          <span>🗂️</span>
          <span className="hidden sm:inline">Split</span>
        </button>

        {/* Outdoor Sunlight / High-Contrast Mode */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onToggleSunlightMode();
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
            isSunlightMode
              ? "bg-amber-400 border-amber-300 text-slate-950 shadow-md font-black"
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-300"
          }`}
          title="Toggle High-Contrast Outdoor Sunlight Mode for bright job sites"
        >
          <span>☀️</span>
          <span className="hidden sm:inline">{isSunlightMode ? "High-Vis" : "Sunlight"}</span>
        </button>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className={`p-1 rounded border transition-colors cursor-pointer ${
            audioActive
              ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400"
              : "bg-slate-900/60 border-slate-800/60 text-slate-600"
          }`}
          title={audioActive ? "Audio Feedback: On (Click to Mute)" : "Audio Feedback: Muted (Click to Unmute)"}
        >
          {audioActive ? "🔊" : "🔇"}
        </button>

        {/* Field Tools Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onOpenFieldTools();
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-bold transition-all cursor-pointer shadow-xs"
          title="Open Field OS Tools (Unit Converter, Hold Timer, Scratchpad)"
        >
          <span>🧰</span>
          <span className="hidden sm:inline">Tools</span>
        </button>

        {/* Keyboard Shortcuts Sheet */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onOpenShortcuts();
          }}
          className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-[10px] transition-colors cursor-pointer"
          title="View Keyboard Shortcuts (?)"
        >
          ⌨️
        </button>
      </div>
    </div>
  );
}
