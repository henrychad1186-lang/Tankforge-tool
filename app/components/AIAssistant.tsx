// encoding: utf-8
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useExcavation,
  useDropTube,
  useConcrete,
  useDailyReport,
  usePreBury,
  useBlueprints,
  useActiveJobId,
} from "../lib/tab-contexts";
import { getBlueprintFile } from "../lib/blueprint-db";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isMultimodal?: boolean;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  triggerToast?: (msg: string) => void;
}

export default function AIAssistant({ isOpen, onClose, initialPrompt, triggerToast }: AIAssistantProps) {
  const activeJobId = useActiveJobId();
  const excavation = useExcavation();
  const dropTube = useDropTube();
  const concrete = useConcrete();
  const dailyReport = useDailyReport();
  const preBury = usePreBury();
  const blueprints = useBlueprints();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "👋 Hello! I'm your **UST Field Copilot**. I have real-time access to this site's excavation benchmarks, OPW drop tube cuts, concrete buoyancy safety factors, and uploaded blueprint sheets.\n\nAsk me to analyze your blueprint, verify PEI RP100 calculations, or draft a contractor Scope of Work.",
      timestamp: "Ready",
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("ust-hub-gemini-key") || "";
      setGeminiApiKey(savedKey);
    }
  }, []);

  // Save API key
  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("ust-hub-gemini-key", key);
    }
    triggerToast?.("Saved Gemini API Key");
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle external initial prompt
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Assemble current site context string
  const compileSiteContext = useCallback(async () => {
    const exc = excavation.state;
    const excRes = excavation.excResults;
    const dt = dropTube.state;
    const dtRes = dropTube.dtResults;
    const con = concrete.state;
    const buoy = concrete.buoyancyResults;
    const bp = blueprints.state;

    let ctx = `--- ACTIVE JOB SITE CONTEXT ---\n`;
    ctx += `Job ID: ${activeJobId}\n`;
    ctx += `Facility Type: ${bp.facilityType}\n\n`;

    ctx += `[EXCAVATION & BENCHMARKS]\n`;
    ctx += `- Transit Benchmark Shot: ${excavation.transitShot.toFixed(2)} ft (${exc.excInputMode})\n`;
    ctx += `- Raw Pit Bottom Depth: ${excRes.tankHoleNoBedding.toFixed(2)} ft [FG + 15.5' Constant]\n`;
    ctx += `- Pea Gravel Bedding Depth: ${excavation.beddingDepth.toFixed(2)} ft [Top of Bedding: ${excRes.tankHoleWithBedding.toFixed(2)} ft]\n`;
    ctx += `- Trenching Depth: ${excRes.trenchDepth.toFixed(2)} ft [FG + 3.0' Constant]\n`;
    ctx += `- Vent Line Slope: ${exc.slopeRun} ft run @ ${exc.slopeRateInchesPerFoot}"/ft fall\n\n`;

    ctx += `[OPW 71SO DROP TUBE]\n`;
    ctx += `- Tank Diameter: ${dt.customDiameter}" | Riser Height: ${dt.riserHeight}"\n`;
    ctx += `- Valve Type: ${dt.valveType} (Offset: +${dtRes.valveOffset}") | Clearance: ${dt.tankClearance}"\n`;
    ctx += `- Cut Length: Upper Tube = ${dtRes.upperDropTubeLength.toFixed(2)}", Total Assembly = ${dtRes.overallDropTubeLength.toFixed(2)}"\n\n`;

    ctx += `[CONCRETE & PEI RP100 §5 BUOYANCY]\n`;
    ctx += `- Tank: ${con.buoyancyTankGallons} gal (${con.buoyancyTankWeightLbs} lbs dry)\n`;
    ctx += `- Deadmen: ${con.deadmanQuantity} beams (${con.deadmanLength}' x ${con.deadmanWidth}" x ${con.deadmanHeight}")\n`;
    ctx += `- Safety Factor: ${buoy.safetyFactor.toFixed(2)}x (Required: >= 1.20x) -> ${buoy.isSafe ? "SAFE" : "UNSAFE"}\n`;
    ctx += `- Strap Tension: ${buoy.loadPerStrapLbs.toFixed(0)} lbs vs WLL ${con.buoyancyStrapWllLbs} lbs -> ${buoy.isStrapAdequate ? "OK" : "OVERLOADED"}\n\n`;

    ctx += `[PRE-BURY INSPECTION]\n`;
    ctx += `- Air Testing: ${preBury.airTestsPassed}/${preBury.airTestsTotal} passed (5.0 psig 60-min hold)\n`;
    ctx += `- Checklists: ${preBury.checksCompleted}/${preBury.checksTotal} complete | Open Items: ${preBury.openItemsCount}\n\n`;

    ctx += `[BLUEPRINTS & SCOPE OF WORK]\n`;
    ctx += `- Uploaded Plan Sheets: ${bp.sheets.length}\n`;
    if (bp.sheets.length > 0) {
      bp.sheets.forEach((s, idx) => {
        ctx += `  Sheet ${idx + 1}: ${s.name} (${s.fileType}) Notes: ${s.notes || "None"}\n`;
      });
    }
    ctx += `- SOW Tasks: ${blueprints.sowCompletedItems}/${blueprints.sowTotalItems} completed (${blueprints.sowTotalEstimatedHours} est hrs)\n`;

    return ctx;
  }, [activeJobId, excavation, dropTube, concrete, preBury, blueprints]);

  // Offline Expert Rule-Based Engine
  const generateOfflineResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Excavation & Laser Benchmark
    if (q.includes("laser") || q.includes("excavat") || q.includes("benchmark") || q.includes("15.5") || q.includes("trench")) {
      const shot = excavation.transitShot;
      const raw = excavation.excResults.tankHoleNoBedding;
      const bed = excavation.excResults.tankHoleWithBedding;
      const tr = excavation.excResults.trenchDepth;

      return `### 📐 UST Excavation & Laser Benchmark Analysis

Based on your current site benchmark of **${shot.toFixed(2)} ft**:

1. **Raw Pit Bottom (No Bedding):** \`${raw.toFixed(2)} ft\`
   - Formula: \`Finish Grade Shot (${shot.toFixed(2)}') + 15.5' Constant\`
   - Excavate the raw dirt pit to this rod reading.
2. **Top of Pea Gravel Bedding:** \`${bed.toFixed(2)} ft\`
   - Formula: \`FG Shot + (15.5' - ${excavation.beddingDepth.toFixed(2)}' Bedding)\`
   - Install compacted rounded pea gravel (minimum 12" depth per PEI RP100 §4.2).
3. **Piping Trenches:** \`${tr.toFixed(2)} ft\`
   - Formula: \`FG Shot + 3.0' Constant\`
4. **Shoring & Safety:** Because depth exceeds 5.0 ft, OSHA 1926 Subpart P requires trench box shoring or 1.5:1 soil sloped sidewalls.`;
    }

    // 2. OPW Drop Tube
    if (q.includes("drop tube") || q.includes("opw") || q.includes("71so") || q.includes("cut")) {
      const dt = dropTube.dtResults;
      const riser = dropTube.state.riserHeight;
      const dia = dropTube.state.customDiameter;

      return `### ⛽ OPW 71SO Overfill Drop Tube Cut Sheet

For your **${dia}" diameter** tank with a **${riser}" riser**:

- **Upper Drop Tube Cut Length:** \`${dt.upperDropTubeLength.toFixed(2)} inches\`
  - Formula: \`Riser Height (${riser}") + Valve Body Offset (+${dt.valveOffset}")\`
- **Overall Assembly Length:** \`${dt.overallDropTubeLength.toFixed(2)} inches\`
  - Formula: \`Riser (${riser}") + Tank Diameter (${dia}") - Clearance (${dropTube.state.tankClearance}")\`
- **EPA 40 CFR §280.20 Rule:** Overfill prevention must automatically stop fuel flow when the tank is no more than 95% full or restrict flow at 90%. Verify bottom 6.0" clearance so delivery fuel does not cause vapor turbulence.`;
    }

    // 3. Concrete & Deadman Buoyancy
    if (q.includes("buoyancy") || q.includes("deadman") || q.includes("anchor") || q.includes("strap") || q.includes("concrete")) {
      const buoy = concrete.buoyancyResults;
      const gal = concrete.state.buoyancyTankGallons;

      return `### ⚓ PEI RP100 §5 Tank Buoyancy & Hold-Down Analysis

For your **${gal} Gallon Tank**:

- **Total Upward Buoyant Force ($F_b$):** \`${buoy.buoyantUpliftLbs.toLocaleString()} lbs\`
- **Total Downward Hold-Down Force:** \`${buoy.totalDownwardForceLbs.toLocaleString()} lbs\`
  - Empty Tank Weight: \`${buoy.tankWeightLbs.toLocaleString()} lbs\`
  - Submerged Deadman Weight: \`${buoy.deadmanSubmergedLbs.toLocaleString()} lbs\`
  - Submerged Soil Overburden: \`${buoy.overburdenSubmergedLbs.toLocaleString()} lbs\`
- **Safety Factor:** \`${buoy.safetyFactor.toFixed(2)}x\` ${
        buoy.isSafe ? "✅ (Meets PEI RP100 >= 1.20x threshold)" : "⚠️ (INSUFFICIENT: Below 1.20x safety factor!)"
      }
- **Strap Working Load Limit (WLL):** Net uplift is distributed across **${concrete.state.strapCount} straps** at \`${buoy.loadPerStrapLbs.toFixed(0)} lbs/strap\` (Rated WLL: \`${concrete.state.buoyancyStrapWllLbs} lbs\`).`;
    }

    // 4. Blueprints & SOW
    if (q.includes("blueprint") || q.includes("sow") || q.includes("scope") || q.includes("plan")) {
      const count = blueprints.state.sowItems.length;
      const completed = blueprints.sowCompletedItems;
      const hours = blueprints.sowTotalEstimatedHours;

      return `### 📋 Blueprint Scope of Work (SOW) Overview

Your active project plan contains **${count} tasks across 7 CSI divisions** (${completed} completed, **${hours} total estimated man-hours**):

1. **DIV 01 General Conditions:** 811 utility ticket, traffic barricades & site fencing.
2. **DIV 02 Pit Excavation:** Sawcutting, raw hole excavation to \`FG + 15.5'\`, 12" pea gravel bedding.
3. **DIV 33.1 Tanks & Anchoring:** Setting double-wall tanks, deadman anchors with cotter-pinned turnbuckles.
4. **DIV 33.2 Piping & Sumps:** Double-wall containment sumps, entry boots, product piping sloped 1/8"/ft.
5. **DIV 26 Electrical:** Explosion-proof seal-off fittings, ATG sensor conduits.
6. **DIV 33.3 Testing:** 5.0 psig 60-min pneumatic air test with soap solution.
7. **DIV 32 Concrete Pad:** 8" 4000 PSI high early slab with #4 rebar on 12" centers.

*Tip: You can check tasks off or add custom items in the 'Scope of Work' sub-tab.*`;
    }

    // 5. Default General Field Answer
    return `### 🛠️ UST Field Copilot Guidance

I reviewed your active job site profile (**${blueprints.state.facilityType}**):

- **Excavation Benchmark:** Rod shot is **${excavation.transitShot.toFixed(2)}'**, giving a raw hole depth target of **${excavation.excResults.tankHoleNoBedding.toFixed(2)}'** (constant +15.5').
- **Drop Tube Cut:** Upper cut length is **${dropTube.dtResults.upperDropTubeLength.toFixed(2)}"** with **${dropTube.state.valveType}** OPW valve.
- **Buoyancy Status:** Safety factor is **${concrete.buoyancyResults.safetyFactor.toFixed(2)}x** (${concrete.buoyancyResults.isSafe ? "Compliant" : "Needs additional ballast"}).
- **Air Testing:** Pre-bury test is held at **5.0 psig** for **60 minutes** per PEI RP100 §6.

You can ask me to draft daily work logs, calculate material yardages, or verify code references!`;
  };

  // Execute Gemini Multimodal API Call
  const callGeminiMultimodal = async (query: string, context: string): Promise<string> => {
    const activeSheet = blueprints.state.sheets.find((s) => s.id === blueprints.state.activeSheetId) || blueprints.state.sheets[0];

    let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;
    if (activeSheet && activeSheet.fileType === "image") {
      try {
        const fileData = await getBlueprintFile(activeSheet.storageKey);
        if (fileData && fileData.dataUrl) {
          const match = fileData.dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (match) {
            imagePart = {
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            };
          }
        }
      } catch (err) {
        console.error("Failed to load image for Gemini:", err);
      }
    }

    const systemPrompt = `You are a certified senior Petroleum Equipment Institute (PEI RP100 / RP1200), EPA 40 CFR 280, and OSHA UST field installation engineering expert.
You provide direct, highly actionable contractor and inspector answers with precise math, cut lengths, laser benchmarks (+15.5' constant), and buoyancy safety factor checks (>= 1.20x).
Answer concisely using markdown headers and bullet points.`;

    const contents: Array<{
      role: string;
      parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${context}\n\nUser Question: ${query}` },
        ],
      },
    ];

    if (imagePart) {
      contents[0].parts.unshift(imagePart);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey.trim()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gemini API Error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("Empty response returned from Gemini API");
    return reply;
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsGenerating(true);

    try {
      const siteContext = await compileSiteContext();
      let replyText = "";

      if (geminiApiKey.trim()) {
        // Use live Google Gemini API
        try {
          replyText = await callGeminiMultimodal(query, siteContext);
        } catch (apiErr: unknown) {
          const apiMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
          console.warn("Gemini API call failed, falling back to offline engine:", apiErr);
          replyText = `⚠️ *(Gemini API notice: ${apiMsg || "Network error"} — using offline UST field brain)*\n\n` +
            generateOfflineResponse(query);
        }
      } else {
        // Instant offline knowledge engine
        replyText = generateOfflineResponse(query);
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `⚠️ An error occurred: ${errMsg || "Unknown error"}`,
          timestamp: "Error",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy assistant response
  const handleCopyMessage = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => triggerToast?.("Copied response to clipboard"))
      .catch(() => triggerToast?.("Copy failed"));
  };

  // Insert response text into daily report notes
  const handleInsertIntoDailyReport = (text: string) => {
    const existing = dailyReport.state.reportNotes ? `${dailyReport.state.reportNotes}\n\n` : "";
    dailyReport.updateState({
      reportNotes: `${existing}[AI Field Copilot Summary]:\n${text}`,
    });
    triggerToast?.("Inserted into Daily Job Report Notes!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-base shadow-md shadow-cyan-500/20">
              🤖
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">UST Field Copilot</h3>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    geminiApiKey.trim()
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {geminiApiKey.trim() ? "Gemini 2.5 Live" : "Offline Brain"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                PEI RP100 • EPA 40 CFR 280 • Laser Shoring • Blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer text-xs font-bold"
              title="API Key Settings"
            >
              ⚙️
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* API Settings Drawer (Toggleable) */}
        {showSettings && (
          <div className="bg-slate-950/95 border-b border-slate-800 p-3.5 space-y-3 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Google Gemini API Key (Optional)</span>
              <span className="text-[10px] text-slate-400">Enables Multimodal Blueprint Vision</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If left blank, the assistant works 100% offline using built-in PEI RP100 calculation algorithms. Providing a
              free Gemini key allows full visual reading of uploaded PDF &amp; image blueprints.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="Paste AIzaSy... key here"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-white"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>
          </div>
        )}

        {/* Chat Message Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                    isUser
                      ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-cyan-500/10"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* Assistant message action strip */}
                {!isUser && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopyMessage(msg.text)}
                      className="hover:text-cyan-400 font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleInsertIntoDailyReport(msg.text)}
                      className="hover:text-rose-400 font-bold cursor-pointer"
                    >
                      Insert into Daily Report
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-400 text-xs w-fit animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing field data &amp; blueprint calculations...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Prompt Quick Chips */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSendMessage("Analyze current blueprint and verify tank sizes and trench depths")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full whitespace-nowrap cursor-pointer transition-all"
          >
            📐 Blueprint Analysis
          </button>
          <button
            onClick={() => handleSendMessage("Verify PEI RP100 deadman hold-down buoyancy safety factor")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full whitespace-nowrap cursor-pointer transition-all"
          >
            ⚓ Buoyancy Check
          </button>
          <button
            onClick={() => handleSendMessage("Calculate OPW 71SO drop tube cut lengths")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full whitespace-nowrap cursor-pointer transition-all"
          >
            ⛽ Drop Tube Cut
          </button>
          <button
            onClick={() => handleSendMessage("Draft a daily work log summary from the active Scope of Work")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full whitespace-nowrap cursor-pointer transition-all"
          >
            📋 Daily Log Draft
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about blueprints, PEI RP100 rules, laser math..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputQuery.trim()}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>Send</span>
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
