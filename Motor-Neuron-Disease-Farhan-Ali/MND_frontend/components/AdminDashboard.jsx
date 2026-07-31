"use client";

import React, { useState, useEffect } from "react";
import {
  Users, Trash2, Stethoscope, Search, ShieldCheck, BadgeCheck, 
  AlertCircle, ShieldAlert, Zap, Lock, BarChart3, Loader2, WifiOff
} from "lucide-react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_doctors: 0, total_patients: 0 });

  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchSystemData = async () => {
    setConnectionError(false);
    try {
      const [resUsers, resStats] = await Promise.all([
        fetch("http://127.0.0.1:8000/admin/users"),
        fetch("http://127.0.0.1:8000/admin/stats"),
      ]);

      if (resUsers.ok) {
        const uData = await resUsers.json();
        setUsers(Array.isArray(uData) ? uData : []);
      } else {
        setConnectionError(true);
      }

      if (resStats.ok) {
        const sData = await resStats.json();
        if (sData) setStats(sData);
      } else {
        setConnectionError(true);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  // Verify / unverify a doctor — persists to DB, then refreshes the list + stats
  const handleUpdateUserStatus = async (userId, isVerified) => {
    setActionError("");
    const stringVal = isVerified ? "true" : "false";
    try {
      const res = await fetch(`http://127.0.0.1:8000/doctor/update-status/${userId}/${stringVal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        await fetchSystemData();
      } else {
        const errBody = await res.json().catch(() => ({}));
        setActionError(errBody.detail || "Failed to update doctor status. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setActionError("Could not reach the server. Check backend service.");
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/delete-user/${userId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await fetchSystemData();
      } else {
        const errBody = await res.json().catch(() => ({}));
        setActionError(errBody.detail || "Failed to delete user. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setActionError("Could not reach the server. Check backend service.");
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const safeStats = stats || { total_doctors: 0, total_patients: 0 };

  const filtered = safeUsers.filter(u => {
    if (!u) return false;
    const nameMatch = (u.full_name || u.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;

    if (filter === "high_risk") return matchesSearch && (u.risk_level?.toLowerCase().includes("high") || u.risk_level?.toLowerCase().includes("moderate") || u.risk_level?.toLowerCase().includes("intermediate"));
    if (filter === "pending") return matchesSearch && u.role === "doctor" && !u.is_verified;
    return matchesSearch;
  });

  const pendingDoctors = filtered.filter(u => u.role === "doctor" && !u.is_verified);
  const verifiedDoctors = filtered.filter(u => u.role === "doctor" && u.is_verified);
  const patients = filtered.filter(u => u.role === "patient");

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0 }}>System Control</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Medical Records & Staff Management Interface</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 12px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 6, height: 6, background: connectionError ? "#ef4444" : "#22c55e", borderRadius: "50%" }}></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{connectionError ? "Backend Offline" : "Live Core"}</span>
          </div>
        </div>
      </div>

      {/* Connection / Action Error Banners */}
      {connectionError && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontSize: 12, fontWeight: 700 }}>
          <WifiOff size={16} />
          Could not load live data from the backend (http://127.0.0.1:8000). Make sure the FastAPI server is running and that /admin/users and /admin/stats exist.
        </div>
      )}
      {actionError && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontSize: 12, fontWeight: 700 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}><AlertCircle size={16} /> {actionError}</span>
          <button onClick={() => setActionError("")} style={{ border: "none", background: "transparent", color: "#92400e", fontWeight: 900, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Statistics Block */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: 18, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 11, fontWeight: 800 }}>
            <span>CLINICIANS</span>
            <Stethoscope size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{safeStats.total_doctors}</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: 18, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 11, fontWeight: 800 }}>
            <span>PENDING APPROVAL</span>
            <Zap size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{safeUsers.filter(u => u?.role === "doctor" && !u?.is_verified).length}</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: 18, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 11, fontWeight: 800 }}>
            <span>TOTAL PATIENTS</span>
            <Users size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{safeStats.total_patients}</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: 18, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 11, fontWeight: 800 }}>
            <span>RISK ALERTS</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>
            {safeUsers.filter(u => u?.risk_level && (u.risk_level.toLowerCase().includes("high") || u.risk_level.toLowerCase().includes("moderate") || u.risk_level.toLowerCase().includes("intermediate"))).length}
          </div>
        </div>
      </div>

      {/* Control Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 16px" }}>
          <Search size={16} color="#94a3b8" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search records..." 
            style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", width: "100%", fontWeight: 500 }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
          <option value="all">View All</option>
          <option value="high_risk">Priority Risk Only</option>
          <option value="pending">Pending Doctors</option>
        </select>
      </div>

      {/* Tables Layout */}
      {loading ? (
        <div style={{ background: "#fff", padding: "40px", textAlign: "center", borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#64748b" }}>
            <Loader2 style={{ animation: "spin 2s linear infinite" }} size={20} /> Loading Data Engine...
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Action Required */}
          {pendingDoctors.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "#fafafa", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <AlertCircle size={16} color="#f59e0b" />
                <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Action Required</h3>
                <span style={{ fontSize: 10, background: "#fff", border: "1px solid #eee", padding: "1px 6px", borderRadius: 4 }}>{pendingDoctors.length}</span>
              </div>
              <div>
                {pendingDoctors.map((u) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1.2fr auto", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{u.full_name || "Doctor"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>ID: {u.license_id || "N/A"}</div>
                    <div><span style={{ background: "#fffbeb", color: "#92400e", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>Pending Review</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleUpdateUserStatus(u.id, true)} style={{ padding: "6px 12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}>Verify</button>
                      <button onClick={() => { if(confirm("Delete user?")) handleDeleteUser(u.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Tracker Banner */}
          <div style={{ background: "linear-gradient(90deg, #f8fafc, #eff6ff)", padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart3 size={16} color="#3b82f6" />
            <span style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 700 }}>
              Risk Distribution: {safeUsers.filter(u => u?.risk_level?.toLowerCase().includes("high")).length} Critical | {safeUsers.filter(u => u?.risk_level?.toLowerCase().includes("moderate") || u?.risk_level?.toLowerCase().includes("intermediate")).length} Moderate
            </span>
          </div>

          {/* Medical Personnel */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: "#fafafa", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={16} color="#2563eb" />
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Medical Personnel</h3>
              <span style={{ fontSize: 10, background: "#fff", border: "1px solid #eee", padding: "1px 6px", borderRadius: 4 }}>{verifiedDoctors.length}</span>
            </div>
            <div>
              {verifiedDoctors.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No verified medical staff active.</div> : 
                verifiedDoctors.map((u) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1.2fr auto", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>{u.full_name || "Doctor"} <BadgeCheck size={14} color="#2563eb" /></div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>ID: {u.license_id || "N/A"}</div>
                    <div><span style={{ background: "#ecfdf5", color: "#065f46", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>Verified Practitioner</span></div>
                    <button onClick={() => { if(confirm("Delete user?")) handleDeleteUser(u.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Patient Records */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: "#fafafa", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={16} color="#0d9488" />
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Patient Records</h3>
              <span style={{ fontSize: 10, background: "#fff", border: "1px solid #eee", padding: "1px 6px", borderRadius: 4 }}>{patients.length}</span>
            </div>
            <div>
              {patients.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No registered patients in core system.</div> : 
                patients.map((u) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1.2fr auto", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{u.full_name || "Patient"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Patient Data Locked</div>
                    <div>
                      <span style={{ 
                        fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                        background: u.risk_level?.toLowerCase().includes("high") ? "#fef2f2" : u.risk_level?.toLowerCase().includes("moderate") ? "#fff7ed" : "#f0f9ff",
                        color: u.risk_level?.toLowerCase().includes("high") ? "#991b1b" : u.risk_level?.toLowerCase().includes("moderate") ? "#c2410c" : "#0369a1"
                      }}>
                        {u.risk_level || "Stable"}
                      </span>
                    </div>
                    <button onClick={() => { if(confirm("Delete user?")) handleDeleteUser(u.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      )}
    </div>
  );
}