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
