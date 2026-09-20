// encoding: utf-8
"use client";

import React, { useState } from "react";

interface Job {
  id: string;
  name: string;
  updatedAt: string;
}

interface JobManagerProps {
  jobList: Job[];
  activeJobId: string;
  onSelectJob: (id: string) => void;
  onCreateJob: (name: string) => string;
  onCloneJob?: (sourceId: string, newName: string) => void;
  onDeleteJob: (id: string) => void;
  triggerToast: (msg: string) => void;
}

export default function JobManager({
  jobList,
  activeJobId,
  onSelectJob,
  onCreateJob,
  onCloneJob,
  onDeleteJob,
  triggerToast,
}: JobManagerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);

  const handleCreate = () => {
    const name = newJobName.trim() || `Job Site ${jobList.length + 1}`;
    onCreateJob(name);
    setNewJobName("");
    setShowNewInput(false);
    setShowDropdown(false);
    triggerToast(`Created job: ${name}`);
  };

  const handleClone = (id: string, name: string) => {
    if (onCloneJob) {
      onCloneJob(id, `${name} (Copy)`);
      setShowDropdown(false);
      triggerToast(`Cloned job: ${name}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (jobList.length <= 1) {
      triggerToast("Cannot delete the last remaining job site.");
      return;
    }
    if (confirm(`Delete job site "${name}" and all its saved calculations?`)) {
      onDeleteJob(id);
      triggerToast(`Deleted job: ${name}`);
    }
  };

  const activeJob = jobList.find((j) => j.id === activeJobId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
      >
        <span>📁</span>
        <span>{activeJob ? activeJob.name : "No Job Selected"}</span>
        <svg className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 z-40 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Saved Jobs</span>
            <button
              onClick={() => setShowNewInput(!showNewInput)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              + New Job
            </button>
          </div>

          {showNewInput && (
            <div className="p-3 border-b border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Job site name..."
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer hover:bg-cyan-400"
              >
                Save
              </button>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {jobList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No saved jobs yet. Create one to persist your calculations.
              </div>
            ) : (
              jobList.map((job) => (
                <div
                  key={job.id}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs cursor-pointer transition-all ${
                    job.id === activeJobId
                      ? "bg-cyan-950/50 text-cyan-300 border-l-2 border-cyan-400"
                      : "text-slate-300 hover:bg-slate-800/50 border-l-2 border-transparent"
                  }`}
                  onClick={() => {
                    onSelectJob(job.id);
                    setShowDropdown(false);
                    triggerToast(`Loaded job: ${job.name}`);
                  }}
                >
                  <div>
                    <span className="font-bold block">{job.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Updated: {new Date(job.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {job.id === activeJobId && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {onCloneJob && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClone(job.id, job.name);
                        }}
                        className="text-slate-500 hover:text-cyan-300 p-1 cursor-pointer"
                        title="Duplicate this job site"
                      >
                        📋
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.id, job.name);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Delete job"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
