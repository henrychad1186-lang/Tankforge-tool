# encoding: utf-8
"""
Bundles the entire UST App codebase into a single markdown file optimized for Claude.
"""

import os
from datetime import datetime

ROOT_DIR = r"C:\Users\henry\ust-app"
APP_DIR = os.path.join(ROOT_DIR, "app")
OUTPUT_FILE = os.path.join(ROOT_DIR, "ust-app-claude-bundle.md")
DOWNLOADS_FILE = r"C:\Users\henry\Downloads\ust-app-claude-bundle.md"

def bundle_codebase():
    files_to_bundle = []
    
    # Add documentation and config files
    for doc in ["package.json", "AGENTS.md", "MEMORY.md"]:
        doc_path = os.path.join(ROOT_DIR, doc)
        if os.path.exists(doc_path):
            files_to_bundle.append(doc_path)

    # Add all ts and tsx files in app/
    for root, _, files in os.walk(APP_DIR):
        for f in sorted(files):
            if f.endswith((".ts", ".tsx")):
                files_to_bundle.append(os.path.join(root, f))

    lines = []
    lines.append("# UST Field Hub — Complete Codebase Export for Claude\n")
    lines.append(f"**Exported:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4")
    lines.append(f"**Root Directory:** `{ROOT_DIR}`\n")
    
    lines.append("## Overview of Tabs & Architecture")
    lines.append("1. **Excavation & Laser (`ExcavationTab.tsx`)**: Laser benchmark (+15.5' constant), bedding depths, trench depth (+3.0'), vent slope calculation (1/8\" and 1/4\" pitch).")
    lines.append("2. **OPW Drop Tube (`DropTubeTab.tsx`)**: OPW 71SO overfill prevention cut sheet, riser heights, diameter clearance, visual SVG diagram.")
    lines.append("3. **Complete Concrete (`ConcreteTab.tsx`)**: Slabs, sonotubes, PEI RP100 §5 deadman buoyancy safety factor (>= 1.20x), strap WLL tension checks, rebar LF/grid, gravel, costs.")
    lines.append("4. **Construction Math (`ConstructionTab.tsx`)**: 3-4-5 triangles, aggregate tonnage, lumber board-feet/formwork, unit converters.")
    lines.append("5. **Daily Job Report (`DailyReportTab.tsx`)**: Weather, crew hours, materials received, safety checklist.")
    lines.append("6. **Pre-Bury Inspector (`PreBuryTab.tsx`)**: Field inspection suite with 6 sub-views: Overview, Checklists, 5.0 psig Air Tests (with SVG gauge and live hold timer), Docs Tracker, 8-step Pre-Check walk, and Mobile Photos Gallery.")
    lines.append("7. **Photo Attachment & Field Compression (`PhotoGallery.tsx`)**: Rear camera capture, on-device canvas downscaling (max 1024px @ 0.72 JPEG), 6 categorization buckets, lightbox preview, print embed.")
    lines.append("8. **Touch Canvas Signature Pad (`SignaturePad.tsx`)**: Certified installer/inspector sign-off with smooth HTML5 canvas curves, undo/clear, embedded in reports.")
    lines.append("9. **Per-Job State Isolation & Backup Sync (`JobManager.tsx`, `BackupSyncModal.tsx`)**: Scoped localStorage keys (`ust-hub-v2-[jobId]-[tabId]`), dynamic context switching, single-click JSON export/import and clipboard backup.\n")
    
    lines.append("## File Index")
    for fpath in files_to_bundle:
        rel = os.path.relpath(fpath, ROOT_DIR).replace("\\", "/")
        lines.append(f"- `{rel}`")
    lines.append("\n---\n")

    for fpath in files_to_bundle:
        rel = os.path.relpath(fpath, ROOT_DIR).replace("\\", "/")
        ext = os.path.splitext(fpath)[1].lstrip(".")
        if ext == "json":
            lang = "json"
        elif ext == "tsx":
            lang = "tsx"
        else:
            lang = "ts"

        lines.append(f"### File: `{rel}`\n")
        lines.append(f"```{lang}")
        with open(fpath, "r", encoding="utf-8", errors="replace") as file:
            lines.append(file.read().rstrip())
        lines.append("```\n")

    full_content = "\n".join(lines)

    for dest in [OUTPUT_FILE, DOWNLOADS_FILE]:
        with open(dest, "w", encoding="utf-8") as out:
            out.write(full_content)
        print(f"Wrote {len(full_content):,} chars to {dest}")

if __name__ == "__main__":
    bundle_codebase()
