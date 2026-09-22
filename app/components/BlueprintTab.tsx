// encoding: utf-8
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { SOW_DIVISIONS, SowDivisionId } from "../lib/constants";
import { BlueprintSheet } from "../lib/tab-types";
import { useBlueprints, useDailyReport, useExcavation, useDropTube, useConcrete } from "../lib/tab-contexts";
import { saveBlueprintFile, getBlueprintFile, deleteBlueprintFile } from "../lib/blueprint-db";

interface BlueprintTabProps {
  triggerToast?: (msg: string) => void;
  onOpenAiAssistant?: (prompt?: string) => void;
}

export default function BlueprintTab({ triggerToast, onOpenAiAssistant }: BlueprintTabProps) {
  const {
    state,
    updateState,
    addSheet,
    deleteSheet,
    setActiveSheetId,
    toggleSowItemStatus,
    addSowItem,
    deleteSowItem,
    sowTotalItems,
    sowCompletedItems,
    sowTotalEstimatedHours,
  } = useBlueprints();

  const dailyReport = useDailyReport();
  const excavation = useExcavation();
  const dropTube = useDropTube();
  const concrete = useConcrete();

  // Viewer state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeImageDataUrl, setActiveImageDataUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("all");
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);

  // New Item Form
  const [newItemDivision, setNewItemDivision] = useState<SowDivisionId>("div_01_general");
  const [newItemTitle, setNewItemTitle] = useState<string>("");
  const [newItemCode, setNewItemCode] = useState<string>("01 00 00");
  const [newItemSpec, setNewItemSpec] = useState<string>("PEI RP100");
  const [newItemDesc, setNewItemDesc] = useState<string>("");
  const [newItemQty, setNewItemQty] = useState<string>("1");
  const [newItemUnit, setNewItemUnit] = useState<string>("LS");
  const [newItemHours, setNewItemHours] = useState<string>("8");
  const [newItemSub, setNewItemSub] = useState<string>("Site Crew");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const activeSheet = useMemo(() => {
    return state.sheets.find((s) => s.id === state.activeSheetId) || state.sheets[0] || null;
  }, [state.sheets, state.activeSheetId]);

  // Load file content from IndexedDB when active sheet changes
  useEffect(() => {
    let isCancelled = false;
    if (!activeSheet) {
      setActiveImageDataUrl(null);
      return;
    }

    setLoadingFile(true);
    getBlueprintFile(activeSheet.storageKey)
      .then((fileData) => {
        if (!isCancelled && fileData) {
          setActiveImageDataUrl(fileData.dataUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to load blueprint file from IndexedDB:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingFile(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSheet]);

  // Handle File Upload (PDF, PNG, JPG)
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const sheetId = `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const storageKey = `bp-${sheetId}`;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;

          // Save large data in IndexedDB
          await saveBlueprintFile({
            storageKey,
            jobId: "current",
            sheetId,
            fileName: file.name,
            fileType: file.type,
            dataUrl,
            updatedAt: new Date().toISOString(),
          });

          // Create sheet metadata for app state
          const newSheet: BlueprintSheet = {
            id: sheetId,
            sheetNumber: `Sheet ${state.sheets.length + i + 1}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            fileType: isPdf ? "pdf" : "image",
            fileName: file.name,
            fileSizeBytes: file.size,
            uploadedAt: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            storageKey,
            thumbnailUrl: isPdf ? undefined : dataUrl.slice(0, 1000), // Small slice or omit
            notes: "Uploaded blueprint plan sheet",
          };

          addSheet(newSheet);
          setActiveSheetId(sheetId);
          triggerToast?.(`Uploaded ${file.name} to Plan Set`);
        };

        reader.readAsDataURL(file);
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [state.sheets.length, addSheet, setActiveSheetId, triggerToast]
  );

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Delete sheet
  const handleDeleteActiveSheet = async () => {
    if (!activeSheet) return;
    if (confirm(`Remove sheet "${activeSheet.name}" from this job?`)) {
      await deleteBlueprintFile(activeSheet.storageKey);
      deleteSheet(activeSheet.id);
      triggerToast?.("Sheet removed");
    }
  };

  // Add Item Submit
  const handleCreateScopeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    addSowItem({
      divisionId: newItemDivision,
      code: newItemCode,
      title: newItemTitle.trim(),
      specRef: newItemSpec.trim() || "PEI RP100",
      description: newItemDesc.trim(),
      quantity: newItemQty.trim() || "1",
      unit: newItemUnit.trim() || "LS",
      estimatedHours: parseFloat(newItemHours) || 8,
      assignedContractor: newItemSub.trim() || "UST Contractor",
      status: "not_started",
    });

    setShowAddItemModal(false);
    setNewItemTitle("");
    setNewItemDesc("");
    triggerToast?.("Added Scope of Work item");
  };

  // Send In-Progress Items to Daily Report
  const handleSendToDailyReport = () => {
    const activeTasks = state.sowItems.filter((i) => i.status === "in_progress");
    if (activeTasks.length === 0) {
      triggerToast?.("No 'In Progress' items to send. Mark tasks as In Progress first.");
      return;
    }

    const newWorkEntries = activeTasks.map((t) => ({
      id: `sow-sync-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      task: `[${t.code}] ${t.title}`,
      hours: (t.estimatedHours || 8).toString(),
      equipment: t.assignedContractor || "Site Crew",
    }));

    dailyReport.updateState({
      workEntries: [...dailyReport.state.workEntries.filter((w) => w.task.trim() !== ""), ...newWorkEntries],
    });

    triggerToast?.(`Sent ${activeTasks.length} active tasks to Daily Job Report!`);
  };

  // Sync SOW metrics to Calculations
  const handleSyncToCalculations = () => {
    // Synchronize excavation depth constant & standard tank
    excavation.updateState({
      excInputMode: "decimal",
      decTransitShot: "4.50",
      beddingDepthFt: "1.0",
      slopeRun: "40",
    });
    concrete.updateState({
      flatLength: "40",
      flatWidth: "25",
      flatThickness: "8",
      deadmanQuantity: "4",
      deadmanLength: "24",
      deadmanWidth: "18",
      deadmanHeight: "18",
      strapCount: "4",
    });
    dropTube.updateState({
      selectedPreset: "x-10k-92",
      customDiameter: "92",
      riserHeight: "36",
      valveType: "standard",
    });
    triggerToast?.("Synced SOW dimensions into Excavation, Concrete & Drop Tube tabs!");
  };

  // Copy Full SOW text to clipboard
  const handleCopySowText = () => {
    let out = `--- UST FACILITY SCOPE OF WORK (SOW) ---\n`;
    out += `Facility Type: ${state.facilityType}\n`;
    out += `Progress: ${sowCompletedItems}/${sowTotalItems} Completed (${Math.round((sowCompletedItems / (sowTotalItems || 1)) * 100)}%)\n`;
    out += `Total Estimated Hours: ${sowTotalEstimatedHours} hrs\n`;
    out += `----------------------------------------\n\n`;

    SOW_DIVISIONS.forEach((div) => {
      const divItems = state.sowItems.filter((item) => item.divisionId === div.id);
      if (divItems.length === 0) return;

      out += `=== [${div.code}] ${div.name.toUpperCase()} ===\n`;
      divItems.forEach((item, idx) => {
        const checkMark = item.status === "completed" ? "[X]" : item.status === "in_progress" ? "[IN PROGRESS]" : "[ ]";
        out += `${checkMark} ${idx + 1}. [${item.code}] ${item.title}\n`;
        out += `     Spec: ${item.specRef || "PEI RP100"} | Qty: ${item.quantity || "1"} ${item.unit || ""} | Est: ${item.estimatedHours || 0} hrs | Assignee: ${item.assignedContractor || "Site Crew"}\n`;
        out += `     Scope: ${item.description}\n`;
        if (item.notes) out += `     Field Notes: ${item.notes}\n`;
        out += `\n`;
      });
    });

    navigator.clipboard
      .writeText(out)
      .then(() => triggerToast?.("Copied Scope of Work to clipboard!"))
      .catch(() => triggerToast?.("Copy failed"));
  };

  const sowPercent = Math.round((sowCompletedItems / (sowTotalItems || 1)) * 100);

  return (
    <div className="space-y-4">
      {/* Sub-Tabs & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => updateState({ activeSubTab: "viewer" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              state.activeSubTab === "viewer"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>📐</span>
            <span>Plan Sheet Viewer</span>
            {state.sheets.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-950/40 rounded-full">
                {state.sheets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => updateState({ activeSubTab: "sow" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              state.activeSubTab === "sow"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>📋</span>
            <span>Scope of Work (SOW)</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-950/40 rounded-full font-mono">
              {sowCompletedItems}/{sowTotalItems}
            </span>
          </button>

          <button
            onClick={() => updateState({ activeSubTab: "specs" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              state.activeSubTab === "specs"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🏛️</span>
            <span>Codes &amp; Standards</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenAiAssistant && (
            <button
              onClick={() => onOpenAiAssistant("Analyze the uploaded blueprint and verify tank and piping scope")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <span>🤖</span>
              <span>Ask AI Copilot</span>
            </button>
          )}

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/10">
            <span>📤</span>
            <span>Upload Sheet</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ─── 1. PLAN SHEET VIEWER SUB-TAB ────────────────────────────────────── */}
      {state.activeSubTab === "viewer" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sheets List & Meta (Sidebar) */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Plan Set Sheets ({state.sheets.length})
                </h2>
                <span className="text-[10px] text-cyan-400 font-mono">Offline Ready</span>
              </div>

              {state.sheets.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                  <span className="text-3xl block">📑</span>
                  <p className="text-xs font-bold text-slate-300">No Sheets Uploaded</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload PDF blueprints or photo scans of civil, piping, or tank layouts.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Select Plan Files
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {state.sheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      onClick={() => setActiveSheetId(sheet.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                        activeSheet?.id === sheet.id
                          ? "bg-cyan-950/80 border-cyan-500/60 text-white"
                          : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate">
                          {sheet.sheetNumber}: {sheet.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {sheet.fileType.toUpperCase()} • {(sheet.fileSizeBytes / 1024).toFixed(0)} KB •{" "}
                          {sheet.uploadedAt}
                        </p>
                      </div>
                      <span className="text-xs">{activeSheet?.id === sheet.id ? "👁️" : "📄"}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sheet Metadata & Notes */}
              {activeSheet && (
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Sheet:</span>
                    <span className="font-bold text-slate-200">{activeSheet.name}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Field Notes on Sheet
                    </label>
                    <textarea
                      rows={2}
                      value={activeSheet.notes || ""}
                      onChange={(e) => {
                        const updated = state.sheets.map((s) =>
                          s.id === activeSheet.id ? { ...s, notes: e.target.value } : s
                        );
                        updateState({ sheets: updated });
                      }}
                      placeholder="Add benchmark notes, elevation tags, or revision comments..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex justify-between gap-2 pt-1">
                    <button
                      onClick={handleDeleteActiveSheet}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      Delete Sheet
                    </button>
                    {onOpenAiAssistant && (
                      <button
                        onClick={() =>
                          onOpenAiAssistant(
                            `Analyze blueprint sheet "${activeSheet.name}" (${activeSheet.notes || "UST Layout"}): Extract tank diameter, capacity, deadman specs, and pipe slope.`
                          )
                        }
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                      >
                        AI Analyze Sheet
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick SOW Extract Card */}
            <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <span>⚡</span>
                <span>Auto-Extract to Scope of Work</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Parse tank capacities, pit excavation depth (+15.5&apos;), deadman ballast, and vent pipe slopes directly
                into your active SOW.
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={handleSyncToCalculations}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer"
                >
                  Sync to Calcs
                </button>
                <button
                  onClick={() => updateState({ activeSubTab: "sow" })}
                  className="px-2 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-[11px] font-black transition-all text-center cursor-pointer"
                >
                  View SOW List
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Viewer Canvas (Main Panel) */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-[600px] overflow-hidden relative">
            {/* Viewer Toolbar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">
                  {activeSheet ? `${activeSheet.sheetNumber} — ${activeSheet.name}` : "Interactive Plan Canvas"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded text-cyan-400">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>

              {/* Pan & Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center font-bold text-sm cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  onClick={handleZoomIn}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center font-bold text-sm cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={handleRotate}
                  className="px-2 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  ↻ 90°
                </button>
                <button
                  onClick={handleResetView}
                  className="px-2 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold cursor-pointer"
                  title="Reset View"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div
              ref={viewerContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center bg-slate-950 p-4 select-none"
            >
              {loadingFile ? (
                <div className="text-center space-y-2">
                  <span className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-xs text-slate-400">Loading plan sheet...</p>
                </div>
              ) : activeImageDataUrl ? (
                activeSheet?.fileType === "pdf" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                    <iframe
                      src={activeImageDataUrl}
                      title="PDF Blueprint Viewer"
                      className="w-full h-full rounded border border-slate-800"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: isDragging ? "none" : "transform 0.15s ease-out",
                    }}
                    className="max-w-none origin-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImageDataUrl}
                      alt={activeSheet?.name || "Blueprint"}
                      className="max-w-full max-h-[520px] object-contain rounded shadow-2xl border border-slate-800 pointer-events-none"
                    />
                  </div>
                )
              ) : (
                /* Interactive Sample Vector Blueprint when no file is uploaded */
                <div
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: isDragging ? "none" : "transform 0.15s ease-out",
                  }}
                  className="origin-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full text-slate-200"
                >
                  <div className="border-b border-cyan-500/30 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        UST Mechanical &amp; Civil Schematic (Sample Blueprint)
                      </span>
                      <h3 className="text-sm font-black text-white">
                        Standard 2-Tank UST Pit &amp; Piping Layout (PEI RP100-20)
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono">
                      Scale: 1/4&quot; = 1&apos;-0&quot;
                    </span>
                  </div>

                  {/* SVG Blueprint Cross-Section Diagram */}
                  <svg viewBox="0 0 700 320" className="w-full h-auto bg-slate-950/80 rounded-xl border border-slate-800 p-2">
                    {/* Finish Grade Line */}
                    <line x1="20" y1="40" x2="680" y2="40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
                    <text x="30" y="32" fill="#38bdf8" fontSize="10" fontWeight="bold">
                      FINISH GRADE (FG) ELEVATION 0.00&apos; (Laser Benchmark Shot: 4.50&apos;)
                    </text>

                    {/* Pipe Trench Depth line */}
                    <line x1="20" y1="80" x2="680" y2="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="510" y="75" fill="#f59e0b" fontSize="9">
                      Trench Depth: FG + 3.0&apos; Constant
                    </text>

                    {/* Tank #1 (12,000 Gal Regular) */}
                    <rect x="80" y="110" width="220" height="120" rx="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                    <text x="140" y="170" fill="#ffffff" fontSize="12" fontWeight="bold">
                      TANK #1: 12,000 GAL
                    </text>
                    <text x="145" y="185" fill="#94a3b8" fontSize="9">
                      92&quot; Dia x 34&apos; L (Double-Wall FRP)
                    </text>

                    {/* Tank #2 (10,000 Gal Diesel) */}
                    <rect x="380" y="110" width="220" height="120" rx="60" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                    <text x="440" y="170" fill="#ffffff" fontSize="12" fontWeight="bold">
                      TANK #2: 10,000 GAL
                    </text>
                    <text x="445" y="185" fill="#94a3b8" fontSize="9">
                      92&quot; Dia x 28&apos; L (Double-Wall FRP)
                    </text>

                    {/* Deadman Anchors */}
                    <rect x="70" y="240" width="240" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                    <text x="135" y="254" fill="#f8fafc" fontSize="9" fontWeight="bold">
                      CONCRETE DEADMAN ANCHORS (2x)
                    </text>
                    <rect x="370" y="240" width="240" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                    <text x="435" y="254" fill="#f8fafc" fontSize="9" fontWeight="bold">
                      CONCRETE DEADMAN ANCHORS (2x)
                    </text>

                    {/* Bedding Pea Gravel */}
                    <rect x="30" y="270" width="640" height="25" fill="#1e293b" stroke="#475569" strokeDasharray="4 2" />
                    <text x="240" y="287" fill="#cbd5e1" fontSize="10">
                      12&quot; Pea Gravel Bedding [FG + (15.5&apos; - 1.0&apos; Bedding) = 14.5&apos;]
                    </text>

                    {/* Raw Hole Bottom */}
                    <line x1="20" y1="305" x2="680" y2="305" stroke="#ef4444" strokeWidth="2" />
                    <text x="30" y="300" fill="#ef4444" fontSize="9" fontWeight="bold">
                      RAW PIT BOTTOM: FG + 15.5&apos; CONSTANT (Rod Shot = 20.00&apos;)
                    </text>
                  </svg>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                    <p>💡 Tip: Drag to pan, use +/- or scroll wheel to zoom.</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    >
                      + Upload Custom Blueprint Image / PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. SCOPE OF WORK (SOW) SUB-TAB ──────────────────────────────────── */}
      {state.activeSubTab === "sow" && (
        <div className="space-y-4">
          {/* SOW Header & Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Automated Project Execution Plan
                </span>
                <h2 className="text-xl font-black text-white">{state.facilityType}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed CSI MasterFormat &amp; PEI RP100 division breakdown of work phases, material schedules, and
                  subcontractors.
                </p>
              </div>

              {/* SOW Presets & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSendToDailyReport}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                  title="Copy in-progress tasks directly into the Daily Job Report"
                >
                  <span>📋</span> Send to Daily Log
                </button>

                <button
                  onClick={handleCopySowText}
                  className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <span>📋</span> Copy SOW
                </button>

                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Overall Progress</span>
                <p className="text-lg font-black text-cyan-400">
                  {sowPercent}%{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({sowCompletedItems}/{sowTotalItems})
                  </span>
                </p>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Estimated Work</span>
                <p className="text-lg font-black text-white">
                  {sowTotalEstimatedHours} <span className="text-xs font-normal text-slate-400">man-hrs</span>
                </p>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Active In-Progress</span>
                <p className="text-lg font-black text-amber-400">
                  {state.sowItems.filter((i) => i.status === "in_progress").length}{" "}
                  <span className="text-xs font-normal text-slate-400">tasks</span>
                </p>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">UST Divisions</span>
                <p className="text-lg font-black text-indigo-400">
                  {SOW_DIVISIONS.length} <span className="text-xs font-normal text-slate-400">categories</span>
                </p>
              </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${sowPercent}%` }}
              />
            </div>
          </div>

          {/* Division Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDivisionFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDivisionFilter === "all"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Divisions ({state.sowItems.length})
            </button>
            {SOW_DIVISIONS.map((div) => {
              const count = state.sowItems.filter((i) => i.divisionId === div.id).length;
              return (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivisionFilter(div.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDivisionFilter === div.id
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {div.code} ({count})
                </button>
              );
            })}
          </div>

          {/* SOW Items List Grouped by Division */}
          <div className="space-y-4">
            {SOW_DIVISIONS.filter(
              (div) => selectedDivisionFilter === "all" || selectedDivisionFilter === div.id
            ).map((div) => {
              const items = state.sowItems.filter((item) => item.divisionId === div.id);
              if (items.length === 0) return null;

              const completedInDiv = items.filter((i) => i.status === "completed").length;

              return (
                <div key={div.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Division Header */}
                  <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        {div.code}
                      </span>
                      <h3 className="text-sm font-black text-white">{div.name}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {completedInDiv} of {items.length} Completed
                    </span>
                  </div>

                  {/* Tasks in Division */}
                  <div className="p-3 space-y-2.5">
                    {items.map((item) => {
                      const isCompleted = item.status === "completed";
                      const isInProgress = item.status === "in_progress";

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCompleted
                              ? "bg-emerald-950/20 border-emerald-500/30"
                              : isInProgress
                              ? "bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-500/5"
                              : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            {/* Left details */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono text-slate-400 font-bold">{item.code}</span>
                                <h4
                                  className={`text-sm font-bold ${
                                    isCompleted ? "line-through text-slate-400" : "text-white"
                                  }`}
                                >
                                  {item.title}
                                </h4>
                                {item.specRef && (
                                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-cyan-400 font-mono">
                                    {item.specRef}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                              {/* Task metadata pills */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                                {item.quantity && (
                                  <span>
                                    Qty: <strong className="text-slate-200">{item.quantity} {item.unit}</strong>
                                  </span>
                                )}
                                {item.estimatedHours && (
                                  <span>
                                    Est: <strong className="text-slate-200">{item.estimatedHours} hrs</strong>
                                  </span>
                                )}
                                {item.assignedContractor && (
                                  <span>
                                    Crew: <strong className="text-slate-200">{item.assignedContractor}</strong>
                                  </span>
                                )}
                              </div>

                              {/* Field notes */}
                              {item.notes && (
                                <div className="mt-1 text-[11px] bg-slate-950/80 p-1.5 rounded border border-slate-800/80 text-cyan-300">
                                  <strong>Field Log:</strong> {item.notes}
                                </div>
                              )}
                            </div>

                            {/* Right Status Controls */}
                            <div className="flex items-center gap-2 self-start">
                              <button
                                onClick={() => toggleSowItemStatus(item.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isCompleted
                                    ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                                    : isInProgress
                                    ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                                    : "bg-slate-800 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span>{isCompleted ? "✓ Done" : isInProgress ? "⏳ In Progress" : "○ Not Started"}</span>
                              </button>

                              <button
                                onClick={() => deleteSowItem(item.id)}
                                className="w-7 h-7 text-slate-500 hover:text-rose-400 rounded flex items-center justify-center cursor-pointer"
                                title="Delete task"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. CODES & SPECIFICATIONS SUB-TAB ───────────────────────────────── */}
      {state.activeSubTab === "specs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📘</span> PEI RP100 Recommended Practices Reference
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">§4 Excavation &amp; Shoring</p>
                <p className="text-slate-400">
                  Maintain 1.5:1 slope or trench box for excavations &gt; 5.0&apos; depth. Pea gravel bedding must be minimum 12&quot; thick, rounded, washed aggregate.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">§5 Buoyancy Safety Factor</p>
                <p className="text-slate-400">
                  Minimum hold-down safety factor must be &ge; 1.20x against buoyant uplift (Total Hold-Down / Uplift &ge; 1.20).
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">§6 Pneumatic Air Testing</p>
                <p className="text-slate-400">
                  Primary and interstitial tanks must hold 5.0 psig (+/- 0.25) for 60 minutes with soap bubble verification and zero detectable pressure loss.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">§8 Piping Fall &amp; Slope</p>
                <p className="text-slate-400">
                  Vent piping must pitch at minimum 1/8&quot; per foot (or 1/4&quot;/ft recommended) continuously downward toward the tank with no sags or traps.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏛️</span> EPA 40 CFR Part 280 &amp; NFPA 30A Standards
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">EPA §280.20 Overfill Prevention</p>
                <p className="text-slate-400">
                  Drop tube shutoff valve (OPW 71SO) must automatically stop delivery when tank is no more than 95% full or restrict flow at 90% full.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">NFPA 30A Dispensing Islands</p>
                <p className="text-slate-400">
                  Emergency disconnect (E-Stop) switches must be located within 20 to 100 feet from dispensers. Under-dispenser sumps must be sensor-monitored.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <p className="font-bold text-white mb-0.5">NFPA 70 Class I, Div 1 &amp; 2 Electrical</p>
                <p className="text-slate-400">
                  All electrical conduit within 18 inches of tank bungs or dispenser sumps must have explosion-proof seal-off fittings poured with compound.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD ITEM MODAL ─────────────────────────────────────────────────── */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Add Scope of Work Task</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScopeItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Division</label>
                <select
                  value={newItemDivision}
                  onChange={(e) => setNewItemDivision(e.target.value as SowDivisionId)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {SOW_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      [{div.code}] {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">CSI Code</label>
                  <input
                    type="text"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    placeholder="e.g. 33 56 13"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Code / Spec Reference</label>
                  <input
                    type="text"
                    value={newItemSpec}
                    onChange={(e) => setNewItemSpec(e.target.value)}
                    placeholder="e.g. PEI RP100 §5.3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. Install Interstitial Leak Detection Probes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Detailed work requirements, equipment, and tolerances..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Quantity</label>
                  <input
                    type="text"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newItemHours}
                    onChange={(e) => setNewItemHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Assigned Sub / Crew</label>
                <input
                  type="text"
                  value={newItemSub}
                  onChange={(e) => setNewItemSub(e.target.value)}
                  placeholder="e.g. Electrical Contractor / UST Installer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-black cursor-pointer"
                >
                  Add to SOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
