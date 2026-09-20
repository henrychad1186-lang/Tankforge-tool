// encoding: utf-8
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A localStorage-backed useState hook.
 * On mount, it restores the value from localStorage (if present).
 * On every state change, it persists the new value.
 * If key changes, it loads the new key's value without overwriting.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [prevKey, setPrevKey] = useState(key);
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupted data or parse failure — fall back to default
    }
    return defaultValue;
  });

  if (prevKey !== key) {
    setPrevKey(key);
    let newVal = defaultValue;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          newVal = JSON.parse(stored) as T;
        }
      } catch {
        // ignore
      }
    }
    setState(newVal);
  }

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [key, state]);

  return [state, setState];
}

// ─── Job Manager Types ───────────────────────────────────────────────────────

export interface JobData {
  name: string;
  createdAt: string;
  updatedAt: string;
  activeTab: string;
  // Excavation state
  excInputMode: string;
  decTransitShot: string;
  excFeet: number;
  excInches: number;
  excSixteenths: number;
  beddingDepthFt: string;
  slopeRun: string;
  slopeStartMode: string;
  customSlopeStart: string;
  // Drop Tube state
  selectedPreset: string;
  customDiameter: string;
  riserHeight: string;
  valveType: string;
  customValveOffset: string;
  tankClearance: string;
  // Concrete state
  concreteShape: string;
  flatLength: string; flatWidth: string; flatThickness: string; flatQuantity: string;
  circDiameter: string; circThickness: string; circQuantity: string;
  sonoDiameter: string; sonoHeight: string; sonoQuantity: string;
  footLength: string; footWidth: string; footDepth: string; footQuantity: string;
  deadmanLength: string; deadmanWidth: string; deadmanHeight: string; deadmanQuantity: string;
  ballastLength: string; ballastWidth: string; ballastThickness: string; ballastQuantity: string;
  curbLength: string; curbHeight: string; curbWidth: string; gutterThickness: string; gutterWidth: string; curbQuantity: string;
  stepCount: string; stepWidth: string; stepRise: string; stepRun: string; stepQuantity: string;
  wallLength: string; wallWidth: string; wallDepth: string; wallQuantity: string;
  wastePct: number;
  rebarSpacing: string;
  rebarSize: string;
  wireMesh: string;
  gravelDepth: string;
  pricePerCy: string;
  pricePerBag80: string; pricePerBag60: string; pricePerBag40: string;
  pricePerGravelTon: string; pricePerRebarStick: string; pricePerMeshRoll: string;
  // Construction state
  constTool: string;
  triA: string; triB: string;
  aggLength: string; aggWidth: string; aggDepth: string; aggMat: string; aggWaste: string; aggPriceTon: string;
  formPerimeter: string; formSpacing: string; formPlates: string; formStakeSpacing: string;
  bfThickness: string; bfWidth: string; bfLength: string; bfQuantity: string; bfPricePerBf: string;
  convCategory: string; convFromUnit: string; convInputVal: string;
}

export interface JobStore {
  jobs: Record<string, JobData>;
  activeJobId: string;
}

const JOBS_STORAGE_KEY = "ust-hub-jobs";

export function useJobManager() {
  const [store, setStore] = useState<JobStore>(() => {
    if (typeof window === "undefined") return { jobs: {}, activeJobId: "" };
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as JobStore;
      }
    } catch { /* fall through */ }
    return { jobs: {}, activeJobId: "" };
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(store));
    } catch { /* fail silently */ }
  }, [store]);

  const saveJob = useCallback((id: string, data: JobData) => {
    setStore((prev) => ({
      ...prev,
      jobs: { ...prev.jobs, [id]: { ...data, updatedAt: new Date().toISOString() } },
      activeJobId: id,
    }));
  }, []);

  const loadJob = useCallback((id: string): JobData | null => {
    return store.jobs[id] || null;
  }, [store.jobs]);

  const deleteJob = useCallback((id: string) => {
    setStore((prev) => {
      const newJobs = { ...prev.jobs };
      delete newJobs[id];
      const remainingIds = Object.keys(newJobs);
      return {
        jobs: newJobs,
        activeJobId: prev.activeJobId === id ? (remainingIds[0] || "") : prev.activeJobId,
      };
    });
  }, []);

  const setActiveJob = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, activeJobId: id }));
  }, []);

  const createJob = useCallback((name: string): string => {
    const id = `job-${Date.now()}`;
    const newJob: JobData = {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeTab: "excavation",
      excInputMode: "decimal", decTransitShot: "4.50",
      excFeet: 4, excInches: 6, excSixteenths: 0,
      beddingDepthFt: "1.0", slopeRun: "40", slopeStartMode: "trench", customSlopeStart: "7.50",
      selectedPreset: "x-10k-92", customDiameter: "92", riserHeight: "36",
      valveType: "standard", customValveOffset: "5.5", tankClearance: "6.0",
      concreteShape: "flatwork",
      flatLength: "30", flatWidth: "12", flatThickness: "8", flatQuantity: "1",
      circDiameter: "12", circThickness: "6", circQuantity: "1",
      sonoDiameter: "24", sonoHeight: "6", sonoQuantity: "4",
      footLength: "6", footWidth: "6", footDepth: "3.5", footQuantity: "4",
      deadmanLength: "20", deadmanWidth: "18", deadmanHeight: "18", deadmanQuantity: "2",
      ballastLength: "32", ballastWidth: "14", ballastThickness: "12", ballastQuantity: "1",
      curbLength: "20", curbHeight: "6", curbWidth: "6", gutterThickness: "6", gutterWidth: "18", curbQuantity: "1",
      stepCount: "3", stepWidth: "4", stepRise: "7", stepRun: "11", stepQuantity: "1",
      wallLength: "50", wallWidth: "12", wallDepth: "18", wallQuantity: "1",
      wastePct: 10, rebarSpacing: "12", rebarSize: "#4", wireMesh: "roll_750", gravelDepth: "4",
      pricePerCy: "150.00", pricePerBag80: "8.50", pricePerBag60: "6.50", pricePerBag40: "4.50",
      pricePerGravelTon: "45.00", pricePerRebarStick: "12.00", pricePerMeshRoll: "180.00",
      constTool: "triangle", triA: "30", triB: "40",
      aggLength: "50", aggWidth: "20", aggDepth: "6", aggMat: "crushed_stone", aggWaste: "10", aggPriceTon: "35.00",
      formPerimeter: "100", formSpacing: "16", formPlates: "3", formStakeSpacing: "3",
      bfThickness: "2", bfWidth: "6", bfLength: "12", bfQuantity: "10", bfPricePerBf: "2.50",
      convCategory: "length", convFromUnit: "ft", convInputVal: "10",
    };
    setStore((prev) => ({
      jobs: { ...prev.jobs, [id]: newJob },
      activeJobId: id,
    }));
    return id;
  }, []);

  return {
    store,
    activeJobId: store.activeJobId,
    activeJob: store.activeJobId ? store.jobs[store.activeJobId] || null : null,
    jobList: Object.entries(store.jobs).map(([id, data]) => ({ id, name: data.name, updatedAt: data.updatedAt })),
    saveJob,
    loadJob,
    deleteJob,
    setActiveJob,
    createJob,
  };
}
