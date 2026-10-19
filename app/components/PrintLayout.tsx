// encoding: utf-8
"use client";

import React, { memo } from "react";
import { formatFeetInches, formatOffsetIn, SUMP_ENTRY_TOLERANCE_IN } from "../lib/calculations";
import { SAFETY_CHECKLIST_ITEMS, type ActiveTab } from "../lib/constants";
import { useExcavation, useConcrete, useDailyReport, usePreBury, useBlueprints } from "../lib/tab-contexts";

interface PrintLayoutProps {
  activeTab: ActiveTab;
}

function PrintLayoutComponent({ activeTab }: PrintLayoutProps) {
  const { state: excState, transitShot, beddingDepth, tankDiameterFt, coverFt, pipeTrench, excResults, slopeResults, sumpEntry } = useExcavation();
  const { slopeStartDecimal, totalSlopeFallInches, slopeEndDecimal, runFeet } = slopeResults;
  const { tankHoleNoBedding, tankHoleWithBedding, tankTopReading, trenchDepth, pitDepthBelowFg, bedTopBelowFg, trenchBelowFg } = excResults;

  const { state: concreteState, concreteVolume, rebarResults, gravelResults, turnbuckleLayout, buoyancyResults } = useConcrete();
  const { concreteShape, wastePct, rebarSpacing, rebarSize, gravelDepth } = concreteState;
  const { adjustedVolumeCy, adjustedVolumeCf, bags80lb, bags60lb, bags40lb, truckLoads } = concreteVolume;
  const { totalLf: rebarTotalLf, pieces20: rebarPieces20 } = rebarResults;
  const { cy: gravelCy, tons: gravelTons } = gravelResults;

  const { state: daily } = useDailyReport();
  const dailyWork = daily.workEntries.filter((e) => e.task.trim());
  const dailyMaterials = daily.materialEntries.filter((e) => e.material.trim());
  const dailyTaskHours = dailyWork.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);
  const dailyCrew = parseInt(daily.crewSize) || 0;
  const dailySafetyChecked = SAFETY_CHECKLIST_ITEMS.filter((item) => daily.safetyChecks[item.id]).length;

  const preBury = usePreBury();
  const blueprints = useBlueprints();

  return (
    <div className="print-only p-8 text-black bg-white space-y-6">
      <div className="border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase">UST Field Operations Submittal Cut Sheet</h1>
          <p className="text-xs">Generated from UST Field Hub App</p>
        </div>
        <div className="text-right text-xs">
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Tab Exported:</strong> {activeTab.toUpperCase()}</p>
        </div>
      </div>

      {activeTab === "excavation" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Laser Transit Benchmark Shots</h2>
          <p className="text-[10px]">
            Tank OD {formatFeetInches(tankDiameterFt)} · Cover (FG to tank top) {formatFeetInches(coverFt)} · Bedding {formatFeetInches(beddingDepth)} · Pit depth below FG {pitDepthBelowFg.toFixed(2)} ft
          </p>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">Target Description</th>
                <th className="p-2">Constant</th>
                <th className="p-2">Rod Shot (Ft-In)</th>
                <th className="p-2">Decimal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-bold font-sans">Finish Grade (FG) Transit Shot</td>
                <td className="p-2">Ref</td>
                <td className="p-2 font-bold">{formatFeetInches(transitShot)}</td>
                <td className="p-2">{transitShot.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Top of Tank</td>
                <td className="p-2">+{coverFt.toFixed(2)}&apos;</td>
                <td className="p-2">{formatFeetInches(tankTopReading)}</td>
                <td className="p-2">{tankTopReading.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200 font-bold bg-gray-50">
                <td className="p-2 font-sans">Bottom of Hole (Raw Dirt, No Bedding)</td>
                <td className="p-2">+{pitDepthBelowFg.toFixed(2)}&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleNoBedding)}</td>
                <td className="p-2">{tankHoleNoBedding.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Top of Pea Gravel Bedding ({beddingDepth.toFixed(1)}&apos;)</td>
                <td className="p-2">+{bedTopBelowFg.toFixed(2)}&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleWithBedding)}</td>
                <td className="p-2">{tankHoleWithBedding.toFixed(2)} ft</td>
              </tr>
              <tr>
                <td className="p-2 font-sans">Trenching Depth (Product Lines)</td>
                <td className="p-2">+{trenchBelowFg.toFixed(2)}&apos;</td>
                <td className="p-2">{formatFeetInches(trenchDepth)}</td>
                <td className="p-2">{trenchDepth.toFixed(2)} ft</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Product / Vent Line Slope &amp; Sump Entry Check</h2>
          <p className="text-[10px]">
            Pipe cover {(pipeTrench.coverFt * 12).toFixed(1)}&quot; · Pipe OD {(pipeTrench.odFt * 12).toFixed(1)}&quot; · Bedding under pipe {(pipeTrench.beddingFt * 12).toFixed(1)}&quot; · Run {runFeet} ft @ {excState.slopeRateInchesPerFoot === "0.250" ? "1/4" : "1/8"}&quot;/ft · Total fall {totalSlopeFallInches.toFixed(2)}&quot;
          </p>
          <table className="w-full text-left border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Trench High Point Shot</td>
                <td className="p-2">{formatFeetInches(slopeStartDecimal)}</td>
                <td className="p-2">{slopeStartDecimal.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Trench Low Point at Tank</td>
                <td className="p-2">{formatFeetInches(slopeEndDecimal)}</td>
                <td className="p-2">{slopeEndDecimal.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Pipe Centerline at Tank</td>
                <td className="p-2">{formatFeetInches(sumpEntry.pipeCenterAtTank)}</td>
                <td className="p-2">{sumpEntry.pipeCenterAtTank.toFixed(2)} ft</td>
              </tr>
              {sumpEntry.entryCenterReading !== null && (
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-sans">Sump Entry Centerline ({excState.sumpEntryHeightIn}&quot; above tank top)</td>
                  <td className="p-2">{formatFeetInches(sumpEntry.entryCenterReading)}</td>
                  <td className="p-2">{sumpEntry.entryCenterReading.toFixed(2)} ft</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border border-gray-400 p-2 font-sans text-[11px] space-y-1">
            {sumpEntry.status === "ok" && (
              <p><strong>RESULT: PASS</strong> — pipe lands on sump entry within ±{SUMP_ENTRY_TOLERANCE_IN}&quot; (offset {formatOffsetIn(sumpEntry.offsetIn ?? 0)}&quot;).</p>
            )}
            {sumpEntry.status === "low" && (
              <p><strong>RESULT: FAIL — PIPE LOW</strong> — pipe arrives {formatOffsetIn(sumpEntry.offsetIn ?? 0)}&quot; below sump entry and would have to rise into the sump (trap).</p>
            )}
            {sumpEntry.status === "high" && (
              <p><strong>RESULT: ADJUST — PIPE HIGH</strong> — pipe arrives {formatOffsetIn(sumpEntry.offsetIn ?? 0)}&quot; above sump entry; more fall required.</p>
            )}
            {(sumpEntry.status === "low" || sumpEntry.status === "high") && sumpEntry.requiredHighPoint !== null && (
              !sumpEntry.requiredHighPointViolatesCover ? (
                <p>Corrective high point shot to land centered: {formatFeetInches(sumpEntry.requiredHighPoint)} ({sumpEntry.requiredHighPoint.toFixed(2)} ft).</p>
              ) : (
                <p>Landing centered requires a high point of {sumpEntry.requiredHighPoint.toFixed(2)} ft, shallower than minimum pipe cover ({trenchDepth.toFixed(2)} ft). Shorten run, reduce pitch, increase tank cover, or use a sump with a higher entry.</p>
              )
            )}
            {sumpEntry.status === "belowTankTop" && (
              <p><strong>RESULT: FAIL</strong> — pipe bottom at tank end ({(slopeEndDecimal - pipeTrench.beddingFt).toFixed(2)} ft) is deeper than top of tank ({tankTopReading.toFixed(2)} ft). Sump entry height not entered.</p>
            )}
            {sumpEntry.status === "clear" && (
              <p><strong>Sump entry height not entered</strong> — only checked that pipe clears top of tank (OK). Enter entry height from the sump submittal for a full check.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "concrete" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Concrete Materials &amp; Reinforcement Cut Sheet</h2>
          <div className="border border-gray-300 p-4 rounded bg-gray-50 space-y-1">
            <p><strong>Form Shape:</strong> {concreteShape.toUpperCase()}</p>
            <p><strong>Total Concrete Volume:</strong> {adjustedVolumeCy.toFixed(2)} CY ({adjustedVolumeCf.toFixed(2)} CF) [+{wastePct}% Buffer]</p>
            <p><strong>Pre-mixed Bags:</strong> 80lb: {bags80lb} bags | 60lb: {bags60lb} bags | 40lb: {bags40lb} bags</p>
            <p><strong>Ready-Mix Trucks:</strong> {truckLoads.toFixed(1)} Truckloads (10 CY ea)</p>
            <p><strong>Rebar Grid:</strong> {rebarSpacing === "none" ? "None" : `${rebarSpacing}" Grid (${rebarSize})`} | Total: {rebarTotalLf.toFixed(1)} LF ({rebarPieces20} x 20ft sticks)</p>
            <p><strong>Sub-Base Gravel:</strong> {gravelDepth === "none" ? "None" : `${gravelDepth}" Depth`} ({gravelCy.toFixed(2)} CY, {gravelTons.toFixed(2)} Tons)</p>
            {(concreteShape === "deadman" || concreteShape === "ballast") && (
              <div className="pt-2 border-t border-gray-300 text-black">
                <p><strong>PEI RP100 Buoyancy Safety Factor:</strong> {(buoyancyResults?.safetyFactor ?? 0).toFixed(2)}x ({buoyancyResults?.isSafe ? "PEI COMPLIANT ≥ 1.20x" : "WARNING: BELOW 1.20x"})</p>
                <p><strong>Downward Restraining Force (F_D):</strong> {(buoyancyResults?.totalDownwardForceLbs ?? 0).toLocaleString()} lbs | <strong>Upward Buoyancy (F_B):</strong> {(buoyancyResults?.buoyantUpliftLbs ?? 0).toLocaleString()} lbs</p>
                <p><strong>Net Strap Load:</strong> {Math.round(buoyancyResults?.loadPerStrapLbs ?? 0).toLocaleString()} lbs / strap set (Strap WLL: {(buoyancyResults?.strapWllLbs ?? 5200).toLocaleString()} lbs)</p>
                <p><strong>Anchor Strap Sets:</strong> {turnbuckleLayout.strapCount} sets | Total Turnbuckles: {turnbuckleLayout.turnbuckleCount} units</p>
                <p><strong>Top Arc Strap Wrap:</strong> {turnbuckleLayout.strapArcLengthInches.toFixed(1)}&quot; | Net Cut Length: {turnbuckleLayout.netStrapCutLengthInches.toFixed(1)}&quot; / strap</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "prebury" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-black pb-1 uppercase">
            UST Pre-Bury Air Test &amp; Installation Verification Submittal
          </h2>
          <div className="border border-gray-300 p-4 rounded bg-gray-50 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Job Site:</strong> {preBury.state.siteName}</p>
                <p><strong>Location:</strong> {preBury.state.location}</p>
                <p><strong>Phase:</strong> {preBury.state.phase}</p>
              </div>
              <div className="text-right">
                <p><strong>Scheduled Inspection:</strong> {preBury.state.targetInspectionDate}</p>
                <p><strong>Checklists Signed:</strong> {preBury.checksCompleted} / {preBury.checksTotal}</p>
                <p><strong>Submittal Docs Ready:</strong> {preBury.docsCompleted} / {preBury.docsTotal}</p>
                <p><strong>Photos Documented:</strong> {(preBury.state.photos || []).length} photos attached</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase pt-2">Primary &amp; Secondary Tank Air Pressure Tests</h3>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">Tank ID</th>
                <th className="p-2">Capacity</th>
                <th className="p-2">Test Pressure</th>
                <th className="p-2">Hold Duration</th>
                <th className="p-2">Status</th>
                <th className="p-2">Field Notes</th>
              </tr>
            </thead>
            <tbody>
              {preBury.state.airTests.map((t) => (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="p-2 font-bold font-sans">{t.tankName}</td>
                  <td className="p-2">{(t.capacityGal || 0).toLocaleString()} gal</td>
                  <td className="p-2">{t.testPsig.toFixed(1)} psig</td>
                  <td className="p-2">{t.holdDurationMin} min</td>
                  <td className="p-2 font-bold uppercase">{t.status}</td>
                  <td className="p-2 text-[10px] text-gray-600">{t.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Photo Evidence Thumbnails in Printout */}
          {preBury.state.photos && preBury.state.photos.length > 0 && (
            <div className="pt-3 border-t border-gray-300 space-y-2">
              <h3 className="text-xs font-bold uppercase">Field Inspection Photo Evidence</h3>
              <div className="grid grid-cols-4 gap-2">
                {preBury.state.photos.slice(0, 8).map((p) => (
                  <div key={p.id} className="border border-gray-300 p-1 rounded bg-gray-50 text-[9px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preBury.photoUrls[p.id] ?? p.dataUrl} alt={p.caption} className="w-full h-20 object-cover rounded" />
                    <p className="font-bold truncate mt-1">{p.caption}</p>
                    <p className="text-gray-500 font-mono">{p.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Inspector Sign-off Block */}
          {preBury.state.signOff && (
            <div className="border-2 border-black p-4 rounded bg-gray-50 mt-4 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <div>
                  <h4 className="font-bold uppercase text-xs">Official Pre-Bury Inspection Authorization</h4>
                  <p className="text-[10px] text-gray-600">PEI RP100 &amp; EPA 40 CFR 280 Compliance Sign-Off</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  preBury.state.signOff.isApproved
                    ? "bg-green-100 text-green-900 border-green-500"
                    : "bg-yellow-100 text-yellow-900 border-yellow-500"
                }`}>
                  {preBury.state.signOff.isApproved ? "✓ Approved for Pit Backfill" : "Conditional Sign-Off"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <p><strong>Inspector:</strong> {preBury.state.signOff.inspectorName || "—"} ({preBury.state.signOff.inspectorTitle || "Inspector"})</p>
                  <p><strong>Agency / Dept:</strong> {preBury.state.signOff.agencyOrCompany || "—"}</p>
                  <p><strong>License / Cert #:</strong> {preBury.state.signOff.certificationNumber || "—"}</p>
                  {preBury.state.signOff.inspectorNotes && (
                    <p className="mt-1"><strong>Comments:</strong> {preBury.state.signOff.inspectorNotes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p><strong>Date &amp; Time:</strong> {preBury.state.signOff.signedAt || "—"}</p>
                  {preBury.state.signOff.signatureDataUrl ? (
                    <div className="mt-1 inline-block text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preBury.state.signOff.signatureDataUrl}
                        alt="Inspector Signature"
                        className="h-12 border-b border-black block ml-auto"
                      />
                      <p className="text-[9px] text-gray-500 text-right">Certified Signature on File</p>
                    </div>
                  ) : (
                    <div className="border-b border-black mt-8 w-40 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "dailyreport" && (
        <div className="space-y-4 text-xs font-mono">
          <h2 className="text-sm font-bold border-b border-black pb-1 uppercase">Daily Job Report</h2>
          <div className="border border-gray-300 p-4 rounded bg-gray-50 grid grid-cols-2 gap-4">
            <div>
              <p><strong>Report Date:</strong> {daily.reportDate}</p>
              <p><strong>Job Site:</strong> {daily.jobSiteName || "N/A"}</p>
              <p><strong>Foreman:</strong> {daily.foremanName || "N/A"}</p>
            </div>
            <div className="text-right">
              <p><strong>Crew Size:</strong> {daily.crewSize || "0"}</p>
              <p>
                <strong>Weather:</strong>{" "}
                {daily.weather.length > 0
                  ? daily.weather.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(", ")
                  : "Not recorded"}
                {daily.temperature ? ` · ${daily.temperature}°F` : ""}
              </p>
              <p><strong>Safety Items Checked:</strong> {dailySafetyChecked} / {SAFETY_CHECKLIST_ITEMS.length}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase pt-2">Work Performed</h3>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">#</th>
                <th className="p-2">Task</th>
                <th className="p-2">Equipment</th>
                <th className="p-2 text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {dailyWork.length === 0 ? (
                <tr><td className="p-2" colSpan={4}>No work entries recorded.</td></tr>
              ) : (
                dailyWork.map((e, i) => (
                  <tr key={e.id} className="border-b border-gray-200">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 font-sans">{e.task}</td>
                    <td className="p-2 font-sans">{e.equipment || "—"}</td>
                    <td className="p-2 text-right">{(parseFloat(e.hours) || 0).toFixed(1)}</td>
                  </tr>
                ))
              )}
              <tr className="font-bold bg-gray-50">
                <td className="p-2" colSpan={3}>Total Task Hours · Crew-Hours ({dailyCrew} crew)</td>
                <td className="p-2 text-right">{dailyTaskHours.toFixed(1)} · {(dailyTaskHours * dailyCrew).toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xs font-bold uppercase pt-2">Materials Received</h3>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">#</th>
                <th className="p-2">Material</th>
                <th className="p-2 text-right">Quantity</th>
                <th className="p-2">Unit</th>
              </tr>
            </thead>
            <tbody>
              {dailyMaterials.length === 0 ? (
                <tr><td className="p-2" colSpan={4}>No materials recorded.</td></tr>
              ) : (
                dailyMaterials.map((e, i) => (
                  <tr key={e.id} className="border-b border-gray-200">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 font-sans">{e.material}</td>
                    <td className="p-2 text-right">{e.quantity || "0"}</td>
                    <td className="p-2">{e.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3 className="text-xs font-bold uppercase pt-2">Safety Checklist</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 border border-gray-300 p-3 font-sans">
            {SAFETY_CHECKLIST_ITEMS.map((item) => (
              <p key={item.id}>
                <span className="font-mono">[{daily.safetyChecks[item.id] ? "X" : " "}]</span> {item.label}
              </p>
            ))}
          </div>

          {daily.reportNotes.trim() && (
            <>
              <h3 className="text-xs font-bold uppercase pt-2">Notes</h3>
              <p className="border border-gray-300 p-3 font-sans whitespace-pre-wrap">{daily.reportNotes}</p>
            </>
          )}
        </div>
      )}

      {activeTab === "blueprints" && (
        <div className="space-y-4 text-xs font-sans">
          <div className="border-b border-black pb-2 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase">
              UST Scope of Work (SOW) — {blueprints.state.facilityType}
            </h2>
            <span className="font-mono">
              Status: {blueprints.sowCompletedItems}/{blueprints.sowTotalItems} Tasks Completed ({blueprints.sowTotalEstimatedHours} hrs)
            </span>
          </div>

          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 font-bold">
                <th className="p-2">Status</th>
                <th className="p-2">Code</th>
                <th className="p-2">Task Title &amp; Specification</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Est. Hrs</th>
                <th className="p-2">Contractor</th>
              </tr>
            </thead>
            <tbody>
              {blueprints.state.sowItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="p-2 font-mono font-bold">
                    {item.status === "completed" ? "[X] Done" : item.status === "in_progress" ? "[~] In Prog" : "[ ] Pending"}
                  </td>
                  <td className="p-2 font-mono font-bold">{item.code}</td>
                  <td className="p-2">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-[10px] text-gray-600">{item.description}</p>
                    {item.specRef && <p className="text-[9px] text-gray-500 font-mono">Ref: {item.specRef}</p>}
                  </td>
                  <td className="p-2">{item.quantity || "1"} {item.unit || ""}</td>
                  <td className="p-2 font-mono">{item.estimatedHours || 0}</td>
                  <td className="p-2">{item.assignedContractor || "Site Crew"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs font-sans">
        <div>
          <p className="font-bold uppercase">Field Agent / Inspector Sign-Off:</p>
          {preBury.state.signOff?.signatureDataUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preBury.state.signOff.signatureDataUrl}
                alt="Signature"
                className="h-12 border-b border-black"
              />
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                {preBury.state.signOff.inspectorName} • {preBury.state.signOff.signedAt}
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-black mt-8 w-48" />
              <p className="text-[10px] text-gray-500 mt-1">Signature &amp; Date</p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold uppercase">Project / Location:</p>
          <div className="border-b border-black mt-8 w-48 ml-auto" />
          <p className="text-[10px] text-gray-500 mt-1">Site &amp; Tank Tag ID</p>
        </div>
      </div>
    </div>
  );
}

export default memo(PrintLayoutComponent);
