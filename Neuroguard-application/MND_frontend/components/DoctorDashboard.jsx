"use client";

import { useState, useEffect } from "react";
import {
  User, RefreshCw, FileText, Download, Eye, Hospital
} from "lucide-react";

export default function DoctorDashboard({ 
  doctorInfo, 
  doctorPatients, 
  setSelectedPatient, 
  setModalType, 
  setDoctorPatients 
}) {
  const [profileData, setProfileData] = useState({
    full_name: doctorInfo?.full_name || "",
    specialization: doctorInfo?.specialization || doctorInfo?.specialty || "",
    hospital: doctorInfo?.hospital || ""
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");

  // Robust session recovery looking up standard session keys from localStorage
  const getDoctorEmail = () => {
    if (doctorInfo?.email) return doctorInfo.email;
    try {
      const stored = localStorage.getItem("user") || localStorage.getItem("doctor") || localStorage.getItem("doctorInfo");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.email || parsed.user?.email || parsed.doctor?.email || "";
      }
    } catch (err) {
      console.error("Local session parsing failed:", err);
    }
    return "";
  };

  const doctorEmail = getDoctorEmail();

  // Load complete doctor profile details including dynamic registration details
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!doctorEmail) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/profile?email=${encodeURIComponent(doctorEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            full_name: data.full_name || "",
            specialization: data.specialization || data.specialty || "",
            hospital: data.hospital || ""
          });
        }
      } catch (err) {
        console.error("Error loading doctor profile:", err);
      }
    };
    fetchDoctorProfile();
  }, [doctorEmail]);

  // Safe check to ensure we always work with an array for rendering
  const patientsList = Array.isArray(doctorPatients) ? doctorPatients : [];

  // Helper functions to safely render potential object fields to prevent React child crashes
  const renderSafeString = (val, fallback = "") => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (typeof val === "object") {
      return val.full_name || val.name || val.label || val.level || JSON.stringify(val);
    }
    return fallback;
  };

  const refreshQueue = async () => {
    if (!doctorEmail) {
      console.warn("Queue sync skipped: Doctor email is not verified yet.");
      return;
    }
    
    if (typeof setDoctorPatients !== "function") {
      console.error("setDoctorPatients function is missing in props!");
      return; 
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/doctor/patients?email=${encodeURIComponent(doctorEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorPatients(Array.isArray(data) ? data : []); 
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Triggers immediate automatic queue sync as soon as doctor session loads
  useEffect(() => { 
    if (doctorEmail) {
      refreshQueue(); 
    }
  }, [doctorEmail, activeTab]);

  const specialty = profileData.specialization || profileData.specialty || doctorInfo?.specialization || doctorInfo?.specialty || "General Physician";
  const displayName = profileData.full_name || doctorInfo?.full_name || "Doctor";

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Dr. {renderSafeString(displayName, "Doctor")}
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase border border-blue-100">
              {renderSafeString(specialty, "General Physician")}
            </span>
          </div>
        </div>
        <button 
          onClick={refreshQueue} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all active:scale-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync Queue
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("patients")} 
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "patients" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
          }`}
        >
          Patient Queue
        </button>
      </div>

      {activeTab === "patients" && (
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Patients Awaiting Review</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Linked via AI Routing
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-6">Identity</th>
                  <th className="p-6">Risk Profile</th>
                  <th className="p-6">Data Source</th>
                  <th className="p-6 text-right">Medical Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-bold italic">
                      No active patient connections found. Click "Sync Queue" or upload reports to link cases.
                    </td>
                  </tr>
                ) : (
                  patientsList.map((p, i) => {
                    const riskVal = renderSafeString(p.risk, "Low Risk");
                    const isHighRisk = riskVal.toLowerCase().includes("high");

                    return (
                      <tr key={i} className="hover:bg-blue-50/20 transition-all group">
                        <td className="p-6">
                          <p className="font-bold text-slate-800">{renderSafeString(p.name, "Patient")}</p>
                          <p className="text-[10px] text-slate-400">{renderSafeString(p.email, "No Email")}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
                            isHighRisk 
                              ? "bg-red-50 text-red-600 border-red-100" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            {riskVal}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                              <FileText size={12} className="text-blue-500" />
                              {p.report_url ? "AI Lab Report" : "Screening Form Only"}
                            </span>
                            
                            {p.report_url && (
                              <div className="flex gap-2">
                                <a 
                                  href={renderSafeString(p.report_url)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[9px] font-black text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                                >
                                  <Eye size={10} /> VIEW
                                </a>
                                <a 
                                  href={renderSafeString(p.report_url)} 
                                  download 
                                  className="flex items-center gap-1 text-[9px] font-black text-emerald-600 hover:underline bg-emerald-50 px-2 py-1 rounded"
                                >
                                  <Download size={10} /> DOWNLOAD
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => { 
                              setSelectedPatient(p); 
                              setModalType("view_report"); 
                            }} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95"
                          >
                            Analyze Case
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}