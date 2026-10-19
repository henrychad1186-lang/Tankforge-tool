// encoding: utf-8
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { type ActiveTab, TANK_PRESETS, SAFETY_CHECKLIST_ITEMS } from "./lib/constants";
import { formatFeetInches, formatInches, formatInchesToFeetInches } from "./lib/calculations";
import { playClickSound, playSuccessChime } from "./lib/soundEffects";

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
import OSStatusBar from "./components/OSStatusBar";
import CommandPalette from "./components/CommandPalette";
import FieldToolsDrawer from "./components/FieldToolsDrawer";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";

// Contexts & Hooks
import { usePersistedState, useUnsavedStorageCount, discardUnsaved } from "./hooks/usePersistedState";
import { copyJobPhotos, deleteJobPhotos } from "./lib/photo-db";
import { copyBlueprintFile, deleteBlueprintFiles } from "./lib/blueprint-db";
import type { BlueprintState } from "./lib/tab-types";
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

/** Per-job localStorage tab keys (`ust-hub-v2-<jobId>-<tab>`) */
const JOB_TAB_KEYS = ["excavation", "droptube", "concrete", "construction", "dailyreport", "prebury", "blueprints"];

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

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
  const [secondaryTab, setSecondaryTab] = usePersistedState<ActiveTab>(`${P}secondaryTab`, "blueprints");
  const [isSplitScreen, setIsSplitScreen] = usePersistedState<boolean>(`${P}isSplitScreen`, false);
  const [isSunlightMode, setIsSunlightMode] = usePersistedState<boolean>(`${P}isSunlightMode`, false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const unsavedStorageCount = useUnsavedStorageCount();
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | undefined>(undefined);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showFieldTools, setShowFieldTools] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  const excavation = useExcavation();
  const dropTube = useDropTube();
  const concrete = useConcrete();
  const construction = useConstruction();
  const dailyReport = useDailyReport();
  const preBury = usePreBury();
  const blueprints = useBlueprints();

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
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

  const handleCloneJob = useCallback(async (sourceId: string, newName: string) => {
    const newId = `job-${Date.now()}`;
    const newJob: Job = {
      id: newId,
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    // Duplicate all scoped tab keys for the new job
    JOB_TAB_KEYS.forEach((tab) => {
      const sourceKey = `${P_V2}${sourceId}-${tab}`;
      const val = localStorage.getItem(sourceKey);
      if (val !== null) {
        localStorage.setItem(`${P_V2}${newId}-${tab}`, val);
      }
    });
    // Copy photo image data before switching so the new job's gallery loads complete
    await copyJobPhotos(sourceId, newId).catch(() => {});

    // Give the copy its own blueprint files, so deleting a sheet in one job can't remove it from the other
    const bpKey = `${P_V2}${newId}-blueprints`;
    const bpState = readJson<BlueprintState>(bpKey);
    if (bpState?.sheets?.length) {
      const sheets = await Promise.all(
        bpState.sheets.map(async (sheet) => {
          const newKey = `bp-${newId}-${sheet.id}`;
          const copied = await copyBlueprintFile(sheet.storageKey, newKey, newId).catch(() => false);
          return copied ? { ...sheet, storageKey: newKey } : sheet;
        })
      );
      try {
        localStorage.setItem(bpKey, JSON.stringify({ ...bpState, sheets }));
      } catch {
        // Storage full — the copy keeps the source's file keys
      }
    }

    setJobList((prev) => [...prev, newJob]);
    setActiveJobId(newId);
  }, [setJobList, setActiveJobId]);

  const handleDeleteJob = useCallback((id: string) => {
    // Remove the job's blueprint files, then all scoped tab keys from localStorage
    const bpSheets = readJson<BlueprintState>(`${P_V2}${id}-blueprints`)?.sheets ?? [];
    deleteBlueprintFiles(bpSheets.map((s) => s.storageKey)).catch(() => {});
    JOB_TAB_KEYS.forEach((tab) => {
      localStorage.removeItem(`${P_V2}${id}-${tab}`);
      discardUnsaved(`${P_V2}${id}-${tab}`);
    });
    deleteJobPhotos(id).catch(() => {});

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
        `Tank OD: ${formatFeetInches(excavation.tankDiameterFt)} | Cover (FG to Tank Top): ${formatFeetInches(excavation.coverFt)}\n` +
        `Pea Gravel Bedding Depth: ${beddingDepth.toFixed(2)} ft\n` +
        `--------------------------------------------------\n` +
        `Top of Tank: ${formatFeetInches(excResults.tankTopReading)} (${excResults.tankTopReading.toFixed(2)} ft) [FG + Cover]\n` +
        `Bottom of Tank Hole (Raw Pit, No Bedding): ${formatFeetInches(excResults.tankHoleNoBedding)} (${excResults.tankHoleNoBedding.toFixed(2)} ft) [FG + ${excResults.pitDepthBelowFg.toFixed(2)}' = Cover + OD + Bedding]\n` +
        `Bottom of Tank Hole (Top of Bedding): ${formatFeetInches(excResults.tankHoleWithBedding)} (${excResults.tankHoleWithBedding.toFixed(2)} ft) [FG + ${excResults.bedTopBelowFg.toFixed(2)}' = Cover + OD]\n` +
        `Trenching Depth (Pipes): ${formatFeetInches(excResults.trenchDepth)} (${excResults.trenchDepth.toFixed(2)} ft) [FG + ${excResults.trenchBelowFg.toFixed(2)}' = Pipe Cover + OD + Bedding]\n` +
        `Vent Line Run: ${state.slopeRun} ft | Fall (1/8"/ft): +${slopeResults.totalSlopeFallInches.toFixed(2)}"\n` +
        `Vent High Point: ${formatFeetInches(slopeResults.slopeStartDecimal)} (${slopeResults.slopeStartDecimal.toFixed(2)} ft)\n` +
        `Vent Low Point at Tank: ${formatFeetInches(slopeResults.slopeEndDecimal)} (${slopeResults.slopeEndDecimal.toFixed(2)} ft)\n` +
        (excavation.sumpEntry.entryCenterReading !== null && excavation.sumpEntry.offsetIn !== null
          ? `Sump Entry Centerline: ${excavation.sumpEntry.entryCenterReading.toFixed(2)} ft | Pipe Centerline at Tank: ${excavation.sumpEntry.pipeCenterAtTank.toFixed(2)} ft | Offset: ${excavation.sumpEntry.offsetIn > 0 ? "+" : ""}${excavation.sumpEntry.offsetIn.toFixed(1)}" (${excavation.sumpEntry.status.toUpperCase()})\n`
          : "");
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
        playSuccessChime();
        triggerToast("Copied Cut Sheet to Clipboard!");
      })
      .catch(() => {
        triggerToast("Copy failed. Please copy manually.");
      });
  }, [activeTab, excavation, dropTube, concrete, dailyReport, preBury, blueprints, triggerToast]);

  const handlePrint = useCallback(() => {
    playClickSound();
    window.print();
  }, []);

  const handleResetDefaults = useCallback(() => {
    playClickSound();
    if (activeTab === "excavation") excavation.resetState();
    else if (activeTab === "droptube") dropTube.resetState();
    else if (activeTab === "concrete") concrete.resetState();
    else if (activeTab === "construction") construction.resetState();
    else if (activeTab === "dailyreport") dailyReport.resetState();
    else if (activeTab === "prebury") preBury.resetState();
    else if (activeTab === "blueprints") blueprints.resetState();

    triggerToast("Reset tab inputs to job defaults");
  }, [activeTab, excavation, dropTube, concrete, construction, dailyReport, preBury, blueprints, triggerToast]);

  const handleSelectTankPreset = useCallback(
    (presetId: string) => {
      const preset = TANK_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        dropTube.updateState({
          selectedPreset: preset.id,
          customDiameter: preset.diameter,
        });
        triggerToast(`Tank Preset Applied: ${preset.name}`);
      }
    },
    [dropTube, triggerToast]
  );

  const handleAppendScratchpadToReport = useCallback(
    (memo: string) => {
      const currentNotes = dailyReport.state.reportNotes;
      dailyReport.updateState({
        reportNotes: currentNotes ? `${currentNotes}\n\n[Field Scratchpad]:\n${memo}` : `[Field Scratchpad]:\n${memo}`,
      });
    },
    [dailyReport]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setShowFieldTools(false);
        setShowShortcutsModal(false);
        setShowHelpModal(false);
        setShowBackupModal(false);
        setShowAiAssistant(false);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        playClickSound();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        playClickSound();
        setIsSplitScreen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        playClickSound();
        setShowAiAssistant((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCopyCutSheet();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        playClickSound();
        setShowBackupModal(true);
        return;
      }

      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        playClickSound();
        setShowShortcutsModal(true);
        return;
      }

      // Number keys 1-7 for tabs
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabMap: Record<string, ActiveTab> = {
          "1": "excavation",
          "2": "droptube",
          "3": "concrete",
          "4": "construction",
          "5": "dailyreport",
          "6": "prebury",
          "7": "blueprints",
        };
        if (tabMap[e.key]) {
          e.preventDefault();
          playClickSound();
          setActiveTab(tabMap[e.key]);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleCopyCutSheet, setActiveTab, setIsSplitScreen]);

  // Register PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service worker registered inside scope:", reg.scope))
        .catch((err) => console.error("Service worker registration failed:", err));
    }
  }, []);

  const activeJob = jobList.find((j) => j.id === activeJobId);

  // Tab Renderer Helper
  const renderTabContent = (tab: ActiveTab) => {
    if (tab === "excavation") return <ExcavationTab />;
    if (tab === "droptube") return <DropTubeTab triggerToast={triggerToast} />;
    if (tab === "concrete") return <ConcreteTab triggerToast={triggerToast} />;
    if (tab === "construction") return <ConstructionTab />;
    if (tab === "dailyreport") return <DailyReportTab triggerToast={triggerToast} />;
    if (tab === "prebury") return <PreBuryTab triggerToast={triggerToast} />;
    if (tab === "blueprints") {
      return (
        <BlueprintTab
          triggerToast={triggerToast}
          onOpenAiAssistant={(prompt) => {
            setAiAssistantPrompt(prompt);
            setShowAiAssistant(true);
          }}
        />
      );
    }
    return null;
  };

  const tabListConfig = [
    { id: "excavation" as const, keyNum: "1", label: "Excavation & Laser", subtitle: "Pit Shots (Cover + OD)", color: "cyan", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
    { id: "droptube" as const, keyNum: "2", label: "OPW Drop Tube Cut", subtitle: "OPW 71SO Valve", color: "emerald", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: "concrete" as const, keyNum: "3", label: "Complete Concrete", subtitle: "Slabs, Deadman, Rebar", color: "amber", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h10" },
    { id: "construction" as const, keyNum: "4", label: "Construction Math", subtitle: "Triangles & Volumes", color: "indigo", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { id: "dailyreport" as const, keyNum: "5", label: "Daily Job Report", subtitle: "Crew, Weather, Safety", color: "rose", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { id: "prebury" as const, keyNum: "6", label: "Pre-Bury Inspector", subtitle: "Air Tests, Checks, Docs", color: "teal", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "blueprints" as const, keyNum: "7", label: "Blueprints & Scope", subtitle: "Plans & SOW Engine", color: "violet", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isSunlightMode ? "sunlight-mode" : ""}`}>
      {/* ─── OS STATUS BAR & DOCK ────────────────────────────────────────── */}
      <OSStatusBar
        activeJobName={activeJob?.name || "Default Job Site"}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onToggleSplitScreen={() => setIsSplitScreen((prev) => !prev)}
        isSplitScreen={isSplitScreen}
        onToggleSunlightMode={() => setIsSunlightMode((prev) => !prev)}
        isSunlightMode={isSunlightMode}
        onOpenFieldTools={() => setShowFieldTools(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        triggerToast={triggerToast}
      />

      <main className="p-3 md:py-4 md:px-6 font-sans selection:bg-cyan-500 selection:text-slate-950">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center gap-3 animate-fade-in border border-cyan-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs md:text-sm font-black">{toastMessage}</span>
            </div>
          )}

          {/* Storage-full warning: some edits exist only in memory */}
          {unsavedStorageCount > 0 && (
            <div role="alert" className="bg-red-950/80 border border-red-500/60 text-red-200 rounded-2xl px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 text-xs md:text-sm">
                <p className="font-black text-red-300">⚠ Device storage is full — changes are not being saved</p>
                <p className="mt-0.5">
                  {unsavedStorageCount} {unsavedStorageCount === 1 ? "section has" : "sections have"} changes held only in memory.
                  They will be lost if you reload or close the app. Download a backup now (it includes these changes),
                  then free space by deleting photos or old jobs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupModal(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-red-500 text-slate-950 text-xs font-black hover:bg-red-400 cursor-pointer"
              >
                Open Backup &amp; Sync
              </button>
            </div>
          )}

          {/* Global Help & Formula Modal */}
          <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

          {/* --- Top Navigation Header & Global Toolbar --- */}
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-800/80 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  UST Field Agent &amp; Contractor Operating System
                </p>
                {isSplitScreen && (
                  <span className="px-2 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-600 rounded-full text-[9px] font-bold font-mono">
                    DUAL SPLIT WORKSPACE
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
                UST Field Hub
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                Excavation laser benchmark (cover + tank OD + bedding), OPW drop tube cut lengths, complete concrete, &amp; plan blueprints.
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
                  playClickSound();
                  setAiAssistantPrompt(undefined);
                  setShowAiAssistant(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-950 via-cyan-950 to-indigo-950 hover:from-indigo-900 hover:to-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95"
                title="Open UST Field AI Copilot (Ctrl+Shift+A)"
              >
                <span>🤖</span>
                <span>AI Copilot</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setShowBackupModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/10 active:scale-95"
                title="Backup, export, or restore job sites and calculations (Ctrl+B)"
              >
                <span>☁️</span>
                <span>Backup &amp; Sync</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setShowHelpModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                <span>📖</span>
                <span>Formulas</span>
              </button>

              <button
                onClick={handleCopyCutSheet}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95"
                title="Copy Cut Sheet (Ctrl+Shift+C)"
              >
                <span>📋</span>
                <span>Copy Cut Sheet</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                title="Print Submittal PDF Package (Ctrl+P)"
              >
                <span>🖨️</span>
                <span>Print PDF</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                title="Reset current tab to default values"
              >
                <span>🔄</span>
                <span>Reset</span>
              </button>
            </div>
          </header>

          {/* Navigation Tabs Bar */}
          <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            {tabListConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-start p-2 rounded-lg transition-all duration-200 cursor-pointer relative group ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300 font-bold"
                    : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80"
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs truncate">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                    </svg>
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <kbd
                    className={`text-[9px] font-mono px-1 py-0.2 rounded transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-950/20 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {tab.keyNum}
                  </kbd>
                </div>
                <span
                  className={`text-[9px] font-semibold mt-0.5 truncate ${
                    activeTab === tab.id ? "text-slate-900" : `text-${tab.color}-400`
                  }`}
                >
                  {tab.subtitle}
                </span>
              </button>
            ))}
          </nav>

          {/* --- TAB CONTENT: SPLIT WORKSPACE OR FULL VIEW --- */}
          {isSplitScreen ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Primary Pane (Left) */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider font-black">
                      Pane 1:
                    </span>
                    <select
                      value={activeTab}
                      onChange={(e) => {
                        playClickSound();
                        setActiveTab(e.target.value as ActiveTab);
                      }}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-bold focus:outline-hidden focus:border-cyan-400"
                    >
                      {tabListConfig.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Primary View</span>
                </div>
                <div className="flex-1 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-1">
                  {renderTabContent(activeTab)}
                </div>
              </div>

              {/* Secondary Pane (Right) */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-[10px] uppercase tracking-wider font-black">
                      Pane 2:
                    </span>
                    <select
                      value={secondaryTab}
                      onChange={(e) => {
                        playClickSound();
                        setSecondaryTab(e.target.value as ActiveTab);
                      }}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-bold focus:outline-hidden focus:border-indigo-400"
                    >
                      {tabListConfig.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setIsSplitScreen(false);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Close Split ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-1">
                  {renderTabContent(secondaryTab)}
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-200">
              {renderTabContent(activeTab)}
            </div>
          )}

          {/* Floating AI Copilot Trigger Button */}
          <button
            onClick={() => {
              playClickSound();
              setAiAssistantPrompt(undefined);
              setShowAiAssistant(true);
            }}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 hover:from-indigo-500 hover:to-cyan-400 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 flex items-center gap-2 border border-cyan-300 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
            title="Open Field AI Copilot (Ctrl+Shift+A)"
          >
            <span className="text-base">🤖</span>
            <span className="text-xs uppercase tracking-wider font-black">AI Copilot</span>
          </button>

          {/* AI Assistant Drawer */}
          <AIAssistant
            isOpen={showAiAssistant}
            onClose={() => setShowAiAssistant(false)}
            initialPrompt={aiAssistantPrompt}
            triggerToast={triggerToast}
          />

          {/* Global OS Command Palette */}
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenAiAssistant={(prompt) => {
              setAiAssistantPrompt(prompt);
              setShowAiAssistant(true);
            }}
            onOpenBackupModal={() => setShowBackupModal(true)}
            onCopyCutSheet={handleCopyCutSheet}
            onPrint={handlePrint}
            onToggleSplitScreen={() => setIsSplitScreen((prev) => !prev)}
            onToggleSunlightMode={() => setIsSunlightMode((prev) => !prev)}
            onOpenFieldTools={() => setShowFieldTools(true)}
            onResetTab={handleResetDefaults}
            jobList={jobList}
            onSelectJob={(id) => setActiveJobId(id)}
            onSelectTankPreset={handleSelectTankPreset}
          />

          {/* Field OS Tools Drawer */}
          <FieldToolsDrawer
            isOpen={showFieldTools}
            onClose={() => setShowFieldTools(false)}
            triggerToast={triggerToast}
            onAppendToDailyReport={handleAppendScratchpadToReport}
          />

          {/* Field OS Keyboard Shortcuts Modal */}
          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
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
    </div>
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
