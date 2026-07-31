"use client";

import { useState, useEffect, useMemo } from "react"; 
import emailjs from '@emailjs/browser'; 
import { Globe, LogOut, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 

// --- COMPONENTS ---
import AdminDashboard from "../components/AdminDashboard.jsx";
import PortalSelect from "../components/PortalSelect.jsx";
import AuthForm from "../components/AuthForm.jsx";
import Screening from "../components/Screening.jsx";
import PatientDashboard from "../components/PatientDashboard.jsx";
import DoctorDashboard from "../components/DoctorDashboard.jsx";
import GlobalModals from "../components/GlobalModals.jsx";
import ChatBot from "../components/ChatBot.jsx";
import Exercises from "../components/Exercises.jsx";

import { TRANSLATIONS, ALL_QUESTIONS } from "./utils/constants";

export default function MNDApp() {
  const API_URL = "http://127.0.0.1:8000"; 

  const SERVICE_ID = "service_7xz5xxn";
  const PUBLIC_KEY = "E0kMjrhVjc96ySAzv";
  const TEMPLATE_ID_APPOINT = "template_cve9ewl"; 

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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        console.log("📧 [MNDApp] Loaded user from localStorage:", parsed.email);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

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
  }, [view, selectedRole, authMode]);

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
    return "https://www.shutterstock.com/image-photo/stethoscope-human-brain-model-neurology-260nw-2716494483.jpg"; 
  };

  useEffect(() => {
    const fetchData = () => {
        if (currentUser?.role === "doctor") fetchPatientsForDoctor(currentUser.email);
        else if (currentUser?.role === "admin") {
            fetchAdminStats();
            fetchAllUsers();
        }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [currentUser, view]);

  const fetchPatientsForDoctor = async (doctorEmail) => {
      if (!doctorEmail) return;
      try {
          const res = await fetch(`${API_URL}/doctor/patients?email=${doctorEmail}`);
          if(res.ok) setDoctorPatients(await res.json());
      } catch (e) { console.error("Fetch Patients Error", e); }
  };

  const fetchAdminStats = async () => {
      try {
          const res = await fetch(`${API_URL}/admin/stats`);
          if(res.ok) setAdminStats(await res.json());
      } catch (e) { console.error("Admin Stats Error", e); }
  };

  const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/users`);
        if (res.ok) setAllUsers(await res.json());
      } catch (e) { console.error(e); }
  };

  const getCalculatedRisk = (finalAnswers) => {
    let score = 0;
    const data = finalAnswers || answers;
    ALL_QUESTIONS.forEach(q => {
      if (q.mnd && data[q.id]) {
        if (data[q.id] === "Yes") score += 2;
        if (data[q.id] === "Sometimes") score += 1;
      }
    });
    if (score >= 6) return "High Risk";
    if (score >= 3) return "Moderate Risk";
    return "Low Risk";
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const payload = authMode === "login" 
          ? { email: loginEmail, password: loginPassword, role: selectedRole } 
          : { 
              full_name: name, 
              email: email, 
              password: password, 
              role: selectedRole, 
              hospital: hospitalName, 
              specialty: specialty, 
              license_id: licenseId
            };

      const res = await fetch(`${API_URL}${endpoint}`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication Failed");

      if (authMode === "register") {
          if (selectedRole === "patient") {
              const newUser = { ...data.user, email: email, name: name };
              setCurrentUser(newUser);
              localStorage.setItem("currentUser", JSON.stringify(newUser));
              localStorage.setItem("userEmail", email);
              
              setStep(0);
              setAnswers({});
              setView("screening"); 
              alert("Registration Successful! Please complete your medical screening.");
          } else {
              alert("Registration Successful! Please login.");
              setAuthMode("login");
              setLoginEmail(email);
          }
          setIsLoading(false);
          return;
      }

      if (data.user.role === "doctor" && !data.user.is_verified) {
          throw new Error("Access Restricted: Your account is pending Admin approval.");
      }

      const loggedInUser = { 
          ...data.user, 
          email: data.user?.email || loginEmail,
          name: data.user?.name || data.user?.full_name || loginEmail.split('@')[0]
      };
      
      setCurrentUser(loggedInUser);
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      localStorage.setItem("userEmail", loggedInUser.email);
      console.log("✅ [LOGIN] Saved user to localStorage:", loggedInUser.email);

      if (data.user.role === "patient") {
          if (data.last_analysis) {
            setUploadAnalysis(data.last_analysis);
          } else if (data.user?.analysis) {
            setUploadAnalysis(data.user.analysis);
          } else {
            setUploadAnalysis(null);
          }
          setView("patient_dashboard"); 
      } else if (data.user.role === "doctor") {
          setView("doctor_dashboard");
      } else {
          setView("admin_dashboard");
      }

    } catch (err) { 
      setErrorMsg(err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  // 🔥🔥🔥 FIX: handleAnswer sirf state update karega, backend submit nahi 🔥🔥🔥
  const handleAnswer = (value) => {
    const questions = ALL_QUESTIONS.filter(q => !q.skipIf || !q.skipIf(answers));
    const currentQuestion = questions[step];
    
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    }
    // Last question ka backend submit Screening.jsx handle karegi
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView("portal_select");
      setStep(0);
      setAnswers({});
      setUploadAnalysis(null);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userEmail");
  };

  const handleGlobalBack = () => {
      if(currentUser) {
          if(confirm("Log out and return to home?")) handleLogout();
      } else {
          setView("portal_select");
          setStep(0);
      }
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
                <img src="/images/mnd logo.png" alt="Logo" className="h-12 w-auto object-contain" />
                <div>
                  <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">NeuroGuard AI</h1>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">MND PREDICTIVE PLATFORM</p>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
                {currentUser && (
                    <div className="flex flex-col text-right mr-2 bg-white/50 px-4 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Logged in</span>
                        <span className="text-sm font-bold text-slate-800">{currentUser.name || currentUser.full_name}</span>
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
            {view === "portal_select" && (
              <PortalSelect 
                key="portal_select"
                setView={(v) => {
                  if(v === "screening") {
                    setSelectedRole("patient");
                    setAuthMode("login");
                    setView("auth");
                  } else {
                    setView(v);
                  }
                }} 
                setSelectedRole={setSelectedRole} 
                setAuthMode={setAuthMode} 
              />
            )}

            {view === "auth" && (
              <AuthForm 
                key={`auth-${selectedRole}-${authMode}`}
                {...{authMode, setAuthMode, setView, selectedRole, name, setName, hospitalName, setHospitalName, 
                loginEmail, setLoginEmail, email, setEmail, loginPassword, setLoginPassword, password, setPassword, 
                isLoading, errorMsg, handleAuth, setShowForgotModal, specialty, setSpecialty, licenseId, setLicenseId, 
                answers 
                }} 
              />
            )}

            {view === "screening" && (
              <Screening 
                key="screening"
                step={step} 
                setStep={setStep} 
                questions={ALL_QUESTIONS.filter(q => !q.skipIf || !q.skipIf(answers))} 
                language={language} 
                handleAnswer={handleAnswer} 
                setView={setView} 
                prefillEmail={currentUser?.email || currentUser?.user?.email || ""}
                calculatedRisk={getCalculatedRisk(answers)}
                allAnswers={answers}
              />
            )}
            
            {view === "patient_dashboard" && (
              <PatientDashboard 
                key="patient_dashboard"
                user={currentUser} 
                uploadAnalysis={uploadAnalysis} 
                setUploadAnalysis={setUploadAnalysis}
                selectedFile={selectedFile} 
                setSelectedFile={setSelectedFile} 
                handleFileUpload={async () => {
                    if(!selectedFile) {
                        alert("Pehle file select karo!");
                        return;
                    }
                    setIsLoading(true);
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    formData.append("email", currentUser.email);
                    
                    try {
                        const res = await fetch(`${API_URL}/upload-report`, { 
                            method: "POST", 
                            body: formData 
                        });
                        
                        const data = await res.json();
                        console.log("Server ka jawab:", data);
                        
                        if(res.ok && data.success) {
                            setUploadAnalysis(data.analysis);
                        } else {
                            alert("Upload mein masla aaya: " + (data.message || "Unknown Error"));
                        }
                    } catch (err) {
                        console.error("Fetch Error:", err);
                        alert("Server se connection nahi ho raha!");
                    } finally {
                        setIsLoading(false);
                    }
                }}
                onStartScreening={() => setView("screening")}
              />
            )}

            {view === "exercises_view" && (
              <Exercises 
                key="exercises_view"
                setView={setView} 
                user={currentUser} 
              />
            )}

            {view === "doctor_dashboard" && (
              <DoctorDashboard 
                key="doctor_dashboard"
                doctorInfo={currentUser} 
                doctorPatients={doctorPatients} 
                setDoctorPatients={setDoctorPatients}
                setSelectedPatient={setSelectedPatient} 
                setModalType={setModalType} 
                handleMarkAsSeen={async (id) => {
                    try { await fetch(`${API_URL}/doctor/mark-seen/${id}`, { method: 'PUT' });
                    setDoctorPatients(prev => prev.map(p => p.id === id ? { ...p, status: "checked" } : p));
                    } catch (e) { console.error(e); }
                }} 
              />
            )}

            {view === "admin_dashboard" && adminStats && (
              <AdminDashboard 
                key="admin_dashboard"
                adminStats={adminStats} 
                allUsers={allUsers} 
                setEditingUser={setEditingUser} 
                setModalType={setModalType} 
                handleDeleteUser={async (id) => {
                    if(!confirm("Delete user?")) return;
                    try { await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
                    setAllUsers(allUsers.filter(u => u.id !== id));
                    } catch(e) { console.error(e); }
                }} 
                handleUpdateUserStatus={async (id, data) => {
                    try { await fetch(`${API_URL}/admin/users/${id}/status`, {
                        method: 'PATCH', headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                      });
                      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
                    } catch (e) { console.error(e); }
                }} 
              />
            )}

            {view === "exercises_view" && (
              <Exercises 
                key="exercises_view"
                setView={setView} 
                user={currentUser} 
              />
            )}
        </AnimatePresence>

        <GlobalModals 
          showForgotModal={showForgotModal} setShowForgotModal={setShowForgotModal} 
          forgotEmail={forgotEmail} setForgotEmail={setForgotEmail} 
          handleForgotPassword={async () => {
            try { await fetch(`${API_URL}/forgot-password`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email: forgotEmail}) });
            alert("Email sent!"); setShowForgotModal(false); } catch(e) { alert("Error."); }
          }} 
          modalType={modalType} setModalType={setModalType} 
          selectedPatient={selectedPatient} 
          appointDate={appointDate} setAppointDate={setAppointDate} 
          appointMsg={appointMsg} setAppointMsg={setAppointMsg} 
          sendAppointmentEmail={async () => {
            setIsLoading(true);
            try {
              const params = { to_email: selectedPatient.email, to_name: selectedPatient.name, doctor_name: currentUser.name, date_time: appointDate, message: appointMsg };
              await emailjs.send(SERVICE_ID, TEMPLATE_ID_APPOINT, params, PUBLIC_KEY);
              alert("Notification sent!"); setModalType(null);
            } catch(e) { alert("Failed to send."); } finally { setIsLoading(false); }
          }} 
          editingUser={editingUser} setEditingUser={setEditingUser} 
          handleUpdateUser={async () => {
            try { await fetch(`${API_URL}/admin/users/${editingUser.id}`, { method: 'PUT', headers: {"Content-Type": "application/json"}, body: JSON.stringify({name: editingUser.name, role: editingUser.role}) });
            setAllUsers(allUsers.map(u => u.id === editingUser.id ? { ...u, name: editingUser.name, full_name: editingUser.name } : u));
            setModalType(null); } catch(e) { alert("Failed."); }
          }} 
          isLoading={isLoading} 
        />
        <ChatBot />
      </div>
    </div>
  );
}