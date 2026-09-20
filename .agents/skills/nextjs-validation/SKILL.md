---
name: nextjs-validation
description: Runbook for validating TypeScript types, running Next.js linting, verifying production build integrity, and testing local UI in ust-app.
---

# Next.js Application Validation Runbook

Use this skill whenever verifying changes, fixing build/type errors, or validating code quality in the `ust-app` codebase.

---

## 1. Automated Health Check

Run the automated verification script from PowerShell:

```powershell
pwsh -File .agents/skills/nextjs-validation/scripts/validate.ps1
```

Or run the individual steps manually below:

### Step 1: TypeScript Type Check
```bash
npx tsc --noEmit
```
* **Expected Result:** Clean exit with 0 errors.

### Step 2: ESLint Linting
```bash
npm run lint
```
* **Expected Result:** No linting warnings or syntax violations.

### Step 3: Next.js Production Build
```bash
npm run build
```
* **Expected Result:** Clean compilation of all static and server pages without hydration errors.

---

## 2. Common Fixes & Troubleshooting

1. **Hydration Errors:**
   - Ensure components using `localStorage` or `usePersistedState` only render on the client after mounting, or use appropriate initial defaults.
2. **Missing Context Providers:**
   - Verify all tab subcomponents are wrapped within `AppStateProviders` in `app/page.tsx`.
3. **Tailwind v4 Styling Issues:**
   - Ensure modern Tailwind CSS syntax is used (`@theme` / `@layer` rules in CSS if customized).
