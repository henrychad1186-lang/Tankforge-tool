// encoding: utf-8
"use client";

import React, { useState, useRef } from "react";
import { P } from "../lib/tab-contexts";

interface Job {
  id: string;
  name: string;
  updatedAt: string;
}

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobList: Job[];
  activeJobId: string;
  triggerToast: (msg: string) => void;
  onRestoreComplete: () => void;
}

interface BackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  jobList: Job[];
  activeJobId: string;
  records: Record<string, unknown>;
}

export default function BackupSyncModal({
  isOpen,
  onClose,
  jobList,
  activeJobId,
  triggerToast,
  onRestoreComplete,
}: BackupSyncModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [pasteJson, setPasteJson] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);

  if (!isOpen) return null;

  // Export all localStorage records scoped under UST app prefix
  const handleExportJson = () => {
    try {
      const records: Record<string, unknown> = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(P) || key.startsWith("ust-hub-"))) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              records[key] = JSON.parse(val);
            } catch {
              records[key] = val;
            }
          }
        }
      }

      const payload: BackupPayload = {
        app: "UST Field Hub",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        jobList,
        activeJobId,
        records,
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ust-hub-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      triggerToast("Backup JSON file exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      triggerToast("Failed to export backup file.");
    }
  };

  const handleCopyClipboard = () => {
    try {
      const records: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(P) || key.startsWith("ust-hub-"))) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              records[key] = JSON.parse(val);
            } catch {
              records[key] = val;
            }
          }
        }
      }

      const payload: BackupPayload = {
        app: "UST Field Hub",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        jobList,
        activeJobId,
        records,
      };

      navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
        triggerToast("Copied full backup JSON to clipboard!");
      }).catch(() => {
        triggerToast("Failed to copy to clipboard.");
      });
    } catch (err) {
      console.error(err);
      triggerToast("Failed to serialize backup.");
    }
  };

  const applyImportData = (parsed: BackupPayload) => {
    if (!parsed || parsed.app !== "UST Field Hub" || !parsed.records) {
      triggerToast("Invalid UST Hub backup file format.");
      return;
    }

    try {
      if (importMode === "replace") {
        // Clear all current UST keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith(P) || k.startsWith("ust-hub-"))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }

      // Write imported records
      Object.entries(parsed.records).forEach(([key, val]) => {
        localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
      });

      // Update or merge jobList
      if (parsed.jobList && Array.isArray(parsed.jobList)) {
        if (importMode === "merge") {
          const existingIds = new Set(jobList.map((j) => j.id));
          const combined = [...jobList];
          parsed.jobList.forEach((j) => {
            if (!existingIds.has(j.id)) {
              combined.push(j);
            }
          });
          localStorage.setItem("ust-hub-jobList", JSON.stringify(combined));
        } else {
          localStorage.setItem("ust-hub-jobList", JSON.stringify(parsed.jobList));
          if (parsed.activeJobId) {
            localStorage.setItem("ust-hub-activeJobId", JSON.stringify(parsed.activeJobId));
          }
        }
      }

      triggerToast(`Successfully restored ${Object.keys(parsed.records).length} data keys!`);
      onRestoreComplete();
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      triggerToast("Failed to write imported data to storage.");
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as BackupPayload;
        applyImportData(parsed);
      } catch (err) {
        console.error(err);
        triggerToast("Error parsing JSON backup file.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handlePasteImport = () => {
    if (!pasteJson.trim()) {
      triggerToast("Please paste valid JSON content.");
      return;
    }
    try {
      const parsed = JSON.parse(pasteJson) as BackupPayload;
      applyImportData(parsed);
    } catch (err) {
      console.error(err);
      triggerToast("Invalid JSON string. Please check formatting.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileImport}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Cloud Backup &amp; JSON Data Sync
              </h2>
              <p className="text-[11px] text-slate-400">
                Protect your job sites, excavation shots, and inspector sign-offs against device loss.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Export */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
              <span>⬇️</span>
              <span>Export Workspace Data</span>
            </h3>
            <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              {jobList.length} Job Sites Saved
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Download a portable `.json` backup file that you can store in Google Drive, iCloud, or email to the office.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleExportJson}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <span>💾</span>
              <span>Download Backup (.json)</span>
            </button>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              <span>📋</span>
              <span>Copy JSON</span>
            </button>
          </div>
        </div>

        {/* Section 2: Import */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
            <span>⬆️</span>
            <span>Import / Restore Backup</span>
          </h3>
          <p className="text-xs text-slate-400">
            Select a `.json` backup file from your device, Google Drive, or paste the backup text below.
          </p>

          {/* Merge vs Replace Mode */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
            <button
              onClick={() => setImportMode("merge")}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                importMode === "merge"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="font-black">🔀 Merge Jobs</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">Keeps current jobs &amp; adds new ones</div>
            </button>

            <button
              onClick={() => setImportMode("replace")}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                importMode === "replace"
                  ? "bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="font-black">🔄 Full Restore</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">Replaces all local data with backup</div>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <span>📂</span>
              <span>Choose Backup File (.json)</span>
            </button>

            <button
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
            >
              <span>📝 Paste</span>
            </button>
          </div>

          {showPasteArea && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <textarea
                placeholder="Paste backup JSON string here..."
                value={pasteJson}
                onChange={(e) => setPasteJson(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handlePasteImport}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Apply Pasted Data
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-[11px] text-slate-500 flex items-center gap-2 border-t border-slate-800 pt-3">
          <span>🔒</span>
          <span>
            All operations run 100% locally in your browser. No data is sent to external servers.
          </span>
        </div>
      </div>
    </div>
  );
}
