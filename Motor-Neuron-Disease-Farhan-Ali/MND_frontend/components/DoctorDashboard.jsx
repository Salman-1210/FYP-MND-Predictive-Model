"use client";
import { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { 
  Stethoscope, Users, Mail, FileSearch, Calendar, 
  Loader2, X, Download, CheckCircle2, Clock 
} from "lucide-react";

export default function DoctorDashboard({ user, API_URL }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view_report' or 'appointment'
  const [loading, setLoading] = useState(false);

  // EmailJS Keys (Aapki purani keys)
  const SERVICE_ID = "service_7xz5xxn";
  const PUBLIC_KEY = "E0kMjrhVjc96ySAzv";
  const TEMPLATE_ID_APPOINT = "template_cve9ewl";

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/doctor/patients`);
      if (res.ok) setPatients(await res.json());
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleSendAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    const templateParams = {
      to_email: selectedPatient.email,
      to_name: selectedPatient.name,
      doctor_name: user.full_name,
      date_time: formData.get("date"),
      message: formData.get("message")
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_APPOINT, templateParams, PUBLIC_KEY);
      alert("Appointment email sent successfully!");
      setModalType(null);
    } catch (err) { alert("Email failed to send."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-emerald-500 flex items-center justify-between">
          <div><p className="text-slate-400 text-xs font-bold uppercase">Pending Patients</p><h2 className="text-4xl font-black">{patients.length}</h2></div>
          <Users className="text-emerald-100 h-12 w-12" />
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-700">Patient Consultation Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-white border-b">
              <tr><th className="p-4">Patient Details</th><th className="p-4">AI Risk Level</th><th className="p-4">Submission Date</th><th className="p-4">Actions</th></tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4"><div className="font-bold text-slate-800">{p.name}</div><div className="text-xs text-slate-400">{p.email}</div></td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.risk === "High Risk" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {p.risk}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => { setSelectedPatient(p); setModalType('view_report'); }} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center gap-1"><FileSearch size={14}/> Report</button>
                    <button onClick={() => { setSelectedPatient(p); setModalType('appointment'); }} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1"><Calendar size={14}/> Schedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Modal */}
      {modalType === 'appointment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Schedule Appointment</h3>
              <X className="cursor-pointer" onClick={() => setModalType(null)} />
            </div>
            <form onSubmit={handleSendAppointment} className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-slate-500">DATE & TIME</label><input name="date" type="datetime-local" required className="w-full p-3 border rounded-xl mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-500">MESSAGE</label><textarea name="message" className="w-full p-3 border rounded-xl mt-1 h-24" placeholder="Dr. XYZ is available for consultation..."></textarea></div>
              <button disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 flex justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <><Mail size={18}/> Send Notification</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}