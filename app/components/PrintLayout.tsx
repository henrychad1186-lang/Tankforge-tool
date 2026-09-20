// encoding: utf-8
"use client";

import React, { memo } from "react";
import { formatFeetInches } from "../lib/calculations";
import type { ActiveTab } from "../lib/constants";
import { useExcavation, useConcrete, usePreBury } from "../lib/tab-contexts";

interface PrintLayoutProps {
  activeTab: ActiveTab;
}

function PrintLayoutComponent({ activeTab }: PrintLayoutProps) {
  const { transitShot, beddingDepth, excResults } = useExcavation();
  const { tankHoleNoBedding, tankHoleWithBedding, trenchDepth } = excResults;

  const { state: concreteState, concreteVolume, rebarResults, gravelResults, turnbuckleLayout, buoyancyResults } = useConcrete();
  const { concreteShape, wastePct, rebarSpacing, rebarSize, gravelDepth } = concreteState;
  const { adjustedVolumeCy, adjustedVolumeCf, bags80lb, bags60lb, bags40lb, truckLoads } = concreteVolume;
  const { totalLf: rebarTotalLf, pieces20: rebarPieces20 } = rebarResults;
  const { cy: gravelCy, tons: gravelTons } = gravelResults;

  const preBury = usePreBury();

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
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 uppercase">Laser Transit Benchmark Shots (+15.5&apos; Constant Rule)</h2>
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
              <tr className="border-b border-gray-200 font-bold bg-gray-50">
                <td className="p-2 font-sans">Bottom of Hole (Raw Dirt, No Bedding)</td>
                <td className="p-2">+15.5&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleNoBedding)}</td>
                <td className="p-2">{tankHoleNoBedding.toFixed(2)} ft</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-sans">Top of Pea Gravel Bedding ({beddingDepth.toFixed(1)}&apos;)</td>
                <td className="p-2">+{(15.5 - beddingDepth).toFixed(1)}&apos;</td>
                <td className="p-2">{formatFeetInches(tankHoleWithBedding)}</td>
                <td className="p-2">{tankHoleWithBedding.toFixed(2)} ft</td>
              </tr>
              <tr>
                <td className="p-2 font-sans">Trenching Depth (Product Lines)</td>
                <td className="p-2">+3.0&apos;</td>
                <td className="p-2">{formatFeetInches(trenchDepth)}</td>
                <td className="p-2">{trenchDepth.toFixed(2)} ft</td>
              </tr>
            </tbody>
          </table>
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
                    <img src={p.dataUrl} alt={p.caption} className="w-full h-20 object-cover rounded" />
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
