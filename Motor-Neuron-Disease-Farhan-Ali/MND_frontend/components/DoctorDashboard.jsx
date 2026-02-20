import { Activity, CheckCircle2, Eye, MapPin, User, ShieldCheck } from "lucide-react";

export default function DoctorDashboard({ doctorInfo, doctorPatients, setSelectedPatient, setModalType }) {
  
  // Logic: Doctor ki specialty ke hisaab se queue manage karna
  // doctorInfo mein 'specialty' honi chahiye (e.g., "Physiotherapist")
  const specialty = doctorInfo?.specialty || "General Physician";

  const sortedPatients = [...doctorPatients].sort((a, b) => {
    // Agar doctor Physio ya Neurologist hai, toh High Risk ko priority do
    if (specialty === "Physiotherapist" || specialty === "Neurologist") {
      const riskPriority = { "High Risk": 3, "Moderate Risk": 2, "Low Risk": 1 };
      return (riskPriority[b.risk] || 0) - (riskPriority[a.risk] || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* --- DOCTOR PROFILE CARD (The "Layer" Header) --- */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Dr. {doctorInfo?.name}</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                {specialty}
              </span>
              <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                <ShieldCheck size={12} /> Verified Staff
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Assigned Queue</p>
          <p className="text-3xl font-black text-slate-800">{doctorPatients.length} <span className="text-sm font-medium text-slate-400">Patients</span></p>
        </div>
      </div>

      {/* --- QUEUE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Activity className="text-blue-500" size={18} /> 
            {specialty === "Physiotherapist" ? "Critical Rehabilitation Queue" : "General Consultation Queue"}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Patient Name</th>
                <th className="p-6">Risk Category</th>
                <th className="p-6">Clinical Action</th>
                <th className="p-6 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPatients.map((p, i) => (
                <tr key={i} className="hover:bg-blue-50/20 transition-all group">
                  <td className="p-6">
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Click view for full history</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black border ${
                      p.risk.includes("High") ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {p.risk}
                    </span>
                  </td>
                  <td className="p-6">
                    {/* Layered Action based on Specialty & Risk */}
                    <div className="text-xs font-bold text-slate-600">
                      {p.risk.includes("High") && specialty === "Physiotherapist" && (
                        <span className="flex items-center gap-2 text-red-500">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                           Immediate Physical Assessment Needed
                        </span>
                      )}
                      {p.risk.includes("Moderate") && (
                        <span className="text-slate-500 italic">Verify symptoms & schedule follow-up</span>
                      )}
                      {!p.risk.includes("High") && !p.risk.includes("Moderate") && (
                        <span className="text-emerald-500">Reassure Patient: No MND Detected</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => {setSelectedPatient(p); setModalType('view_report')}}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={14} className="inline mr-1" /> View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}