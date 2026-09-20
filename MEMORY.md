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
