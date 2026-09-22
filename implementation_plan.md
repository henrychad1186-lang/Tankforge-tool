# Implementation Plan - UST Field Hub (PWA, Preset Tanks, Quick Share & PDF Export)

We will implement the requested field features (Offline PWA, Preset Tanks, Quick Share, and PDF Export) using native browser APIs to ensure 100% compatibility, fast builds, and zero external NPM dependencies.

---

## Technical Details

### 1. Offline Mode & PWA Support (#1)

- **Approach**: Create a web app manifest and a custom Service Worker that caches static assets and network requests, allowing the site to load and function without internet access.
- **Files**:
  - `[NEW]` [manifest.json](file:///c:/Users/henry/ust-app/public/manifest.json): Defines app metadata, icons, and theme colors.
  - `[NEW]` [sw.js](file:///c:/Users/henry/ust-app/public/sw.js): Implements cache-first strategy for static assets.
  - `[MODIFY]` [layout.tsx](file:///c:/Users/henry/ust-app/app/layout.tsx): Registers `/sw.js` service worker upon client-side load.

### 2. Preset Tank Specs Database (#2)

- **Approach**: Embed a structured lookup table of common UST sizes inside the calculator code.
- **Database Schema**:
  - **Xerxes (Fiberglass)**:
    - `4,000 Gallon`: Diameter $74"$
    - `6,000 Gallon`: Diameter $92"$
    - `8,000 Gallon`: Diameter $92"$
    - `10,000 Gallon`: Diameter $92"$, $118"$
    - `12,000 Gallon`: Diameter $118"$
    - `15,005 Gallon`: Diameter $118"$
    - `20,000 Gallon`: Diameter $118"$
  - **Containment Solutions (Steel/Fiberglass)**:
    - `4,000 Gallon`: Diameter $76"$
    - `6,000 Gallon`: Diameter $92"$
    - `8,000 Gallon`: Diameter $92"$
    - `10,000 Gallon`: Diameter $92"$, $120"$
    - `12,500 Gallon`: Diameter $120"$
    - `15,000 Gallon`: Diameter $120"$
    - `20,000 Gallon`: Diameter $120"$
- **UI Integration**: Add a select dropdown "Preset Tank Size". Choosing a preset will automatically set the `tankDiameter` state. Manual input is still supported via a "Custom" option.

### 3. Quick Share Text Copy (#3)

- **Approach**: Add a button "Copy Cut Sheet" to the dashboard.
- **Logic**:
  - Reads the active tab and gathers all calculations (Excavation shots, Drop tube cut lengths, or Concrete volumes).
  - Formats a clean text block designed for quick reading on mobile SMS, Slack, or WhatsApp.
  - Copies to the clipboard using `navigator.clipboard.writeText` and triggers a toast notification.

### 4. Print-Friendly PDF Cut Sheet (#5)

- **Approach**: Use CSS Media Queries (`@media print`) and Tailwind print modifiers (`print:`) to format a dedicated submittal page when `window.print()` is triggered.
- **Print Layout Styling**:
  - Hides navigation tabs, inputs, and sliders (`print:hidden`).
  - Centers the dynamic SVGs and expands the calculation results to fill the page.
  - Adds a signature/inspector block at the bottom of the page.
  - Outputs in high-contrast black-and-white.

---

## Proposed Changes

### [MODIFY] [layout.tsx](file:///c:/Users/henry/ust-app/app/layout.tsx)

- Register `/sw.js` service worker inside an effect or inline script.
- Add meta tags for Apple touch icons, theme colors, and mobile capability.

### [NEW] [manifest.json](file:///c:/Users/henry/ust-app/public/manifest.json)

- Configure the web app metadata so that it is installable as a standalone PWA app.

### [NEW] [sw.js](file:///c:/Users/henry/ust-app/public/sw.js)

- Standard offline service worker with fetch intercept and cache.

### [MODIFY] [page.tsx](file:///c:/Users/henry/ust-app/app/page.tsx)

- Add preset tank options and dropdown lookup.
- Add "Copy Cut Sheet" sharing function.
- Add print/PDF formatting controls and trigger button.

---

## Verification Plan

### Manual Verification

1. **PWA Testing**:
   - Verify `manifest.json` is served at `/manifest.json`.
   - Verify the Service Worker is registered successfully in Chrome Developer Tools.
   - Simulate offline mode in browser dev tools $\rightarrow$ Reload page $\rightarrow$ App must load and function.
2. **Preset Tank Database**:
   - Select "Xerxes 10,000 Gallon (92\")" $\rightarrow$ Verify Tank Diameter input changes to `92`.
   - Select "Containment Solutions 15,000 Gallon (120\")" $\rightarrow$ Verify Tank Diameter input changes to `120`.
3. **Quick Share**:
   - Click "Copy Cut Sheet" in Drop Tube tab $\rightarrow$ Paste in notepad $\rightarrow$ Verify formatting.
4. **PDF/Print**:
   - Click "Print PDF" $\rightarrow$ Verify browser print dialog displays a clean layout with only diagrams and calculations (no tabs/sliders/input fields).
