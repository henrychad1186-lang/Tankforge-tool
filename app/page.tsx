// encoding: utf-8
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { type ActiveTab, TANK_PRESETS, SAFETY_CHECKLIST_ITEMS } from "./lib/constants";
import { formatFeetInches, formatInches, formatInchesToFeetInches } from "./lib/calculations";

// Components
import HelpModal from "./components/HelpModal";
import PrintLayout from "./components/PrintLayout";
import ExcavationTab from "./components/ExcavationTab";
import DropTubeTab from "./components/DropTubeTab";
import ConcreteTab from "./components/ConcreteTab";
import ConstructionTab from "./components/ConstructionTab";
import DailyReportTab from "./components/DailyReportTab";
import PreBuryTab from "./components/PreBuryTab";
import BlueprintTab from "./components/BlueprintTab";
import AIAssistant from "./components/AIAssistant";
import JobManager from "./components/JobManager";
import BackupSyncModal from "./components/BackupSyncModal";

// Contexts & Hooks
import { usePersistedState } from "./hooks/usePersistedState";
import {
  AppStateProviders,
  useExcavation,
  useDropTube,
  useConcrete,
  useConstruction,
  useDailyReport,
  usePreBury,
  useBlueprints,
  P as P_V2,
} from "./lib/tab-contexts";

const P = "ust-hub-";

interface Job {
  id: string;
  name: string;
  updatedAt: string;
}

interface MainAppContentProps {
  jobList: Job[];
  setJobList: React.Dispatch<React.SetStateAction<Job[]>>;
  activeJobId: string;
  setActiveJobId: React.Dispatch<React.SetStateAction<string>>;
}

function MainAppContent({ jobList, setJobList, activeJobId, setActiveJobId }: MainAppContentProps) {
  const [activeTab, setActiveTab] = usePersistedState<ActiveTab>(`${P}activeTab`, "excavation");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | undefined>(undefined);

  const excavation = useExcavation();
  const dropTube = useDropTube();
  const concrete = useConcrete();
  const construction = useConstruction();
  const dailyReport = useDailyReport();
  const preBury = usePreBury();
  const blueprints = useBlueprints();

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleSelectJob = useCallback((id: string) => {
    setActiveJobId(id);
  }, [setActiveJobId]);

  const handleCreateJob = useCallback((name: string) => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
    };
    setJobList((prev) => [...prev, newJob]);
    setActiveJobId(newJob.id);
    return newJob.id;
  }, [setJobList, setActiveJobId]);

  const handleCloneJob = useCallback((sourceId: string, newName: string) => {
    const newId = `job-${Date.now()}`;
    const newJob: Job = {
      id: newId,
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    // Duplicate all scoped tab keys for the new job
    const tabKeys = ["excavation", "droptube", "concrete", "construction", "dailyreport", "prebury"];
    tabKeys.forEach((tab) => {
      const sourceKey = `${P_V2}${sourceId}-${tab}`;
      const val = localStorage.getItem(sourceKey);
      if (val !== null) {
        localStorage.setItem(`${P_V2}${newId}-${tab}`, val);
      }
    });

    setJobList((prev) => [...prev, newJob]);
    setActiveJobId(newId);
  }, [setJobList, setActiveJobId]);

  const handleDeleteJob = useCallback((id: string) => {
    // Clean up all scoped tab keys from localStorage
    const tabKeys = ["excavation", "droptube", "concrete", "construction", "dailyreport", "prebury"];
    tabKeys.forEach((tab) => {
      localStorage.removeItem(`${P_V2}${id}-${tab}`);
    });

    setJobList((prev) => prev.filter((j) => j.id !== id));
    if (activeJobId === id) {
      setActiveJobId("default-job");
    }
  }, [setJobList, activeJobId, setActiveJobId]);

  // ─── Copy Cut Sheet ──────────────────────────────────────────────────────
  const handleCopyCutSheet = useCallback(() => {
    let text = "";

    if (activeTab === "excavation") {
      const { state, transitShot, beddingDepth, excResults, slopeResults } = excavation;
      text =
        `--- UST Excavation & Laser Benchmark Cut Sheet ---\n` +
        `Input Mode: ${state.excInputMode.toUpperCase()}\n` +
        `Finish Grade (FG) Shot: ${formatFeetInches(transitShot)} (${transitShot.toFixed(2)} ft)\n` +
        `Pea Gravel Bedding Depth: ${beddingDepth.toFixed(2)} ft\n` +
        `--------------------------------------------------\n` +
        `Bottom of Tank Hole (Raw Pit, No Bedding): ${formatFeetInches(excResults.tankHoleNoBedding)} (${excResults.tankHoleNoBedding.toFixed(2)} ft) [FG + 15.5' Constant]\n` +
        `Bottom of Tank Hole (Top of Bedding): ${formatFeetInches(excResults.tankHoleWithBedding)} (${excResults.tankHoleWithBedding.toFixed(2)} ft) [FG + (15.5' - Bedding)]\n` +
        `Trenching Depth (Pipes): ${formatFeetInches(excResults.trenchDepth)} (${excResults.trenchDepth.toFixed(2)} ft) [FG + 3.0' Constant]\n` +
        `Vent Line Run: ${state.slopeRun} ft | Fall (1/8"/ft): +${slopeResults.totalSlopeFallInches.toFixed(2)}"\n` +
        `Vent High Point: ${formatFeetInches(slopeResults.slopeStartDecimal)} (${slopeResults.slopeStartDecimal.toFixed(2)} ft)\n` +
        `Vent Low Point at Tank: ${formatFeetInches(slopeResults.slopeEndDecimal)} (${slopeResults.slopeEndDecimal.toFixed(2)} ft)\n`;
    } else if (activeTab === "droptube") {
      const { state, d_tank, h_riser, dtResults } = dropTube;
      text =
        `--- OPW 71SO Overfill Drop Tube Cut Sheet ---\n` +
        `Tank Preset: ${TANK_PRESETS.find((p) => p.id === state.selectedPreset)?.name || "Custom"}\n` +
        `Tank Diameter: ${formatInches(d_tank)} (${d_tank}")\n` +
        `Riser Pipe Height: ${formatInches(h_riser)} (${h_riser}")\n` +
        `Valve Offset: +${dtResults.valveOffset}" (${state.valveType === "standard" ? "Standard OPW 71SO" : state.valveType === "testable" ? "Testable OPW 71SO-T" : "Custom Offset"})\n` +
        `Bottom Tank Clearance: ${parseFloat(state.tankClearance) || 6.0}"\n` +
        `---------------------------------------------\n` +
        `Upper Drop Tube Cut Length: ${formatInches(dtResults.upperDropTubeLength)} (${formatInchesToFeetInches(dtResults.upperDropTubeLength)})\n` +
        `Overall Drop Tube Assembly Length: ${formatInches(dtResults.overallDropTubeLength)} (${formatInchesToFeetInches(dtResults.overallDropTubeLength)})\n`;
    } else if (activeTab === "concrete") {
      const { state, concreteVolume, rebarResults, gravelResults } = concrete;
      text =
        `--- Complete Concrete Materials Estimate Cut Sheet ---\n` +
        `Shape: ${state.concreteShape.toUpperCase()}\n` +
        `Waste Buffer Added: +${state.wastePct}%\n` +
        `-----------------------------------------------------\n` +
        `Total Concrete Needed: ${concreteVolume.adjustedVolumeCy.toFixed(2)} CY (${concreteVolume.adjustedVolumeCf.toFixed(2)} CF)\n` +
        `Pre-mixed Bags (80lb): ${concreteVolume.bags80lb} bags\n` +
        `Pre-mixed Bags (60lb): ${concreteVolume.bags60lb} bags\n` +
        `Pre-mixed Bags (40lb): ${concreteVolume.bags40lb} bags\n` +
        `Ready-Mix Truck Loads: ${concreteVolume.truckLoads.toFixed(1)} Truckloads (assumes 10 CY ea)${concreteVolume.isShortLoad ? " [WARNING: Short-Load Fee May Apply]" : ""}\n` +
        `Rebar: ${state.rebarSpacing === "none" ? "None" : state.rebarSpacing + '" Grid'} (${state.rebarSize}) | ${rebarResults.totalLf.toFixed(1)} LF\n` +
        `Gravel: ${state.gravelDepth === "none" ? "None" : state.gravelDepth + '" depth'} | ${gravelResults.cy.toFixed(2)} CY\n`;
    } else if (activeTab === "construction") {
      text = `--- Construction Math Summary ---\nExported from UST Field Hub\n`;
    } else if (activeTab === "dailyreport") {
      const { state } = dailyReport;
      const weatherStr =
        state.weather.length > 0
          ? state.weather.join(", ") + (state.temperature ? ` ${state.temperature}\u00B0F` : "")
          : "Not recorded";
      const totalHrs = state.workEntries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);
      const crewNum = parseInt(state.crewSize) || 0;
      const checkedCount = SAFETY_CHECKLIST_ITEMS.filter((item) => state.safetyChecks[item.id]).length;
      text =
        `--- UST Daily Job Report ---\n` +
        `Date: ${state.reportDate}\n` +
        `Job Site: ${state.jobSiteName || "N/A"}\n` +
        `Foreman: ${state.foremanName || "N/A"}\n` +
        `Crew Size: ${state.crewSize}\n` +
        `Weather: ${weatherStr}\n` +
        `--------------------------------------------------\n` +
        `WORK LOG:\n` +
        state.workEntries
          .filter((e) => e.task.trim())
          .map((e, i) => `  ${i + 1}. ${e.task} — ${e.hours || 0} hrs${e.equipment ? ` (${e.equipment})` : ""}`)
          .join("\n") +
        "\n" +
        `Total Task Hours: ${totalHrs.toFixed(1)} | Crew-Hours: ${(totalHrs * crewNum).toFixed(1)}\n` +
        `--------------------------------------------------\n` +
        `MATERIALS RECEIVED:\n` +
        state.materialEntries
          .filter((e) => e.material.trim())
          .map((e, i) => `  ${i + 1}. ${e.material} — ${e.quantity || 0} ${e.unit}`)
          .join("\n") +
        "\n" +
        `--------------------------------------------------\n` +
        `SAFETY: ${checkedCount}/${SAFETY_CHECKLIST_ITEMS.length} items checked\n` +
        (state.reportNotes ? `NOTES: ${state.reportNotes}\n` : "");
    } else if (activeTab === "prebury") {
      const {
        state,
        checksCompleted,
        checksTotal,
        docsCompleted,
        docsTotal,
        airTestsPassed,
        airTestsTotal,
        openItemsCount,
      } = preBury;
      text =
        `--- UST Pre-Bury Inspection Submittal Cut Sheet ---\n` +
        `Site: ${state.siteName}\n` +
        `Location: ${state.location}\n` +
        `Phase: ${state.phase}\n` +
        `Scheduled Inspection: ${state.targetInspectionDate}\n` +
        `--------------------------------------------------\n` +
        `AIR TESTS: ${airTestsPassed}/${airTestsTotal} Tanks Passed (5.0 psig 60-min hold)\n` +
        state.airTests
          .map(
            (t) =>
              `  - ${t.tankName} (${(t.capacityGal || 0).toLocaleString()} gal): ${t.status.toUpperCase()} [${t.testPsig.toFixed(1)} psig / ${t.holdDurationMin} min] — ${t.notes || "OK"}`
          )
          .join("\n") +
        "\n" +
        `--------------------------------------------------\n` +
        `CHECKLISTS: ${checksCompleted}/${checksTotal} Signed Off\n` +
        `DOCS PACKAGE: ${docsCompleted}/${docsTotal} Uploaded\n` +
        `OPEN ITEMS: ${openItemsCount} need action\n`;
    } else if (activeTab === "blueprints") {
      const { state, sowCompletedItems, sowTotalItems, sowTotalEstimatedHours } = blueprints;
      text =
        `--- UST Blueprints & Scope of Work (SOW) Cut Sheet ---\n` +
        `Facility: ${state.facilityType}\n` +
        `Plan Sheets: ${state.sheets.length} uploaded\n` +
        `Progress: ${sowCompletedItems}/${sowTotalItems} Completed (${Math.round((sowCompletedItems / (sowTotalItems || 1)) * 100)}%)\n` +
        `Total Estimated Work: ${sowTotalEstimatedHours} man-hours\n` +
        `--------------------------------------------------\n` +
        state.sowItems
          .map((i) => `  [${i.status === "completed" ? "X" : i.status === "in_progress" ? "IP" : " "}] [${i.code}] ${i.title} (${i.estimatedHours || 0} hrs) — ${i.assignedContractor || "Site Crew"}`)
          .join("\n") +
        "\n";
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        triggerToast("Copied Cut Sheet to Clipboard!");
      })
      .catch(() => {
        triggerToast("Copy failed. Please copy manually.");
      });
  }, [activeTab, excavation, dropTube, concrete, dailyReport, preBury, blueprints, triggerToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleResetDefaults = useCallback(() => {
    if (activeTab === "excavation") excavation.resetState();
    else if (activeTab === "droptube") dropTube.resetState();
    else if (activeTab === "concrete") concrete.resetState();
    else if (activeTab === "construction") construction.resetState();
    else if (activeTab === "dailyreport") dailyReport.resetState();
    else if (activeTab === "prebury") preBury.resetState();
    else if (activeTab === "blueprints") blueprints.resetState();

    triggerToast("Reset tab inputs to job defaults");
  }, [activeTab, excavation, dropTube, concrete, construction, dailyReport, preBury, blueprints, triggerToast]);

  // Register PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service worker registered inside scope:", reg.scope))
        .catch((err) => console.error("Service worker registration failed:", err));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 md:py-4 md:px-6 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-cyan-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center gap-3 animate-fade-in border border-cyan-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Help & Formula Modal */}
        <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

        {/* --- Top Navigation Header & Global Toolbar --- */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                UST Field Agent &amp; Contractor Suite
              </p>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
              UST Field Hub
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
              Excavation laser benchmark (+15.5&apos; Constant), OPW drop tube builder, complete concrete calculator, &amp; site math.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <JobManager
              jobList={jobList}
              activeJobId={activeJobId}
              onSelectJob={handleSelectJob}
              onCreateJob={handleCreateJob}
              onCloneJob={handleCloneJob}
              onDeleteJob={handleDeleteJob}
              triggerToast={triggerToast}
            />

            <button
              onClick={() => {
                setAiAssistantPrompt(undefined);
                setShowAiAssistant(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-950 via-cyan-950 to-indigo-950 hover:from-indigo-900 hover:to-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/10 animate-pulse"
              title="Open UST Field AI Copilot"
            >
              <span>🤖</span>
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/10"
              title="Backup, export, or restore job sites and calculations"
            >
              <span>☁️</span>
              <span>Backup &amp; Sync</span>
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            >
              <span>📖</span>
              <span>Formulas &amp; Guide</span>
            </button>

            <button
              onClick={handleCopyCutSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/10"
            >
              <span>📋</span>
              <span>Copy Cut Sheet</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <span>🖨️</span>
              <span>Print Submittal PDF</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
              title="Reset current tab to default values"
            >
              <span>🔄</span>
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          {[
            { id: "excavation" as const, label: "Excavation & Laser", subtitle: "Pit Shots (+15.5')", color: "cyan", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
            { id: "droptube" as const, label: "OPW Drop Tube Cut", subtitle: "OPW 71SO Valve", color: "emerald", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { id: "concrete" as const, label: "Complete Concrete", subtitle: "Slabs, Deadman, Rebar", color: "amber", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h10" },
            { id: "construction" as const, label: "Construction Math", subtitle: "Triangles & Volumes", color: "indigo", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
            { id: "dailyreport" as const, label: "Daily Job Report", subtitle: "Crew, Weather, Safety", color: "rose", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
            { id: "prebury" as const, label: "Pre-Bury Inspector", subtitle: "Air Tests, Checks, Docs", color: "teal", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { id: "blueprints" as const, label: "Blueprints & Scope", subtitle: "Plans & SOW Engine", color: "violet", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center md:items-start p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300"
                  : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </div>
              <span className={`text-[9px] font-semibold mt-0.5 ${
                activeTab === tab.id ? "text-slate-900" : `text-${tab.color}-400`
              }`}>
                {tab.subtitle}
              </span>
            </button>
          ))}
        </nav>

        {/* --- TAB CONTENT --- */}
        {activeTab === "excavation" && <ExcavationTab />}
        {activeTab === "droptube" && <DropTubeTab triggerToast={triggerToast} />}
        {activeTab === "concrete" && <ConcreteTab triggerToast={triggerToast} />}
        {activeTab === "construction" && <ConstructionTab />}
        {activeTab === "dailyreport" && <DailyReportTab triggerToast={triggerToast} />}
        {activeTab === "prebury" && <PreBuryTab triggerToast={triggerToast} />}
        {activeTab === "blueprints" && (
          <BlueprintTab
            triggerToast={triggerToast}
            onOpenAiAssistant={(prompt) => {
              setAiAssistantPrompt(prompt);
              setShowAiAssistant(true);
            }}
          />
        )}

        {/* Floating AI Copilot Trigger Button */}
        <button
          onClick={() => {
            setAiAssistantPrompt(undefined);
            setShowAiAssistant(true);
          }}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 hover:from-indigo-500 hover:to-cyan-400 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 flex items-center gap-2 border border-cyan-300 cursor-pointer transition-all transform hover:scale-105"
        >
          <span className="text-base">🤖</span>
          <span className="text-xs uppercase tracking-wider">AI Copilot</span>
        </button>

        {/* AI Assistant Drawer */}
        <AIAssistant
          isOpen={showAiAssistant}
          onClose={() => setShowAiAssistant(false)}
          initialPrompt={aiAssistantPrompt}
          triggerToast={triggerToast}
        />

        {/* --- PRINT ONLY PDF SUBMITTAL CUT SHEET LAYOUT --- */}
        <PrintLayout activeTab={activeTab} />

        {/* --- BACKUP & CLOUD SYNC MODAL --- */}
        <BackupSyncModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          jobList={jobList}
          activeJobId={activeJobId}
          triggerToast={triggerToast}
          onRestoreComplete={() => {
            window.location.reload();
          }}
        />
      </div>
    </main>
  );
}

export default function Home() {
  const [jobList, setJobList] = usePersistedState<Job[]>(`${P}jobList`, [
    { id: "default-job", name: "Default Job Site", updatedAt: new Date().toISOString() },
  ]);
  const [activeJobId, setActiveJobId] = usePersistedState<string>(`${P}activeJobId`, "default-job");

  return (
    <AppStateProviders key={activeJobId} activeJobId={activeJobId}>
      <MainAppContent
        jobList={jobList}
        setJobList={setJobList}
        activeJobId={activeJobId}
        setActiveJobId={setActiveJobId}
      />
    </AppStateProviders>
  );
}
