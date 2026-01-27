"use client";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, Users, Stethoscope, AlertTriangle, 
  Edit, Trash2, Loader2, Database 
} from "lucide-react";

export default function AdminDashboard({ API_URL }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats aur Users load karne ke liye
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`),
          fetch(`${API_URL}/admin/users`)
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (err) {
        console.error("Admin Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [API_URL]);

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/user/${id}`, { method: "DELETE" });
      if (res.ok) setUsers(users.filter(u => u.id !== id));
    } catch (e) { 
      alert("Delete failed"); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20 text-blue-600 animate-pulse">
        <Loader2 className="animate-spin mr-2" /> Loading Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-blue-500">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
          <h3 className="text-4xl font-black text-slate-800">{stats?.total_patients || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-emerald-500">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Doctors</p>
          <h3 className="text-4xl font-black text-slate-800">{stats?.total_doctors || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-red-500">
          <p className="text-xs font-black text-red-400 uppercase tracking-widest">High Risk Cases</p>
          <h3 className="text-4xl font-black text-red-600">{stats?.high_risk_cases || 0}</h3>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 bg-slate-800 text-white flex items-center gap-3">
          <Database className="text-blue-400" />
          <h3 className="font-bold text-xl">User Management Database</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-xs font-bold text-slate-400 uppercase">
            <tr>
              <th className="p-5">Name</th>
              <th className="p-5">Role</th>
              <th className="p-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-slate-50">
                <td className="p-5 font-bold">{u.full_name}</td>
                <td className="p-5 capitalize">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-black">
                    {u.role}
                  </span>
                </td>
                <td className="p-5 flex justify-center gap-3">
                  <button 
                    onClick={() => handleDeleteUser(u.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}