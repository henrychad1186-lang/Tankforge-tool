# UST Field Hub — Complete Codebase Export for Claude

**Exported:** 2026-09-20 17:07:21
**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4
**Root Directory:** `C:\Users\henry\ust-app`

## Overview of Tabs & Architecture
1. **Excavation & Laser (`ExcavationTab.tsx`)**: Laser benchmark (+15.5' constant), bedding depths, trench depth (+3.0'), vent slope calculation (1/8" and 1/4" pitch).
2. **OPW Drop Tube (`DropTubeTab.tsx`)**: OPW 71SO overfill prevention cut sheet, riser heights, diameter clearance, visual SVG diagram.
3. **Complete Concrete (`ConcreteTab.tsx`)**: Slabs, sonotubes, PEI RP100 §5 deadman buoyancy safety factor (>= 1.20x), strap WLL tension checks, rebar LF/grid, gravel, costs.
4. **Construction Math (`ConstructionTab.tsx`)**: 3-4-5 triangles, aggregate tonnage, lumber board-feet/formwork, unit converters.
5. **Daily Job Report (`DailyReportTab.tsx`)**: Weather, crew hours, materials received, safety checklist.
6. **Pre-Bury Inspector (`PreBuryTab.tsx`)**: Field inspection suite with 6 sub-views: Overview, Checklists, 5.0 psig Air Tests (with SVG gauge and live hold timer), Docs Tracker, 8-step Pre-Check walk, and Mobile Photos Gallery.
7. **Photo Attachment & Field Compression (`PhotoGallery.tsx`)**: Rear camera capture, on-device canvas downscaling (max 1024px @ 0.72 JPEG), 6 categorization buckets, lightbox preview, print embed.
8. **Touch Canvas Signature Pad (`SignaturePad.tsx`)**: Certified installer/inspector sign-off with smooth HTML5 canvas curves, undo/clear, embedded in reports.
9. **Per-Job State Isolation & Backup Sync (`JobManager.tsx`, `BackupSyncModal.tsx`)**: Scoped localStorage keys (`ust-hub-v2-[jobId]-[tabId]`), dynamic context switching, single-click JSON export/import and clipboard backup.

## File Index
- `package.json`
- `AGENTS.md`
- `MEMORY.md`
- `app/layout.tsx`
- `app/page.tsx`
- `app/components/BackupSyncModal.tsx`
- `app/components/ConcreteTab.tsx`
- `app/components/ConstructionTab.tsx`
- `app/components/DailyReportTab.tsx`
- `app/components/DropTubeTab.tsx`
- `app/components/ExcavationTab.tsx`
- `app/components/HelpModal.tsx`
- `app/components/JobManager.tsx`
- `app/components/PhotoGallery.tsx`
- `app/components/PreBuryTab.tsx`
- `app/components/PrintLayout.tsx`
- `app/components/SignaturePad.tsx`
- `app/hooks/usePersistedState.ts`
- `app/lib/calculations.ts`
- `app/lib/constants.ts`
- `app/lib/tab-contexts.tsx`
- `app/lib/tab-types.ts`

---

### File: `package.json`

```json
{
  "name": "ust-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### File: `AGENTS.md`

```ts
# UST Field Hub - Priority Upgrades Walkthrough

We have implemented all 5 field-readiness upgrades to transform **UST Field Hub** into a full-fledged, offline-capable field engineering tool:

---

## 1. Per-Job State Isolation
- **Storage Scoping:** All 6 calculation tabs now store state under job-specific localStorage keys formatted as `ust-hub-v2-[jobId]-[tabId]`.
- **Legacy Data Migration:** On first launch, existing flat `ust-hub-*` entries are automatically migrated into the default job (`default-job`) so no existing field calculations are lost.
- **Dynamic Context Switching:** Swapping jobs in the top header immediately unmounts and remounts tab providers via `<AppStateProviders key={activeJobId} activeJobId={activeJobId}>`, ensuring zero cross-contamination between job sites.
- **Job Cloning & Cleanup:** Added quick duplicate/clone action to copy a site profile and its calculation data into a new job, plus thorough key cleanup on job deletion.

---

## 2. Cloud Sync & Backup (`BackupSyncModal.tsx`)
- **Single-Click Export:** Back up all active jobs, site profiles, notes, calculations, photos, and signatures into a timestamped JSON file (e.g., `ust-field-hub-backup-2026-09-18.json`).
- **One-Click Clipboard:** Direct copy/paste payload for pasting directly into email or notes.
- **Intelligent Restoration:** Import JSON files with two options:
  - **Merge & Overwrite Matching:** Ingest jobs while preserving existing non-conflicting jobs.
  - **Clean Replace All:** Complete device restoration.
- **Offline & Cross-Device Compatible:** Works 100% offline without requiring external API tokens or login credentials.

---

## 3. Photo Attachment with Field Compression (`PhotoGallery.tsx`)
- **Direct Mobile Camera Access:** Uses `<input type="file" capture="environment" accept="image/*">` to launch the device's rear camera directly in the field.
- **On-Device Canvas Compression:** Downscales high-resolution camera photos (4–10 MB) to max 1024px width/height at 0.72 JPEG quality (~70–120 KB), preventing `localStorage` quotas from filling up while keeping dial numbers, pipe stamps, and holiday test sparks crisp.
- **Pre-Bury Categorization:** Filter and organize photos by `Overburden & Grade`, `Anchor Straps & Deadmen`, `Piping Fall & Slope`, `Drop Tube & Riser`, `Gauge & Pressure Test`, or `General Site`.
- **Lightbox Preview & Captions:** Full-screen zoom modal with inline editable captions and timestamps.
- **PDF Print Integration:** Captured photos embed directly into the print-ready inspection report.

---

## 4. Full PEI RP100 §5 Buoyancy Calculations (`calculations.ts` & `ConcreteTab.tsx`)
- **Comprehensive Upward & Downward Force Balances:**
  - **Displaced Water Force ($F_b$):** Full tank volume displaced at $8.34\text{ lbs/gal}$ ($62.4\text{ lbs/cu ft}$).
  - **Submerged Deadman Weight ($W_{\text{sub\_deadman}}$):** Deadman volume $\times 87.6\text{ lbs/cu ft}$ ($150\text{ lbs/cu ft dry} - 62.4\text{ lbs/cu ft water}$).
  - **Submerged Soil Overburden ($W_{\text{sub\_soil}}$):** Vertical soil column prism over deadman projection $\times 47.6\text{ lbs/cu ft}$ ($110\text{ lbs/cu ft dry} - 62.4\text{ lbs/cu ft water}$).
  - **Tank Dry Weight ($W_{\text{tank}}$):** Empty steel or fiberglass tank weight in lbs.
- **Safety Factor ($\ge 1.20\times$):** Visual safety badge dynamically alerts whether hold-down forces meet the PEI RP100 minimum threshold ($\text{Hold Down} / \text{Buoyant Uplift} \ge 1.20$).
- **Strap Working Load Limit (WLL) Checks:** Calculates net uplift force divided across strap count and compares against strap WLL rating (with warnings if individual strap tension exceeds safe rating).
- **Quick Presets:** One-tap presets for 6k, 8k, 10k, 12k, 15k, 20k, and 30k gallon USTs.

---

## 5. Touch Canvas Signature Pad (`SignaturePad.tsx`)
- **HTML5 Canvas Drawing:** Supports finger, stylus, and mouse input with smooth quadratic curve smoothing.
- **Field Inspector Sign-Off:** Captures certified UST installer/inspector sign-offs under the Pre-Bury tab with:
  - Inspector Name & Title
  - Certification / License Number
  - Inspection Date & Time
  - Full Sign-Off Agreement Statement
- **Signature Actions:** Undo stroke, clear, and baseline guide.
- **Export & Print Ready:** Automatically renders the clean PNG signature into the generated PDF and printable reports.

---

## Live Browser & Device Verification
- **Local Dev URL:** `http://localhost:3000`
- **Wi-Fi LAN / Mobile Access:** `http://192.168.4.247:3000` (test on phone or tablet on the same local network)
- **Turbopack Dev Status:** Ready in 6.8s, hot-reloads under 50ms.

### Visual Interface Progressions

![UST Field Hub Top Header & Job Manager](C:\Users\henry\.gemini\antigravity-ide\brain\30c0a0a6-eb5d-4c27-8e1f-2d1607f150eb\ust_hub_homepage_1789756584474.png)

![PEI RP100 §5 Tank Buoyancy Safety Analysis & Force Cards](C:\Users\henry\.gemini\antigravity-ide\brain\30c0a0a6-eb5d-4c27-8e1f-2d1607f150eb\concrete_buoyancy_card_1789756767225.png)

![Mobile Field Photos Gallery with Category Filters](C:\Users\henry\.gemini\antigravity-ide\brain\30c0a0a6-eb5d-4c27-8e1f-2d1607f150eb\photos_subtab_view_1789756995531.png)

![Inspector Touch Signature Pad with Canvas Smoothing & Sign-Off Block](C:\Users\henry\.gemini\antigravity-ide\brain\30c0a0a6-eb5d-4c27-8e1f-2d1607f150eb\signoff_completed_view_1789781151439.png)

---

## Verification Summary
- **TypeScript:** `npx tsc --noEmit` verified 0 errors.
- **ESLint:** `npm run lint` verified 0 errors, 0 warnings.
- **Production Build:** `npm run build` compiled 100% static routes in 5.3s.
- **Sign-Off Flow:** Verified button clicks, form state updates, signature canvas, and print submittal with 0 runtime errors.

---

## 6. Tab Architecture & Calculation Specs

### 1. Excavation & Laser Benchmark (`ExcavationTab.tsx`)
- **Finish Grade (FG) Transit Benchmark Rule:** `+15.5'` constant for raw hole depth (`transitShot + 15.5'`).
- **Bedding Correction:** `FG + (15.5' - Bedding Depth)`.
- **Product Piping Trench Depth:** `FG + 3.0'` constant (`transitShot + 3.0'`).
- **Vent Line Slope:** Configurable pitch fall rate of $1/8"$ or $1/4"$ per foot towards tank.

### 2. OPW 71SO Drop Tube Cut (`DropTubeTab.tsx`)
- **Upper Drop Tube Cut Length:** `Riser Height + Valve Offset` (Standard 71SO: `5.5"`, Testable 71SO-T: `7.25"`).
- **Overall Assembly Length:** `Riser Height + Tank Diameter - Tank Clearance` (Standard PEI/EPA clearance: `6.0"`).
- **Live SVG Blueprint:** Dynamic interactive cross-section diagram showing grade, riser pipe, upper tube, valve body, lower tube, and clearance zone.

### 3. Complete Concrete & Anchoring (`ConcreteTab.tsx`)
- **Structural Elements:** Slabs, sonotubes, footers, curbs, steps, and deadman anchors.
- **PEI RP100 §5 Buoyancy Math:** Upward displaced water vs hold-down forces (deadman @ $87.6\text{ lbs/cf}$, overburden @ $47.6\text{ lbs/cf}$, empty tank weight). Target safety factor $\ge 1.20\times$.
- **Hardware & Straps:** Turnbuckle sizing (5/8"x6", 3/4"x9", 7/8"x12"), strap WLL tension load distribution checks.
- **Materials:** Rebar LF/grid estimator, sub-base aggregate tonnage, ready-mix truck capacity (10 CY) vs bags.

### 4. Construction Math (`ConstructionTab.tsx`)
- **3-4-5 Right Triangle Solver:** Square checks and hypotenuse calculator.
- **Aggregate Densities:** Crushed stone (1.40 t/CY), pea gravel (1.35 t/CY), sand (1.30 t/CY), topsoil (1.10 t/CY), asphalt (2.00 t/CY).
- **Lumber Estimator:** Board-feet calculation and formwork framing studs/whalers.
- **Field Unit Converters:** Length, Area, Volume, Weight, and Pressure (psig, bar, kPa, inHg, ft H2O).

### 5. Daily Job Report (`DailyReportTab.tsx`)
- **Job Site Logging:** Crew hours, equipment logs, materials received, weather conditions, 7-point safety checklist.
- **Reporting:** Printable summary and submittal clipboard export.

### 6. Pre-Bury Inspector Suite (`PreBuryTab.tsx`)
- **6 Sub-Views:** Progress Overview, 4-Group Checklists, 5.0 psig Air Testing (live SVG gauge + 60-min hold timer), Submittal Docs Tracker, 8-Point Day-Before Pre-Check Walk, and Compressed Field Photos Gallery.
- **Inspector Sign-Off:** Certified inspector touch signature pad embedded into official submittal reports.
```

### File: `MEMORY.md`

```ts
# Project Memory: UST Field Hub

## Overview
- **Project Name:** UST Field Hub (Contractor & Pre-Bury Inspector Suite)
- **Root Path:** `c:\Users\henry\ust-app`
- **Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4
- **Claude Codebase Bundle:** `c:\Users\henry\Downloads\ust-app-claude-bundle.md`

## Architecture & Tabs
1. **Excavation & Laser Benchmark (`ExcavationTab.tsx`)**
   - Finish Grade (FG) transit benchmark rule: `+15.5'` constant for raw hole depth.
   - Bedding correction: `FG + (15.5' - Bedding Depth)`.
   - Product piping trench depth: `FG + 3.0'` constant.
   - Vent line slope: 1/8" or 1/4" per foot pitch calculation.

2. **OPW 71SO Drop Tube Cut (`DropTubeTab.tsx`)**
   - Upper drop tube cut length = Riser Height + Valve Offset (Std: 5.5", Testable: 7.25").
   - Overall assembly length = Riser Height + Tank Diameter - Tank Clearance (Std: 6.0").
   - Live visual SVG blueprint diagram.

3. **Complete Concrete (`ConcreteTab.tsx`)**
   - Slabs, sonotubes, footers, curbs, steps, and deadman anchors.
   - Deadman buoyancy safety factor & turnbuckle hardware specs (5/8"x6", 3/4"x9", 7/8"x12").
   - Rebar linear footage & grid layouts, sub-base gravel tonnage, ready-mix trucks vs bags, cost summaries.

4. **Construction Math (`ConstructionTab.tsx`)**
   - 3-4-5 right triangle squaring and hypotenuse solver.
   - Aggregate tonnage by density (crushed stone, pea gravel, sand, topsoil, asphalt).
   - Lumber board-feet and formwork framing estimator.
   - Field unit conversions (Length, Area, Volume, Weight, Pressure).

5. **Daily Job Report (`DailyReportTab.tsx`)**
   - Crew hours, equipment log, materials received, weather conditions, safety inspection checklist.

6. **Pre-Bury Inspector (`PreBuryTab.tsx`)**
   - Field inspection suite before tank hole backfill.
   - **Overview:** Project progress dial, metric cards, inspection blockers.
   - **Checklists:** 4 groups (Air Testing, Containment & Piping, Mechanical, Electrical).
   - **Air Tests:** 5.0 psig SVG gauge dial, live countdown hold timer (60-min standard hold), tank log.
   - **Docs:** Submittal package tracker (permits, tightness tests, deflection reports, gradation certs).
   - **Pre-Check:** 8-point day-before inspection walk protocol.

## State & Submittals
- **Persistence & Job Isolation:** `usePersistedState` (`localStorage`) scoped under `ust-hub-v2-[jobId]-[tabId]`, dynamic context switching via `<AppStateProviders key={activeJobId}>`, plus legacy flat migration.
- **Job Manager:** Saving, switching, cloning, and deleting multiple job sites.
- **Backup & Sync:** Single-click JSON export/import with merge or clean restore options, and one-click clipboard payload.
- **Photo Attachments:** Mobile rear camera capture, on-device canvas downscaling (max 1024px @ 0.72 quality), categorized gallery with lightbox preview, embedded in PDF.
- **PEI RP100 §5 Buoyancy:** Full upward/downward force balances, safety factor threshold (≥ 1.20×), strap WLL checks, and quick presets.
- **Touch Signature Pad:** HTML5 smooth canvas signature capture for certified inspector pre-bury sign-off, undo/clear actions, rendered directly in print/PDF.
- **Reporting:** "Copy Cut Sheet" to clipboard and printable submittal PDF via `PrintLayout.tsx`.
```

### File: `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UST Excavation & Drop Tube Hub",
  description: "Field calculations, drop tube builders, and concrete calculators.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UST Hub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

### File: `app/page.tsx`

```tsx
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

  const excavation = useExcavation();
  const dropTube = useDropTube();
  const concrete = useConcrete();
  const construction = useConstruction();
  const dailyReport = useDailyReport();
  const preBury = usePreBury();

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
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        triggerToast("Copied Cut Sheet to Clipboard!");
      })
      .catch(() => {
        triggerToast("Copy failed. Please copy manually.");
      });
  }, [activeTab, excavation, dropTube, concrete, dailyReport, preBury, triggerToast]);

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

    triggerToast("Reset tab inputs to job defaults");
  }, [activeTab, excavation, dropTube, concrete, construction, dailyReport, preBury, triggerToast]);

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
        <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          {[
            { id: "excavation" as const, label: "Excavation & Laser", subtitle: "Pit Shots (+15.5')", color: "cyan", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
            { id: "droptube" as const, label: "OPW Drop Tube Cut", subtitle: "OPW 71SO Valve", color: "emerald", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { id: "concrete" as const, label: "Complete Concrete", subtitle: "Slabs, Deadman, Rebar", color: "amber", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h10" },
            { id: "construction" as const, label: "Construction Math", subtitle: "Triangles & Volumes", color: "indigo", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
            { id: "dailyreport" as const, label: "Daily Job Report", subtitle: "Crew, Weather, Safety", color: "rose", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
            { id: "prebury" as const, label: "Pre-Bury Inspector", subtitle: "Air Tests, Checks, Docs", color: "teal", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
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
```

### File: `app/components/BackupSyncModal.tsx`

```tsx
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
```

### File: `app/components/ConcreteTab.tsx`

```tsx
"use client";

import React, { memo } from "react";
import { ConcreteShape } from "../lib/constants";
import { useConcrete } from "../lib/tab-contexts";

export interface ConcreteTabProps {
  triggerToast: (msg: string) => void;
}

function ConcreteTabComponent({ triggerToast }: ConcreteTabProps) {
  const {
    state,
    updateState,
    concreteVolume,
    rebarResults: rebarCalculations,
    gravelResults: gravelCalculations,
    costSummary,
    buoyancyResults,
    turnbuckleLayout,
  } = useConcrete();

  const {
    concreteShape,
    flatLength,
    flatWidth,
    flatThickness,
    flatQuantity,
    circDiameter,
    circThickness,
    circQuantity,
    sonoDiameter,
    sonoHeight,
    sonoQuantity,
    footLength,
    footWidth,
    footDepth,
    footQuantity,
    deadmanLength,
    deadmanWidth,
    deadmanHeight,
    deadmanQuantity,
    ballastLength,
    ballastWidth,
    ballastThickness,
    ballastQuantity,
    curbLength,
    curbHeight,
    curbWidth,
    gutterThickness,
    gutterWidth,
    curbQuantity,
    stepCount,
    stepWidth,
    stepRise,
    stepRun,
    stepQuantity,
    wallLength,
    wallWidth,
    wallDepth,
    wallQuantity,
    wastePct,
    rebarSpacing,
    rebarSize,
    wireMesh,
    gravelDepth,
    showCostEstimator,
    pricePerCy,
    pricePerBag80,
    pricePerGravelTon,
    pricePerRebarStick,
  } = state;

  const { adjustedVolumeCy, adjustedVolumeCf, bags80lb, bags60lb, bags40lb, truckLoads, isShortLoad } = concreteVolume;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* User Friendly Workflow Header */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-lg font-bold">
            🏗️
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Complete Concrete, Rebar, Mesh &amp; Material Cost Calculator
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold border border-amber-500/30">
                9 Job Geometries
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Calculate cubic yards, pre-mixed bag counts, ready-mix truckloads, rebar sticks/ties, wire mesh, sub-base aggregate, and cost comparison.
            </p>
          </div>
        </div>

        {/* Quick Presets Shortcuts Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "ballast",
                ballastLength: "30",
                ballastWidth: "12",
                ballastThickness: "8",
                ballastQuantity: "1",
              });
              triggerToast("Loaded UST Ballast Hold-Down Slab Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            UST Ballast (30&apos;x12&apos;x8&quot;)
          </button>
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "deadman",
                deadmanLength: "20",
                deadmanWidth: "18",
                deadmanHeight: "18",
                deadmanQuantity: "2",
              });
              triggerToast("Loaded UST Deadman Anchor Beams Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            Deadman (2x 20&apos;x18&quot;)
          </button>
          <button
            type="button"
            onClick={() => {
              updateState({
                concreteShape: "footer",
                footLength: "6",
                footWidth: "6",
                footDepth: "3.5",
                footQuantity: "4",
              });
              triggerToast("Loaded Canopy Column Footer Preset");
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            Canopy (4x 6&apos;x6&apos;)
          </button>
        </div>
      </div>

      {/* Shape Selector Bar */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-md space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Select Job Geometry / Form Shape:
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {[
            { id: "flatwork", label: "Pad / Slab", icon: "🟧" },
            { id: "circular", label: "Circular", icon: "⭕" },
            { id: "sonotube", label: "Sonotube", icon: "💈" },
            { id: "footer", label: "Footer Box", icon: "📦" },
            { id: "deadman", label: "Deadman", icon: "⚓" },
            { id: "ballast", label: "UST Ballast", icon: "⚖️" },
            { id: "curb", label: "Curb & Gutter", icon: "🛣️" },
            { id: "steps", label: "Stairs / Steps", icon: "🪜" },
            { id: "wallfooting", label: "Wall Footing", icon: "🧱" },
          ].map((shape) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => updateState({ concreteShape: shape.id as ConcreteShape })}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                concreteShape === shape.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-1 ring-amber-300"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span className="text-base">{shape.icon}</span>
              <span className="text-[10px] font-bold mt-0.5 text-center leading-tight">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Inputs & Mix Options (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Inputs Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>01</span> Form Dimensions &amp; Quantity
              </h2>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                {concreteShape.toUpperCase()}
              </span>
            </div>

            {/* Dynamic Inputs per Shape */}
            {concreteShape === "flatwork" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={flatLength} onChange={(e) => updateState({ flatLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={flatWidth} onChange={(e) => updateState({ flatWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={flatThickness} onChange={(e) => updateState({ flatThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={flatQuantity} onChange={(e) => updateState({ flatQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "circular" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Diameter (Ft)</label>
                  <input type="number" step="any" value={circDiameter} onChange={(e) => updateState({ circDiameter: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={circThickness} onChange={(e) => updateState({ circThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={circQuantity} onChange={(e) => updateState({ circQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "sonotube" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Diameter (Inches)</label>
                  <input type="number" step="any" value={sonoDiameter} onChange={(e) => updateState({ sonoDiameter: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Height/Depth (Ft)</label>
                  <input type="number" step="any" value={sonoHeight} onChange={(e) => updateState({ sonoHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity (Piers)</label>
                  <input type="number" min="1" value={sonoQuantity} onChange={(e) => updateState({ sonoQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "footer" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={footLength} onChange={(e) => updateState({ footLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={footWidth} onChange={(e) => updateState({ footWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Depth (Ft)</label>
                  <input type="number" step="any" value={footDepth} onChange={(e) => updateState({ footDepth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={footQuantity} onChange={(e) => updateState({ footQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "deadman" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                    <input type="number" step="any" value={deadmanLength} onChange={(e) => updateState({ deadmanLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Inches)</label>
                    <input type="number" step="any" value={deadmanWidth} onChange={(e) => updateState({ deadmanWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Height (Inches)</label>
                    <input type="number" step="any" value={deadmanHeight} onChange={(e) => updateState({ deadmanHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity (Beams)</label>
                    <input type="number" min="1" value={deadmanQuantity} onChange={(e) => updateState({ deadmanQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Turnbuckle Hardware Spec</label>
                    <select
                      value={state.turnbuckleModelId || "5_8_x_6"}
                      onChange={(e) => updateState({ turnbuckleModelId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      <option value="5_8_x_6">5/8&quot; x 6&quot; Take-Up Jaw Turnbuckle (3,500 lbs WLL)</option>
                      <option value="3_4_x_9">3/4&quot; x 9&quot; Heavy Duty Turnbuckle (5,200 lbs WLL)</option>
                      <option value="7_8_x_12">7/8&quot; x 12&quot; Extreme Duty Turnbuckle (7,200 lbs WLL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Deadman Clearance from Tank (In)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={state.deadmanClearanceInches || "12"}
                      onChange={(e) => updateState({ deadmanClearanceInches: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Anchor Strap Sets Count</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={state.strapCount || "2"}
                      onChange={(e) => updateState({ strapCount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-base font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {concreteShape === "ballast" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Length (Ft)</label>
                  <input type="number" step="any" value={ballastLength} onChange={(e) => updateState({ ballastLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Width (Ft)</label>
                  <input type="number" step="any" value={ballastWidth} onChange={(e) => updateState({ ballastWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Thickness (In)</label>
                  <input type="number" step="any" value={ballastThickness} onChange={(e) => updateState({ ballastThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={ballastQuantity} onChange={(e) => updateState({ ballastQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "curb" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Total Length (Ft)</label>
                  <input type="number" step="any" value={curbLength} onChange={(e) => updateState({ curbLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Curb Height (In)</label>
                  <input type="number" step="any" value={curbHeight} onChange={(e) => updateState({ curbHeight: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Curb Width (In)</label>
                  <input type="number" step="any" value={curbWidth} onChange={(e) => updateState({ curbWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gutter Thick (In)</label>
                  <input type="number" step="any" value={gutterThickness} onChange={(e) => updateState({ gutterThickness: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gutter Width (In)</label>
                  <input type="number" step="any" value={gutterWidth} onChange={(e) => updateState({ gutterWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={curbQuantity} onChange={(e) => updateState({ curbQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "steps" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Number of Steps</label>
                  <input type="number" min="1" value={stepCount} onChange={(e) => updateState({ stepCount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Stair Width (Ft)</label>
                  <input type="number" step="any" value={stepWidth} onChange={(e) => updateState({ stepWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Step Rise (In)</label>
                  <input type="number" step="any" value={stepRise} onChange={(e) => updateState({ stepRise: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Step Run (In)</label>
                  <input type="number" step="any" value={stepRun} onChange={(e) => updateState({ stepRun: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={stepQuantity} onChange={(e) => updateState({ stepQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {concreteShape === "wallfooting" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Total Length (Ft)</label>
                  <input type="number" step="any" value={wallLength} onChange={(e) => updateState({ wallLength: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Footing Width (In)</label>
                  <input type="number" step="any" value={wallWidth} onChange={(e) => updateState({ wallWidth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Footing Depth (In)</label>
                  <input type="number" step="any" value={wallDepth} onChange={(e) => updateState({ wallDepth: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-amber-300 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Quantity</label>
                  <input type="number" min="1" value={wallQuantity} onChange={(e) => updateState({ wallQuantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-lg font-bold" />
                </div>
              </div>
            )}

            {/* Waste Buffer Slider */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Waste &amp; Spillage Buffer Factor
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{wastePct}% Added Buffer
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={wastePct}
                onChange={(e) => updateState({ wastePct: parseInt(e.target.value) || 0 })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0% (Exact)</span>
                <span>+10% (Std Jobsite Buffer)</span>
                <span>+20% (High Flex)</span>
              </div>
            </div>
          </div>

          {/* Volume & Mix Output Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total CY */}
            <div className="bg-slate-900/90 rounded-3xl border border-amber-500/40 p-5 shadow-xl glow-card-amber">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                Total Concrete Needed
              </span>
              <span className="block text-3xl font-black tracking-tight text-white font-mono mt-2">
                {adjustedVolumeCy.toFixed(2)} CY
              </span>
              <span className="block text-xs font-semibold text-amber-400 font-mono mt-1">
                {adjustedVolumeCf.toFixed(2)} CF (+{wastePct}% buffer)
              </span>
            </div>

            {/* 80lb Bags */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                Pre-Mixed 80lb Bags
              </span>
              <span className="block text-3xl font-black tracking-tight text-cyan-300 font-mono mt-2">
                {bags80lb} Bags
              </span>
              <span className="block text-[11px] text-slate-400 font-mono mt-1">
                60lb: {bags60lb} | 40lb: {bags40lb}
              </span>
            </div>

            {/* Ready Mix Truckloads */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                Ready-Mix Truckloads
              </span>
              <span className="block text-3xl font-black tracking-tight text-emerald-300 font-mono mt-2">
                {truckLoads.toFixed(1)} Trucks
              </span>
              <span className="block text-[11px] text-slate-400 font-mono mt-1">
                {isShortLoad ? "⚠️ Volume < 6 CY (Short-load fee)" : "Standard 10 CY Truckloads"}
              </span>
            </div>
          </div>

          {/* PEI RP100 §5 Comprehensive Buoyancy & Hold-Down Sizing Module */}
          {(concreteShape === "deadman" || concreteShape === "ballast") && (
            <div className={`p-6 rounded-3xl border shadow-2xl space-y-5 ${
              buoyancyResults.isSafe
                ? "bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 text-emerald-200"
                : "bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 text-amber-200"
            }`}>
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚓</span>
                    <h3 className="font-black text-sm uppercase tracking-wide text-white">
                      PEI RP100 §5 Tank Buoyancy &amp; Hold-Down Safety Analysis
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      buoyancyResults.isSafe
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {buoyancyResults.isSafe ? "PEI RP100 Compliant (SF ≥ 1.20x)" : "Warning: Below PEI 1.20x Target"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates submerged deadman weight, soil overburden prism, and empty tank dry weight against upward water displacement.
                  </p>
                </div>

                <div className="text-right self-end sm:self-auto font-mono bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Factor</span>
                  <span className={`text-3xl font-black ${buoyancyResults?.isSafe ? "text-emerald-400" : "text-amber-400"}`}>
                    {(buoyancyResults?.safetyFactor ?? 0).toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">PEI Min: 1.20x</span>
                </div>
              </div>

              {/* Force Summary Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Upward Buoyancy (F_B)</span>
                  <span className="text-lg font-black text-red-400 block mt-0.5">
                    {(buoyancyResults?.buoyantUpliftLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.estimatedTankGallons ?? 10000).toLocaleString()} gal × 8.34 lbs/gal
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Downward (F_D)</span>
                  <span className="text-lg font-black text-emerald-400 block mt-0.5">
                    {(buoyancyResults?.totalDownwardForceLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Deadmen + Soil + Tank Weight
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Submerged Deadmen</span>
                  <span className="text-lg font-black text-white block mt-0.5">
                    {(buoyancyResults?.deadmanSubmergedLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.deadmanVolumeCf ?? 0).toFixed(1)} CF × 87.6 lbs/cf
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Soil Overburden Prism</span>
                  <span className="text-lg font-black text-white block mt-0.5">
                    {(buoyancyResults?.overburdenSubmergedLbs ?? 0).toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(buoyancyResults?.overburdenVolumeCf ?? 0).toFixed(1)} CF × 47.6 lbs/cf
                  </span>
                </div>
              </div>

              {/* Strap & Turnbuckle Tension Engineering */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-white">
                    <span>🪢 Hold-Down Strap &amp; Turnbuckle Tension Analysis</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      buoyancyResults?.isStrapAdequate
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}>
                      {buoyancyResults?.isStrapAdequate ? "Strap Tension OK" : "OVERLOAD: Add More Straps"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Net upward load on straps: <strong className="font-mono text-white">{(buoyancyResults?.netUpliftForceLbs ?? 0).toLocaleString()} lbs</strong> | Distributed across <strong className="font-mono text-white">{buoyancyResults?.strapCount ?? 2} strap sets</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Load / Strap Set</span>
                    <span className={`text-base font-black ${buoyancyResults?.isStrapAdequate ? "text-cyan-300" : "text-red-400"}`}>
                      {Math.round(buoyancyResults?.loadPerStrapLbs ?? 0).toLocaleString()} lbs
                    </span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase block">Strap WLL</span>
                    <span className="text-base font-black text-slate-300">
                      {(buoyancyResults?.strapWllLbs ?? 5200).toLocaleString()} lbs
                    </span>
                  </div>
                </div>
              </div>

              {/* Engineering Inputs */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Adjust Site Buoyancy Engineering Variables
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Tank Capacity (gal)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyTankGallons || "10000"}
                      onChange={(e) => updateState({ buoyancyTankGallons: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      {["6000", "10000", "12000", "15000", "20000"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateState({ buoyancyTankGallons: g })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                        >
                          {parseInt(g) / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Empty Tank Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyTankWeightLbs || "4500"}
                      onChange={(e) => updateState({ buoyancyTankWeightLbs: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => updateState({ buoyancyTankWeightLbs: "4500" })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                      >
                        FRP (~4.5k)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateState({ buoyancyTankWeightLbs: "10500" })}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono text-slate-300 rounded cursor-pointer"
                      >
                        Steel (~10.5k)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Burial Cover over Deadmen (ft)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={state.buoyancyBurialDepthFt || "3.5"}
                      onChange={(e) => updateState({ buoyancyBurialDepthFt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.buoyancyIncludeOverburden ?? true}
                        onChange={(e) => updateState({ buoyancyIncludeOverburden: e.target.checked })}
                        className="rounded accent-cyan-500"
                      />
                      <span>Credit Backfill Prism</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Strap Working Load Limit (lbs)
                    </label>
                    <input
                      type="number"
                      value={state.buoyancyStrapWllLbs || "5200"}
                      onChange={(e) => updateState({ buoyancyStrapWllLbs: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Std 3/4&quot; Turnbuckle = 5,200 lbs WLL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reinforcement & Sub-Base Controls */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>02</span> Reinforcement &amp; Sub-Base Aggregate Options
              </h2>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Rebar &amp; Mesh
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Rebar Spacing</label>
                <select
                  value={rebarSpacing}
                  onChange={(e) => updateState({ rebarSpacing: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None / Plain</option>
                  <option value="6">6&quot; Grid</option>
                  <option value="12">12&quot; Grid (Standard)</option>
                  <option value="18">18&quot; Grid</option>
                  <option value="24">24&quot; Grid</option>
                  <option value="36">36&quot; Grid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Rebar Bar Size</label>
                <select
                  value={rebarSize}
                  onChange={(e) => updateState({ rebarSize: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="#3">#3 (3/8&quot; Bar)</option>
                  <option value="#4">#4 (1/2&quot; Bar Std)</option>
                  <option value="#5">#5 (5/8&quot; Heavy)</option>
                  <option value="#6">#6 (3/4&quot; Heavy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Wire Mesh Fabric</label>
                <select
                  value={wireMesh}
                  onChange={(e) => updateState({ wireMesh: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="roll_750">6x6 W1.4 Roll (5&apos;x150&apos;)</option>
                  <option value="sheet_120">6x6 Sheets (8&apos;x15&apos;)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Gravel Sub-Base</label>
                <select
                  value={gravelDepth}
                  onChange={(e) => updateState({ gravelDepth: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-emerald-300 text-sm font-bold cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="2">2&quot; Base</option>
                  <option value="4">4&quot; Base (Standard)</option>
                  <option value="6">6&quot; Base</option>
                  <option value="8">8&quot; Heavy Base</option>
                  <option value="12">12&quot; Base</option>
                </select>
              </div>
            </div>

            {/* Reinforcement Output Grid */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Total Rebar LF</span>
                <span className="font-bold text-cyan-300 text-sm">{rebarCalculations.totalLf.toFixed(1)} LF</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">20ft Rebar Sticks</span>
                <span className="font-bold text-cyan-300 text-sm">{rebarCalculations.pieces20} Sticks</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Tie Wire Rolls</span>
                <span className="font-bold text-slate-300 text-sm">{rebarCalculations.tieWireRolls} Roll(s)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Rebar Chairs</span>
                <span className="font-bold text-slate-300 text-sm">{rebarCalculations.chairsCount} Chairs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Interactive Diagram & Material Cost Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          {/* Dynamic SVG Visual Diagram */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live Form Geometry Cross-Section
              </h3>
              <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                Dynamic Render
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Gravel Base */}
                {gravelDepth !== "none" && (
                  <rect x="40" y="220" width="320" height="40" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                )}
                {gravelDepth !== "none" && (
                  <text x="200" y="245" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Gravel Sub-Base ({gravelDepth}&quot; Depth: {gravelCalculations.tons.toFixed(1)} Tons)
                  </text>
                )}

                {/* Shape Visual */}
                {concreteShape === "flatwork" || concreteShape === "ballast" ? (
                  <g>
                    <rect x="40" y="100" width="320" height="120" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    {rebarSpacing !== "none" && (
                      <line x1="60" y1="160" x2="340" y2="160" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,4" />
                    )}
                    <text x="200" y="155" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {concreteShape === "flatwork" ? "Concrete Slab" : "UST Ballast Slab"}
                    </text>
                    <text x="200" y="175" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(1)} CF)
                    </text>
                  </g>
                ) : concreteShape === "circular" ? (
                  <g>
                    <ellipse cx="200" cy="150" rx="140" ry="60" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="150" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Circular Base ({circDiameter}&apos; Dia x {circThickness}&quot; T)
                    </text>
                    <text x="200" y="170" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY
                    </text>
                  </g>
                ) : concreteShape === "sonotube" ? (
                  <g>
                    <rect x="140" y="60" width="120" height="160" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <line x1="160" y1="70" x2="160" y2="210" stroke="#06b6d4" strokeWidth="2" />
                    <line x1="240" y1="70" x2="240" y2="210" stroke="#06b6d4" strokeWidth="2" />
                    <text x="200" y="130" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Sonotube Column ({sonoDiameter}&quot; Dia)
                    </text>
                    <text x="200" y="150" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      Qty: {sonoQuantity} | {adjustedVolumeCy.toFixed(2)} CY
                    </text>
                  </g>
                ) : concreteShape === "deadman" ? (
                  <g>
                    {/* Pit Excavation Walls */}
                    <polygon points="20,20 40,260 360,260 380,20" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                    
                    {/* Pea Gravel Pit Bedding */}
                    <rect x="40" y="240" width="320" height="20" fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="200" y="253" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Pea Gravel Bedding Layer (12&quot; Depth)
                    </text>

                    {/* Left & Right Concrete Deadman Beams */}
                    <rect x="75" y="205" width="50" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
                    <rect x="275" y="205" width="50" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="100" y="226" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Deadman</text>
                    <text x="300" y="226" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Deadman</text>

                    {/* Embedded Eye Rods / D-Rings */}
                    <circle cx="100" cy="205" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="300" cy="205" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

                    {/* Galvanized Turnbuckle Assemblies */}
                    {/* Left Turnbuckle */}
                    <rect x="96" y="155" width="8" height="35" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1="100" y1="190" x2="100" y2="200" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="100" y1="145" x2="100" y2="155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="65" y="175" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="end">Turnbuckle</text>

                    {/* Right Turnbuckle */}
                    <rect x="296" y="155" width="8" height="35" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1="300" y1="190" x2="300" y2="200" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="300" y1="145" x2="300" y2="155" stroke="#38bdf8" strokeWidth="2" />
                    <text x="335" y="175" fill="#38bdf8" fontSize="9" fontWeight="bold">Turnbuckle</text>

                    {/* Cylindrical Tank Shell Section */}
                    <ellipse cx="200" cy="130" rx="80" ry="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="125" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                      UST Tank Section
                    </text>
                    <text x="200" y="142" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {turnbuckleLayout.tankDiameterInches}&quot; Dia ({turnbuckleLayout.tankRadiusInches}&quot; Radius)
                    </text>

                    {/* Rubber Cushion Anchor Strap over top semi-circle */}
                    <path d="M 120 130 A 80 80 0 0 1 280 130" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="5,2" />
                    <line x1="120" y1="130" x2="100" y2="145" stroke="#22c55e" strokeWidth="3" />
                    <line x1="280" y1="130" x2="300" y2="145" stroke="#22c55e" strokeWidth="3" />
                    <text x="200" y="42" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Anchor Strap Arc Wrap ({turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot;)
                    </text>

                    {/* Dimension Line: Deadman Clearance */}
                    <line x1="200" y1="210" x2="275" y2="210" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="237" y="203" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Clearance: {turnbuckleLayout.deadmanClearanceInches}&quot;
                    </text>
                  </g>
                ) : (
                  <g>
                    <rect x="60" y="100" width="280" height="120" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                    <text x="200" y="155" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Custom Concrete Structure
                    </text>
                    <text x="200" y="175" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                      {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(1)} CF)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Turnbuckle & Strap Cut Sheet Callout Card (When deadman shape active) */}
            {concreteShape === "deadman" && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-sans">
                  <span className="font-extrabold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
                    <span>⛓️</span> Turnbuckle &amp; Strap Cut Sheet
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded font-bold border border-cyan-500/30">
                    {turnbuckleLayout.strapCount} Strap Sets Required
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Strap Top Arc Wrap</span>
                    <span className="font-bold text-slate-200">{turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot;</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Perimeter Assembly</span>
                    <span className="font-bold text-slate-200">{turnbuckleLayout.totalAssemblyLengthInches.toFixed(1)}&quot;</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Turnbuckles Total</span>
                    <span className="font-bold text-cyan-300">{turnbuckleLayout.turnbuckleCount} Turnbuckles</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Net Strap Cut Length</span>
                    <span className="font-bold text-emerald-400">{turnbuckleLayout.netStrapCutLengthInches.toFixed(1)}&quot; / strap</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Estimator Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>💰</span> Material Cost Comparison
              </h3>
              <button
                type="button"
                onClick={() => updateState({ showCostEstimator: !showCostEstimator })}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                {showCostEstimator ? "Hide Pricing" : "Show Pricing"}
              </button>
            </div>

            {showCostEstimator && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-b border-slate-800/80 pb-3">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Ready-Mix $/CY</label>
                  <input type="number" step="5" value={pricePerCy} onChange={(e) => updateState({ pricePerCy: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">80lb Bag $/ea</label>
                  <input type="number" step="0.5" value={pricePerBag80} onChange={(e) => updateState({ pricePerBag80: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Rebar $/Stick</label>
                  <input type="number" step="1" value={pricePerRebarStick} onChange={(e) => updateState({ pricePerRebarStick: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Gravel $/Ton</label>
                  <input type="number" step="5" value={pricePerGravelTon} onChange={(e) => updateState({ pricePerGravelTon: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-xs text-white" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
              {/* Ready-Mix Truck Cost Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">
                  Option A: Ready-Mix Truck
                </span>
                <span className="text-xl font-black text-white font-mono block">
                  ${costSummary.totalWithReadyMix.toFixed(2)}
                </span>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-800">
                  <p>Ready-Mix: ${costSummary.readyMix.toFixed(2)}</p>
                  <p>Rebar &amp; Mesh: ${(costSummary.rebar + costSummary.mesh).toFixed(2)}</p>
                  <p>Gravel Base: ${costSummary.gravel.toFixed(2)}</p>
                </div>
              </div>

              {/* Pre-mix Bagged Cost Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide block">
                  Option B: Pre-mixed Bags
                </span>
                <span className="text-xl font-black text-cyan-300 font-mono block">
                  ${costSummary.totalWith80lbBags.toFixed(2)}
                </span>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-800">
                  <p>80lb Bags ({bags80lb}): ${costSummary.bags80.toFixed(2)}</p>
                  <p>Rebar &amp; Mesh: ${(costSummary.rebar + costSummary.mesh).toFixed(2)}</p>
                  <p>Gravel Base: ${costSummary.gravel.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ConcreteTabComponent);
```

### File: `app/components/ConstructionTab.tsx`

```tsx
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
```

### File: `app/components/DailyReportTab.tsx`

```tsx
// encoding: utf-8
'use client';

import React, { useMemo, useCallback, memo } from 'react';
import {
  type WeatherCondition,
  type DailyWorkEntry,
  type DailyMaterialEntry,
  MATERIAL_UNITS,
  SAFETY_CHECKLIST_ITEMS,
} from '../lib/constants';
import { useDailyReport } from '../lib/tab-contexts';

export interface DailyReportTabProps {
  triggerToast: (msg: string) => void;
}

const WEATHER_OPTIONS: { value: WeatherCondition; emoji: string; label: string }[] = [
  { value: "clear", emoji: "\u2600\uFE0F", label: "Clear" },
  { value: "cloudy", emoji: "\u2601\uFE0F", label: "Cloudy" },
  { value: "rain", emoji: "\uD83C\uDF27\uFE0F", label: "Rain" },
  { value: "snow", emoji: "\u2744\uFE0F", label: "Snow" },
  { value: "wind", emoji: "\uD83D\uDCA8", label: "Wind" },
  { value: "hot", emoji: "\uD83D\uDD25", label: "Hot" },
  { value: "cold", emoji: "\uD83E\uDD76", label: "Cold" },
];

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 glow-card-rose">
    <h3 className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-wide">
      <span>{icon}</span>
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

function DailyReportTabComponent({ triggerToast }: DailyReportTabProps) {
  const { state, updateState } = useDailyReport();
  const {
    reportDate,
    jobSiteName,
    foremanName,
    crewSize,
    weather,
    temperature,
    workEntries,
    materialEntries,
    safetyChecks,
    reportNotes,
  } = state;

  // ─── Weather Toggle ─────────────────────────────────────────────────────
  const toggleWeather = useCallback(
    (w: WeatherCondition) => {
      const nextWeather = weather.includes(w)
        ? weather.filter((x) => x !== w)
        : [...weather, w];
      updateState({ weather: nextWeather });
    },
    [weather, updateState]
  );

  // ─── Work Log Handlers ──────────────────────────────────────────────────
  const addWorkEntry = useCallback(() => {
    updateState({
      workEntries: [...workEntries, { id: genId(), task: "", hours: "", equipment: "" }],
    });
    triggerToast?.("Added work entry row");
  }, [workEntries, updateState, triggerToast]);

  const removeWorkEntry = useCallback(
    (id: string) => {
      if (workEntries.length <= 1) return;
      updateState({
        workEntries: workEntries.filter((e) => e.id !== id),
      });
    },
    [workEntries, updateState]
  );

  const updateWorkEntry = useCallback(
    (id: string, field: keyof Omit<DailyWorkEntry, "id">, value: string) => {
      updateState({
        workEntries: workEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      });
    },
    [workEntries, updateState]
  );

  // ─── Material Handlers ─────────────────────────────────────────────────
  const addMaterialEntry = useCallback(() => {
    updateState({
      materialEntries: [...materialEntries, { id: genId(), material: "", quantity: "", unit: "each" }],
    });
  }, [materialEntries, updateState]);

  const removeMaterialEntry = useCallback(
    (id: string) => {
      if (materialEntries.length <= 1) return;
      updateState({
        materialEntries: materialEntries.filter((e) => e.id !== id),
      });
    },
    [materialEntries, updateState]
  );

  const updateMaterialEntry = useCallback(
    (id: string, field: keyof Omit<DailyMaterialEntry, "id">, value: string) => {
      updateState({
        materialEntries: materialEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      });
    },
    [materialEntries, updateState]
  );

  // ─── Safety Toggle ──────────────────────────────────────────────────────
  const toggleSafety = useCallback(
    (checkId: string) => {
      updateState({
        safetyChecks: { ...safetyChecks, [checkId]: !safetyChecks[checkId] },
      });
    },
    [safetyChecks, updateState]
  );

  // ─── Summary Calculations ──────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalHours = workEntries.reduce((sum, e) => {
      const h = parseFloat(e.hours);
      return sum + (isNaN(h) ? 0 : h);
    }, 0);

    const crew = parseInt(crewSize) || 0;
    const totalCrewHours = totalHours * crew;
    const materialsCount = materialEntries.filter((e) => e.material.trim()).length;
    const totalChecks = SAFETY_CHECKLIST_ITEMS.length;
    const checkedCount = SAFETY_CHECKLIST_ITEMS.filter((item) => safetyChecks[item.id]).length;
    const safetyPct = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;
    const taskCount = workEntries.filter((e) => e.task.trim()).length;

    return { totalHours, totalCrewHours, materialsCount, checkedCount, totalChecks, safetyPct, taskCount };
  }, [workEntries, crewSize, materialEntries, safetyChecks]);

  const inputCls = "w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all";
  const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* SECTION 1: JOB HEADER */}
      <SectionCard title="Job Header" icon={"\uD83D\uDCCB"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => updateState({ reportDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Job / Site Name</label>
            <input
              type="text"
              placeholder="e.g. BP #4821 — Main St"
              value={jobSiteName}
              onChange={(e) => updateState({ jobSiteName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Foreman</label>
            <input
              type="text"
              placeholder="Crew lead name"
              value={foremanName}
              onChange={(e) => updateState({ foremanName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Crew Size</label>
            <input
              type="number"
              min="1"
              placeholder="# of crew"
              value={crewSize}
              onChange={(e) => updateState({ crewSize: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Weather & Temp Row */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 pt-2">
          <div className="flex-1">
            <label className={labelCls}>Weather Conditions</label>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => toggleWeather(w.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    weather.includes(w.value)
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <span>{w.emoji}</span>
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-36">
            <label className={labelCls}>Temp (°F)</label>
            <input
              type="number"
              placeholder="°F"
              value={temperature}
              onChange={(e) => updateState({ temperature: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: WORK LOG */}
      <SectionCard title="Work Log" icon={"\u2692\uFE0F"}>
        <div className="space-y-3">
          {workEntries.map((entry, i) => (
            <div key={entry.id} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-950/50 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 md:self-center w-6 shrink-0">#{i + 1}</span>
              <div className="flex-[3]">
                {i === 0 && <label className={labelCls}>Task / Activity</label>}
                <input
                  type="text"
                  placeholder="e.g. Set 10k FG tank, backfill pit"
                  value={entry.task}
                  onChange={(e) => updateWorkEntry(entry.id, "task", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-24">
                {i === 0 && <label className={labelCls}>Hours</label>}
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="hrs"
                  value={entry.hours}
                  onChange={(e) => updateWorkEntry(entry.id, "hours", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex-[2]">
                {i === 0 && <label className={labelCls}>Equipment Used</label>}
                <input
                  type="text"
                  placeholder="e.g. CAT 320, Vac Truck"
                  value={entry.equipment}
                  onChange={(e) => updateWorkEntry(entry.id, "equipment", e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                onClick={() => removeWorkEntry(entry.id)}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addWorkEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <span>＋</span>
          <span>Add Work Entry</span>
        </button>
      </SectionCard>

      {/* SECTION 3: MATERIALS RECEIVED */}
      <SectionCard title="Materials Received" icon={"\uD83E\uDEA8"}>
        <div className="space-y-3">
          {materialEntries.map((entry, i) => (
            <div key={entry.id} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-950/50 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 md:self-center w-6 shrink-0">#{i + 1}</span>
              <div className="flex-[3]">
                {i === 0 && <label className={labelCls}>Material</label>}
                <input
                  type="text"
                  placeholder="e.g. Pea gravel, #57 stone, 2x6 lumber"
                  value={entry.material}
                  onChange={(e) => updateMaterialEntry(entry.id, "material", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-24">
                {i === 0 && <label className={labelCls}>Qty</label>}
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="amt"
                  value={entry.quantity}
                  onChange={(e) => updateMaterialEntry(entry.id, "quantity", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-28">
                {i === 0 && <label className={labelCls}>Unit</label>}
                <select
                  value={entry.unit}
                  onChange={(e) => updateMaterialEntry(entry.id, "unit", e.target.value)}
                  className={inputCls + " cursor-pointer"}
                >
                  {MATERIAL_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeMaterialEntry(entry.id)}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMaterialEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <span>＋</span>
          <span>Add Material</span>
        </button>
      </SectionCard>

      {/* SECTION 4: SAFETY & INSPECTIONS */}
      <SectionCard title="Safety & Inspections" icon={"\uD83E\uDDBA"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAFETY_CHECKLIST_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSafety(item.id)}
              className={`flex items-center gap-2 p-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                safetyChecks[item.id]
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                safetyChecks[item.id]
                  ? "bg-emerald-500 border-emerald-400"
                  : "border-slate-600"
              }`}>
                {safetyChecks[item.id] && (
                  <svg className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        {/* Safety completion bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Safety Checklist Completion</span>
            <span className={summary.safetyPct === 100 ? "text-emerald-400" : "text-slate-400"}>
              {summary.checkedCount}/{summary.totalChecks} — {summary.safetyPct}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.safetyPct === 100 ? "bg-emerald-500" : summary.safetyPct >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${summary.safetyPct}%` }}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 5: NOTES / ISSUES */}
      <SectionCard title="Notes / Issues / Delays" icon={"\uD83D\uDCDD"}>
        <textarea
          value={reportNotes}
          onChange={(e) => updateState({ reportNotes: e.target.value })}
          placeholder="Rain delay 2 hrs AM, inspector arrived 10:30, change order #12 approved for additional backfill..."
          rows={3}
          className={inputCls + " resize-y min-h-[60px]"}
        />
      </SectionCard>

      {/* SECTION 6: DAILY SUMMARY CARD */}
      <div className="bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/60 border border-rose-500/20 rounded-xl p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-wide">
          <span>{"\uD83D\uDCCA"}</span>
          <span>Daily Summary</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-white">{summary.totalHours.toFixed(1)}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Task Hours</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-cyan-400">{summary.totalCrewHours.toFixed(1)}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Crew-Hours</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-amber-400">{summary.materialsCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Materials</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className={`text-xl font-black ${
              summary.safetyPct === 100 ? "text-emerald-400" : summary.safetyPct >= 50 ? "text-amber-400" : "text-rose-400"
            }`}>
              {summary.safetyPct}%
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Safety Score</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          {reportDate && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDCC5"} {new Date(reportDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
          {jobSiteName && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDCCD"} {jobSiteName}
            </span>
          )}
          {foremanName && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDC77"} {foremanName}
            </span>
          )}
          {weather.length > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {weather.map((w) => WEATHER_OPTIONS.find((o) => o.value === w)?.emoji).join(" ")} {temperature ? `${temperature}°F` : ""}
            </span>
          )}
          {summary.taskCount > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\u2692\uFE0F"} {summary.taskCount} task{summary.taskCount !== 1 ? "s" : ""} logged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DailyReportTabComponent);
```

### File: `app/components/DropTubeTab.tsx`

```tsx
"use client";

import React, { memo } from "react";
import { TANK_PRESETS, type ValveType } from "../lib/constants";
import { formatInches, formatInchesToFeetInches } from "../lib/calculations";
import { useDropTube } from "../lib/tab-contexts";

interface DropTubeTabProps {
  triggerToast: (msg: string) => void;
}

function DropTubeTabComponent({ triggerToast }: DropTubeTabProps) {
  const { state, updateState, d_tank, h_riser, dtResults } = useDropTube();
  const {
    selectedPreset,
    customDiameter,
    riserHeight,
    valveType,
    customValveOffset,
    tankClearance,
  } = state;

  const { upperDropTubeLength, overallDropTubeLength, valveOffset } = dtResults;

  const handlePresetChange = (presetId: string) => {
    const preset = TANK_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      updateState({
        selectedPreset: presetId,
        customDiameter: preset.diameter,
      });
      triggerToast(`Loaded preset ${preset.name}`);
    } else {
      updateState({ selectedPreset: presetId });
    }
  };

  const handleManualDiameterChange = (val: string) => {
    updateState({
      customDiameter: val,
      selectedPreset: "custom",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Workflow Header */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg font-bold">
            ⛽
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              OPW 71SO Overfill Prevention Drop Tube Cut Builder
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold border border-emerald-500/30">
                EPA Overfill Standard
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact cut lengths for Upper &amp; Lower drop tubes based on tank diameter, riser height, and OPW 71SO valve offsets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tank Preset & Dimensions Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>01</span> Tank &amp; Riser Geometry
              </h2>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Preset Specs
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Select Tank Model Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  {TANK_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Tank Inside Diameter (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customDiameter}
                    onChange={(e) => handleManualDiameterChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="92"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Equivalent: <strong className="text-slate-300">{formatInchesToFeetInches(d_tank)}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Riser Pipe Height (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={riserHeight}
                    onChange={(e) => updateState({ riserHeight: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="36"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    From top of tank shell to rim of adapter.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Valve Type & Clearance Settings Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>02</span> Overfill Valve &amp; Clearance Options
              </h2>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Valve Spec
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  OPW 71SO Valve Assembly Model
                </label>
                <select
                  value={valveType}
                  onChange={(e) => updateState({ valveType: e.target.value as ValveType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                >
                  <option value="standard">Standard OPW 71SO (+5.5&quot; Offset)</option>
                  <option value="testable">Testable OPW 71SO-T (+7.25&quot; Offset)</option>
                  <option value="custom">Custom Valve Assembly Offset</option>
                </select>
              </div>

              {valveType === "custom" ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Custom Valve Offset (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customValveOffset}
                    onChange={(e) => updateState({ customValveOffset: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-sm font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Bottom Tank Clearance (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={tankClearance}
                    onChange={(e) => updateState({ tankClearance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Standard EPA/PEI spec is 6.0&quot; clearance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cut Sheet Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upper Drop Tube Cut Length */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-4 shadow-md glow-card-emerald">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Upper Drop Tube Cut Length
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-extrabold">
                  + {valveOffset}&quot; Valve Offset
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatInches(upperDropTubeLength)}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-400 font-mono mt-0.5">
                  {upperDropTubeLength.toFixed(2)}&quot; ({formatInchesToFeetInches(upperDropTubeLength)})
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Formula: Riser Height ({h_riser}&quot;) + Valve Offset ({valveOffset}&quot;)
              </div>
            </div>

            {/* Overall Assembly Length */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-cyan-500/40 p-4 shadow-md glow-card-cyan">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Overall Assembly Length
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono font-extrabold">
                  -{parseFloat(tankClearance) || 6.0}&quot; Clearance
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatInches(overallDropTubeLength)}
                </span>
                <span className="block text-[10px] font-semibold text-cyan-400 font-mono mt-0.5">
                  {overallDropTubeLength.toFixed(2)}&quot; ({formatInchesToFeetInches(overallDropTubeLength)})
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Formula: Riser ({h_riser}&quot;) + Diameter ({d_tank}&quot;) - Clearance ({parseFloat(tankClearance) || 6.0}&quot;)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual SVG Diagram (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live OPW 71SO Drop Tube Diagram
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Field Blueprint
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 400 500" className="w-full h-full">
                {/* Surface / Grade */}
                <line x1="20" y1="50" x2="380" y2="50" stroke="#334155" strokeWidth="3" />
                <text x="30" y="42" fill="#64748b" fontSize="10" fontWeight="bold">Grade Surface</text>

                {/* Manhole & Riser Pipe */}
                <rect x="170" y="50" width="60" height="90" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <text x="238" y="95" fill="#94a3b8" fontSize="10" className="font-mono">Riser: {h_riser}&quot;</text>

                {/* Tank Shell Top */}
                <path d="M 40 140 Q 200 120 360 140" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <text x="300" y="130" fill="#38bdf8" fontSize="10" fontWeight="bold">Tank Shell</text>

                {/* Tank Inside */}
                <rect x="40" y="140" width="320" height="310" rx="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

                {/* Upper Drop Tube */}
                <rect x="185" y="55" width="30" height="120" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <text x="135" y="115" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="end" className="font-mono">
                  Upper: {upperDropTubeLength.toFixed(1)}&quot;
                </text>

                {/* OPW 71SO Valve Mechanism */}
                <rect x="175" y="175" width="50" height="40" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="200" y="198" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">OPW 71SO</text>

                {/* Lower Drop Tube */}
                <rect x="188" y="215" width="24" height="205" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                
                {/* Bottom Clearance Zone */}
                <line x1="180" y1="420" x2="220" y2="420" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="180" y1="440" x2="220" y2="440" stroke="#f59e0b" strokeWidth="2" />
                <text x="230" y="433" fill="#f59e0b" fontSize="10" fontWeight="bold" className="font-mono">
                  Clearance: {tankClearance}&quot;
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DropTubeTabComponent);
```

### File: `app/components/ExcavationTab.tsx`

```tsx
'use client';

import React, { memo } from 'react';
import { FRACTIONS, type SlopeStartMode } from '../lib/constants';
import { formatFeetInches } from '../lib/calculations';
import { useExcavation } from '../lib/tab-contexts';

function ExcavationTabComponent() {
  const {
    state,
    updateState,
    transitShot,
    beddingDepth,
    excResults,
    slopeResults,
  } = useExcavation();

  const {
    excInputMode,
    decTransitShot,
    excFeet,
    excInches,
    excSixteenths,
    beddingDepthFt,
    slopeRun,
    slopeStartMode,
    customSlopeStart,
  } = state;

  const { tankHoleNoBedding, tankHoleWithBedding, trenchDepth } = excResults;
  const { slopeStartDecimal, totalSlopeFallInches, slopeEndDecimal } = slopeResults;

  // Sync decimal shot when switching modes
  const handleSetInputModeExc = (mode: "decimal" | "fractions") => {
    if (mode === "decimal" && excInputMode === "fractions") {
      updateState({ excInputMode: mode, decTransitShot: transitShot.toFixed(2) });
    } else if (mode === "fractions" && excInputMode === "decimal") {
      const feet = Math.floor(transitShot);
      const totalInches = (transitShot - feet) * 12;
      const inches = Math.floor(totalInches);
      const sixteenths = Math.round((totalInches - inches) * 16);
      updateState({
        excInputMode: mode,
        excFeet: feet,
        excInches: inches,
        excSixteenths: sixteenths === 16 ? 0 : sixteenths,
      });
    } else {
      updateState({ excInputMode: mode });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* User Friendly Workflow Card */}
      <div className="bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-lg font-bold">
            🎯
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Excavation Pit Benchmark &amp; Laser Rod Calculator
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-extrabold border border-cyan-500/30">
                +15.5&apos; Constant Rule
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Calculate target rod readings for raw pit depth, pea gravel bedding top, trenching, and vent line pitch fall.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => handleSetInputModeExc("decimal")}
            className={`flex-1 md:flex-none px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              excInputMode === "decimal"
                ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Decimal Feet (4.50&apos;)
          </button>
          <button
            onClick={() => handleSetInputModeExc("fractions")}
            className={`flex-1 md:flex-none px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              excInputMode === "fractions"
                ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Feet, Inches &amp; 1/16ths
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Inputs & Calculations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Finish Grade Shot Input Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>01</span> Finish Grade (FG) Laser Transit Shot
              </h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Reference Rod Reading
              </span>
            </div>

            {excInputMode === "decimal" ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Finish Grade Shot (Decimal Feet)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={decTransitShot}
                    onChange={(e) => updateState({ decTransitShot: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
                    placeholder="4.50"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-500 pointer-events-none font-mono">
                    FT
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-slate-500 font-mono">
                    Equivalent format: <strong className="text-slate-300">{formatFeetInches(transitShot)}</strong>
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Presets:</span>
                    {["4.50", "5.00", "5.25", "6.00"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateState({ decTransitShot: preset })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          decTransitShot === preset
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {preset}&apos;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Feet
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={excFeet}
                    onChange={(e) => updateState({ excFeet: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Inches
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={excInches}
                    onChange={(e) => updateState({ excInches: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-cyan-300 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    1/16ths
                  </label>
                  <select
                    value={excSixteenths}
                    onChange={(e) => updateState({ excSixteenths: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 font-mono text-cyan-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                  >
                    {FRACTIONS.map((frac, idx) => (
                      <option key={idx} value={idx}>
                        {idx === 0 ? "0 (Exact)" : `${idx}/16"`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Bedding Thickness Input */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                  Pea Gravel Bedding Depth (Feet)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {beddingDepth.toFixed(2)} ft ({formatFeetInches(beddingDepth)})
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="3"
                value={beddingDepthFt}
                onChange={(e) => updateState({ beddingDepthFt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-emerald-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="1.0"
              />
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Bedding Presets:</span>
                {[
                  { label: "6\" (0.5')", val: "0.5" },
                  { label: "12\" Std (1.0')", val: "1.0" },
                  { label: "18\" (1.5')", val: "1.5" }
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => updateState({ beddingDepthFt: b.val })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      beddingDepthFt === b.val
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Benchmark Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bottom of Tank Hole (Raw Pit, No Bedding) */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-cyan-500/40 p-4 shadow-md glow-card-cyan">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Bottom of Hole (Raw Dirt)
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono font-extrabold">
                  +15.5&apos; Constant
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatFeetInches(tankHoleNoBedding)}
                </span>
                <span className="block text-[10px] font-semibold text-cyan-400 font-mono mt-0.5">
                  {tankHoleNoBedding.toFixed(2)} ft decimal (FG Shot + 15.50&apos;)
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Target rod reading at un-bedded dirt pit base.
              </div>
            </div>

            {/* Bottom of Hole (With Bedding / Top of Gravel) */}
            <div className="relative overflow-hidden bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-4 shadow-md glow-card-emerald">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Top of Pea Gravel Bedding
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-extrabold">
                  +{(15.5 - beddingDepth).toFixed(1)}&apos; Bedded
                </span>
              </div>
              <div className="mt-2">
                <span className="block text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                  {formatFeetInches(tankHoleWithBedding)}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-400 font-mono mt-0.5">
                  {tankHoleWithBedding.toFixed(2)} ft decimal (FG + 15.5&apos; - {beddingDepth.toFixed(1)}&apos;)
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Target rod reading on top of pea gravel bed.
              </div>
            </div>
          </div>

          {/* Vent Line Slope Calculator Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>02</span> Vent &amp; Product Line Slope Calculator
              </h2>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                1/8&quot; Per Foot Pitch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Trench Run Length (Feet)
                </label>
                <input
                  type="number"
                  min="1"
                  value={slopeRun}
                  onChange={(e) => updateState({ slopeRun: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Slope Rate Pitch
                </label>
                <select
                  value={state.slopeRateInchesPerFoot || "0.125"}
                  onChange={(e) => updateState({ slopeRateInchesPerFoot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="0.125">1/8&quot; per foot (Standard Fuel/Vent)</option>
                  <option value="0.250">1/4&quot; per foot (Steep Drainage)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  High Point Shot Mode
                </label>
                <select
                  value={slopeStartMode}
                  onChange={(e) => updateState({ slopeStartMode: e.target.value as SlopeStartMode })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="trench">Standard Trench (FG + 3.0&apos;)</option>
                  <option value="custom">Custom High Point Shot</option>
                </select>
              </div>
            </div>

            {slopeStartMode === "custom" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Custom High Point Transit Shot (Feet)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customSlopeStart}
                  onChange={(e) => updateState({ customSlopeStart: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-300 text-sm font-bold"
                />
              </div>
            )}

            {/* Slope Output Summary */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Total Fall</span>
                <span className="font-mono font-bold text-amber-400 text-sm">+{totalSlopeFallInches.toFixed(2)}&quot;</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">High Point Shot</span>
                <span className="font-mono font-bold text-slate-200 text-xs">{formatFeetInches(slopeStartDecimal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Low Point at Tank</span>
                <span className="font-mono font-bold text-amber-300 text-xs">{formatFeetInches(slopeEndDecimal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Interactive SVG Diagram & Laser Reference Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start">
          {/* Interactive SVG Diagram */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Live Laser Benchmark Cross-Section
              </h3>
              <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                +15.5&apos; Baseline
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] max-h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1.5">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                {/* Sky & Surface */}
                <rect x="0" y="0" width="800" height="80" fill="#090d16" />
                
                {/* Laser Transmitter */}
                <rect x="50" y="25" width="24" height="35" rx="3" fill="#06b6d4" />
                <line x1="62" y1="25" x2="62" y2="10" stroke="#06b6d4" strokeWidth="3" />
                <circle cx="62" cy="8" r="4" fill="#22d3ee" />
                
                {/* Laser Beam Line */}
                <line x1="74" y1="40" x2="750" y2="40" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,4" className="animate-pulse" />
                
                {/* Surface Grade Line (FG) */}
                <line x1="0" y1="80" x2="800" y2="80" stroke="#334155" strokeWidth="4" />
                <text x="15" y="70" fill="#94a3b8" fontSize="12" fontWeight="bold">Finish Grade (FG)</text>

                {/* Dirt Excavation Pit */}
                <polygon points="120,80 180,440 620,440 680,80" fill="#1e1b18" stroke="#44403c" strokeWidth="3" />
                
                {/* Pea Gravel Bedding Layer */}
                <polygon points="175,410 180,440 620,440 625,410" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="400" y="430" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Pea Gravel Bedding ({beddingDepth.toFixed(1)}&apos;)
                </text>

                {/* UST Tank Outline */}
                <ellipse cx="400" cy="270" rx="190" ry="130" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <text x="400" y="275" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Underground Storage Tank (UST)
                </text>

                {/* Transit Grade Rod */}
                <line x1="550" y1="40" x2="550" y2="440" stroke="#f59e0b" strokeWidth="3" />
                <rect x="542" y="32" width="16" height="16" fill="#f59e0b" rx="2" />

                {/* Dimension: Raw Pit Bottom (+15.5' Constant) */}
                <g>
                  <line x1="710" y1="40" x2="710" y2="440" stroke="#06b6d4" strokeWidth="2" />
                  <path d="M 705 40 L 715 40 M 705 440 L 715 440" stroke="#06b6d4" strokeWidth="2" />
                  <text x="725" y="230" fill="#22d3ee" fontSize="12" fontWeight="bold" className="font-mono">
                    Raw Pit Bottom:
                  </text>
                  <text x="725" y="248" fill="#ffffff" fontSize="13" fontWeight="extrabold" className="font-mono">
                    {tankHoleNoBedding.toFixed(2)}&apos;
                  </text>
                  <text x="725" y="264" fill="#06b6d4" fontSize="10" className="font-mono font-bold">
                    [FG + 15.5&apos; Constant]
                  </text>
                </g>

                {/* Dimension: Bedding Top */}
                <g>
                  <line x1="650" y1="40" x2="650" y2="410" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />
                  <path d="M 645 40 L 655 40 M 645 410 L 655 410" stroke="#10b981" strokeWidth="1.5" />
                  <text x="655" y="160" fill="#34d399" fontSize="11" fontWeight="bold" className="font-mono" textAnchor="end">
                    Top of Gravel: {tankHoleWithBedding.toFixed(2)}&apos;
                  </text>
                </g>

                {/* Callout */}
                <text x="62" y="55" fill="#06b6d4" fontSize="10" fontWeight="bold">Shot S = {transitShot.toFixed(2)}&apos;</text>
              </svg>
            </div>
          </div>

          {/* Laser Rod Benchmark Quick Citing Table */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>📋 Benchmark Laser Rod Summary Table</span>
              <span className="text-[9px] font-mono text-cyan-400">Field Reference</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1 px-1.5">Benchmark Target</th>
                    <th className="py-1 px-1.5">Constant</th>
                    <th className="py-1 px-1.5 text-right">Rod Shot (Ft-In)</th>
                    <th className="py-1 px-1.5 text-right">Decimal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-1.5 px-1.5 font-semibold text-slate-300 font-sans">Finish Grade (FG) Shot</td>
                    <td className="py-1.5 px-1.5 text-slate-500">Ref</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-white">{formatFeetInches(transitShot)}</td>
                    <td className="py-1.5 px-1.5 text-right text-slate-400">{transitShot.toFixed(2)}&apos;</td>
                  </tr>
                  <tr className="bg-cyan-950/30">
                    <td className="py-1.5 px-1.5 font-semibold text-cyan-300 font-sans">Bottom of Hole (Raw Pit)</td>
                    <td className="py-1.5 px-1.5 text-cyan-400 font-bold">+15.5&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-cyan-300 text-xs">{formatFeetInches(tankHoleNoBedding)}</td>
                    <td className="py-1.5 px-1.5 text-right text-cyan-400 font-bold">{tankHoleNoBedding.toFixed(2)}&apos;</td>
                  </tr>
                  <tr className="bg-emerald-950/20">
                    <td className="py-1.5 px-1.5 font-semibold text-emerald-300 font-sans">Top of Pea Gravel Bedding</td>
                    <td className="py-1.5 px-1.5 text-emerald-400">+{(15.5 - beddingDepth).toFixed(1)}&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-emerald-300">{formatFeetInches(tankHoleWithBedding)}</td>
                    <td className="py-1.5 px-1.5 text-right text-emerald-400">{tankHoleWithBedding.toFixed(2)}&apos;</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-semibold text-amber-300 font-sans">Trenching Depth</td>
                    <td className="py-1.5 px-1.5 text-amber-400">+3.0&apos;</td>
                    <td className="py-1.5 px-1.5 text-right font-bold text-amber-300">{formatFeetInches(trenchDepth)}</td>
                    <td className="py-1.5 px-1.5 text-right text-amber-400">{trenchDepth.toFixed(2)}&apos;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExcavationTabComponent);
```

### File: `app/components/HelpModal.tsx`

```tsx
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
```

### File: `app/components/JobManager.tsx`

```tsx
// encoding: utf-8
"use client";

import React, { useState } from "react";

interface Job {
  id: string;
  name: string;
  updatedAt: string;
}

interface JobManagerProps {
  jobList: Job[];
  activeJobId: string;
  onSelectJob: (id: string) => void;
  onCreateJob: (name: string) => string;
  onCloneJob?: (sourceId: string, newName: string) => void;
  onDeleteJob: (id: string) => void;
  triggerToast: (msg: string) => void;
}

export default function JobManager({
  jobList,
  activeJobId,
  onSelectJob,
  onCreateJob,
  onCloneJob,
  onDeleteJob,
  triggerToast,
}: JobManagerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);

  const handleCreate = () => {
    const name = newJobName.trim() || `Job Site ${jobList.length + 1}`;
    onCreateJob(name);
    setNewJobName("");
    setShowNewInput(false);
    setShowDropdown(false);
    triggerToast(`Created job: ${name}`);
  };

  const handleClone = (id: string, name: string) => {
    if (onCloneJob) {
      onCloneJob(id, `${name} (Copy)`);
      setShowDropdown(false);
      triggerToast(`Cloned job: ${name}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (jobList.length <= 1) {
      triggerToast("Cannot delete the last remaining job site.");
      return;
    }
    if (confirm(`Delete job site "${name}" and all its saved calculations?`)) {
      onDeleteJob(id);
      triggerToast(`Deleted job: ${name}`);
    }
  };

  const activeJob = jobList.find((j) => j.id === activeJobId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
      >
        <span>📁</span>
        <span>{activeJob ? activeJob.name : "No Job Selected"}</span>
        <svg className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 z-40 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Saved Jobs</span>
            <button
              onClick={() => setShowNewInput(!showNewInput)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              + New Job
            </button>
          </div>

          {showNewInput && (
            <div className="p-3 border-b border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Job site name..."
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer hover:bg-cyan-400"
              >
                Save
              </button>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {jobList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No saved jobs yet. Create one to persist your calculations.
              </div>
            ) : (
              jobList.map((job) => (
                <div
                  key={job.id}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs cursor-pointer transition-all ${
                    job.id === activeJobId
                      ? "bg-cyan-950/50 text-cyan-300 border-l-2 border-cyan-400"
                      : "text-slate-300 hover:bg-slate-800/50 border-l-2 border-transparent"
                  }`}
                  onClick={() => {
                    onSelectJob(job.id);
                    setShowDropdown(false);
                    triggerToast(`Loaded job: ${job.name}`);
                  }}
                >
                  <div>
                    <span className="font-bold block">{job.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Updated: {new Date(job.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {job.id === activeJobId && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {onCloneJob && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClone(job.id, job.name);
                        }}
                        className="text-slate-500 hover:text-cyan-300 p-1 cursor-pointer"
                        title="Duplicate this job site"
                      >
                        📋
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.id, job.name);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Delete job"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### File: `app/components/PhotoGallery.tsx`

```tsx
// encoding: utf-8
"use client";

import React, { useState, useRef } from "react";
import { PreBuryPhoto, PhotoCategory } from "../lib/tab-types";

interface PhotoGalleryProps {
  photos: PreBuryPhoto[];
  onAddPhoto: (photo: Omit<PreBuryPhoto, "id" | "timestamp">) => void;
  onDeletePhoto: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  triggerToast?: (msg: string) => void;
}

const CATEGORIES: { id: PhotoCategory; label: string; emoji: string }[] = [
  { id: "gauge", label: "Air Gauge & Pressure", emoji: "⏱️" },
  { id: "bedding", label: "Bedding & Hole", emoji: "🪨" },
  { id: "piping", label: "Piping & Sumps", emoji: "🔧" },
  { id: "deflection", label: "Deflection & Shell", emoji: "📐" },
  { id: "general", label: "Site & Anchors", emoji: "🏗️" },
];

/**
 * Client-side canvas compression: scales max dimension to 1024px at 0.72 JPEG quality.
 * Shrinks 3–8 MB camera photos down to ~70–120 KB without noticeable inspection quality loss.
 */
async function compressImageFile(file: File): Promise<{ dataUrl: string; originalKb: number; compressedKb: number }> {
  const originalKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Add subtle timestamp watermark to the corner of compressed image
        const dateStamp = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(10, height - 32, 175, 24);
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`UST HUB • ${dateStamp}`, 16, height - 16);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        const compressedKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, originalKb, compressedKb });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoGallery({
  photos = [],
  onAddPhoto,
  onDeletePhoto,
  onUpdateCaption,
  triggerToast,
}: PhotoGalleryProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>("gauge");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<PreBuryPhoto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl, originalKb, compressedKb } = await compressImageFile(file);
        const categoryMeta = CATEGORIES.find((c) => c.id === selectedCategory);
        const defaultCaption = `${categoryMeta?.label || "Inspection Photo"} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

        onAddPhoto({
          category: selectedCategory,
          caption: defaultCaption,
          dataUrl,
        });

        triggerToast?.(`Photo saved! Compressed ${originalKb}KB → ${compressedKb}KB`);
      } catch (err) {
        console.error("Image processing error:", err);
        triggerToast?.("Failed to process photo.");
      }
    }

    setIsProcessing(false);
    if (e.target) e.target.value = "";
  };

  const filteredPhotos = filterCategory === "all"
    ? photos
    : photos.filter((p) => p.category === filterCategory);

  const handleStartEditCaption = (photo: PreBuryPhoto) => {
    setEditingId(photo.id);
    setEditCaption(photo.caption);
  };

  const handleSaveCaption = (id: string) => {
    onUpdateCaption(id, editCaption.trim() || "Inspection Photo");
    setEditingId(null);
    triggerToast?.("Caption updated");
  };

  const handleDownload = (photo: PreBuryPhoto) => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `ust-inspection-${photo.category}-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hidden file inputs: one for direct camera, one for photo library */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action Header Card */}
      <div className="bg-slate-900/90 p-4 md:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Field Inspection Photo Evidence ({photos.length} Captured)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap the camera to capture live pit photos or attach from your library. Photos are auto-compressed for offline storage and included in PDF submittals.
          </p>
        </div>

        {/* Capture Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PhotoCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-teal-300 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>📸</span>
            <span>{isProcessing ? "Processing..." : "Take Photo"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>📁</span>
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === "all"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Photos ({photos.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = photos.filter((p) => p.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === c.id
                    ? "bg-teal-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl text-teal-400">
            📸
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {filterCategory === "all" ? "No Inspection Photos Captured Yet" : "No Photos in This Category"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Take photos of the 5.0 psig gauge hold, tank bedding, containment sumps, deflection measurements, and anchor straps for the pre-bury sign-off submittal.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              📸 Open Camera Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const cat = CATEGORIES.find((c) => c.id === photo.category);
            return (
              <div
                key={photo.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group"
              >
                {/* Photo Thumbnail */}
                <div
                  className="relative h-44 bg-slate-950 cursor-pointer overflow-hidden"
                  onClick={() => setActivePhoto(photo)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    <span>{cat?.emoji}</span>
                    <span>{cat?.label}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400">
                    {photo.timestamp.split(",")[1] || photo.timestamp}
                  </div>
                </div>

                {/* Photo Card Footer */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  {editingId === photo.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveCaption(photo.id)}
                        className="flex-1 bg-slate-950 border border-teal-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCaption(photo.id)}
                        className="px-2 py-1 bg-teal-500 text-slate-950 font-bold text-[10px] rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer group/cap"
                      onClick={() => handleStartEditCaption(photo)}
                      title="Click to edit caption"
                    >
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                        {photo.caption}
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-0.5 group-hover/cap:text-teal-400">
                        {photo.timestamp} • ✏️ Edit
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setActivePhoto(photo)}
                      className="text-teal-400 hover:text-teal-300 text-[11px] font-bold cursor-pointer"
                    >
                      🔍 Full View
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(photo)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Download photo"
                      >
                        💾
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this inspection photo?")) {
                            onDeletePhoto(photo.id);
                            triggerToast?.("Photo deleted");
                          }
                        }}
                        className="text-slate-400 hover:text-red-400 text-xs cursor-pointer"
                        title="Delete photo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activePhoto.caption}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{activePhoto.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activePhoto)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  💾 Download
                </button>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black p-2 flex items-center justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.dataUrl}
                alt={activePhoto.caption}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### File: `app/components/PreBuryTab.tsx`

```tsx
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
```

### File: `app/components/PrintLayout.tsx`

```tsx
// encoding: utf-8
"use client";

import React, { memo } from "react";
import { formatFeetInches } from "../lib/calculations";
import type { ActiveTab } from "../lib/constants";
import { useExcavation, useConcrete, usePreBury } from "../lib/tab-contexts";

interface PrintLayoutProps {
  activeTab: ActiveTab;
}

function PrintLayoutComponent({ activeTab }: PrintLayoutProps) {
  const { transitShot, beddingDepth, excResults } = useExcavation();
  const { tankHoleNoBedding, tankHoleWithBedding, trenchDepth } = excResults;

  const { state: concreteState, concreteVolume, rebarResults, gravelResults, turnbuckleLayout, buoyancyResults } = useConcrete();
  const { concreteShape, wastePct, rebarSpacing, rebarSize, gravelDepth } = concreteState;
  const { adjustedVolumeCy, adjustedVolumeCf, bags80lb, bags60lb, bags40lb, truckLoads } = concreteVolume;
  const { totalLf: rebarTotalLf, pieces20: rebarPieces20 } = rebarResults;
  const { cy: gravelCy, tons: gravelTons } = gravelResults;

  const preBury = usePreBury();

  return (
    <div className="print-only p-8 text-black bg-white space-y-6">
      <div className="border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase">UST Field Operations Submittal Cut Sheet</h1>
          <p className="text-xs">Generated from UST Field Hub App</p>
        </div>
        <div className="text-right text-xs">
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Tab Exported:</strong> {activeTab.toUpperCase()}</p>
        </div>
      </div>

      {activeTab === "excavation" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Laser Transit Benchmark Shots (+15.5&apos; Constant Rule)</h2>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">Target Description</th>
                <th className="p-2">Constant</th>
                <th className="p-2">Rod Shot (Ft-In)</th>
                <th className="p-2">Decimal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-bold font-sans">Finish Grade (FG) Transit Shot</td>
                <td className="p-2">Ref</td>
                <td className="p-2 font-bold">{formatFeetInches(transitShot)}</td>
                <td className="p-2">{transitShot.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200 font-bold bg-gray-50">
                <td className="p-2 font-sans">Bottom of Hole (Raw Dirt, No Bedding)</td>
                <td className="p-2">+15.5&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleNoBedding)}</td>
                <td className="p-2">{tankHoleNoBedding.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Top of Pea Gravel Bedding ({beddingDepth.toFixed(1)}&apos;)</td>
                <td className="p-2">+{(15.5 - beddingDepth).toFixed(1)}&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleWithBedding)}</td>
                <td className="p-2">{tankHoleWithBedding.toFixed(2)} ft</td>
              </tr>
              <tr>
                <td className="p-2 font-sans">Trenching Depth (Product Lines)</td>
                <td className="p-2">+3.0&apos;</td>
                <td className="p-2">{formatFeetInches(trenchDepth)}</td>
                <td className="p-2">{trenchDepth.toFixed(2)} ft</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "concrete" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Concrete Materials &amp; Reinforcement Cut Sheet</h2>
          <div className="border border-gray-300 p-4 rounded bg-gray-50 space-y-1">
            <p><strong>Form Shape:</strong> {concreteShape.toUpperCase()}</p>
            <p><strong>Total Concrete Volume:</strong> {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(2)} CF) [+{wastePct}% Buffer]</p>
            <p><strong>Pre-mixed Bags:</strong> 80lb: {bags80lb} bags | 60lb: {bags60lb} bags | 40lb: {bags40lb} bags</p>
            <p><strong>Ready-Mix Trucks:</strong> {truckLoads.toFixed(1)} Truckloads (10 CY ea)</p>
            <p><strong>Rebar Grid:</strong> {rebarSpacing === "none" ? "None" : `${rebarSpacing}" Grid (${rebarSize})`} | Total: {rebarTotalLf.toFixed(1)} LF ({rebarPieces20} x 20ft sticks)</p>
            <p><strong>Sub-Base Gravel:</strong> {gravelDepth === "none" ? "None" : `${gravelDepth}" Depth`} ({gravelCy.toFixed(2)} CY, {gravelTons.toFixed(2)} Tons)</p>
            {(concreteShape === "deadman" || concreteShape === "ballast") && (
              <div className="pt-2 border-t border-gray-300 text-black">
                <p><strong>PEI RP100 Buoyancy Safety Factor:</strong> {(buoyancyResults?.safetyFactor ?? 0).toFixed(2)}x ({buoyancyResults?.isSafe ? "PEI COMPLIANT ≥ 1.20x" : "WARNING: BELOW 1.20x"})</p>
                <p><strong>Downward Restraining Force (F_D):</strong> {(buoyancyResults?.totalDownwardForceLbs ?? 0).toLocaleString()} lbs | <strong>Upward Buoyancy (F_B):</strong> {(buoyancyResults?.buoyantUpliftLbs ?? 0).toLocaleString()} lbs</p>
                <p><strong>Net Strap Load:</strong> {Math.round(buoyancyResults?.loadPerStrapLbs ?? 0).toLocaleString()} lbs / strap set (Strap WLL: {(buoyancyResults?.strapWllLbs ?? 5200).toLocaleString()} lbs)</p>
                <p><strong>Anchor Strap Sets:</strong> {turnbuckleLayout.strapCount} sets | Total Turnbuckles: {turnbuckleLayout.turnbuckleCount} units</p>
                <p><strong>Top Arc Strap Wrap:</strong> {turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot; | Net Cut Length: {turnbuckleLayout.netStrapCutLengthInches.toFixed(1)}&quot; / strap</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "prebury" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-black pb-1 uppercase">
            UST Pre-Bury Air Test &amp; Installation Verification Submittal
          </h2>
          <div className="border border-gray-300 p-4 rounded bg-gray-50 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Job Site:</strong> {preBury.state.siteName}</p>
                <p><strong>Location:</strong> {preBury.state.location}</p>
                <p><strong>Phase:</strong> {preBury.state.phase}</p>
              </div>
              <div className="text-right">
                <p><strong>Scheduled Inspection:</strong> {preBury.state.targetInspectionDate}</p>
                <p><strong>Checklists Signed:</strong> {preBury.checksCompleted} / {preBury.checksTotal}</p>
                <p><strong>Submittal Docs Ready:</strong> {preBury.docsCompleted} / {preBury.docsTotal}</p>
                <p><strong>Photos Documented:</strong> {(preBury.state.photos || []).length} photos attached</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase pt-2">Primary &amp; Secondary Tank Air Pressure Tests</h3>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">Tank ID</th>
                <th className="p-2">Capacity</th>
                <th className="p-2">Test Pressure</th>
                <th className="p-2">Hold Duration</th>
                <th className="p-2">Status</th>
                <th className="p-2">Field Notes</th>
              </tr>
            </thead>
            <tbody>
              {preBury.state.airTests.map((t) => (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="p-2 font-bold font-sans">{t.tankName}</td>
                  <td className="p-2">{(t.capacityGal || 0).toLocaleString()} gal</td>
                  <td className="p-2">{t.testPsig.toFixed(1)} psig</td>
                  <td className="p-2">{t.holdDurationMin} min</td>
                  <td className="p-2 font-bold uppercase">{t.status}</td>
                  <td className="p-2 text-[10px] text-gray-600">{t.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Photo Evidence Thumbnails in Printout */}
          {preBury.state.photos && preBury.state.photos.length > 0 && (
            <div className="pt-3 border-t border-gray-300 space-y-2">
              <h3 className="text-xs font-bold uppercase">Field Inspection Photo Evidence</h3>
              <div className="grid grid-cols-4 gap-2">
                {preBury.state.photos.slice(0, 8).map((p) => (
                  <div key={p.id} className="border border-gray-300 p-1 rounded bg-gray-50 text-[9px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={p.caption} className="w-full h-20 object-cover rounded" />
                    <p className="font-bold truncate mt-1">{p.caption}</p>
                    <p className="text-gray-500 font-mono">{p.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Inspector Sign-off Block */}
          {preBury.state.signOff && (
            <div className="border-2 border-black p-4 rounded bg-gray-50 mt-4 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <div>
                  <h4 className="font-bold uppercase text-xs">Official Pre-Bury Inspection Authorization</h4>
                  <p className="text-[10px] text-gray-600">PEI RP100 &amp; EPA 40 CFR 280 Compliance Sign-Off</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  preBury.state.signOff.isApproved
                    ? "bg-green-100 text-green-900 border-green-500"
                    : "bg-yellow-100 text-yellow-900 border-yellow-500"
                }`}>
                  {preBury.state.signOff.isApproved ? "✓ Approved for Pit Backfill" : "Conditional Sign-Off"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <p><strong>Inspector:</strong> {preBury.state.signOff.inspectorName || "—"} ({preBury.state.signOff.inspectorTitle || "Inspector"})</p>
                  <p><strong>Agency / Dept:</strong> {preBury.state.signOff.agencyOrCompany || "—"}</p>
                  <p><strong>License / Cert #:</strong> {preBury.state.signOff.certificationNumber || "—"}</p>
                  {preBury.state.signOff.inspectorNotes && (
                    <p className="mt-1"><strong>Comments:</strong> {preBury.state.signOff.inspectorNotes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p><strong>Date &amp; Time:</strong> {preBury.state.signOff.signedAt || "—"}</p>
                  {preBury.state.signOff.signatureDataUrl ? (
                    <div className="mt-1 inline-block text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preBury.state.signOff.signatureDataUrl}
                        alt="Inspector Signature"
                        className="h-12 border-b border-black block ml-auto"
                      />
                      <p className="text-[9px] text-gray-500 text-right">Certified Signature on File</p>
                    </div>
                  ) : (
                    <div className="border-b border-black mt-8 w-40 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs font-sans">
        <div>
          <p className="font-bold uppercase">Field Agent / Inspector Sign-Off:</p>
          {preBury.state.signOff?.signatureDataUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preBury.state.signOff.signatureDataUrl}
                alt="Signature"
                className="h-12 border-b border-black"
              />
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                {preBury.state.signOff.inspectorName} • {preBury.state.signOff.signedAt}
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-black mt-8 w-48" />
              <p className="text-[10px] text-gray-500 mt-1">Signature &amp; Date</p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold uppercase">Project / Location:</p>
          <div className="border-b border-black mt-8 w-48 ml-auto" />
          <p className="text-[10px] text-gray-500 mt-1">Site &amp; Tank Tag ID</p>
        </div>
      </div>
    </div>
  );
}

export default memo(PrintLayoutComponent);
```

### File: `app/components/SignaturePad.tsx`

```tsx
// encoding: utf-8
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface SignaturePadProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  signerName?: string;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export default function SignaturePad({
  initialDataUrl = "",
  onSave,
  onClear,
  signerName = "",
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialDataUrl);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  // Initialize canvas resolution & load existing signature
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = 180;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a"; // slate-900 canvas surface
    ctx.fillRect(0, 0, width, height);

    // Draw base guideline
    ctx.strokeStyle = "#334155"; // slate-700
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 35);
    ctx.lineTo(width - 20, height - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  // Redraw all strokes
  const redrawCanvas = useCallback((allStrokes: Point[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Baseline guide
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 35);
    ctx.lineTo(canvas.width - 20, canvas.height - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stroke ink
    ctx.strokeStyle = "#22d3ee"; // cyan-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of allStrokes) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const point = getCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const point = getCoordinates(e);
    if (!point) return;

    setCurrentStroke((prev) => {
      const updated = [...prev, point];
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && prev.length > 0) {
        const last = prev[prev.length - 1];
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      return updated;
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setHasSignature(true);

      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL("image/png"));
      }
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setHasSignature(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, canvas.height - 35);
        ctx.lineTo(canvas.width - 20, canvas.height - 35);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    onClear?.();
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    redrawCanvas(newStrokes);
    setHasSignature(newStrokes.length > 0);

    const canvas = canvasRef.current;
    if (canvas) {
      if (newStrokes.length > 0) {
        onSave(canvas.toDataURL("image/png"));
      } else {
        onClear?.();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold flex items-center gap-1.5">
          <span>✍️</span>
          <span>{signerName ? `${signerName}'s Signature` : "Sign Here (Touch / Stylus / Mouse)"}</span>
        </span>
        <div className="flex items-center gap-2">
          {hasSignature && !disabled && (
            <>
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold disabled:opacity-40 cursor-pointer"
                title="Undo last stroke"
              >
                ↩ Undo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 rounded text-[11px] font-bold cursor-pointer"
                title="Clear signature"
              >
                ✕ Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden border transition-all ${
          isDrawing
            ? "border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
            : hasSignature
            ? "border-emerald-500/50"
            : "border-slate-800"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-crosshair"}`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none w-full block bg-slate-900"
        />

        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 text-xs">
            <span className="text-xl mb-1">✍️</span>
            <span>Sign with finger or stylus inside box</span>
            <span className="text-[10px] text-slate-600 mt-0.5">X ________________________________</span>
          </div>
        )}

        <div className="absolute bottom-2 left-4 pointer-events-none text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          X Signer Baseline
        </div>
      </div>

      {hasSignature && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <span>✓</span>
          <span>Signature recorded &amp; attached to job submittal</span>
        </div>
      )}
    </div>
  );
}
```

### File: `app/hooks/usePersistedState.ts`

```ts
// encoding: utf-8
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A localStorage-backed useState hook.
 * On mount, it restores the value from localStorage (if present).
 * On every state change, it persists the new value.
 * If key changes, it loads the new key's value without overwriting.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [prevKey, setPrevKey] = useState(key);
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupted data or parse failure — fall back to default
    }
    return defaultValue;
  });

  if (prevKey !== key) {
    setPrevKey(key);
    let newVal = defaultValue;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          newVal = JSON.parse(stored) as T;
        }
      } catch {
        // ignore
      }
    }
    setState(newVal);
  }

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [key, state]);

  return [state, setState];
}

// ─── Job Manager Types ───────────────────────────────────────────────────────

export interface JobData {
  name: string;
  createdAt: string;
  updatedAt: string;
  activeTab: string;
  // Excavation state
  excInputMode: string;
  decTransitShot: string;
  excFeet: number;
  excInches: number;
  excSixteenths: number;
  beddingDepthFt: string;
  slopeRun: string;
  slopeStartMode: string;
  customSlopeStart: string;
  // Drop Tube state
  selectedPreset: string;
  customDiameter: string;
  riserHeight: string;
  valveType: string;
  customValveOffset: string;
  tankClearance: string;
  // Concrete state
  concreteShape: string;
  flatLength: string; flatWidth: string; flatThickness: string; flatQuantity: string;
  circDiameter: string; circThickness: string; circQuantity: string;
  sonoDiameter: string; sonoHeight: string; sonoQuantity: string;
  footLength: string; footWidth: string; footDepth: string; footQuantity: string;
  deadmanLength: string; deadmanWidth: string; deadmanHeight: string; deadmanQuantity: string;
  ballastLength: string; ballastWidth: string; ballastThickness: string; ballastQuantity: string;
  curbLength: string; curbHeight: string; curbWidth: string; gutterThickness: string; gutterWidth: string; curbQuantity: string;
  stepCount: string; stepWidth: string; stepRise: string; stepRun: string; stepQuantity: string;
  wallLength: string; wallWidth: string; wallDepth: string; wallQuantity: string;
  wastePct: number;
  rebarSpacing: string;
  rebarSize: string;
  wireMesh: string;
  gravelDepth: string;
  pricePerCy: string;
  pricePerBag80: string; pricePerBag60: string; pricePerBag40: string;
  pricePerGravelTon: string; pricePerRebarStick: string; pricePerMeshRoll: string;
  // Construction state
  constTool: string;
  triA: string; triB: string;
  aggLength: string; aggWidth: string; aggDepth: string; aggMat: string; aggWaste: string; aggPriceTon: string;
  formPerimeter: string; formSpacing: string; formPlates: string; formStakeSpacing: string;
  bfThickness: string; bfWidth: string; bfLength: string; bfQuantity: string; bfPricePerBf: string;
  convCategory: string; convFromUnit: string; convInputVal: string;
}

export interface JobStore {
  jobs: Record<string, JobData>;
  activeJobId: string;
}

const JOBS_STORAGE_KEY = "ust-hub-jobs";

export function useJobManager() {
  const [store, setStore] = useState<JobStore>(() => {
    if (typeof window === "undefined") return { jobs: {}, activeJobId: "" };
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as JobStore;
      }
    } catch { /* fall through */ }
    return { jobs: {}, activeJobId: "" };
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(store));
    } catch { /* fail silently */ }
  }, [store]);

  const saveJob = useCallback((id: string, data: JobData) => {
    setStore((prev) => ({
      ...prev,
      jobs: { ...prev.jobs, [id]: { ...data, updatedAt: new Date().toISOString() } },
      activeJobId: id,
    }));
  }, []);

  const loadJob = useCallback((id: string): JobData | null => {
    return store.jobs[id] || null;
  }, [store.jobs]);

  const deleteJob = useCallback((id: string) => {
    setStore((prev) => {
      const newJobs = { ...prev.jobs };
      delete newJobs[id];
      const remainingIds = Object.keys(newJobs);
      return {
        jobs: newJobs,
        activeJobId: prev.activeJobId === id ? (remainingIds[0] || "") : prev.activeJobId,
      };
    });
  }, []);

  const setActiveJob = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, activeJobId: id }));
  }, []);

  const createJob = useCallback((name: string): string => {
    const id = `job-${Date.now()}`;
    const newJob: JobData = {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeTab: "excavation",
      excInputMode: "decimal", decTransitShot: "4.50",
      excFeet: 4, excInches: 6, excSixteenths: 0,
      beddingDepthFt: "1.0", slopeRun: "40", slopeStartMode: "trench", customSlopeStart: "7.50",
      selectedPreset: "x-10k-92", customDiameter: "92", riserHeight: "36",
      valveType: "standard", customValveOffset: "5.5", tankClearance: "6.0",
      concreteShape: "flatwork",
      flatLength: "30", flatWidth: "12", flatThickness: "8", flatQuantity: "1",
      circDiameter: "12", circThickness: "6", circQuantity: "1",
      sonoDiameter: "24", sonoHeight: "6", sonoQuantity: "4",
      footLength: "6", footWidth: "6", footDepth: "3.5", footQuantity: "4",
      deadmanLength: "20", deadmanWidth: "18", deadmanHeight: "18", deadmanQuantity: "2",
      ballastLength: "32", ballastWidth: "14", ballastThickness: "12", ballastQuantity: "1",
      curbLength: "20", curbHeight: "6", curbWidth: "6", gutterThickness: "6", gutterWidth: "18", curbQuantity: "1",
      stepCount: "3", stepWidth: "4", stepRise: "7", stepRun: "11", stepQuantity: "1",
      wallLength: "50", wallWidth: "12", wallDepth: "18", wallQuantity: "1",
      wastePct: 10, rebarSpacing: "12", rebarSize: "#4", wireMesh: "roll_750", gravelDepth: "4",
      pricePerCy: "150.00", pricePerBag80: "8.50", pricePerBag60: "6.50", pricePerBag40: "4.50",
      pricePerGravelTon: "45.00", pricePerRebarStick: "12.00", pricePerMeshRoll: "180.00",
      constTool: "triangle", triA: "30", triB: "40",
      aggLength: "50", aggWidth: "20", aggDepth: "6", aggMat: "crushed_stone", aggWaste: "10", aggPriceTon: "35.00",
      formPerimeter: "100", formSpacing: "16", formPlates: "3", formStakeSpacing: "3",
      bfThickness: "2", bfWidth: "6", bfLength: "12", bfQuantity: "10", bfPricePerBf: "2.50",
      convCategory: "length", convFromUnit: "ft", convInputVal: "10",
    };
    setStore((prev) => ({
      jobs: { ...prev.jobs, [id]: newJob },
      activeJobId: id,
    }));
    return id;
  }, []);

  return {
    store,
    activeJobId: store.activeJobId,
    activeJob: store.activeJobId ? store.jobs[store.activeJobId] || null : null,
    jobList: Object.entries(store.jobs).map(([id, data]) => ({ id, name: data.name, updatedAt: data.updatedAt })),
    saveJob,
    loadJob,
    deleteJob,
    setActiveJob,
    createJob,
  };
}
```

### File: `app/lib/calculations.ts`

```ts
// encoding: utf-8
// Pure calculation and formatting functions for UST Field Hub
// All functions are stateless and side-effect-free.

import {
  FRACTIONS,
  EXCAVATION_CONSTANT,
  TRENCH_CONSTANT,
  SLOPE_RATE_INCHES_PER_FOOT,
  BAG_YIELDS,
  TRUCK_CAPACITY_CY,
  SHORT_LOAD_THRESHOLD_CY,
  AGG_DENSITIES,
  type ConcreteShape,
} from "./constants";

// ─── Formatting Helpers ──────────────────────────────────────────────────────

/** Convert decimal feet to standard construction format (feet, inches, fraction) */
export function formatFeetInches(totalFeet: number): string {
  if (isNaN(totalFeet) || totalFeet < 0) return "0' 0\"";

  const feet = Math.floor(totalFeet);
  const totalInches = (totalFeet - feet) * 12;
  const inches = Math.floor(totalInches);
  const sixteenths = Math.round((totalInches - inches) * 16);

  if (sixteenths === 16) {
    const adjInches = inches + 1;
    if (adjInches === 12) {
      return `${feet + 1}' 0"`;
    }
    return `${feet}' ${adjInches}"`;
  }

  const fractionStr = FRACTIONS[sixteenths] ? ` ${FRACTIONS[sixteenths]}` : "";
  return `${feet}' ${inches}${fractionStr}"`;
}

/** Format inches to inches + fraction string */
export function formatInches(totalInches: number): string {
  if (isNaN(totalInches) || totalInches < 0) return '0"';
  const inches = Math.floor(totalInches);
  const sixteenths = Math.round((totalInches - inches) * 16);

  if (sixteenths === 16) {
    return `${inches + 1}"`;
  }

  const fractionStr = FRACTIONS[sixteenths] ? ` ${FRACTIONS[sixteenths]}` : "";
  return `${inches}${fractionStr}"`;
}

/** Convert inches to feet and inches string */
export function formatInchesToFeetInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const remainingInches = totalInches % 12;
  return `${feet}' ${formatInches(remainingInches)}`;
}

/** Combine feet, inches, and 1/16ths into decimal feet */
export function partsToDecimalFeet(feet: number, inches: number, sixteenths: number): number {
  const totalInches = (feet * 12) + inches + (sixteenths / 16);
  return totalInches / 12;
}

// ─── Excavation Calculations ─────────────────────────────────────────────────

export interface ExcavationResults {
  tankHoleNoBedding: number;
  tankHoleWithBedding: number;
  trenchDepth: number;
}

export function calcExcavation(transitShot: number, beddingDepth: number): ExcavationResults {
  return {
    tankHoleNoBedding: transitShot + EXCAVATION_CONSTANT,
    tankHoleWithBedding: transitShot + EXCAVATION_CONSTANT - beddingDepth,
    trenchDepth: transitShot + TRENCH_CONSTANT,
  };
}

export interface SlopeResults {
  slopeStartDecimal: number;
  totalSlopeFallInches: number;
  slopeEndDecimal: number;
}

export function calcSlope(
  trenchDepth: number,
  slopeStartMode: "trench" | "custom",
  customSlopeStart: number,
  runFeet: number,
  slopeRateInchesPerFoot: number = SLOPE_RATE_INCHES_PER_FOOT
): SlopeResults {
  const slopeStartDecimal = slopeStartMode === "trench" ? trenchDepth : customSlopeStart;
  const totalSlopeFallInches = runFeet * slopeRateInchesPerFoot;
  const slopeEndDecimal = slopeStartDecimal + (totalSlopeFallInches / 12);
  return { slopeStartDecimal, totalSlopeFallInches, slopeEndDecimal };
}

// ─── UST Buoyancy Safety Factor Calculations ───────────────────────────────

export interface BuoyancyOptions {
  deadmanVolumeCf: number;
  tankGallons?: number;
  emptyTankWeightLbs?: number;
  burialDepthFt?: number;
  deadmanFootprintSqFt?: number;
  includeOverburden?: boolean;
  waterTable?: "grade" | "tank_top" | "custom";
  strapCount?: number;
  strapWllLbs?: number;
}

export interface BuoyancyResults {
  deadmanVolumeCf: number;
  submergedWeightLbs: number;
  estimatedTankGallons: number;
  buoyantUpliftLbs: number;
  tankWeightLbs: number;
  deadmanSubmergedLbs: number;
  overburdenSubmergedLbs: number;
  overburdenVolumeCf: number;
  totalDownwardForceLbs: number;
  netUpliftForceLbs: number;
  loadPerStrapLbs: number;
  strapWllLbs: number;
  isStrapAdequate: boolean;
  strapCount: number;
  waterTableCondition: string;
  safetyFactor: number;
  isSafe: boolean;
}

export function calcDeadmanBuoyancy(
  arg: number | BuoyancyOptions,
  legacyGallons: number = 10000
): BuoyancyResults {
  const isOptions = typeof arg === "object" && arg !== null;
  const deadmanVolumeCf = Math.max(0, isOptions ? (Number(arg.deadmanVolumeCf) || 0) : Number(arg) || 0);
  const tankGallons = Math.max(0, isOptions ? (Number(arg.tankGallons) || 10000) : Number(legacyGallons) || 10000);
  const emptyTankWeightLbs = Math.max(0, isOptions ? (Number(arg.emptyTankWeightLbs) || 4500) : 4500);
  const burialDepthFt = Math.max(0, isOptions ? (Number(arg.burialDepthFt) || 3.5) : 3.5);
  const deadmanFootprintSqFt = Math.max(0, isOptions ? (Number(arg.deadmanFootprintSqFt) || (deadmanVolumeCf > 0 ? deadmanVolumeCf / 1.5 : 0)) : (deadmanVolumeCf > 0 ? deadmanVolumeCf / 1.5 : 0));
  const includeOverburden = isOptions ? (arg.includeOverburden ?? true) : true;
  const waterTable = isOptions ? (arg.waterTable ?? "grade") : "grade";
  const strapCount = Math.max(1, isOptions ? (Number(arg.strapCount) || 2) : 2);
  const strapWllLbs = Math.max(0, isOptions ? (Number(arg.strapWllLbs) || 5200) : 5200);

  // Upward Buoyant Force (Displacement):
  // PEI RP100 §5: Water displacement weight = 8.34 lbs/gal (or 62.4 lbs/cf).
  // Under worst-case ground-water level to grade, 100% of tank volume is submerged.
  const buoyantUpliftLbs = tankGallons * 8.34;

  // Downward Forces (PEI RP100 §5):
  // 1. Submerged concrete deadman weight = Volume * (150 lbs/cf dry - 62.4 lbs/cf water) = Volume * 87.6 lbs/cf
  const deadmanSubmergedLbs = deadmanVolumeCf * 87.6;
  const submergedWeightLbs = deadmanSubmergedLbs; // Backward compatibility alias

  // 2. Submerged soil overburden column directly over the deadman anchors
  // Standard backfill dry density is 110 lbs/cf; submerged density = 110 - 62.4 = 47.6 lbs/cf
  const overburdenVolumeCf = includeOverburden ? deadmanFootprintSqFt * burialDepthFt : 0;
  const overburdenSubmergedLbs = overburdenVolumeCf * 47.6;

  // 3. Total downward hold-down force = Tank weight + Submerged deadman weight + Submerged overburden
  const totalDownwardForceLbs = emptyTankWeightLbs + deadmanSubmergedLbs + overburdenSubmergedLbs;

  // Safety Factor against flotation (PEI RP100 standard: minimum 1.20x)
  const safetyFactor = buoyantUpliftLbs > 0 ? totalDownwardForceLbs / buoyantUpliftLbs : 0;
  const isSafe = safetyFactor >= 1.20;

  // Strap & Anchor Tension Engineering:
  // Net upward buoyant load that hold-down straps must restrain:
  const netUpliftForceLbs = Math.max(0, buoyantUpliftLbs - emptyTankWeightLbs);
  const loadPerStrapLbs = strapCount > 0 ? netUpliftForceLbs / strapCount : netUpliftForceLbs;
  const isStrapAdequate = loadPerStrapLbs <= strapWllLbs;

  return {
    deadmanVolumeCf,
    submergedWeightLbs,
    estimatedTankGallons: tankGallons,
    buoyantUpliftLbs,
    tankWeightLbs: emptyTankWeightLbs,
    deadmanSubmergedLbs,
    overburdenSubmergedLbs,
    overburdenVolumeCf,
    totalDownwardForceLbs,
    netUpliftForceLbs,
    loadPerStrapLbs,
    strapWllLbs,
    isStrapAdequate,
    strapCount,
    waterTableCondition: waterTable,
    safetyFactor,
    isSafe,
  };
}

// ─── Drop Tube Calculations ─────────────────────────────────────────────────

export interface DropTubeResults {
  upperDropTubeLength: number;
  overallDropTubeLength: number;
  valveOffset: number;
}

export function calcDropTube(
  riserHeight: number,
  tankDiameter: number,
  valveType: "standard" | "testable" | "custom",
  customValveOffset: number,
  tankClearance: number
): DropTubeResults {
  const valveOffset =
    valveType === "standard" ? 5.5 : valveType === "testable" ? 7.25 : customValveOffset;
  return {
    upperDropTubeLength: riserHeight + valveOffset,
    overallDropTubeLength: riserHeight + tankDiameter - tankClearance,
    valveOffset,
  };
}

// ─── Concrete Volume Calculations ────────────────────────────────────────────

export interface ConcreteInputs {
  shape: ConcreteShape;
  flatLength: number; flatWidth: number; flatThickness: number; flatQuantity: number;
  circDiameter: number; circThickness: number; circQuantity: number;
  sonoDiameter: number; sonoHeight: number; sonoQuantity: number;
  footLength: number; footWidth: number; footDepth: number; footQuantity: number;
  deadmanLength: number; deadmanWidth: number; deadmanHeight: number; deadmanQuantity: number;
  ballastLength: number; ballastWidth: number; ballastThickness: number; ballastQuantity: number;
  curbLength: number; curbHeight: number; curbWidth: number; gutterThickness: number; gutterWidth: number; curbQuantity: number;
  stepCount: number; stepWidth: number; stepRise: number; stepRun: number; stepQuantity: number;
  wallLength: number; wallWidth: number; wallDepth: number; wallQuantity: number;
}

/** Calculate raw concrete volume in cubic feet */
export function calcRawVolumeCf(inputs: ConcreteInputs): number {
  const s = inputs.shape;
  if (s === "flatwork") {
    return inputs.flatLength * inputs.flatWidth * (inputs.flatThickness / 12) * inputs.flatQuantity;
  } else if (s === "circular") {
    const r = inputs.circDiameter / 2;
    return Math.PI * Math.pow(r, 2) * (inputs.circThickness / 12) * inputs.circQuantity;
  } else if (s === "sonotube") {
    const r = inputs.sonoDiameter / 24; // inches to radius feet
    return Math.PI * Math.pow(r, 2) * inputs.sonoHeight * inputs.sonoQuantity;
  } else if (s === "footer") {
    return inputs.footLength * inputs.footWidth * inputs.footDepth * inputs.footQuantity;
  } else if (s === "deadman") {
    return inputs.deadmanLength * (inputs.deadmanWidth / 12) * (inputs.deadmanHeight / 12) * inputs.deadmanQuantity;
  } else if (s === "ballast") {
    return inputs.ballastLength * inputs.ballastWidth * (inputs.ballastThickness / 12) * inputs.ballastQuantity;
  } else if (s === "curb") {
    const curbArea = (inputs.curbWidth / 12) * ((inputs.curbHeight + inputs.gutterThickness) / 12);
    const gutterArea = (inputs.gutterWidth / 12) * (inputs.gutterThickness / 12);
    return (curbArea + gutterArea) * inputs.curbLength * inputs.curbQuantity;
  } else if (s === "steps") {
    return inputs.stepWidth * (inputs.stepRun / 12) * (inputs.stepRise / 12) * (inputs.stepCount * (inputs.stepCount + 1) / 2) * inputs.stepQuantity;
  } else if (s === "wallfooting") {
    return inputs.wallLength * (inputs.wallWidth / 12) * (inputs.wallDepth / 12) * inputs.wallQuantity;
  }
  return 0;
}

export interface ConcreteVolumeResults {
  rawVolumeCf: number;
  rawVolumeCy: number;
  adjustedVolumeCf: number;
  adjustedVolumeCy: number;
  bags80lb: number;
  bags60lb: number;
  bags40lb: number;
  truckLoads: number;
  isShortLoad: boolean;
}

export function calcConcreteVolume(rawVolumeCf: number, wastePct: number): ConcreteVolumeResults {
  const rawVolumeCy = rawVolumeCf / 27;
  const wasteMultiplier = 1 + (wastePct / 100);
  const adjustedVolumeCf = rawVolumeCf * wasteMultiplier;
  const adjustedVolumeCy = rawVolumeCy * wasteMultiplier;

  const bags80lb = Math.ceil(adjustedVolumeCf / BAG_YIELDS.bag80lb) || 0;
  const bags60lb = Math.ceil(adjustedVolumeCf / BAG_YIELDS.bag60lb) || 0;
  const bags40lb = Math.ceil(adjustedVolumeCf / BAG_YIELDS.bag40lb) || 0;
  const truckLoads = adjustedVolumeCy / TRUCK_CAPACITY_CY;
  const isShortLoad = adjustedVolumeCy > 0 && adjustedVolumeCy < SHORT_LOAD_THRESHOLD_CY;

  return { rawVolumeCf, rawVolumeCy, adjustedVolumeCf, adjustedVolumeCy, bags80lb, bags60lb, bags40lb, truckLoads, isShortLoad };
}

// ─── Rebar Calculations ─────────────────────────────────────────────────────

export interface RebarResults {
  totalLf: number;
  pieces20: number;
  tieWireRolls: number;
  chairsCount: number;
}

export function calcRebar(inputs: ConcreteInputs, rebarSpacing: string): RebarResults {
  if (rebarSpacing === "none" && inputs.shape !== "deadman" && inputs.shape !== "curb" && inputs.shape !== "sonotube") {
    return { totalLf: 0, pieces20: 0, tieWireRolls: 0, chairsCount: 0 };
  }

  const spacing = parseFloat(rebarSpacing) || 0;
  let totalLf = 0;
  let areaSqFt = 0;
  const s = inputs.shape;

  if (s === "flatwork" || s === "ballast") {
    const l = s === "flatwork" ? inputs.flatLength : inputs.ballastLength;
    const w = s === "flatwork" ? inputs.flatWidth : inputs.ballastWidth;
    const q = s === "flatwork" ? inputs.flatQuantity : inputs.ballastQuantity;
    areaSqFt = l * w * q;
    if (spacing > 0) {
      const rows = Math.floor((w * 12) / spacing) + 1;
      const cols = Math.floor((l * 12) / spacing) + 1;
      totalLf = ((rows * l) + (cols * w)) * q;
    }
  } else if (s === "circular") {
    const d = inputs.circDiameter;
    const q = inputs.circQuantity;
    areaSqFt = Math.PI * Math.pow(d / 2, 2) * q;
    if (spacing > 0) {
      const r = d / 2;
      const spacingFt = spacing / 12;
      for (let x = spacingFt; x < r; x += spacingFt) {
        totalLf += 4 * Math.sqrt(r * r - x * x);
      }
      totalLf += 2 * d; // center cross bars
      totalLf *= q;
    }
  } else if (s === "sonotube") {
    const d = inputs.sonoDiameter;
    const h = inputs.sonoHeight;
    const q = inputs.sonoQuantity;
    areaSqFt = Math.PI * Math.pow(d / 24, 2) * q;
    const vertLf = 4 * h;
    const numTies = Math.floor(h);
    const tieDia = Math.max(2, d - 4);
    const tieCirc = Math.PI * (tieDia / 12);
    const tieLf = numTies * tieCirc;
    totalLf = (vertLf + tieLf) * q;
  } else if (s === "footer") {
    const l = inputs.footLength;
    const w = inputs.footWidth;
    const q = inputs.footQuantity;
    areaSqFt = l * w * q;
    if (spacing > 0) {
      const rows = Math.floor((w * 12) / spacing) + 1;
      const cols = Math.floor((l * 12) / spacing) + 1;
      totalLf = ((rows * l) + (cols * w)) * q;
    }
  } else if (s === "deadman") {
    const l = inputs.deadmanLength;
    const w = inputs.deadmanWidth;
    const h = inputs.deadmanHeight;
    const q = inputs.deadmanQuantity;
    areaSqFt = l * (w / 12) * q;
    const vertLf = 4 * l;
    const numStirrups = Math.floor(l) + 1;
    const stirrupPerim = (2 * Math.max(2, w - 3) + 2 * Math.max(2, h - 3)) / 12;
    const stirrupLf = numStirrups * stirrupPerim;
    totalLf = (vertLf + stirrupLf) * q;
  } else if (s === "curb") {
    const l = inputs.curbLength;
    const q = inputs.curbQuantity;
    areaSqFt = l * 2 * q;
    totalLf = (3 * l) * q; // 3 continuous longitudinal bars
  } else if (s === "steps") {
    const n = inputs.stepCount;
    const w = inputs.stepWidth;
    const ru = inputs.stepRun;
    const q = inputs.stepQuantity;
    const runFt = (n * ru) / 12;
    areaSqFt = runFt * w * q;
    if (spacing > 0) {
      const rows = Math.floor((w * 12) / spacing) + 1;
      const cols = Math.floor((runFt * 12) / spacing) + 1;
      totalLf = ((rows * runFt) + (cols * w)) * q;
    }
  } else if (s === "wallfooting") {
    const l = inputs.wallLength;
    const w = inputs.wallWidth;
    const q = inputs.wallQuantity;
    areaSqFt = l * (w / 12) * q;
    const rows = 2; // 2 continuous bars along length
    const crossBars = Math.floor(l) + 1;
    totalLf = ((rows * l) + (crossBars * (w / 12))) * q;
  }

  const adjustedLf = totalLf * 1.1; // 10% lap splice overlap factor
  const pieces20 = Math.ceil(adjustedLf / 20);
  const tieWireRolls = Math.max(1, Math.ceil(adjustedLf / 1000));
  const chairsCount = Math.ceil(areaSqFt / 9); // spaced every 3ft O.C. (9 sq ft per chair)

  return { totalLf, pieces20, tieWireRolls, chairsCount };
}

// ─── Wire Mesh Calculations ─────────────────────────────────────────────────

export interface MeshResults {
  rolls: number;
  sheets: number;
}

export function calcWireMesh(inputs: ConcreteInputs, wireMesh: string): MeshResults {
  if (wireMesh === "none") return { rolls: 0, sheets: 0 };

  let area = 0;
  const s = inputs.shape;

  if (s === "flatwork") {
    area = inputs.flatLength * inputs.flatWidth * inputs.flatQuantity;
  } else if (s === "circular") {
    area = Math.PI * Math.pow(inputs.circDiameter / 2, 2) * inputs.circQuantity;
  } else if (s === "ballast") {
    area = inputs.ballastLength * inputs.ballastWidth * inputs.ballastQuantity;
  } else {
    return { rolls: 0, sheets: 0 };
  }

  const areaWithOverlap = area * 1.1; // 10% overlap factor
  const rolls = wireMesh === "roll_750" ? Math.ceil(areaWithOverlap / 750) : 0;
  const sheets = wireMesh === "sheet_120" ? Math.ceil(areaWithOverlap / 120) : 0;
  return { rolls, sheets };
}

// ─── Gravel Sub-Base Calculations ────────────────────────────────────────────

export interface GravelResults {
  cy: number;
  tons: number;
  truckloads15: number;
  truckloads20: number;
}

export function calcGravel(inputs: ConcreteInputs, gravelDepth: string): GravelResults {
  if (gravelDepth === "none") return { cy: 0, tons: 0, truckloads15: 0, truckloads20: 0 };

  const depthIn = parseFloat(gravelDepth) || 0;
  let area = 0;
  const s = inputs.shape;

  if (s === "flatwork") {
    area = inputs.flatLength * inputs.flatWidth * inputs.flatQuantity;
  } else if (s === "circular") {
    area = Math.PI * Math.pow(inputs.circDiameter / 2, 2) * inputs.circQuantity;
  } else if (s === "footer") {
    area = inputs.footLength * inputs.footWidth * inputs.footQuantity;
  } else if (s === "ballast") {
    area = inputs.ballastLength * inputs.ballastWidth * inputs.ballastQuantity;
  } else if (s === "curb") {
    area = ((inputs.curbWidth + inputs.gutterWidth) / 12) * inputs.curbLength * inputs.curbQuantity;
  } else if (s === "wallfooting") {
    area = inputs.wallLength * (inputs.wallWidth / 12) * inputs.wallQuantity;
  }

  const cf = area * (depthIn / 12);
  const cy = cf / 27;
  const tons = cy * 1.4; // standard 1.4 tons per cubic yard crushed stone
  const truckloads15 = Math.ceil(tons / 15);
  const truckloads20 = Math.ceil(tons / 20);
  return { cy, tons, truckloads15, truckloads20 };
}

// ─── Cost Summary Calculations ───────────────────────────────────────────────

export interface CostInputs {
  adjustedVolumeCy: number;
  bags80lb: number;
  bags60lb: number;
  bags40lb: number;
  rebarPieces20: number;
  meshRolls: number;
  meshSheets: number;
  gravelTons: number;
  pricePerCy: number;
  pricePerBag80: number;
  pricePerBag60: number;
  pricePerBag40: number;
  pricePerRebarStick: number;
  pricePerMeshRoll: number;
  pricePerGravelTon: number;
}

export interface CostSummary {
  readyMix: number;
  bags80: number;
  bags60: number;
  bags40: number;
  rebar: number;
  mesh: number;
  gravel: number;
  totalWithReadyMix: number;
  totalWith80lbBags: number;
}

export function calcCostSummary(c: CostInputs): CostSummary {
  const readyMix = c.adjustedVolumeCy * c.pricePerCy;
  const bags80 = c.bags80lb * c.pricePerBag80;
  const bags60 = c.bags60lb * c.pricePerBag60;
  const bags40 = c.bags40lb * c.pricePerBag40;
  const rebar = c.rebarPieces20 * c.pricePerRebarStick;
  const mesh = (c.meshRolls * c.pricePerMeshRoll) + (c.meshSheets * 35.00);
  const gravel = c.gravelTons * c.pricePerGravelTon;
  const totalReinforcementCost = rebar + mesh;

  return {
    readyMix, bags80, bags60, bags40, rebar, mesh, gravel,
    totalWithReadyMix: readyMix + totalReinforcementCost + gravel,
    totalWith80lbBags: bags80 + totalReinforcementCost + gravel,
  };
}

// ─── Construction Tool Calculations ──────────────────────────────────────────

export interface TriangleResults {
  sideA: number;
  sideB: number;
  sideC: number;
  angleDeg: number;
  fallPerFoot: number;
}

export function calcTriangle(a: number, b: number): TriangleResults {
  const c = Math.sqrt(a * a + b * b);
  const angleRad = Math.atan2(b, a);
  const angleDeg = (angleRad * 180) / Math.PI;
  const fallPerFoot = a > 0 ? (b * 12) / a : 0;
  return { sideA: a, sideB: b, sideC: c, angleDeg, fallPerFoot };
}

export interface AggregateResults {
  rawCF: number;
  rawCY: number;
  adjCY: number;
  adjCF: number;
  totalTons: number;
  truckloads15Ton: number;
  truckloads20Ton: number;
  cost: number;
  matName: string;
}

export function calcAggregate(
  length: number, width: number, depthInches: number,
  material: string, wastePct: number, priceTon: number
): AggregateResults {
  const density = AGG_DENSITIES[material] ? AGG_DENSITIES[material].tonsPerCy : 1.4;
  const rawCF = length * width * (depthInches / 12);
  const rawCY = rawCF / 27;
  const adjCY = rawCY * (1 + wastePct / 100);
  const adjCF = adjCY * 27;
  const totalTons = adjCY * density;
  const truckloads15Ton = Math.ceil(totalTons / 15);
  const truckloads20Ton = Math.ceil(totalTons / 20);
  const cost = totalTons * priceTon;
  const matName = AGG_DENSITIES[material]?.name || material;

  return { rawCF, rawCY, adjCY, adjCF, totalTons, truckloads15Ton, truckloads20Ton, cost, matName };
}

export interface LumberResults {
  singleBf: number;
  totalBf: number;
  totalCost: number;
  studsCount: number;
  stakesCount: number;
  linearPlates: number;
  boards16ft: number;
}

export function calcLumber(
  subTool: "boardfeet" | "formwork",
  bfThickness: number, bfWidth: number, bfLength: number, bfQuantity: number, bfPricePerBf: number,
  formPerimeter: number, formSpacing: number, formPlates: number, formStakeSpacing: number
): LumberResults {
  if (subTool === "boardfeet") {
    const singleBf = (bfThickness * bfWidth * bfLength) / 12;
    const totalBf = singleBf * bfQuantity;
    const totalCost = totalBf * bfPricePerBf;
    return { singleBf, totalBf, totalCost, studsCount: 0, stakesCount: 0, linearPlates: 0, boards16ft: 0 };
  } else {
    const studsCount = Math.ceil((formPerimeter * 12) / formSpacing) + 1;
    const stakesCount = Math.ceil(formPerimeter / formStakeSpacing) + 1;
    const linearPlates = formPerimeter * formPlates;
    const boards16ft = Math.ceil(linearPlates / 16);
    return { singleBf: 0, totalBf: 0, totalCost: 0, studsCount, stakesCount, linearPlates, boards16ft };
  }
}

export interface ConversionResult {
  label: string;
  value: number;
  unitStr: string;
}

export function calcConversions(
  category: string, fromUnit: string, val: number
): Record<string, ConversionResult> {
  const res: Record<string, ConversionResult> = {};

  if (category === "length") {
    let meters = 0;
    if (fromUnit === "ft") meters = val * 0.3048;
    else if (fromUnit === "in") meters = val * 0.0254;
    else if (fromUnit === "m") meters = val;
    else if (fromUnit === "yd") meters = val * 0.9144;
    else if (fromUnit === "mm") meters = val / 1000;

    res.ft = { label: "Feet", value: meters / 0.3048, unitStr: "ft" };
    res.in = { label: "Inches", value: meters / 0.0254, unitStr: "in" };
    res.yd = { label: "Yards", value: meters / 0.9144, unitStr: "yd" };
    res.m = { label: "Meters", value: meters, unitStr: "m" };
    res.mm = { label: "Millimeters", value: meters * 1000, unitStr: "mm" };
  } else if (category === "area") {
    let sqMeters = 0;
    if (fromUnit === "sqft") sqMeters = val * 0.092903;
    else if (fromUnit === "sqin") sqMeters = val * 0.00064516;
    else if (fromUnit === "sqyd") sqMeters = val * 0.836127;
    else if (fromUnit === "acre") sqMeters = val * 4046.86;

    res.sqft = { label: "Sq Feet", value: sqMeters / 0.092903, unitStr: "sq ft" };
    res.sqin = { label: "Sq Inches", value: sqMeters / 0.00064516, unitStr: "sq in" };
    res.sqyd = { label: "Sq Yards", value: sqMeters / 0.836127, unitStr: "sq yd" };
    res.acre = { label: "Acres", value: sqMeters / 4046.86, unitStr: "acres" };
  } else if (category === "volume") {
    let cuMeters = 0;
    if (fromUnit === "cy") cuMeters = val * 0.764555;
    else if (fromUnit === "cf") cuMeters = val * 0.0283168;
    else if (fromUnit === "gal") cuMeters = val * 0.00378541;

    res.cy = { label: "Cubic Yards (CY)", value: cuMeters / 0.764555, unitStr: "CY" };
    res.cf = { label: "Cubic Feet (CF)", value: cuMeters / 0.0283168, unitStr: "CF" };
    res.gal = { label: "US Gallons", value: cuMeters / 0.00378541, unitStr: "gal" };
  } else if (category === "weight") {
    let kg = 0;
    if (fromUnit === "lbs") kg = val * 0.453592;
    else if (fromUnit === "tons") kg = val * 907.185;
    else if (fromUnit === "kg") kg = val;

    res.lbs = { label: "Pounds (lbs)", value: kg / 0.453592, unitStr: "lbs" };
    res.tons = { label: "US Tons (2000 lbs)", value: kg / 907.185, unitStr: "tons" };
    res.kg = { label: "Kilograms", value: kg, unitStr: "kg" };
  } else {
    let psi = 0;
    if (fromUnit === "psi") psi = val;
    else if (fromUnit === "bar") psi = val * 14.5038;
    else if (fromUnit === "kpa") psi = val * 0.145038;

    res.psi = { label: "PSI (lbs/sq in)", value: psi, unitStr: "PSI" };
    res.bar = { label: "Bar", value: psi / 14.5038, unitStr: "bar" };
    res.kpa = { label: "kPa (Kilopascals)", value: psi / 0.145038, unitStr: "kPa" };
  }
  return res;
}

// ─── Turnbuckle & Strap Layout Calculations ────────────────────────────────

export interface TurnbuckleLayoutResults {
  tankDiameterInches: number;
  tankRadiusInches: number;
  deadmanClearanceInches: number;
  deadmanCenterOffsetInches: number;
  strapArcLengthInches: number;
  tangentLengthInches: number;
  totalAssemblyLengthInches: number;
  netStrapCutLengthInches: number;
  turnbuckleModelId: string;
  turnbuckleCount: number;
  strapCount: number;
}

export function calcDeadmanTurnbuckleLayout(
  tankDiameterInches: number,
  deadmanClearanceInches: number = 12,
  turnbuckleModelId: string = "5_8_x_6",
  strapCount: number = 2
): TurnbuckleLayoutResults {
  const d = tankDiameterInches > 0 ? tankDiameterInches : 92;
  const r = d / 2;
  const clearance = Math.max(0, deadmanClearanceInches);
  const centerOffset = r + clearance;

  // Arc wrap over upper semi-circle of tank shell
  const strapArcLengthInches = Math.PI * r;

  // Tangent drop length from horizontal springline down to deadman eye
  const tangentLengthInches = r + clearance;

  // Total assembly perimeter length (left tangent + top arc + right tangent)
  const totalAssemblyLengthInches = strapArcLengthInches + (2 * tangentLengthInches);

  // Turnbuckle closed length deduction (2 turnbuckles per strap set)
  const tbClosedLength = turnbuckleModelId === "7_8_x_12" ? 21.0 : turnbuckleModelId === "3_4_x_9" ? 17.5 : 13.5;
  const netStrapCutLengthInches = Math.max(0, totalAssemblyLengthInches - (2 * tbClosedLength));

  return {
    tankDiameterInches: d,
    tankRadiusInches: r,
    deadmanClearanceInches: clearance,
    deadmanCenterOffsetInches: centerOffset,
    strapArcLengthInches,
    tangentLengthInches,
    totalAssemblyLengthInches,
    netStrapCutLengthInches,
    turnbuckleModelId,
    turnbuckleCount: strapCount * 2,
    strapCount,
  };
}
```

### File: `app/lib/constants.ts`

```ts
// encoding: utf-8
// Shared constants, type definitions, and lookup tables for UST Field Hub

// ─── Tab Types ───────────────────────────────────────────────────────────────

export type ActiveTab = "excavation" | "droptube" | "concrete" | "construction" | "dailyreport" | "prebury";
export type ExcInputMode = "decimal" | "fractions";
export type ValveType = "standard" | "testable" | "custom";
export type ConcreteShape =
  | "flatwork"
  | "circular"
  | "sonotube"
  | "footer"
  | "deadman"
  | "ballast"
  | "curb"
  | "steps"
  | "wallfooting";
export type ConstructionTool = "triangle" | "aggregate" | "lumber" | "converter";
export type LumberSubTool = "boardfeet" | "formwork";
export type ConvCategory = "length" | "area" | "volume" | "weight" | "pressure";
export type SlopeStartMode = "trench" | "custom";

// ─── Daily Report Types ──────────────────────────────────────────────────────

export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow" | "wind" | "hot" | "cold";

export interface DailyWorkEntry {
  id: string;
  task: string;
  hours: string;
  equipment: string;
}

export interface DailyMaterialEntry {
  id: string;
  material: string;
  quantity: string;
  unit: string;
}

export const MATERIAL_UNITS = ["CY", "tons", "LF", "bags", "each", "gallons", "loads"] as const;

export const SAFETY_CHECKLIST_ITEMS = [
  { id: "toolbox_talk", label: "Toolbox Talk Held" },
  { id: "near_miss", label: "Near-Miss / Incident Reported" },
  { id: "inspector_onsite", label: "Inspector On-Site" },
  { id: "osha_poster", label: "OSHA Poster Visible" },
  { id: "confined_space", label: "Confined Space Permit" },
  { id: "ppe_compliance", label: "Full PPE Compliance" },
  { id: "fire_ext", label: "Fire Extinguisher On-Site" },
] as const;

// ─── Constants ───────────────────────────────────────────────────────────────

/** Standard construction fractions of an inch (1/16ths) */
export const FRACTIONS = [
  "", "1/16", "1/8", "3/16", "1/4", "5/16", "3/8", "7/16",
  "1/2", "9/16", "5/8", "11/16", "3/4", "13/16", "7/8", "15/16"
];

/** Excavation constant: add this to FG shot for bottom of raw pit */
export const EXCAVATION_CONSTANT = 15.5;

/** Trenching constant: add this to FG shot for pipe trench depth */
export const TRENCH_CONSTANT = 3.0;

/** Standard vent/product line slope options */
export const SLOPE_RATES = [
  { value: "0.125", label: '1/8" per foot (Standard Fuel/Vent Pitch)' },
  { value: "0.250", label: '1/4" per foot (Steep Pitch / Drainage)' },
] as const;

export const SLOPE_RATE_INCHES_PER_FOOT = 1 / 8;

// ─── Tank Presets ────────────────────────────────────────────────────────────

export interface TankPreset {
  id: string;
  name: string;
  diameter: string;
}

export const TANK_PRESETS: TankPreset[] = [
  { id: "custom", name: 'Custom Size (Enter below)', diameter: "" },
  { id: "x-4k", name: 'Xerxes 4,000 Gallon (74" dia)', diameter: "74" },
  { id: "x-6k", name: 'Xerxes 6,000 Gallon (92" dia)', diameter: "92" },
  { id: "x-8k", name: 'Xerxes 8,000 Gallon (92" dia)', diameter: "92" },
  { id: "x-10k-92", name: 'Xerxes 10,000 Gallon (92" dia)', diameter: "92" },
  { id: "x-10k-118", name: 'Xerxes 10,000 Gallon (118" dia)', diameter: "118" },
  { id: "x-12k", name: 'Xerxes 12,000 Gallon (118" dia)', diameter: "118" },
  { id: "x-15k", name: 'Xerxes 15,000 Gallon (118" dia)', diameter: "118" },
  { id: "x-20k", name: 'Xerxes 20,000 Gallon (118" dia)', diameter: "118" },
  { id: "cs-4k", name: 'Containment Solutions 4,000 Gallon (76" dia)', diameter: "76" },
  { id: "cs-6k", name: 'Containment Solutions 6,000 Gallon (92" dia)', diameter: "92" },
  { id: "cs-8k", name: 'Containment Solutions 8,000 Gallon (92" dia)', diameter: "92" },
  { id: "cs-10k-92", name: 'Containment Solutions 10,000 Gallon (92" dia)', diameter: "92" },
  { id: "cs-10k-120", name: 'Containment Solutions 10,000 Gallon (120" dia)', diameter: "120" },
  { id: "cs-12k", name: 'Containment Solutions 12,500 Gallon (120" dia)', diameter: "120" },
  { id: "cs-15k", name: 'Containment Solutions 15,000 Gallon (120" dia)', diameter: "120" },
  { id: "cs-20k", name: 'Containment Solutions 20,000 Gallon (120" dia)', diameter: "120" },
  { id: "ht-6k", name: 'Highland Tank 6,000 Gallon Steel (96" dia)', diameter: "96" },
  { id: "ht-8k", name: 'Highland Tank 8,000 Gallon Steel (96" dia)', diameter: "96" },
  { id: "ht-10k", name: 'Highland Tank 10,000 Gallon Steel (96" dia)', diameter: "96" },
  { id: "ht-12k", name: 'Highland Tank 12,000 Gallon Steel (120" dia)', diameter: "120" },
  { id: "ht-15k", name: 'Highland Tank 15,000 Gallon Steel (120" dia)', diameter: "120" },
  { id: "ht-20k", name: 'Highland Tank 20,000 Gallon Steel (120" dia)', diameter: "120" },
];

// ─── Aggregate Densities ─────────────────────────────────────────────────────

export interface AggDensity {
  name: string;
  tonsPerCy: number;
}

export const AGG_DENSITIES: Record<string, AggDensity> = {
  crushed_stone: { name: "Crushed Stone / Dense Grade (#57 / ABC)", tonsPerCy: 1.40 },
  pea_gravel: { name: "Pea Gravel / Backfill Stone (UST Spec)", tonsPerCy: 1.35 },
  sand: { name: "Coarse Sand / Bedding Sand", tonsPerCy: 1.25 },
  topsoil: { name: "Topsoil / Fill Dirt", tonsPerCy: 1.15 },
  asphalt: { name: "Hot Mix Asphalt (HMA)", tonsPerCy: 2.00 }
};

// ─── Concrete Bag Yields (Cubic Feet) ────────────────────────────────────────

export const BAG_YIELDS = {
  bag80lb: 0.60,
  bag60lb: 0.45,
  bag40lb: 0.30,
} as const;

/** Standard ready-mix truck capacity in cubic yards */
export const TRUCK_CAPACITY_CY = 10;

/** Short load threshold (cubic yards) — fees may apply below this */
export const SHORT_LOAD_THRESHOLD_CY = 6.0;

// ─── Turnbuckle & Anchor Hardware Presets ────────────────────────────────────

export interface TurnbuckleModel {
  id: string;
  name: string;
  threadDiameterInches: number;
  takeUpInches: number;
  workingLoadLimitLbs: number;
  closedLengthInches: number;
}

export const TURNBUCKLE_MODELS: Record<string, TurnbuckleModel> = {
  "5_8_x_6": {
    id: "5_8_x_6",
    name: '5/8" x 6" Take-Up Jaw & Jaw Turnbuckle (Std)',
    threadDiameterInches: 0.625,
    takeUpInches: 6.0,
    workingLoadLimitLbs: 3500,
    closedLengthInches: 13.5,
  },
  "3_4_x_9": {
    id: "3_4_x_9",
    name: '3/4" x 9" Take-Up Heavy Duty Turnbuckle',
    threadDiameterInches: 0.750,
    takeUpInches: 9.0,
    workingLoadLimitLbs: 5200,
    closedLengthInches: 17.5,
  },
  "7_8_x_12": {
    id: "7_8_x_12",
    name: '7/8" x 12" Take-Up Extreme Duty Turnbuckle',
    threadDiameterInches: 0.875,
    takeUpInches: 12.0,
    workingLoadLimitLbs: 7200,
    closedLengthInches: 21.0,
  },
};

// ─── Pre-Bury Inspector Types & Constants ─────────────────────────────────────

export type PreBuryDocStatus = "uploaded" | "missing" | "pending";
export type AirTestStatus = "passed" | "failed" | "in_progress" | "pending";

export interface AirTestRecord {
  id: string;
  tankName: string;
  capacityGal: number;
  testPsig: number;
  holdDurationMin: number;
  status: AirTestStatus;
  notes?: string;
  recordedAt: string;
}

export interface PreBuryChecklistGroup {
  id: string;
  title: string;
  items: { id: string; label: string }[];
}

export const PREBURY_CHECKLIST_GROUPS: PreBuryChecklistGroup[] = [
  {
    id: "air_testing",
    title: "Tank Air Testing",
    items: [
      { id: "at_1", label: "Pressurize primary tanks to 5 psig" },
      { id: "at_2", label: "Allow air temperature to stabilize before reading" },
      { id: "at_3", label: "Soap all fittings, nozzles, manway covers" },
      { id: "at_4", label: "Hold pressure min 1 hour, no drop (Primary Tanks)" },
      { id: "at_5", label: "Hold pressure min 1 hour, no drop (Secondary Tanks / Interstitial)" },
      { id: "at_6", label: "Test interstitial space via monitoring fitting" },
      { id: "at_7", label: "Document results on Tank Installation Checklist" },
    ],
  },
  {
    id: "containment_piping",
    title: "Secondary Containment & Piping",
    items: [
      { id: "cp_1", label: "Install and flood all containment sumps (hydro test)" },
      { id: "cp_2", label: "Install spill buckets at fill connections" },
      { id: "cp_3", label: "Air/hydro test all product piping (24-hr hold)" },
      { id: "cp_4", label: "Verify double-wall piping interstitial monitoring" },
      { id: "cp_5", label: "Confirm vent lines routed, connected, and clear" },
    ],
  },
  {
    id: "mechanical",
    title: "Mechanical Completion",
    items: [
      { id: "mc_1", label: "Tank anchors / hold-down straps torqued" },
      { id: "mc_2", label: "Deadman anchors set per manufacturer spec" },
      { id: "mc_3", label: "Tank bedding compacted, clean, and level" },
      { id: "mc_4", label: "Risers, manholes, access points installed" },
      { id: "mc_5", label: "Entry boots installed at all containment penetrations" },
    ],
  },
  {
    id: "electrical_monitoring",
    title: "Electrical & Monitoring",
    items: [
      { id: "em_1", label: "ATG console mounted" },
      { id: "em_2", label: "Probes and interstitial leak detection sensors in place" },
      { id: "em_3", label: "Explosion-proof conduit and seal-offs installed" },
      { id: "em_4", label: "Wiring pulled to junction boxes" },
    ],
  },
];

export interface PreBuryDocItem {
  id: string;
  name: string;
  description: string;
  defaultStatus: PreBuryDocStatus;
  dateOrNote?: string;
}

export const PREBURY_DOC_ITEMS: PreBuryDocItem[] = [
  {
    id: "doc_install_checklist",
    name: "Tank Installation Checklist",
    description: "Manufacturer pre-installation checklist signed by certified installer",
    defaultStatus: "uploaded",
    dateOrNote: "Uploaded Sep 3",
  },
  {
    id: "doc_air_test",
    name: "Air Test Results",
    description: "5 psig gauge hold test logs & soap test verifications",
    defaultStatus: "pending",
    dateOrNote: "Partial — awaiting final hold",
  },
  {
    id: "doc_line_tightness",
    name: "Line Tightness Test Results",
    description: "Certified piping precision pressure test certificate",
    defaultStatus: "uploaded",
    dateOrNote: "Uploaded Sep 2",
  },
  {
    id: "doc_deflection",
    name: "Tank Deflection Measurements",
    description: "Vertical diameter deflection log per manufacturer tolerance",
    defaultStatus: "uploaded",
    dateOrNote: "Uploaded Sep 1",
  },
  {
    id: "doc_mfr_delivery",
    name: "Manufacturer Delivery Report",
    description: "Bill of lading, serial numbers, and offloading inspection cert",
    defaultStatus: "uploaded",
    dateOrNote: "Uploaded Aug 28",
  },
  {
    id: "doc_permits",
    name: "UST Install Permit + Building/Fire",
    description: "Approved municipal permits and local fire marshal sign-off",
    defaultStatus: "uploaded",
    dateOrNote: "Uploaded Aug 25",
  },
  {
    id: "doc_asbuilt",
    name: "As-Built Site Sketch",
    description: "Field dimensioned sketch with pipe runs, depths & benchmark",
    defaultStatus: "missing",
    dateOrNote: "Missing — required for inspection",
  },
  {
    id: "doc_backfill_cert",
    name: "Backfill Material Certification",
    description: "Gradation & sieve analysis for rounded pea gravel bedding",
    defaultStatus: "missing",
    dateOrNote: "Missing — gradation report needed",
  },
];

export interface PreBuryPrecheckItem {
  id: string;
  text: string;
}

export const PREBURY_PRECHECK_ITEMS: PreBuryPrecheckItem[] = [
  { id: "pc_1", text: "Walk the pit: remove all debris, tools, and loose material" },
  { id: "pc_2", text: "Verify all temporary plugs are redoped and tight" },
  { id: "pc_3", text: "Confirm test manifold connected, air supply ready for re-demo" },
  { id: "pc_4", text: "Ensure soap solution and spray bottle are on-site" },
  { id: "pc_5", text: "Print and organize full documentation package" },
  { id: "pc_6", text: "Confirm inspector appointment time and point of contact" },
  { id: "pc_7", text: "Brief crew on inspection protocol (no work in pit during inspection)" },
  { id: "pc_8", text: "Photograph all installed systems for project record" },
];
```

### File: `app/lib/tab-contexts.tsx`

```tsx
// encoding: utf-8
"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import {
  ExcavationState,
  DEFAULT_EXCAVATION_STATE,
  DropTubeState,
  DEFAULT_DROPTUBE_STATE,
  ConcreteState,
  DEFAULT_CONCRETE_STATE,
  ConstructionState,
  DEFAULT_CONSTRUCTION_STATE,
  DailyReportState,
  DEFAULT_DAILYREPORT_STATE,
  PreBuryState,
  DEFAULT_PREBURY_STATE,
  PreBuryPhoto,
  PreBurySignOff,
  DEFAULT_PREBURY_SIGNOFF,
} from "./tab-types";
import {
  PREBURY_CHECKLIST_GROUPS,
  PREBURY_DOC_ITEMS,
  PreBuryDocStatus,
  AirTestRecord,
} from "./constants";
import {
  partsToDecimalFeet,
  calcExcavation,
  calcSlope,
  calcDropTube,
  calcRawVolumeCf,
  calcConcreteVolume,
  calcRebar,
  calcWireMesh,
  calcGravel,
  calcCostSummary,
  calcDeadmanBuoyancy,
  calcDeadmanTurnbuckleLayout,
  calcTriangle,
  calcAggregate,
  calcLumber,
  calcConversions,
  ConcreteInputs,
} from "./calculations";

export const P = "ust-hub-v2-";

/**
 * Generates an isolated storage key for a tab within a specific job.
 * Automatically migrates existing legacy data to 'default-job' if found.
 */
export function getJobStorageKey(tab: string, jobId: string = "default-job"): string {
  const scopedKey = `${P}${jobId}-${tab}`;
  if (typeof window !== "undefined" && jobId === "default-job") {
    try {
      const existing = localStorage.getItem(scopedKey);
      if (existing === null) {
        const legacy = localStorage.getItem(`${P}${tab}`);
        if (legacy !== null) {
          localStorage.setItem(scopedKey, legacy);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return scopedKey;
}

const ActiveJobContext = createContext<string>("default-job");
export function useActiveJobId() {
  return useContext(ActiveJobContext) || "default-job";
}

// ─── 1. EXCAVATION CONTEXT ───────────────────────────────────────────────────

interface ExcavationContextType {
  state: ExcavationState;
  updateState: (updates: Partial<ExcavationState>) => void;
  resetState: () => void;
  transitShot: number;
  beddingDepth: number;
  excResults: ReturnType<typeof calcExcavation>;
  slopeResults: ReturnType<typeof calcSlope>;
}

const ExcavationContext = createContext<ExcavationContextType | null>(null);

export function ExcavationProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<ExcavationState>(
    getJobStorageKey("excavation", jobId),
    DEFAULT_EXCAVATION_STATE
  );

  const updateState = useCallback((updates: Partial<ExcavationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_EXCAVATION_STATE);
  }, [setState]);

  const transitShot = useMemo(() => {
    if (state.excInputMode === "decimal") {
      const parsed = parseFloat(state.decTransitShot);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return partsToDecimalFeet(state.excFeet, state.excInches, state.excSixteenths);
  }, [state.excInputMode, state.decTransitShot, state.excFeet, state.excInches, state.excSixteenths]);

  const beddingDepth = useMemo(() => parseFloat(state.beddingDepthFt) || 1.0, [state.beddingDepthFt]);

  const excResults = useMemo(
    () => calcExcavation(transitShot, beddingDepth),
    [transitShot, beddingDepth]
  );

  const slopeResults = useMemo(
    () =>
      calcSlope(
        excResults.trenchDepth,
        state.slopeStartMode,
        parseFloat(state.customSlopeStart) || excResults.trenchDepth,
        parseFloat(state.slopeRun) || 0,
        parseFloat(state.slopeRateInchesPerFoot) || 0.125
      ),
    [
      excResults.trenchDepth,
      state.slopeStartMode,
      state.customSlopeStart,
      state.slopeRun,
      state.slopeRateInchesPerFoot,
    ]
  );

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
      transitShot,
      beddingDepth,
      excResults,
      slopeResults,
    }),
    [state, updateState, resetState, transitShot, beddingDepth, excResults, slopeResults]
  );

  return <ExcavationContext.Provider value={value}>{children}</ExcavationContext.Provider>;
}

export function useExcavation() {
  const ctx = useContext(ExcavationContext);
  if (!ctx) throw new Error("useExcavation must be used within ExcavationProvider");
  return ctx;
}

// ─── 2. DROP TUBE CONTEXT ────────────────────────────────────────────────────

interface DropTubeContextType {
  state: DropTubeState;
  updateState: (updates: Partial<DropTubeState>) => void;
  resetState: () => void;
  d_tank: number;
  h_riser: number;
  dtResults: ReturnType<typeof calcDropTube>;
}

const DropTubeContext = createContext<DropTubeContextType | null>(null);

export function DropTubeProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<DropTubeState>(
    getJobStorageKey("droptube", jobId),
    DEFAULT_DROPTUBE_STATE
  );

  const updateState = useCallback((updates: Partial<DropTubeState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_DROPTUBE_STATE);
  }, [setState]);

  const d_tank = useMemo(() => parseFloat(state.customDiameter) || 0, [state.customDiameter]);
  const h_riser = useMemo(() => parseFloat(state.riserHeight) || 0, [state.riserHeight]);

  const dtResults = useMemo(
    () =>
      calcDropTube(
        h_riser,
        d_tank,
        state.valveType,
        parseFloat(state.customValveOffset) || 5.5,
        parseFloat(state.tankClearance) || 6.0
      ),
    [h_riser, d_tank, state.valveType, state.customValveOffset, state.tankClearance]
  );

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
      d_tank,
      h_riser,
      dtResults,
    }),
    [state, updateState, resetState, d_tank, h_riser, dtResults]
  );

  return <DropTubeContext.Provider value={value}>{children}</DropTubeContext.Provider>;
}

export function useDropTube() {
  const ctx = useContext(DropTubeContext);
  if (!ctx) throw new Error("useDropTube must be used within DropTubeProvider");
  return ctx;
}

// ─── 3. CONCRETE CONTEXT ────────────────────────────────────────────────────

interface ConcreteContextType {
  state: ConcreteState;
  updateState: (updates: Partial<ConcreteState>) => void;
  resetState: () => void;
  concreteInputs: ConcreteInputs;
  rawVolumeCf: number;
  concreteVolume: ReturnType<typeof calcConcreteVolume>;
  rebarResults: ReturnType<typeof calcRebar>;
  meshResults: ReturnType<typeof calcWireMesh>;
  gravelResults: ReturnType<typeof calcGravel>;
  costSummary: ReturnType<typeof calcCostSummary>;
  buoyancyResults: ReturnType<typeof calcDeadmanBuoyancy>;
  turnbuckleLayout: ReturnType<typeof calcDeadmanTurnbuckleLayout>;
}

const ConcreteContext = createContext<ConcreteContextType | null>(null);

export function ConcreteProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<ConcreteState>(
    getJobStorageKey("concrete", jobId),
    DEFAULT_CONCRETE_STATE
  );

  const updateState = useCallback((updates: Partial<ConcreteState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_CONCRETE_STATE);
  }, [setState]);

  const concreteInputs: ConcreteInputs = useMemo(
    () => ({
      shape: state.concreteShape,
      flatLength: parseFloat(state.flatLength) || 0,
      flatWidth: parseFloat(state.flatWidth) || 0,
      flatThickness: parseFloat(state.flatThickness) || 0,
      flatQuantity: parseFloat(state.flatQuantity) || 1,
      circDiameter: parseFloat(state.circDiameter) || 0,
      circThickness: parseFloat(state.circThickness) || 0,
      circQuantity: parseFloat(state.circQuantity) || 1,
      sonoDiameter: parseFloat(state.sonoDiameter) || 0,
      sonoHeight: parseFloat(state.sonoHeight) || 0,
      sonoQuantity: parseFloat(state.sonoQuantity) || 1,
      footLength: parseFloat(state.footLength) || 0,
      footWidth: parseFloat(state.footWidth) || 0,
      footDepth: parseFloat(state.footDepth) || 0,
      footQuantity: parseFloat(state.footQuantity) || 1,
      deadmanLength: parseFloat(state.deadmanLength) || 0,
      deadmanWidth: parseFloat(state.deadmanWidth) || 0,
      deadmanHeight: parseFloat(state.deadmanHeight) || 0,
      deadmanQuantity: parseFloat(state.deadmanQuantity) || 1,
      ballastLength: parseFloat(state.ballastLength) || 0,
      ballastWidth: parseFloat(state.ballastWidth) || 0,
      ballastThickness: parseFloat(state.ballastThickness) || 0,
      ballastQuantity: parseFloat(state.ballastQuantity) || 1,
      curbLength: parseFloat(state.curbLength) || 0,
      curbHeight: parseFloat(state.curbHeight) || 0,
      curbWidth: parseFloat(state.curbWidth) || 0,
      gutterThickness: parseFloat(state.gutterThickness) || 0,
      gutterWidth: parseFloat(state.gutterWidth) || 0,
      curbQuantity: parseFloat(state.curbQuantity) || 1,
      stepCount: parseInt(state.stepCount) || 0,
      stepWidth: parseFloat(state.stepWidth) || 0,
      stepRise: parseFloat(state.stepRise) || 0,
      stepRun: parseFloat(state.stepRun) || 0,
      stepQuantity: parseFloat(state.stepQuantity) || 1,
      wallLength: parseFloat(state.wallLength) || 0,
      wallWidth: parseFloat(state.wallWidth) || 0,
      wallDepth: parseFloat(state.wallDepth) || 0,
      wallQuantity: parseFloat(state.wallQuantity) || 1,
    }),
    [
      state.concreteShape,
      state.flatLength,
      state.flatWidth,
      state.flatThickness,
      state.flatQuantity,
      state.circDiameter,
      state.circThickness,
      state.circQuantity,
      state.sonoDiameter,
      state.sonoHeight,
      state.sonoQuantity,
      state.footLength,
      state.footWidth,
      state.footDepth,
      state.footQuantity,
      state.deadmanLength,
      state.deadmanWidth,
      state.deadmanHeight,
      state.deadmanQuantity,
      state.ballastLength,
      state.ballastWidth,
      state.ballastThickness,
      state.ballastQuantity,
      state.curbLength,
      state.curbHeight,
      state.curbWidth,
      state.gutterThickness,
      state.gutterWidth,
      state.curbQuantity,
      state.stepCount,
      state.stepWidth,
      state.stepRise,
      state.stepRun,
      state.stepQuantity,
      state.wallLength,
      state.wallWidth,
      state.wallDepth,
      state.wallQuantity,
    ]
  );

  const rawVolumeCf = useMemo(() => calcRawVolumeCf(concreteInputs), [concreteInputs]);
  const concreteVolume = useMemo(
    () => calcConcreteVolume(rawVolumeCf, state.wastePct),
    [rawVolumeCf, state.wastePct]
  );
  const rebarResults = useMemo(
    () => calcRebar(concreteInputs, state.rebarSpacing),
    [concreteInputs, state.rebarSpacing]
  );
  const meshResults = useMemo(
    () => calcWireMesh(concreteInputs, state.wireMesh),
    [concreteInputs, state.wireMesh]
  );
  const gravelResults = useMemo(
    () => calcGravel(concreteInputs, state.gravelDepth),
    [concreteInputs, state.gravelDepth]
  );
  const costSummary = useMemo(
    () =>
      calcCostSummary({
        adjustedVolumeCy: concreteVolume.adjustedVolumeCy,
        bags80lb: concreteVolume.bags80lb,
        bags60lb: concreteVolume.bags60lb,
        bags40lb: concreteVolume.bags40lb,
        rebarPieces20: rebarResults.pieces20,
        meshRolls: meshResults.rolls,
        meshSheets: meshResults.sheets,
        gravelTons: gravelResults.tons,
        pricePerCy: parseFloat(state.pricePerCy) || 0,
        pricePerBag80: parseFloat(state.pricePerBag80) || 0,
        pricePerBag60: parseFloat(state.pricePerBag60) || 0,
        pricePerBag40: parseFloat(state.pricePerBag40) || 0,
        pricePerRebarStick: parseFloat(state.pricePerRebarStick) || 0,
        pricePerMeshRoll: parseFloat(state.pricePerMeshRoll) || 0,
        pricePerGravelTon: parseFloat(state.pricePerGravelTon) || 0,
      }),
    [
      concreteVolume,
      rebarResults,
      meshResults,
      gravelResults,
      state.pricePerCy,
      state.pricePerBag80,
      state.pricePerBag60,
      state.pricePerBag40,
      state.pricePerRebarStick,
      state.pricePerMeshRoll,
      state.pricePerGravelTon,
    ]
  );

  const deadmanFootprintSqFt = useMemo(() => {
    const l = parseFloat(state.deadmanLength) || 0;
    const w = (parseFloat(state.deadmanWidth) || 0) / 12;
    const q = parseFloat(state.deadmanQuantity) || 1;
    return l * w * q;
  }, [state.deadmanLength, state.deadmanWidth, state.deadmanQuantity]);

  const buoyancyResults = useMemo(
    () =>
      calcDeadmanBuoyancy({
        deadmanVolumeCf: rawVolumeCf,
        tankGallons: parseFloat(state.buoyancyTankGallons) || 10000,
        emptyTankWeightLbs: parseFloat(state.buoyancyTankWeightLbs) || 4500,
        burialDepthFt: parseFloat(state.buoyancyBurialDepthFt) || 3.5,
        deadmanFootprintSqFt,
        includeOverburden: state.buoyancyIncludeOverburden ?? true,
        waterTable: state.buoyancyWaterTable || "grade",
        strapCount: parseInt(state.strapCount) || 2,
        strapWllLbs: parseFloat(state.buoyancyStrapWllLbs) || 5200,
      }),
    [
      rawVolumeCf,
      deadmanFootprintSqFt,
      state.buoyancyTankGallons,
      state.buoyancyTankWeightLbs,
      state.buoyancyBurialDepthFt,
      state.buoyancyIncludeOverburden,
      state.buoyancyWaterTable,
      state.strapCount,
      state.buoyancyStrapWllLbs,
    ]
  );

  const turnbuckleLayout = useMemo(
    () =>
      calcDeadmanTurnbuckleLayout(
        parseFloat(state.circDiameter) || parseFloat(state.deadmanHeight) || 92,
        parseFloat(state.deadmanClearanceInches) || 12,
        state.turnbuckleModelId || "5_8_x_6",
        parseInt(state.strapCount) || 2
      ),
    [state.circDiameter, state.deadmanHeight, state.deadmanClearanceInches, state.turnbuckleModelId, state.strapCount]
  );

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
      concreteInputs,
      rawVolumeCf,
      concreteVolume,
      rebarResults,
      meshResults,
      gravelResults,
      costSummary,
      buoyancyResults,
      turnbuckleLayout,
    }),
    [
      state,
      updateState,
      resetState,
      concreteInputs,
      rawVolumeCf,
      concreteVolume,
      rebarResults,
      meshResults,
      gravelResults,
      costSummary,
      buoyancyResults,
      turnbuckleLayout,
    ]
  );

  return <ConcreteContext.Provider value={value}>{children}</ConcreteContext.Provider>;
}

export function useConcrete() {
  const ctx = useContext(ConcreteContext);
  if (!ctx) throw new Error("useConcrete must be used within ConcreteProvider");
  return ctx;
}

// ─── 4. CONSTRUCTION CONTEXT ────────────────────────────────────────────────

interface ConstructionContextType {
  state: ConstructionState;
  updateState: (updates: Partial<ConstructionState>) => void;
  resetState: () => void;
  triCalc: ReturnType<typeof calcTriangle>;
  aggCalc: ReturnType<typeof calcAggregate>;
  lumberCalc: ReturnType<typeof calcLumber>;
  convCalc: ReturnType<typeof calcConversions>;
}

const ConstructionContext = createContext<ConstructionContextType | null>(null);

export function ConstructionProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<ConstructionState>(
    getJobStorageKey("construction", jobId),
    DEFAULT_CONSTRUCTION_STATE
  );

  const updateState = useCallback((updates: Partial<ConstructionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_CONSTRUCTION_STATE);
  }, [setState]);

  const triCalc = useMemo(
    () => calcTriangle(parseFloat(state.triA) || 0, parseFloat(state.triB) || 0),
    [state.triA, state.triB]
  );

  const aggCalc = useMemo(
    () =>
      calcAggregate(
        parseFloat(state.aggLength) || 0,
        parseFloat(state.aggWidth) || 0,
        parseFloat(state.aggDepth) || 0,
        state.aggMat,
        parseFloat(state.aggWaste) || 0,
        parseFloat(state.aggPriceTon) || 0
      ),
    [
      state.aggLength,
      state.aggWidth,
      state.aggDepth,
      state.aggMat,
      state.aggWaste,
      state.aggPriceTon,
    ]
  );

  const lumberCalc = useMemo(
    () =>
      calcLumber(
        state.lumberSubTool,
        parseFloat(state.bfThickness) || 0,
        parseFloat(state.bfWidth) || 0,
        parseFloat(state.bfLength) || 0,
        parseFloat(state.bfQuantity) || 1,
        parseFloat(state.bfPricePerBf) || 0,
        parseFloat(state.formPerimeter) || 0,
        parseFloat(state.formSpacing) || 16,
        parseFloat(state.formPlates) || 3,
        parseFloat(state.formStakeSpacing) || 3
      ),
    [
      state.lumberSubTool,
      state.bfThickness,
      state.bfWidth,
      state.bfLength,
      state.bfQuantity,
      state.bfPricePerBf,
      state.formPerimeter,
      state.formSpacing,
      state.formPlates,
      state.formStakeSpacing,
    ]
  );

  const convCalc = useMemo(
    () =>
      calcConversions(
        state.convCategory,
        state.convFromUnit,
        parseFloat(state.convInputVal) || 0
      ),
    [state.convCategory, state.convFromUnit, state.convInputVal]
  );

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
      triCalc,
      aggCalc,
      lumberCalc,
      convCalc,
    }),
    [state, updateState, resetState, triCalc, aggCalc, lumberCalc, convCalc]
  );

  return <ConstructionContext.Provider value={value}>{children}</ConstructionContext.Provider>;
}

export function useConstruction() {
  const ctx = useContext(ConstructionContext);
  if (!ctx) throw new Error("useConstruction must be used within ConstructionProvider");
  return ctx;
}

// ─── 5. DAILY REPORT CONTEXT ─────────────────────────────────────────────────

interface DailyReportContextType {
  state: DailyReportState;
  updateState: (updates: Partial<DailyReportState>) => void;
  resetState: () => void;
}

const DailyReportContext = createContext<DailyReportContextType | null>(null);

export function DailyReportProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<DailyReportState>(
    getJobStorageKey("dailyreport", jobId),
    DEFAULT_DAILYREPORT_STATE
  );

  const updateState = useCallback((updates: Partial<DailyReportState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_DAILYREPORT_STATE);
  }, [setState]);

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
    }),
    [state, updateState, resetState]
  );

  return <DailyReportContext.Provider value={value}>{children}</DailyReportContext.Provider>;
}

export function useDailyReport() {
  const ctx = useContext(DailyReportContext);
  if (!ctx) throw new Error("useDailyReport must be used within DailyReportProvider");
  return ctx;
}

// ─── 6. PRE-BURY INSPECTOR CONTEXT ──────────────────────────────────────────

interface PreBuryContextType {
  state: PreBuryState;
  updateState: (updates: Partial<PreBuryState>) => void;
  resetState: () => void;
  toggleCheck: (id: string) => void;
  setDocStatus: (id: string, status: PreBuryDocStatus) => void;
  togglePrecheck: (id: string) => void;
  addAirTest: (test: Omit<AirTestRecord, "id" | "recordedAt">) => void;
  updateAirTest: (id: string, updates: Partial<AirTestRecord>) => void;
  deleteAirTest: (id: string) => void;
  addPhoto: (photo: Omit<PreBuryPhoto, "id" | "timestamp">) => void;
  deletePhoto: (id: string) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  setSignOff: (signOffUpdates: Partial<PreBurySignOff>) => void;
  clearSignOff: () => void;
  checksCompleted: number;
  checksTotal: number;
  docsCompleted: number;
  docsTotal: number;
  airTestsPassed: number;
  airTestsTotal: number;
  openItemsCount: number;
}

const PreBuryContext = createContext<PreBuryContextType | null>(null);

export function PreBuryProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<PreBuryState>(
    getJobStorageKey("prebury", jobId),
    DEFAULT_PREBURY_STATE
  );

  const updateState = useCallback((updates: Partial<PreBuryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_PREBURY_STATE);
  }, [setState]);

  const toggleCheck = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [id]: !prev.checks[id],
      },
    }));
  }, [setState]);

  const setDocStatus = useCallback((id: string, status: PreBuryDocStatus) => {
    setState((prev) => ({
      ...prev,
      docs: {
        ...prev.docs,
        [id]: status,
      },
    }));
  }, [setState]);

  const togglePrecheck = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      precheck: {
        ...prev.precheck,
        [id]: !prev.precheck[id],
      },
    }));
  }, [setState]);

  const addAirTest = useCallback((test: Omit<AirTestRecord, "id" | "recordedAt">) => {
    const newRecord: AirTestRecord = {
      ...test,
      id: `at-${Date.now()}`,
      recordedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setState((prev) => ({
      ...prev,
      airTests: [...prev.airTests, newRecord],
    }));
  }, [setState]);

  const updateAirTest = useCallback((id: string, updates: Partial<AirTestRecord>) => {
    setState((prev) => ({
      ...prev,
      airTests: prev.airTests.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, [setState]);

  const deleteAirTest = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      airTests: prev.airTests.filter((t) => t.id !== id),
    }));
  }, [setState]);

  const addPhoto = useCallback((photo: Omit<PreBuryPhoto, "id" | "timestamp">) => {
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
    setState((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto],
    }));
  }, [setState]);

  const deletePhoto = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== id),
    }));
  }, [setState]);

  const updatePhotoCaption = useCallback((id: string, caption: string) => {
    setState((prev) => ({
      ...prev,
      photos: (prev.photos || []).map((p) => (p.id === id ? { ...p, caption } : p)),
    }));
  }, [setState]);

  const setSignOff = useCallback((signOffUpdates: Partial<PreBurySignOff>) => {
    setState((prev) => ({
      ...prev,
      signOff: {
        ...(prev.signOff || DEFAULT_PREBURY_SIGNOFF),
        ...signOffUpdates,
        signedAt: signOffUpdates.signedAt || new Date().toLocaleString("en-US"),
      },
    }));
  }, [setState]);

  const clearSignOff = useCallback(() => {
    setState((prev) => ({
      ...prev,
      signOff: DEFAULT_PREBURY_SIGNOFF,
    }));
  }, [setState]);

  // Computed metrics
  const totalCheckItems = useMemo(
    () => PREBURY_CHECKLIST_GROUPS.reduce((acc, g) => acc + g.items.length, 0),
    []
  );

  const checksCompleted = useMemo(
    () => Object.values(state.checks).filter(Boolean).length,
    [state.checks]
  );

  const docsCompleted = useMemo(
    () => Object.values(state.docs).filter((s) => s === "uploaded").length,
    [state.docs]
  );

  const airTestsPassed = useMemo(
    () => state.airTests.filter((t) => t.status === "passed").length,
    [state.airTests]
  );

  const openItemsCount = useMemo(() => {
    const incompleteChecks = totalCheckItems - checksCompleted;
    const incompleteDocs = PREBURY_DOC_ITEMS.length - docsCompleted;
    const failedOrIncompleteTests = state.airTests.filter((t) => t.status !== "passed").length;
    return incompleteChecks + incompleteDocs + failedOrIncompleteTests;
  }, [totalCheckItems, checksCompleted, docsCompleted, state.airTests]);

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
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
      checksTotal: totalCheckItems,
      docsCompleted,
      docsTotal: PREBURY_DOC_ITEMS.length,
      airTestsPassed,
      airTestsTotal: state.airTests.length,
      openItemsCount,
    }),
    [
      state,
      updateState,
      resetState,
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
      totalCheckItems,
      docsCompleted,
      airTestsPassed,
      openItemsCount,
    ]
  );

  return <PreBuryContext.Provider value={value}>{children}</PreBuryContext.Provider>;
}

export function usePreBury() {
  const ctx = useContext(PreBuryContext);
  if (!ctx) throw new Error("usePreBury must be used within PreBuryProvider");
  return ctx;
}

// ─── ROOT APP PROVIDER COMBINER ─────────────────────────────────────────────

export function AppStateProviders({
  children,
  activeJobId = "default-job",
}: {
  children: React.ReactNode;
  activeJobId?: string;
}) {
  return (
    <ActiveJobContext.Provider value={activeJobId}>
      <ExcavationProvider key={`${activeJobId}-exc`} jobId={activeJobId}>
        <DropTubeProvider key={`${activeJobId}-dt`} jobId={activeJobId}>
          <ConcreteProvider key={`${activeJobId}-con`} jobId={activeJobId}>
            <ConstructionProvider key={`${activeJobId}-cst`} jobId={activeJobId}>
              <DailyReportProvider key={`${activeJobId}-dr`} jobId={activeJobId}>
                <PreBuryProvider key={`${activeJobId}-pb`} jobId={activeJobId}>
                  {children}
                </PreBuryProvider>
              </DailyReportProvider>
            </ConstructionProvider>
          </ConcreteProvider>
        </DropTubeProvider>
      </ExcavationProvider>
    </ActiveJobContext.Provider>
  );
}
```

### File: `app/lib/tab-types.ts`

```ts
// encoding: utf-8
import {
  ExcInputMode,
  ValveType,
  ConcreteShape,
  ConstructionTool,
  LumberSubTool,
  ConvCategory,
  SlopeStartMode,
  WeatherCondition,
  DailyWorkEntry,
  DailyMaterialEntry,
  AirTestRecord,
  PreBuryDocStatus,
} from "./constants";

// ─── Grouped Tab States ──────────────────────────────────────────────────────

export interface ExcavationState {
  excInputMode: ExcInputMode;
  decTransitShot: string;
  excFeet: number;
  excInches: number;
  excSixteenths: number;
  beddingDepthFt: string;
  slopeRun: string;
  slopeStartMode: SlopeStartMode;
  customSlopeStart: string;
  slopeRateInchesPerFoot: string;
}

export const DEFAULT_EXCAVATION_STATE: ExcavationState = {
  excInputMode: "decimal",
  decTransitShot: "4.50",
  excFeet: 4,
  excInches: 6,
  excSixteenths: 0,
  beddingDepthFt: "1.0",
  slopeRun: "40",
  slopeStartMode: "trench",
  customSlopeStart: "7.50",
  slopeRateInchesPerFoot: "0.125",
};

export interface DropTubeState {
  selectedPreset: string;
  customDiameter: string;
  riserHeight: string;
  valveType: ValveType;
  customValveOffset: string;
  tankClearance: string;
}

export const DEFAULT_DROPTUBE_STATE: DropTubeState = {
  selectedPreset: "x-10k-92",
  customDiameter: "92",
  riserHeight: "36",
  valveType: "standard",
  customValveOffset: "5.5",
  tankClearance: "6.0",
};

export interface ConcreteState {
  concreteShape: ConcreteShape;
  flatLength: string;
  flatWidth: string;
  flatThickness: string;
  flatQuantity: string;
  circDiameter: string;
  circThickness: string;
  circQuantity: string;
  sonoDiameter: string;
  sonoHeight: string;
  sonoQuantity: string;
  footLength: string;
  footWidth: string;
  footDepth: string;
  footQuantity: string;
  deadmanLength: string;
  deadmanWidth: string;
  deadmanHeight: string;
  deadmanQuantity: string;
  ballastLength: string;
  ballastWidth: string;
  ballastThickness: string;
  ballastQuantity: string;
  curbLength: string;
  curbHeight: string;
  curbWidth: string;
  gutterThickness: string;
  gutterWidth: string;
  curbQuantity: string;
  stepCount: string;
  stepWidth: string;
  stepRise: string;
  stepRun: string;
  stepQuantity: string;
  wallLength: string;
  wallWidth: string;
  wallDepth: string;
  wallQuantity: string;
  wastePct: number;
  rebarSpacing: string;
  rebarSize: string;
  wireMesh: string;
  gravelDepth: string;
  showCostEstimator: boolean;
  pricePerCy: string;
  pricePerBag80: string;
  pricePerBag60: string;
  pricePerBag40: string;
  pricePerGravelTon: string;
  pricePerRebarStick: string;
  pricePerMeshRoll: string;
  turnbuckleModelId: string;
  deadmanClearanceInches: string;
  strapCount: string;
  buoyancyTankGallons: string;
  buoyancyTankWeightLbs: string;
  buoyancyWaterTable: "grade" | "tank_top" | "custom";
  buoyancyBurialDepthFt: string;
  buoyancyIncludeOverburden: boolean;
  buoyancyStrapWllLbs: string;
}

export const DEFAULT_CONCRETE_STATE: ConcreteState = {
  concreteShape: "flatwork",
  flatLength: "30",
  flatWidth: "12",
  flatThickness: "8",
  flatQuantity: "1",
  circDiameter: "12",
  circThickness: "6",
  circQuantity: "1",
  sonoDiameter: "24",
  sonoHeight: "6",
  sonoQuantity: "4",
  footLength: "6",
  footWidth: "6",
  footDepth: "3.5",
  footQuantity: "4",
  deadmanLength: "20",
  deadmanWidth: "18",
  deadmanHeight: "18",
  deadmanQuantity: "2",
  ballastLength: "32",
  ballastWidth: "14",
  ballastThickness: "12",
  ballastQuantity: "1",
  curbLength: "20",
  curbHeight: "6",
  curbWidth: "6",
  gutterThickness: "6",
  gutterWidth: "18",
  curbQuantity: "1",
  stepCount: "3",
  stepWidth: "4",
  stepRise: "7",
  stepRun: "11",
  stepQuantity: "1",
  wallLength: "50",
  wallWidth: "12",
  wallDepth: "18",
  wallQuantity: "1",
  wastePct: 10,
  rebarSpacing: "12",
  rebarSize: "#4",
  wireMesh: "roll_750",
  gravelDepth: "4",
  showCostEstimator: true,
  pricePerCy: "150.00",
  pricePerBag80: "8.50",
  pricePerBag60: "6.50",
  pricePerBag40: "4.50",
  pricePerGravelTon: "45.00",
  pricePerRebarStick: "12.00",
  pricePerMeshRoll: "180.00",
  turnbuckleModelId: "5_8_x_6",
  deadmanClearanceInches: "12",
  strapCount: "2",
  buoyancyTankGallons: "10000",
  buoyancyTankWeightLbs: "4500",
  buoyancyWaterTable: "grade",
  buoyancyBurialDepthFt: "3.5",
  buoyancyIncludeOverburden: true,
  buoyancyStrapWllLbs: "5200",
};

export interface ConstructionState {
  constTool: ConstructionTool;
  triA: string;
  triB: string;
  aggLength: string;
  aggWidth: string;
  aggDepth: string;
  aggMat: string;
  aggWaste: string;
  aggPriceTon: string;
  lumberSubTool: LumberSubTool;
  bfThickness: string;
  bfWidth: string;
  bfLength: string;
  bfQuantity: string;
  bfPricePerBf: string;
  formPerimeter: string;
  formSpacing: string;
  formPlates: string;
  formStakeSpacing: string;
  convCategory: ConvCategory;
  convFromUnit: string;
  convInputVal: string;
}

export const DEFAULT_CONSTRUCTION_STATE: ConstructionState = {
  constTool: "triangle",
  triA: "30",
  triB: "40",
  aggLength: "50",
  aggWidth: "20",
  aggDepth: "6",
  aggMat: "crushed_stone",
  aggWaste: "10",
  aggPriceTon: "35.00",
  lumberSubTool: "formwork",
  bfThickness: "2",
  bfWidth: "6",
  bfLength: "12",
  bfQuantity: "10",
  bfPricePerBf: "2.50",
  formPerimeter: "100",
  formSpacing: "16",
  formPlates: "3",
  formStakeSpacing: "3",
  convCategory: "length",
  convFromUnit: "ft",
  convInputVal: "10",
};

export interface DailyReportState {
  reportDate: string;
  jobSiteName: string;
  foremanName: string;
  crewSize: string;
  weather: WeatherCondition[];
  temperature: string;
  workEntries: DailyWorkEntry[];
  materialEntries: DailyMaterialEntry[];
  safetyChecks: Record<string, boolean>;
  reportNotes: string;
}

export const DEFAULT_DAILYREPORT_STATE: DailyReportState = {
  reportDate: new Date().toISOString().slice(0, 10),
  jobSiteName: "",
  foremanName: "",
  crewSize: "4",
  weather: [],
  temperature: "",
  workEntries: [{ id: "init1", task: "", hours: "", equipment: "" }],
  materialEntries: [{ id: "init1", material: "", quantity: "", unit: "each" }],
  safetyChecks: {},
  reportNotes: "",
};

// ─── Pre-Bury Inspector State ────────────────────────────────────────────────

export type PreBurySubTab = "overview" | "checks" | "tests" | "docs" | "precheck" | "photos" | "signoff";

export type PhotoCategory = "bedding" | "piping" | "gauge" | "deflection" | "general";

export interface PreBuryPhoto {
  id: string;
  category: PhotoCategory;
  caption: string;
  dataUrl: string;
  timestamp: string;
}

export interface PreBurySignOff {
  inspectorName: string;
  inspectorTitle: string;
  agencyOrCompany: string;
  certificationNumber: string;
  signedAt: string;
  signatureDataUrl: string;
  isApproved: boolean;
  inspectorNotes: string;
}

export const DEFAULT_PREBURY_SIGNOFF: PreBurySignOff = {
  inspectorName: "",
  inspectorTitle: "Certified UST Inspector",
  agencyOrCompany: "",
  certificationNumber: "",
  signedAt: "",
  signatureDataUrl: "",
  isApproved: false,
  inspectorNotes: "",
};

export interface PreBuryState {
  activeSubTab: PreBurySubTab;
  siteName: string;
  location: string;
  phase: string;
  targetInspectionDate: string;
  checks: Record<string, boolean>;
  docs: Record<string, PreBuryDocStatus>;
  precheck: Record<string, boolean>;
  airTests: AirTestRecord[];
  activeAirTestId: string | null;
  gaugePsig: number;
  timerElapsedSec: number;
  timerTotalSec: number;
  isTimerRunning: boolean;
  photos: PreBuryPhoto[];
  signOff: PreBurySignOff;
}

export const DEFAULT_PREBURY_STATE: PreBuryState = {
  activeSubTab: "overview",
  siteName: "Station 47 — Shell Petroleum",
  location: "2841 Industrial Blvd, Jacksonville, FL",
  phase: "Phase 3 of 5: Structural & Install",
  targetInspectionDate: "Sunday, September 7",
  checks: {
    at_1: true,
    at_2: true,
    at_3: true,
    at_4: true,
    at_5: false,
    at_6: true,
    at_7: false,
    cp_1: true,
    cp_2: true,
    cp_3: false,
    cp_4: true,
    cp_5: false,
    mc_1: true,
    mc_2: true,
    mc_3: true,
    mc_4: true,
    mc_5: true,
    em_1: true,
    em_2: false,
    em_3: true,
    em_4: false,
  },
  docs: {
    doc_install_checklist: "uploaded",
    doc_air_test: "pending",
    doc_line_tightness: "uploaded",
    doc_deflection: "uploaded",
    doc_mfr_delivery: "uploaded",
    doc_permits: "uploaded",
    doc_asbuilt: "missing",
    doc_backfill_cert: "missing",
  },
  precheck: {
    pc_1: true,
    pc_2: true,
    pc_3: false,
    pc_4: false,
    pc_5: false,
    pc_6: false,
    pc_7: false,
    pc_8: false,
  },
  airTests: [
    {
      id: "at-tank-1",
      tankName: "Tank #1",
      capacityGal: 12000,
      testPsig: 5.0,
      holdDurationMin: 60,
      status: "passed",
      notes: "Passed 60 min hold, zero drop, soap verified",
      recordedAt: "Sep 3, 2026",
    },
    {
      id: "at-tank-2",
      tankName: "Tank #2",
      capacityGal: 12000,
      testPsig: 5.0,
      holdDurationMin: 60,
      status: "passed",
      notes: "Passed 60 min hold, zero drop",
      recordedAt: "Sep 3, 2026",
    },
    {
      id: "at-tank-3",
      tankName: "Tank #3",
      capacityGal: 8000,
      testPsig: 5.0,
      holdDurationMin: 60,
      status: "in_progress",
      notes: "Holding steady at 5.0 psig",
      recordedAt: "Sep 4, 2026",
    },
    {
      id: "at-tank-4",
      tankName: "Tank #4",
      capacityGal: 8000,
      testPsig: 5.0,
      holdDurationMin: 60,
      status: "failed",
      notes: "0.2 psi drop detected at 42 min — retest required",
      recordedAt: "Sep 4, 2026",
    },
  ],
  activeAirTestId: "at-tank-3",
  gaugePsig: 5.0,
  timerElapsedSec: 2852, // 47 min 32 sec
  timerTotalSec: 3600,   // 60 min
  isTimerRunning: true,
  photos: [],
  signOff: DEFAULT_PREBURY_SIGNOFF,
};
```
