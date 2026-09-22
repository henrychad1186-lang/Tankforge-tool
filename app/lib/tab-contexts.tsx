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
  BlueprintState,
  DEFAULT_BLUEPRINT_STATE,
  BlueprintSheet,
  ScopeItem,
  SowItemStatus,
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

// ─── 7. BLUEPRINTS & SCOPE OF WORK CONTEXT ──────────────────────────────────

interface BlueprintContextType {
  state: BlueprintState;
  updateState: (updates: Partial<BlueprintState>) => void;
  resetState: () => void;
  addSheet: (sheet: BlueprintSheet) => void;
  deleteSheet: (id: string) => void;
  setActiveSheetId: (id: string | null) => void;
  setSowItemStatus: (id: string, status: SowItemStatus) => void;
  toggleSowItemStatus: (id: string) => void;
  updateSowItem: (id: string, updates: Partial<ScopeItem>) => void;
  addSowItem: (item: Omit<ScopeItem, "id">) => void;
  deleteSowItem: (id: string) => void;
  loadSowPreset: (presetItems: ScopeItem[], facilityType: string) => void;
  sowTotalItems: number;
  sowCompletedItems: number;
  sowTotalEstimatedHours: number;
}

const BlueprintContext = createContext<BlueprintContextType | null>(null);

export function BlueprintProvider({ children, jobId = "default-job" }: { children: React.ReactNode; jobId?: string }) {
  const [state, setState] = usePersistedState<BlueprintState>(
    getJobStorageKey("blueprints", jobId),
    DEFAULT_BLUEPRINT_STATE
  );

  const updateState = useCallback((updates: Partial<BlueprintState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(DEFAULT_BLUEPRINT_STATE);
  }, [setState]);

  const addSheet = useCallback((sheet: BlueprintSheet) => {
    setState((prev) => ({
      ...prev,
      sheets: [...(prev.sheets || []), sheet],
      activeSheetId: prev.activeSheetId || sheet.id,
    }));
  }, [setState]);

  const deleteSheet = useCallback((id: string) => {
    setState((prev) => {
      const remaining = (prev.sheets || []).filter((s) => s.id !== id);
      return {
        ...prev,
        sheets: remaining,
        activeSheetId: prev.activeSheetId === id ? (remaining[0]?.id || null) : prev.activeSheetId,
      };
    });
  }, [setState]);

  const setActiveSheetId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeSheetId: id }));
  }, [setState]);

  const setSowItemStatus = useCallback((id: string, status: SowItemStatus) => {
    setState((prev) => ({
      ...prev,
      sowItems: (prev.sowItems || []).map((item) => (item.id === id ? { ...item, status } : item)),
    }));
  }, [setState]);

  const toggleSowItemStatus = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      sowItems: (prev.sowItems || []).map((item) => {
        if (item.id !== id) return item;
        const nextStatus: SowItemStatus =
          item.status === "completed"
            ? "not_started"
            : item.status === "in_progress"
            ? "completed"
            : "in_progress";
        return { ...item, status: nextStatus };
      }),
    }));
  }, [setState]);

  const updateSowItem = useCallback((id: string, updates: Partial<ScopeItem>) => {
    setState((prev) => ({
      ...prev,
      sowItems: (prev.sowItems || []).map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, [setState]);

  const addSowItem = useCallback((item: Omit<ScopeItem, "id">) => {
    const newItem: ScopeItem = {
      ...item,
      id: `sow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      sowItems: [...(prev.sowItems || []), newItem],
    }));
  }, [setState]);

  const deleteSowItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      sowItems: (prev.sowItems || []).filter((item) => item.id !== id),
    }));
  }, [setState]);

  const loadSowPreset = useCallback((presetItems: ScopeItem[], facilityType: string) => {
    setState((prev) => ({
      ...prev,
      facilityType,
      sowItems: presetItems,
    }));
  }, [setState]);

  const sowTotalItems = useMemo(() => (state.sowItems || []).length, [state.sowItems]);
  const sowCompletedItems = useMemo(
    () => (state.sowItems || []).filter((item) => item.status === "completed").length,
    [state.sowItems]
  );
  const sowTotalEstimatedHours = useMemo(
    () => (state.sowItems || []).reduce((sum, item) => sum + (item.estimatedHours || 0), 0),
    [state.sowItems]
  );

  const value = useMemo(
    () => ({
      state,
      updateState,
      resetState,
      addSheet,
      deleteSheet,
      setActiveSheetId,
      setSowItemStatus,
      toggleSowItemStatus,
      updateSowItem,
      addSowItem,
      deleteSowItem,
      loadSowPreset,
      sowTotalItems,
      sowCompletedItems,
      sowTotalEstimatedHours,
    }),
    [
      state,
      updateState,
      resetState,
      addSheet,
      deleteSheet,
      setActiveSheetId,
      setSowItemStatus,
      toggleSowItemStatus,
      updateSowItem,
      addSowItem,
      deleteSowItem,
      loadSowPreset,
      sowTotalItems,
      sowCompletedItems,
      sowTotalEstimatedHours,
    ]
  );

  return <BlueprintContext.Provider value={value}>{children}</BlueprintContext.Provider>;
}

export function useBlueprints() {
  const ctx = useContext(BlueprintContext);
  if (!ctx) throw new Error("useBlueprints must be used within BlueprintProvider");
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
                  <BlueprintProvider key={`${activeJobId}-bp`} jobId={activeJobId}>
                    {children}
                  </BlueprintProvider>
                </PreBuryProvider>
              </DailyReportProvider>
            </ConstructionProvider>
          </ConcreteProvider>
        </DropTubeProvider>
      </ExcavationProvider>
    </ActiveJobContext.Provider>
  );
}

