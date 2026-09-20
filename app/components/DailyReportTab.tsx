// encoding: utf-8
'use client';

import React, { useMemo, useCallback, memo } from 'react';
import {
  type WeatherCondition,
  type DailyWorkEntry,
  type DailyMaterialEntry,
  MATERIAL_UNITS,
  SAFETY_CHECKLIST_ITEMS,
} from '../lib/constants';
import { useDailyReport } from '../lib/tab-contexts';

export interface DailyReportTabProps {
  triggerToast: (msg: string) => void;
}

const WEATHER_OPTIONS: { value: WeatherCondition; emoji: string; label: string }[] = [
  { value: "clear", emoji: "\u2600\uFE0F", label: "Clear" },
  { value: "cloudy", emoji: "\u2601\uFE0F", label: "Cloudy" },
  { value: "rain", emoji: "\uD83C\uDF27\uFE0F", label: "Rain" },
  { value: "snow", emoji: "\u2744\uFE0F", label: "Snow" },
  { value: "wind", emoji: "\uD83D\uDCA8", label: "Wind" },
  { value: "hot", emoji: "\uD83D\uDD25", label: "Hot" },
  { value: "cold", emoji: "\uD83E\uDD76", label: "Cold" },
];

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 glow-card-rose">
    <h3 className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-wide">
      <span>{icon}</span>
      <span>{title}</span>
    </h3>
    {children}
  </div>
);

function DailyReportTabComponent({ triggerToast }: DailyReportTabProps) {
  const { state, updateState } = useDailyReport();
  const {
    reportDate,
    jobSiteName,
    foremanName,
    crewSize,
    weather,
    temperature,
    workEntries,
    materialEntries,
    safetyChecks,
    reportNotes,
  } = state;

  // ─── Weather Toggle ─────────────────────────────────────────────────────
  const toggleWeather = useCallback(
    (w: WeatherCondition) => {
      const nextWeather = weather.includes(w)
        ? weather.filter((x) => x !== w)
        : [...weather, w];
      updateState({ weather: nextWeather });
    },
    [weather, updateState]
  );

  // ─── Work Log Handlers ──────────────────────────────────────────────────
  const addWorkEntry = useCallback(() => {
    updateState({
      workEntries: [...workEntries, { id: genId(), task: "", hours: "", equipment: "" }],
    });
    triggerToast?.("Added work entry row");
  }, [workEntries, updateState, triggerToast]);

  const removeWorkEntry = useCallback(
    (id: string) => {
      if (workEntries.length <= 1) return;
      updateState({
        workEntries: workEntries.filter((e) => e.id !== id),
      });
    },
    [workEntries, updateState]
  );

  const updateWorkEntry = useCallback(
    (id: string, field: keyof Omit<DailyWorkEntry, "id">, value: string) => {
      updateState({
        workEntries: workEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      });
    },
    [workEntries, updateState]
  );

  // ─── Material Handlers ─────────────────────────────────────────────────
  const addMaterialEntry = useCallback(() => {
    updateState({
      materialEntries: [...materialEntries, { id: genId(), material: "", quantity: "", unit: "each" }],
    });
  }, [materialEntries, updateState]);

  const removeMaterialEntry = useCallback(
    (id: string) => {
      if (materialEntries.length <= 1) return;
      updateState({
        materialEntries: materialEntries.filter((e) => e.id !== id),
      });
    },
    [materialEntries, updateState]
  );

  const updateMaterialEntry = useCallback(
    (id: string, field: keyof Omit<DailyMaterialEntry, "id">, value: string) => {
      updateState({
        materialEntries: materialEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      });
    },
    [materialEntries, updateState]
  );

  // ─── Safety Toggle ──────────────────────────────────────────────────────
  const toggleSafety = useCallback(
    (checkId: string) => {
      updateState({
        safetyChecks: { ...safetyChecks, [checkId]: !safetyChecks[checkId] },
      });
    },
    [safetyChecks, updateState]
  );

  // ─── Summary Calculations ──────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalHours = workEntries.reduce((sum, e) => {
      const h = parseFloat(e.hours);
      return sum + (isNaN(h) ? 0 : h);
    }, 0);

    const crew = parseInt(crewSize) || 0;
    const totalCrewHours = totalHours * crew;
    const materialsCount = materialEntries.filter((e) => e.material.trim()).length;
    const totalChecks = SAFETY_CHECKLIST_ITEMS.length;
    const checkedCount = SAFETY_CHECKLIST_ITEMS.filter((item) => safetyChecks[item.id]).length;
    const safetyPct = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;
    const taskCount = workEntries.filter((e) => e.task.trim()).length;

    return { totalHours, totalCrewHours, materialsCount, checkedCount, totalChecks, safetyPct, taskCount };
  }, [workEntries, crewSize, materialEntries, safetyChecks]);

  const inputCls = "w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all";
  const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* SECTION 1: JOB HEADER */}
      <SectionCard title="Job Header" icon={"\uD83D\uDCCB"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => updateState({ reportDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Job / Site Name</label>
            <input
              type="text"
              placeholder="e.g. BP #4821 — Main St"
              value={jobSiteName}
              onChange={(e) => updateState({ jobSiteName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Foreman</label>
            <input
              type="text"
              placeholder="Crew lead name"
              value={foremanName}
              onChange={(e) => updateState({ foremanName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Crew Size</label>
            <input
              type="number"
              min="1"
              placeholder="# of crew"
              value={crewSize}
              onChange={(e) => updateState({ crewSize: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Weather & Temp Row */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 pt-2">
          <div className="flex-1">
            <label className={labelCls}>Weather Conditions</label>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => toggleWeather(w.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    weather.includes(w.value)
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <span>{w.emoji}</span>
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-36">
            <label className={labelCls}>Temp (°F)</label>
            <input
              type="number"
              placeholder="°F"
              value={temperature}
              onChange={(e) => updateState({ temperature: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: WORK LOG */}
      <SectionCard title="Work Log" icon={"\u2692\uFE0F"}>
        <div className="space-y-3">
          {workEntries.map((entry, i) => (
            <div key={entry.id} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-950/50 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 md:self-center w-6 shrink-0">#{i + 1}</span>
              <div className="flex-[3]">
                {i === 0 && <label className={labelCls}>Task / Activity</label>}
                <input
                  type="text"
                  placeholder="e.g. Set 10k FG tank, backfill pit"
                  value={entry.task}
                  onChange={(e) => updateWorkEntry(entry.id, "task", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-24">
                {i === 0 && <label className={labelCls}>Hours</label>}
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="hrs"
                  value={entry.hours}
                  onChange={(e) => updateWorkEntry(entry.id, "hours", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex-[2]">
                {i === 0 && <label className={labelCls}>Equipment Used</label>}
                <input
                  type="text"
                  placeholder="e.g. CAT 320, Vac Truck"
                  value={entry.equipment}
                  onChange={(e) => updateWorkEntry(entry.id, "equipment", e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                onClick={() => removeWorkEntry(entry.id)}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addWorkEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <span>＋</span>
          <span>Add Work Entry</span>
        </button>
      </SectionCard>

      {/* SECTION 3: MATERIALS RECEIVED */}
      <SectionCard title="Materials Received" icon={"\uD83E\uDEA8"}>
        <div className="space-y-3">
          {materialEntries.map((entry, i) => (
            <div key={entry.id} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-950/50 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 md:self-center w-6 shrink-0">#{i + 1}</span>
              <div className="flex-[3]">
                {i === 0 && <label className={labelCls}>Material</label>}
                <input
                  type="text"
                  placeholder="e.g. Pea gravel, #57 stone, 2x6 lumber"
                  value={entry.material}
                  onChange={(e) => updateMaterialEntry(entry.id, "material", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-24">
                {i === 0 && <label className={labelCls}>Qty</label>}
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="amt"
                  value={entry.quantity}
                  onChange={(e) => updateMaterialEntry(entry.id, "quantity", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="w-full md:w-28">
                {i === 0 && <label className={labelCls}>Unit</label>}
                <select
                  value={entry.unit}
                  onChange={(e) => updateMaterialEntry(entry.id, "unit", e.target.value)}
                  className={inputCls + " cursor-pointer"}
                >
                  {MATERIAL_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeMaterialEntry(entry.id)}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Remove row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMaterialEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <span>＋</span>
          <span>Add Material</span>
        </button>
      </SectionCard>

      {/* SECTION 4: SAFETY & INSPECTIONS */}
      <SectionCard title="Safety & Inspections" icon={"\uD83E\uDDBA"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAFETY_CHECKLIST_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSafety(item.id)}
              className={`flex items-center gap-2 p-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                safetyChecks[item.id]
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                safetyChecks[item.id]
                  ? "bg-emerald-500 border-emerald-400"
                  : "border-slate-600"
              }`}>
                {safetyChecks[item.id] && (
                  <svg className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        {/* Safety completion bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Safety Checklist Completion</span>
            <span className={summary.safetyPct === 100 ? "text-emerald-400" : "text-slate-400"}>
              {summary.checkedCount}/{summary.totalChecks} — {summary.safetyPct}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.safetyPct === 100 ? "bg-emerald-500" : summary.safetyPct >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${summary.safetyPct}%` }}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 5: NOTES / ISSUES */}
      <SectionCard title="Notes / Issues / Delays" icon={"\uD83D\uDCDD"}>
        <textarea
          value={reportNotes}
          onChange={(e) => updateState({ reportNotes: e.target.value })}
          placeholder="Rain delay 2 hrs AM, inspector arrived 10:30, change order #12 approved for additional backfill..."
          rows={3}
          className={inputCls + " resize-y min-h-[60px]"}
        />
      </SectionCard>

      {/* SECTION 6: DAILY SUMMARY CARD */}
      <div className="bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/60 border border-rose-500/20 rounded-xl p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-wide">
          <span>{"\uD83D\uDCCA"}</span>
          <span>Daily Summary</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-white">{summary.totalHours.toFixed(1)}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Task Hours</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-cyan-400">{summary.totalCrewHours.toFixed(1)}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Crew-Hours</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-black text-amber-400">{summary.materialsCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Materials</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <p className={`text-xl font-black ${
              summary.safetyPct === 100 ? "text-emerald-400" : summary.safetyPct >= 50 ? "text-amber-400" : "text-rose-400"
            }`}>
              {summary.safetyPct}%
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Safety Score</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          {reportDate && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDCC5"} {new Date(reportDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
          {jobSiteName && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDCCD"} {jobSiteName}
            </span>
          )}
          {foremanName && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\uD83D\uDC77"} {foremanName}
            </span>
          )}
          {weather.length > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {weather.map((w) => WEATHER_OPTIONS.find((o) => o.value === w)?.emoji).join(" ")} {temperature ? `${temperature}°F` : ""}
            </span>
          )}
          {summary.taskCount > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">
              {"\u2692\uFE0F"} {summary.taskCount} task{summary.taskCount !== 1 ? "s" : ""} logged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DailyReportTabComponent);
