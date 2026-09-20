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
