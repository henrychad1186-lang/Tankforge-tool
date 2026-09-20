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
