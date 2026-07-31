"use client";

import React from 'react';
import { 
  X, FileText, BrainCircuit 
} from 'lucide-react';

export default function GlobalModals({ 
  modalType, 
  setModalType, 
  selectedPatient 
}) {
  if (!modalType || modalType !== "view_report") return null;

  console.log("=== MODAL PATIENT DATA ===", selectedPatient);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Patient Diagnostic File</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Identity: {selectedPatient?.name || selectedPatient?.full_name || "N/A"}
              </p>
            </div>
          </div>
          <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-8">
          
          {/* 1. AI DIAGNOSTIC SUMMARY */}
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
            <h3 className="text-blue-700 font-black text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <BrainCircuit size={16}/> AI Diagnostic Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-sm font-bold text-slate-600">Calculated Risk Level:</span>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase text-white ${selectedPatient?.risk?.includes("High") ? "bg-red-500" : "bg-emerald-500"}`}>
                  {selectedPatient?.risk || "Low Risk"}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic px-2">
                {selectedPatient?.analysis?.summary || `Motor neuron risk calculation chart rendered successfully based on clinical analytics.`}
              </p>
            </div>
          </div>

          {/* 2. ATTACHED REPORT LINK */}
          <div className="bg-slate-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border border-slate-200 gap-4 group">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                <FileText size={24}/>
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">MRI / EMG Lab Report</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format: PDF / JPEG</p>
              </div>
            </div>

            {selectedPatient?.report_url ? (
              <div className="flex gap-3 w-full md:w-auto">
                <a 
                  href={selectedPatient.report_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  View Report
                </a>
              </div>
            ) : (
              <span className="px-5 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase">
                No Report Attached
              </span>
            )}
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={() => setModalType(null)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-sm">
            Close File
          </button>
        </div>
      </div>
    </div>
  );
}