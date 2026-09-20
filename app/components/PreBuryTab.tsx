// encoding: utf-8
"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { usePreBury } from "../lib/tab-contexts";
import {
  PREBURY_CHECKLIST_GROUPS,
  PREBURY_DOC_ITEMS,
  PREBURY_PRECHECK_ITEMS,
  PreBuryDocStatus,
  AirTestStatus,
} from "../lib/constants";
import {
  PreBurySubTab,
  PreBuryPhoto,
  PreBurySignOff,
  DEFAULT_PREBURY_SIGNOFF,
} from "../lib/tab-types";
import PhotoGallery from "./PhotoGallery";
import SignaturePad from "./SignaturePad";

interface PreBuryTabProps {
  triggerToast?: (msg: string) => void;
}

function PreBuryTabComponent({ triggerToast }: PreBuryTabProps) {
  const {
    state,
    updateState,
    toggleCheck,
    setDocStatus,
    togglePrecheck,
    addAirTest,
    updateAirTest,
    deleteAirTest,
    addPhoto,
    deletePhoto,
    updatePhotoCaption,
    setSignOff,
    clearSignOff,
    checksCompleted,
    checksTotal,
    docsCompleted,
    docsTotal,
    airTestsPassed,
    airTestsTotal,
    openItemsCount,
  } = usePreBury();

  // Bulletproof fallbacks against stale HMR closures
  const safeSetSignOff = useCallback(
    (signOffUpdates: Partial<PreBurySignOff>) => {
      if (typeof setSignOff === "function") {
        setSignOff(signOffUpdates);
      } else {
        updateState({
          signOff: {
            ...(state.signOff || DEFAULT_PREBURY_SIGNOFF),
            ...signOffUpdates,
            signedAt: signOffUpdates.signedAt || new Date().toLocaleString("en-US"),
          },
        });
      }
    },
    [setSignOff, updateState, state.signOff]
  );

  const safeClearSignOff = useCallback(() => {
    if (typeof clearSignOff === "function") {
      clearSignOff();
    } else {
      updateState({
        signOff: DEFAULT_PREBURY_SIGNOFF,
      });
    }
  }, [clearSignOff, updateState]);

  const safeAddPhoto = useCallback(
    (photo: Omit<PreBuryPhoto, "id" | "timestamp">) => {
      if (typeof addPhoto === "function") {
        addPhoto(photo);
      } else {
        const newPhoto: PreBuryPhoto = {
          ...photo,
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        };
        updateState({
          photos: [...(state.photos || []), newPhoto],
        });
      }
    },
    [addPhoto, updateState, state.photos]
  );

  const safeDeletePhoto = useCallback(
    (id: string) => {
      if (typeof deletePhoto === "function") {
        deletePhoto(id);
      } else {
        updateState({
          photos: (state.photos || []).filter((p) => p.id !== id),
        });
      }
    },
    [deletePhoto, updateState, state.photos]
  );

  const safeUpdatePhotoCaption = useCallback(
    (id: string, caption: string) => {
      if (typeof updatePhotoCaption === "function") {
        updatePhotoCaption(id, caption);
      } else {
        updateState({
          photos: (state.photos || []).map((p) => (p.id === id ? { ...p, caption } : p)),
        });
      }
    },
    [updatePhotoCaption, updateState, state.photos]
  );

  const [activeSubTab, setActiveSubTab] = useState<PreBurySubTab>(state.activeSubTab || "overview");
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [newTankName, setNewTankName] = useState("Tank #5");
  const [newTankCapacity, setNewTankCapacity] = useState("10000");
  const [newTestPsig, setNewTestPsig] = useState("5.0");
  const [newHoldMin, setNewHoldMin] = useState("60");

  // Timer interval for active air test
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        updateState({ timerElapsedSec: state.timerElapsedSec + 1 });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isTimerRunning, state.timerElapsedSec, updateState]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Overall Completion Percentage
  const overallPct = useMemo(() => {
    const totalItems = checksTotal + docsTotal + (airTestsTotal || 1);
    const completedItems = checksCompleted + docsCompleted + airTestsPassed;
    return Math.min(100, Math.round((completedItems / totalItems) * 100));
  }, [checksTotal, docsTotal, airTestsTotal, checksCompleted, docsCompleted, airTestsPassed]);

  const handleCreateAirTest = (e: React.FormEvent) => {
    e.preventDefault();
    addAirTest({
      tankName: newTankName.trim() || `Tank #${airTestsTotal + 1}`,
      capacityGal: parseFloat(newTankCapacity) || 10000,
      testPsig: parseFloat(newTestPsig) || 5.0,
      holdDurationMin: parseInt(newHoldMin) || 60,
      status: "in_progress",
      notes: `Started test at ${newTestPsig} psig`,
    });
    setShowNewTestModal(false);
    triggerToast?.(`Added air test for ${newTankName}`);
  };

  return (
    <div className="space-y-4">
      {/* ── Sub-Navigation Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "overview" as const, label: "Overview", icon: "📊" },
            { id: "checks" as const, label: `Checklists (${checksCompleted}/${checksTotal})`, icon: "☑️" },
            { id: "tests" as const, label: `Air Tests (${airTestsPassed}/${airTestsTotal})`, icon: "⏱️" },
            { id: "docs" as const, label: `Docs (${docsCompleted}/${docsTotal})`, icon: "📑" },
            { id: "precheck" as const, label: "Pre-Check Walk", icon: "📋" },
            { id: "photos" as const, label: `Photos (${(state.photos || []).length})`, icon: "📷" },
            { id: "signoff" as const, label: state.signOff?.isApproved ? "Signed Off ✓" : "Sign-Off", icon: "✍️" },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setActiveSubTab(sub.id);
                updateState({ activeSubTab: sub.id });
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === sub.id
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider font-mono">
            {state.phase}
          </span>
        </div>
      </div>

      {/* ── SUB-TAB 1: OVERVIEW ── */}
      {activeSubTab === "overview" && (
        <div className="space-y-4 animate-fade-in">
          {/* Active Project Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-teal-950/90 via-slate-900 to-slate-950 border border-teal-500/40 rounded-3xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-500/30">
                  Pre-Bury Inspection Status
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-2">
                  {state.siteName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{state.location}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-black text-white font-mono">{overallPct}%</div>
                  <div className="text-[11px] text-teal-300 font-semibold">{state.phase}</div>
                </div>
                <div className="w-14 h-14 relative flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800 stroke-current"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-teal-400 stroke-current transition-all duration-700"
                      strokeDasharray={`${overallPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white font-mono">
                    {overallPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Quick Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Air Tests Hold
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {airTestsPassed}/{airTestsTotal}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tanks passed 60-min hold</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Docs Package
              </div>
              <div className="text-2xl font-black text-teal-400 font-mono mt-1">
                {docsCompleted}/{docsTotal}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Required items ready</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Open Items
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {openItemsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Require field action</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Inspection Date
              </div>
              <div className="text-lg font-black text-white font-mono mt-1 truncate">
                {state.targetInspectionDate}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Scheduled appointment</div>
            </div>
          </div>

          {/* Priority Actions & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Priority Actions */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ⚠️ Priority Action Items
                </h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Inspection Blockers
                </span>
              </div>

              <div className="space-y-2">
                {state.airTests.some((t) => t.status === "failed") && (
                  <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1.5 shrink-0 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-red-200">
                        Tank Retest Required
                      </div>
                      <div className="text-[11px] text-red-400/80">
                        {state.airTests.find((t) => t.status === "failed")?.notes ||
                          "Air pressure loss detected. Soap fittings and re-pressurize."}
                      </div>
                    </div>
                  </div>
                )}

                {state.docs.doc_asbuilt === "missing" && (
                  <div className="flex items-start gap-3 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-200">
                        Missing As-Built Site Sketch
                      </div>
                      <div className="text-[11px] text-amber-400/80">
                        Field dimensioned sketch with pipe runs and laser transit benchmark needed.
                      </div>
                    </div>
                  </div>
                )}

                {state.docs.doc_backfill_cert === "missing" && (
                  <div className="flex items-start gap-3 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-200">
                        Backfill Gradation Certification Pending
                      </div>
                      <div className="text-[11px] text-amber-400/80">
                        Sieve analysis report for rounded pea gravel bedding required by inspector.
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-teal-950/30 border border-teal-500/30 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-teal-200">
                      Confirm Fire Marshal Appointment
                    </div>
                    <div className="text-[11px] text-teal-400/80">
                      Verify inspector on-site window for {state.targetInspectionDate}.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Navigation */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ⚡ Field Actions &amp; Navigation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveSubTab("tests")}
                  className="flex items-center gap-2 p-3 bg-slate-950 border border-teal-500/30 hover:border-teal-500 text-left rounded-xl transition-all cursor-pointer group"
                >
                  <span className="text-xl">⏱️</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-400">
                      Open Air Test Gauge
                    </div>
                    <div className="text-[10px] text-slate-400">5.0 psig timer &amp; hold log</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSubTab("checks")}
                  className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 hover:border-teal-500 text-left rounded-xl transition-all cursor-pointer group"
                >
                  <span className="text-xl">☑️</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-400">
                      Inspect All Systems
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {checksCompleted}/{checksTotal} items checked
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSubTab("docs")}
                  className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 hover:border-teal-500 text-left rounded-xl transition-all cursor-pointer group"
                >
                  <span className="text-xl">📑</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-400">
                      Document Package
                    </div>
                    <div className="text-[10px] text-slate-400">Permits &amp; test certs</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSubTab("precheck")}
                  className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 hover:border-teal-500 text-left rounded-xl transition-all cursor-pointer group"
                >
                  <span className="text-xl">📋</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-400">
                      Pre-Check Walk
                    </div>
                    <div className="text-[10px] text-slate-400">8-point day-before walk</div>
                  </div>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Tank: {state.airTests.find((t) => t.id === state.activeAirTestId)?.tankName || "None"}</span>
                <span className="font-mono text-teal-400">Hold: 5.0 psig</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: CHECKLISTS ── */}
      {activeSubTab === "checks" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Pre-Bury Inspection Checklists</h2>
              <p className="text-xs text-slate-400">
                Verify all mechanical, piping, and tank criteria before pouring backfill bedding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-xl">
                Total: {checksCompleted} / {checksTotal} Signed Off
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {PREBURY_CHECKLIST_GROUPS.map((group) => {
              const groupCompleted = group.items.filter((item) => state.checks[item.id]).length;
              const isGroupComplete = groupCompleted === group.items.length;

              return (
                <div
                  key={group.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border-b border-slate-800/80">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{isGroupComplete ? "🟢" : "🔘"}</span>
                      <span>{group.title}</span>
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isGroupComplete
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {groupCompleted} / {group.items.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50 p-1">
                    {group.items.map((item) => {
                      const isChecked = !!state.checks[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            toggleCheck(item.id);
                            triggerToast?.(isChecked ? "Item unchecked" : "Item verified!");
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-slate-800/40 rounded-xl cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-teal-500 border-teal-400 text-slate-950"
                                : "border-slate-700 bg-slate-950 text-transparent"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span
                            className={`text-xs flex-1 transition-all ${
                              isChecked ? "text-slate-400 line-through font-medium" : "text-slate-200 font-semibold"
                            }`}
                          >
                            {item.label}
                          </span>
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

      {/* ── SUB-TAB 3: AIR TESTS ── */}
      {activeSubTab === "tests" && (
        <div className="space-y-4 animate-fade-in">
          {/* Pressure Gauge Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Live Pressure Gauge Dial */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-teal-500/40 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="relative w-44 h-44 my-2">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-teal-400 transition-all duration-700"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * (state.gaugePsig / 10))}
                    fill="none"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono tracking-tight">
                    {state.gaugePsig.toFixed(1)}
                  </span>
                  <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">
                    psig
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Holding Steady (Zero Drop)</span>
              </div>

              <div className="mt-4 text-xs text-slate-400 font-mono">
                {state.airTests.find((t) => t.id === state.activeAirTestId)?.tankName || "Tank #3"} —{" "}
                <span className="text-white font-bold">{formatTimer(state.timerElapsedSec)}</span> elapsed of{" "}
                {state.timerTotalSec / 60}:00 min hold
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => updateState({ isTimerRunning: !state.isTimerRunning })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    state.isTimerRunning
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "bg-teal-500 text-slate-950 hover:bg-teal-400"
                  }`}
                >
                  {state.isTimerRunning ? "⏸️ Pause Timer" : "▶️ Start Hold Timer"}
                </button>
                <button
                  onClick={() => updateState({ timerElapsedSec: 0, isTimerRunning: false })}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            {/* Air Test History & Actions */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Field Air Test Log
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standard EPA/PEI 5 psig 60-minute holding test with soap test verifications.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewTestModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <span>➕</span>
                    <span>New Test</span>
                  </button>
                </div>

                {/* Table of Tanks */}
                <div className="divide-y divide-slate-800/80 mt-2">
                  {state.airTests.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{t.tankName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {(t.capacityGal || 0).toLocaleString()} gal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.notes}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={t.status}
                          onChange={(e) => updateAirTest(t.id, { status: e.target.value as AirTestStatus })}
                          className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border cursor-pointer ${
                            t.status === "passed"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                              : t.status === "in_progress"
                              ? "bg-teal-950/80 text-teal-300 border-teal-500/40"
                              : t.status === "failed"
                              ? "bg-red-950/80 text-red-300 border-red-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <option value="passed">✓ Passed</option>
                          <option value="in_progress">● In Progress</option>
                          <option value="failed">✗ Failed</option>
                          <option value="pending">○ Pending</option>
                        </select>

                        <button
                          onClick={() => deleteAirTest(t.id)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Delete test log"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Modal for New Air Test */}
              {showNewTestModal && (
                <form
                  onSubmit={handleCreateAirTest}
                  className="bg-slate-950 border border-teal-500/40 rounded-2xl p-4 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Add New Tank Air Test
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNewTestModal(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Tank ID / Name</label>
                      <input
                        type="text"
                        value={newTankName}
                        onChange={(e) => setNewTankName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Capacity (Gallons)</label>
                      <input
                        type="number"
                        value={newTankCapacity}
                        onChange={(e) => setNewTankCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Test Pressure (psig)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTestPsig}
                        onChange={(e) => setNewTestPsig(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Hold Duration (Min)</label>
                      <input
                        type="number"
                        value={newHoldMin}
                        onChange={(e) => setNewHoldMin(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Save &amp; Start Air Test
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: DOCS TRACKER ── */}
      {activeSubTab === "docs" && (
        <div className="space-y-4 animate-fade-in">
          {/* Docs Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-400 stroke-current transition-all duration-700"
                    strokeDasharray={`${Math.round((docsCompleted / docsTotal) * 100)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-white">
                  {docsCompleted}/{docsTotal}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Submittal Documentation Package</h3>
                <p className="text-xs text-slate-400">
                  {docsTotal - docsCompleted} items still needed before the inspector arrives on-site.
                </p>
              </div>
            </div>
          </div>

          {/* Document Items List */}
          <div className="space-y-2">
            {PREBURY_DOC_ITEMS.map((doc) => {
              const currentStatus = state.docs[doc.id] || doc.defaultStatus;

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">
                      {currentStatus === "uploaded" ? "📄" : currentStatus === "pending" ? "⏳" : "❌"}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">{doc.name}</div>
                      <div className="text-xs text-slate-400">{doc.description}</div>
                      {doc.dateOrNote && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Note: {doc.dateOrNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {(["uploaded", "pending", "missing"] as PreBuryDocStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setDocStatus(doc.id, status);
                          triggerToast?.(`Updated status for ${doc.name}`);
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          currentStatus === status
                            ? status === "uploaded"
                              ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm"
                              : status === "pending"
                              ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                              : "bg-red-500 text-white font-extrabold shadow-sm"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 5: PRE-CHECK PROTOCOL ── */}
      {activeSubTab === "precheck" && (
        <div className="space-y-4 animate-fade-in">
          {/* Inspection Countdown Banner */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 text-center shadow-lg">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Inspection Readiness Countdown
            </div>
            <div className="text-3xl md:text-4xl font-black text-white font-mono mt-1">
              3 Days Out
            </div>
            <div className="text-xs text-amber-200/80 mt-1 font-medium">
              Target Inspection: {state.targetInspectionDate}
            </div>
          </div>

          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Day-Before Inspection Walk Protocol
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {Object.values(state.precheck).filter(Boolean).length} / {PREBURY_PRECHECK_ITEMS.length} steps verified
            </span>
          </div>

          <div className="space-y-2">
            {PREBURY_PRECHECK_ITEMS.map((item, index) => {
              const isDone = !!state.precheck[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    togglePrecheck(item.id);
                    triggerToast?.(isDone ? "Step reset" : "Step verified!");
                  }}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDone
                      ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                      : "bg-slate-900/90 border-slate-800 text-white hover:border-teal-500/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black transition-all ${
                      isDone
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium flex-1 ${
                      isDone ? "line-through text-slate-500" : "text-slate-200"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.id === "pc_8" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSubTab("photos");
                        updateState({ activeSubTab: "photos" });
                      }}
                      className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      📸 Photos ({(state.photos || []).length})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 6: PHOTO EVIDENCE ── */}
      {activeSubTab === "photos" && (
        <PhotoGallery
          photos={state.photos || []}
          onAddPhoto={safeAddPhoto}
          onDeletePhoto={safeDeletePhoto}
          onUpdateCaption={safeUpdatePhotoCaption}
          triggerToast={triggerToast}
        />
      )}

      {/* ── SUB-TAB 7: CERTIFIED INSPECTOR SIGN-OFF ── */}
      {activeSubTab === "signoff" && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-950 border border-teal-500/40 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h2 className="text-base md:text-lg font-black uppercase text-white">
                  Certified Pre-Bury Inspection Sign-Off &amp; Authorization
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official contractor &amp; municipal inspector sign-off authorizing backfill of the tank excavation pit per PEI RP100 and EPA 40 CFR 280 standards.
              </p>
            </div>

            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Authorization Status</span>
              <span className={`text-sm font-black uppercase font-mono ${
                state.signOff?.isApproved ? "text-emerald-400" : "text-amber-400"
              }`}>
                {state.signOff?.isApproved ? "✓ Backfill Approved" : "Pending Signature"}
              </span>
            </div>
          </div>

          {/* Inspector Details Form */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <span>📋</span>
              <span>Inspector / Certified Installer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Inspector / Agent Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe, P.E."
                  value={state.signOff?.inspectorName || ""}
                  onChange={(e) => safeSetSignOff({ inspectorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Agency / Municipal Dept
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Dept of Env Protection / City Fire"
                  value={state.signOff?.agencyOrCompany || ""}
                  onChange={(e) => safeSetSignOff({ agencyOrCompany: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Certification / License #
                </label>
                <input
                  type="text"
                  placeholder="e.g. UST-CERT-94021"
                  value={state.signOff?.certificationNumber || ""}
                  onChange={(e) => safeSetSignOff({ certificationNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Sign-off Date &amp; Time
                </label>
                <input
                  type="text"
                  value={state.signOff?.signedAt || ""}
                  onChange={(e) => safeSetSignOff({ signedAt: e.target.value })}
                  placeholder="e.g. Sep 18, 2026, 2:15 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            {/* Approval Radio / Disposition */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                Inspection Finding &amp; Backfill Disposition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => safeSetSignOff({ isApproved: true })}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    state.signOff?.isApproved
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-xs">✓ Approved for Backfill</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Air hold passed, piping tightness verified</div>
                </button>

                <button
                  type="button"
                  onClick={() => safeSetSignOff({ isApproved: false })}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    !state.signOff?.isApproved
                      ? "bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-xs">⚠️ Conditional / Pending</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Requires minor checklist or doc correction</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    safeSetSignOff({ isApproved: false, inspectorNotes: "FAILED: Retest required before backfill." });
                    triggerToast?.("Marked as re-inspection required");
                  }}
                  className="p-3 rounded-2xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-left cursor-pointer"
                >
                  <div className="font-bold text-xs">✕ Reject / Retest</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Pressure loss or installation deficiency</div>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Inspector Comments &amp; Observations
              </label>
              <textarea
                rows={2}
                placeholder="Notes on tank bedding depth, deflection, turnbuckle torque, soap test on fittings..."
                value={state.signOff?.inspectorNotes || ""}
                onChange={(e) => safeSetSignOff({ inspectorNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Touch Signature Pad */}
            <div className="pt-2">
              <SignaturePad
                initialDataUrl={state.signOff?.signatureDataUrl}
                signerName={state.signOff?.inspectorName || "Inspector"}
                onSave={(dataUrl) => {
                  safeSetSignOff({
                    signatureDataUrl: dataUrl,
                    isApproved: true,
                    signedAt: state.signOff?.signedAt || new Date().toLocaleString("en-US"),
                  });
                  triggerToast?.("Inspector signature recorded!");
                }}
                onClear={() => {
                  safeClearSignOff();
                  triggerToast?.("Signature cleared");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PreBuryTabComponent);
