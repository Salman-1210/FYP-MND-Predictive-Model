import React, { useState } from "react";
import { 
  Users, Edit, Trash2, ShieldAlert, UserCheck, Stethoscope, 
  Search, ShieldCheck, BadgeCheck, XCircle, AlertCircle 
} from "lucide-react";

export default function AdminDashboard({ 
  adminStats, allUsers, setEditingUser, setModalType, handleDeleteUser, handleUpdateUserStatus 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!adminStats) return null;

  // --- 1. Filter and Search Logic ---
  const filteredUsers = allUsers.filter(u => 
    (u.full_name || u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const admins = filteredUsers.filter(u => u.role === 'admin');
  
  // Layering Doctors: Approved vs Pending
  const doctors = filteredUsers.filter(u => u.role === 'doctor');
  const pendingDoctors = doctors.filter(u => !u.is_verified);
  const verifiedDoctors = doctors.filter(u => u.is_verified);
  
  // Patients sorting: High Risk first
  const patients = filteredUsers.filter(u => u.role === 'patient').sort((a, b) => {
    const aRisk = a.risk_level === 'high' || a.is_high_risk ? 1 : 0;
    const bRisk = b.risk_level === 'high' || b.is_high_risk ? 1 : 0;
    return bRisk - aRisk;
  });

  // --- REUSABLE TABLE COMPONENT (Modified for Verification) ---
  const UserTable = ({ title, data, icon: Icon, colorClass, type }) => (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 mb-8 transition-all">
      <div className={`p-6 border-b border-slate-100 ${colorClass} flex justify-between items-center`}>
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Icon className="h-5 w-5 opacity-70" /> {title} ({data.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="p-5">Identity & Status</th>
              <th className="p-5">License / Details</th>
              <th className="p-5 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.length > 0 ? data.map((u, i) => (
              <tr key={u.id || i} className={`hover:bg-slate-50/80 transition-colors ${u.is_high_risk ? 'bg-red-50/20' : ''}`}>
                <td className="p-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{u.full_name || u.name}</span>
                      {u.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" title="Verified Professional" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                  </div>
                </td>
                <td className="p-5">
                  {u.role === 'doctor' ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">ID: {u.license_id || "PMC-8829-X"}</span>
                      <span className={`text-[10px] font-bold uppercase ${u.is_verified ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {u.is_verified ? '● Active Staff' : '● Awaiting Approval'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">{u.risk_level === 'high' ? 'High Priority Case' : 'Routine Checkup'}</span>
                  )}
                </td>
                <td className="p-5 flex gap-2 justify-end items-center">
                  {/* Verification Toggle for Doctors */}
                  {u.role === 'doctor' && !u.is_verified && (
                    <button 
                      onClick={() => handleUpdateUserStatus(u.id, { is_verified: true })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                    >
                      <ShieldCheck className="h-3 w-3" /> Approve
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { setEditingUser({ ...u, name: u.full_name || u.name }); setModalType('edit_user'); }} 
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(u.id)} 
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-10 text-center text-slate-400 italic">No records in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- LAYERED STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Doctors</p>
              <p className="text-3xl font-black text-slate-800">{adminStats.total_doctors}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 relative">
              <AlertCircle className="absolute right-4 top-4 text-orange-400 h-5 w-5" />
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pending Approvals</p>
              <p className="text-3xl font-black text-orange-700">{pendingDoctors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
              <p className="text-3xl font-black text-slate-800">{adminStats.total_patients}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 relative">
              <ShieldAlert className="absolute right-4 top-4 text-red-400 h-5 w-5" />
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">High Risk Cases</p>
              <p className="text-3xl font-black text-red-700">{adminStats.high_risk_cases}</p>
          </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name, email or license..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLES BY PRIORITY LAYERS --- */}
      
      {/* Layer 1: Pending Doctor Approvals (Most Important for Security) */}
      {pendingDoctors.length > 0 && (
        <UserTable 
          title="Verification Queue (New Doctors)" 
          data={pendingDoctors} 
          icon={AlertCircle} 
          colorClass="bg-orange-50/50" 
          type="pending"
        />
      )}

      {/* Layer 2: Verified Doctors */}
      <UserTable 
        title="Verified Medical Staff" 
        data={verifiedDoctors} 
        icon={Stethoscope} 
        colorClass="bg-blue-50/50" 
      />

      {/* Layer 3: Patients */}
      <UserTable 
        title="Patient Directory" 
        data={patients} 
        icon={UserCheck} 
        colorClass="bg-slate-50/50" 
      />
      
    </div>
  );
}