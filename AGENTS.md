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

