"use client";

import { useState, useEffect, useMemo } from "react"; 
import emailjs from '@emailjs/browser'; 
import { BrainCircuit, Globe, LogOut, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 

// --- IMPORTS FROM COMPONENTS ---
import AdminDashboard from "../components/AdminDashboard.jsx";
import PortalSelect from "../components/PortalSelect.jsx";
import AuthForm from "../components/AuthForm.jsx";
import Screening from "../components/Screening.jsx";
import PatientDashboard from "../components/PatientDashboard.jsx";
import DoctorDashboard from "../components/DoctorDashboard.jsx";
import GlobalModals from "../components/GlobalModals.jsx";
import ChatBot from "../components/ChatBot.jsx";

import { TRANSLATIONS, ALL_QUESTIONS } from "./utils/constants";

export default function MNDApp() {
  const API_URL = "http://127.0.0.1:8000"; 

  // --- EMAILJS CREDENTIALS ---
  const SERVICE_ID = "service_7xz5xxn";
  const PUBLIC_KEY = "E0kMjrhVjc96ySAzv";
  const TEMPLATE_ID_APPOINT = "template_cve9ewl"; 

  // --- STATE MANAGEMENT ---
  const [view, setView] = useState("portal_select"); 
  const [selectedRole, setSelectedRole] = useState("patient"); 
  const [currentUser, setCurrentUser] = useState(null);
  
  const [specialty, setSpecialty] = useState("");
  const [licenseId, setLicenseId] = useState("");
  
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [authMode, setAuthMode] = useState("login"); 
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedPatient, setSelectedPatient] = useState(null); 
  const [modalType, setModalType] = useState(null); 
  const [editingUser, setEditingUser] = useState(null); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitalName, setHospitalName] = useState(""); 
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadAnalysis, setUploadAnalysis] = useState(null); 
  const [language, setLanguage] = useState("en");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [appointDate, setAppointDate] = useState("");
  const [appointMsg, setAppointMsg] = useState("");

  // --- 1. RESET LOGIC (Autofill Fix) ---
  useEffect(() => {
    setLoginEmail("");
    setLoginPassword("");
    setErrorMsg("");
    setName("");
    setEmail("");
    setPassword("");
    setHospitalName("");
    setLicenseId("");
    setSpecialty("");
  }, [view, selectedRole]);

  // --- DYNAMIC BACKGROUND LOGIC ---
  const getBgImage = () => {
    if (view === 'patient_dashboard' || view === 'screening' || (view === 'auth' && selectedRole === 'patient')) {
        return "https://media.istockphoto.com/id/2158873057/photo/microscopic-of-neural-network-brain-cells.jpg?s=612x612&w=0&k=20&c=ry6qsW3QEZRmlHoj7klS48-OH_vOwiv_PTBgvH8yyr4="; 
    }
    if (view === 'doctor_dashboard' || (view === 'auth' && selectedRole === 'doctor')) {
        return "https://images.unsplash.com/photo-1655313719493-16ebe4906441?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; 
    }
    if (view === 'admin_dashboard' || (view === 'auth' && selectedRole === 'admin')) {
        return "https://media.istockphoto.com/id/2226751694/photo/businessperson-using-laptop-with-digital-invoice-and-finance-icons-concept-of-electronic.jpg?s=612x612&w=0&k=20&c=d1-Xm9sjbPUicNx-l5MUJBe7nquDq8qPRxNdXB_uIVc="; 
    }
    return "https://media.istockphoto.com/id/1398176399/vector/graphic-illustration-of-brain-organ-protected-by-a-shield-healthcare-concept-background-with.jpg?s=1024x1024&w=is&k=20&c=1gIcpcHP8A8vtCNcrI9OY7mC4cT6l03yLoHKU7Ek_k8="; 
  };

  // --- EFFECTS ---
  useEffect(() => {
    const fetchData = () => {
        if (currentUser?.role === "doctor") fetchPatientsForDoctor();
        else if (currentUser?.role === "admin") {
            fetchAdminStats();
            fetchAllUsers();
        }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [currentUser, view]);

  // --- API CALLS ---
  const fetchPatientsForDoctor = async () => {
      try {
          const res = await fetch(`${API_URL}/doctor/patients`);
          if(res.ok) setDoctorPatients(await res.json());
      } catch (e) { console.error("Error", e); }
  };

  const fetchAdminStats = async () => {
      try {
          const res = await fetch(`${API_URL}/admin/stats`);
          if(res.ok) setAdminStats(await res.json());
      } catch (e) { console.error("Error", e); }
  };

  const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/users`);
        if (res.ok) setAllUsers(await res.json());
      } catch (e) { console.error(e); }
  };

  const handleUpdateUserStatus = async (userId, updateData) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updateData } : u));
        alert("Medical Professional Verified Successfully!");
      }
    } catch (e) { console.error("Failed to update status", e); }
  };

  // --- AUTHENTICATION HANDLER ---
  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const payload = authMode === "login" 
          ? { email: loginEmail, password: loginPassword, role: selectedRole } 
          : { 
              full_name: name, email, password, 
              role: selectedRole, hospital: hospitalName, specialty, license_id: licenseId 
            };

      const res = await fetch(`${API_URL}${endpoint}`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication Failed");

      if (authMode === "register") {
          alert(selectedRole === "doctor" ? "Registration Successful! Account sent for Admin Approval." : "Registration Successful! Please login.");
          setAuthMode("login");
          setLoginEmail(""); 
          setIsLoading(false);
          return;
      }

      // Security Check: Block unverified doctors
      if (data.user.role === "doctor" && !data.user.is_verified) {
          throw new Error("Access Restricted: Your account is pending Admin approval.");
      }

      setCurrentUser({ ...data.user });
      setView(data.user.role === "admin" ? "admin_dashboard" : data.user.role === "doctor" ? "doctor_dashboard" : "patient_dashboard");

    } catch (err) { 
      setErrorMsg(err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleLogout = () => {
      setCurrentUser(null); setView("portal_select"); setStep(0); setUploadAnalysis(null); setAnswers({});
  };

  const handleGlobalBack = () => {
      if(currentUser) {
          if(confirm("Go back to Main Menu? You will be logged out.")) handleLogout();
      } else {
          setView("portal_select"); setStep(0); setAnswers({});
      }
  };

  const handleMarkAsSeen = async (screeningId) => {
    try {
      const res = await fetch(`${API_URL}/doctor/mark-seen/${screeningId}`, { 
        method: 'PUT',
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setDoctorPatients((prev) =>
          prev.map((p) => (p.id === screeningId ? { ...p, status: "checked" } : p))
        );
      }
    } catch (e) { console.error("Status update failed", e); }
  };

  const handleDeleteUser = async (userId) => {
    if(!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
        if(res.ok) setAllUsers(allUsers.filter(u => u.id !== userId));
    } catch(e) { console.error(e); }
  };

  const handleUpdateUser = async () => {
    try {
        const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, { 
            method: 'PUT', headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: editingUser.name, role: editingUser.role})
        });
        if(res.ok) {
            setAllUsers(allUsers.map(u => u.id === editingUser.id ? { ...u, name: editingUser.name, role: editingUser.role, full_name: editingUser.name } : u));
            setModalType(null);
            alert("User updated successfully!");
        }
    } catch(e) { alert("Update failed"); }
  };

  const handleForgotPassword = async () => {
    if(!forgotEmail) return alert("Please enter email");
    try {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email: forgotEmail})
        });
        if(res.ok) { alert("Password reset link sent!"); setShowForgotModal(false); }
    } catch(e) { alert("Error sending reset link."); }
  };

  const handleFileUpload = async () => {
    if(!selectedFile) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", currentUser.email);
    try {
      const res = await fetch(`${API_URL}/upload-report`, { method: "POST", body: formData });
      const data = await res.json();
      if(data.success) setUploadAnalysis(data.analysis);
    } catch (err) { alert("Upload/OCR analysis failed. Please try again."); } 
    finally { setIsLoading(false); }
  };

  const sendAppointmentEmail = async () => {
    setIsLoading(true);
    try {
      const templateParams = { to_email: selectedPatient.email, to_name: selectedPatient.name, doctor_name: currentUser.name, date_time: appointDate, message: appointMsg };
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_APPOINT, templateParams, PUBLIC_KEY);
      alert(`Appointment notification sent to ${selectedPatient.name}!`); 
      setModalType(null);
    } catch(e) { alert("Failed to send email."); } 
    finally { setIsLoading(false); }
  };

  const questions = useMemo(() => ALL_QUESTIONS.filter(q => !q.skipIf || !q.skipIf(answers)), [answers]);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) setStep(step + 1);
    else { setView("auth"); setAuthMode("register"); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans text-slate-800 bg-slate-50">
      <AnimatePresence mode="wait">
        <motion.div key={view + selectedRole} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white/10 to-emerald-50/20 z-10"></div>
            <img src={getBgImage()} alt="Background" className="w-full h-full object-cover"/>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 w-full max-w-7xl">
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/80 backdrop-blur-md shadow-lg border border-white/50 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center mb-8 sticky top-4 z-50">
            <div onClick={handleGlobalBack} className="flex items-center gap-3 cursor-pointer">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg"><BrainCircuit className="h-7 w-7" /></div>
              <div>
                <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">NeuroGuard AI</h1>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">MND Detection System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                {currentUser && (
                    <div className="hidden md:flex flex-col text-right mr-2 bg-white/50 px-4 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Logged in</span>
                        <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                    </div>
                )}
                {view !== "portal_select" && (
                    <button onClick={handleGlobalBack} className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full shadow-md ${currentUser ? "bg-red-500 text-white" : "bg-white text-slate-600"}`}>
                        {currentUser ? <><LogOut size={16}/> Logout</> : <><Home size={16}/> Home</>}
                    </button>
                )}
                <button onClick={() => setLanguage(language === "en" ? "ur" : "en")} className="flex items-center gap-1.5 text-sm font-bold text-blue-700 bg-blue-50/80 px-4 py-2.5 rounded-full border border-blue-100">
                    <Globe className="h-4 w-4" /> {language === "en" ? "اردو" : "English"}
                </button>
            </div>
        </motion.div>

        <AnimatePresence mode="wait">
            {view === "portal_select" && <PortalSelect setView={setView} setSelectedRole={setSelectedRole} setAuthMode={setAuthMode} />}
            {view === "screening" && <Screening step={step} questions={questions} language={language} handleAnswer={handleAnswer} setView={setView} />}
            {view === "auth" && (
              <AuthForm 
                {...{authMode, setAuthMode, setView, selectedRole, name, setName, hospitalName, setHospitalName, 
                loginEmail, setLoginEmail, email, setEmail, loginPassword, setLoginPassword, password, setPassword, 
                isLoading, errorMsg, handleAuth, setShowForgotModal, specialty, setSpecialty, licenseId, setLicenseId}} 
              />
            )}
            {view === "patient_dashboard" && <PatientDashboard user={currentUser} uploadAnalysis={uploadAnalysis} setUploadAnalysis={setUploadAnalysis} selectedFile={selectedFile} setSelectedFile={setSelectedFile} handleFileUpload={handleFileUpload} isLoading={isLoading} />}
            {view === "doctor_dashboard" && <DoctorDashboard doctorInfo={currentUser} doctorPatients={doctorPatients} setSelectedPatient={setSelectedPatient} setModalType={setModalType} handleMarkAsSeen={handleMarkAsSeen} />}
            {view === "admin_dashboard" && adminStats && <AdminDashboard adminStats={adminStats} allUsers={allUsers} setEditingUser={setEditingUser} setModalType={setModalType} handleDeleteUser={handleDeleteUser} handleUpdateUserStatus={handleUpdateUserStatus} />}
        </AnimatePresence>

        <GlobalModals showForgotModal={showForgotModal} setShowForgotModal={setShowForgotModal} forgotEmail={forgotEmail} setForgotEmail={setForgotEmail} handleForgotPassword={handleForgotPassword} modalType={modalType} setModalType={setModalType} selectedPatient={selectedPatient} appointDate={appointDate} setAppointDate={setAppointDate} appointMsg={appointMsg} setAppointMsg={setAppointMsg} sendAppointmentEmail={sendAppointmentEmail} editingUser={editingUser} setEditingUser={setEditingUser} handleUpdateUser={handleUpdateUser} isLoading={isLoading} />
        <ChatBot />
      </div>
    </div>
  );
}