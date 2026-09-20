---
trigger: model_decision
description: Core standards, calculation rules, and architecture guidelines for the UST Field Hub application.
---

# UST Field Hub - Project Rules & Guidelines

## 1. Domain Standards & Engineering Math

- **Safety & Regulatory Compliance:**
  - **PEI RP100 / RP1200:** Follow standard recommended practices for installation of underground storage systems.
  - **Buoyancy Safety Factor:** Total downward hold-down force (submerged deadman weight + soil overburden + tank weight) divided by buoyant upward force (submerged water displacement) must target a safety factor $\ge 1.2\times$.
  - **Submerged Concrete Density:** Use $87.6\text{ lbs/cf}$ ($150\text{ lbs/cf dry} - 62.4\text{ lbs/cf water}$).
  - **Water Weight:** Use $8.34\text{ lbs/gal}$ ($62.4\text{ lbs/cf}$).
  - **Drop Tube Clearance:** Standard bottom clearance is $6\text{ inches}$ from the tank bottom (per PEI RP100 / CARB / EPA 40 CFR). Drop tube cut length = `(Riser Pipe Height + Tank Diameter) - Bottom Clearance`.
  - **OSHA Excavation Slopes (1926 Subpart P):**
    - Type A Soil: $3/4:1$ ($53^\circ$)
    - Type B Soil: $1:1$ ($45^\circ$)
    - Type C Soil / Submerged: $1.5:1$ ($34^\circ$)
  - **Fuel / Vent Line Pitch:** Standard slope is $1/8\text{ inch/ft}$ or $1/4\text{ inch/ft}$ fall towards the tank.

## 2. Technical Stack & Code Architecture

- **Framework:** Next.js 16 App Router with React 19 and TypeScript.
- **Client Components:** Mark interactive tab and state components with `"use client";` and `# encoding: utf-8`.
- **Styling:** Tailwind CSS v4 with clean, responsive, field-accessible layouts.
  - Support high-contrast field viewing.
  - Ensure all input fields and buttons have clear touch targets on mobile/tablet.
  - Maintain `@media print` layout compatibility in `PrintLayout.tsx`.
- **State Management & Persistence:**
  - Use `usePersistedState` hook with prefix `ust-hub-` for all persistent inputs.
  - Ensure job data respects the active job profile switched in `JobManager.tsx`.
  - Provide fallback defaults for all calculation inputs to avoid `NaN` or application crashes.

## 3. Formatting & Unit Consistency

- Use the shared utility functions in `app/lib/calculations.ts` (`formatFeetInches`, `formatInches`, `formatInchesToFeetInches`).
- Always show dimensions with clear units (`ft`, `in`, `cu yds`, `tons`, `lbs`, `gal`).
- Concrete and aggregate volume results must be rounded to two decimal places (or standard fractions) with standard $5\text{–}10\%$ waste overhead options.
