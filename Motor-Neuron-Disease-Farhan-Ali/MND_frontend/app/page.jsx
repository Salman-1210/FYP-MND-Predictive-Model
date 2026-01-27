"use client";

import { useState, useEffect, useMemo } from "react"; 
import emailjs from '@emailjs/browser'; 
import {
  BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2,
  Globe, Smile, Loader2, Lock, Mail, Stethoscope, 
  FileText, Hospital, LogOut, Calendar, X,
  User, ShieldCheck, Phone, HeartHandshake,
  Users, Activity, AlertTriangle, ChevronRight, Download,
  Trash2, Edit, Save, Home, Clock
} from "lucide-react";

// KARACHI HOSPITALS DATA
const karachiHospitals = [
  { name: "Aga Khan University Hospital", doctor: "Dr. Sarwar Jamil", contact: "021-34861000", address: "Stadium Road, Karachi" },
  { name: "Liaquat National Hospital", doctor: "Dr. Arif Herekar", contact: "021-34412000", address: "Gulshan-e-Iqbal, Karachi" },
  { name: "South City Hospital", doctor: "Dr. Mughis Sheerani", contact: "021-35862301", address: "Clifton, Karachi" },
  { name: "Dow University Hospital", doctor: "Dr. Naila Shahbaz", contact: "021-99232660", address: "Ojha Campus, Karachi" },
];

export default function MNDApp() {
  const API_URL = "http://127.0.0.1:8000"; 

  // --- EMAILJS CREDENTIALS ---
  const SERVICE_ID = "service_7xz5xxn";
  const PUBLIC_KEY = "E0kMjrhVjc96ySAzv";
  const TEMPLATE_ID_REGISTER = "template_cve9ewl"; 
  const TEMPLATE_ID_RESET    = "template_gixvpg6"; 
  const TEMPLATE_ID_APPOINT  = "template_cve9ewl"; 

  // STATE
  const [view, setView] = useState("portal_select"); 
  const [selectedRole, setSelectedRole] = useState("patient"); 
  
  // Questionnaire
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [riskLevel, setRiskLevel] = useState("Low Risk");

  // Auth
  const [authMode, setAuthMode] = useState("login"); 
  const [currentUser, setCurrentUser] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  
  // Data Lists
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 

  // Modals & Actions
  const [selectedPatient, setSelectedPatient] = useState(null); 
  const [modalType, setModalType] = useState(null); 
  const [appointDate, setAppointDate] = useState("");
  const [appointMsg, setAppointMsg] = useState("");
  const [editingUser, setEditingUser] = useState(null); 

  // Inputs
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

  // --- EFFECTS ---
  useEffect(() => {
    const fetchData = () => {
        if (currentUser?.role === "doctor") {
            fetchPatientsForDoctor();
        } else if (currentUser?.role === "admin") {
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

  // --- ACTIONS ---
  const handleDeleteUser = async (userId) => {
      if(!confirm("Are you sure you want to delete this user?")) return;
      try {
          const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
          if(res.ok) {
              setAllUsers(allUsers.filter(u => u.id !== userId));
              alert("User deleted successfully!");
          }
      } catch(e) { alert("Delete failed"); }
  };

  const handleUpdateUser = async () => {
      try {
          const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, { 
              method: 'PUT', 
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({name: editingUser.name, role: editingUser.role})
          });
          if(res.ok) {
              setAllUsers(allUsers.map(u => u.id === editingUser.id ? editingUser : u));
              setModalType(null);
              alert("User updated successfully!");
          }
      } catch(e) { alert("Update failed"); }
  };

  const handleGlobalBack = () => {
      if(currentUser) {
          if(confirm("Go back to Main Menu? You will be logged out.")) {
              handleLogout();
          }
      } else {
          setView("portal_select");
          setStep(0);
          setAnswers({});
      }
  };

  // --- TRANSLATIONS ---
  const t = {
    en: {
      title: "MND Care Portal",
      patient: "Patient", doctor: "Doctor", admin: "Administrator",
      uploadSuccess: "Report Uploaded Successfully!",
      riskLow: "Low Risk", riskMod: "Moderate Risk", riskHigh: "High Risk",
      consultTitle: "Medical Consultation Recommended",
      consultMsg: "Your symptoms indicate potential concerns. Please consult a specialist.",
      consultAction: "Top Neurologists in Karachi",
      goodNews: "Good News! You seem healthy.",
      enjoyLife: "No significant motor neuron symptoms detected.",
      login: "Login", register: "Register", welcome: "Welcome", upload: "Upload Medical Report"
    },
    ur: {
        title: "MND کیئر پورٹل",
        patient: "مریض", doctor: "ڈاکٹر", admin: "ایڈمن",
        uploadSuccess: "رپورٹ کامیابی سے اپ لوڈ ہو گئی!",
        riskLow: "کم خطرہ", riskMod: "اوسط خطرہ", riskHigh: "زیادہ خطرہ",
        consultTitle: "ڈاکٹر سے مشورہ تجویز کیا جاتا ہے",
        consultMsg: "آپ کی علامات کو دیکھتے ہوئے بہتر ہے کہ آپ ڈاکٹر سے رجوع کریں۔",
        consultAction: "کراچی میں موجود ماہرین",
        goodNews: "خوشخبری! آپ صحت مند لگ رہے ہیں۔",
        enjoyLife: "کوئی تشویشناک علامات نہیں ملیں۔",
        login: "لاگ ان", register: "رجسٹر", welcome: "خوش آمدید", upload: "رپورٹ اپ لوڈ کریں"
    }
  }[language];

  // --- QUESTIONS ---
  const allQuestions = [
    { id: "age", text: { en: "What is your age?", ur: "آپ کی عمر کیا ہے؟" }, type: "number", image: "https://media.istockphoto.com/id/164940623/photo/old-and-child.webp?a=1&b=1&s=612x612&w=0&k=20&c=8WPG_YO2BSQoQMutC4XBpZWtCj_a1YzGTZ0-ZeRRImg=" },
    { id: "gender", text: { en: "What is your gender?", ur: "آپ کی جنس کیا ہے؟" }, type: "select", options: { en: ["Male", "Female", "Other"], ur: ["مرد", "عورت", "دیگر"] }, image: "https://images.unsplash.com/photo-1545693315-85b6be26a3d6?w=500&auto=format&fit=crop&q=60" },
    { id: "ethnicity", text: { en: "What is your ethnicity?", ur: "آپ کا نسلی پس منظر کیا ہے؟" }, type: "select", options: { en: ["Asian", "White", "Other"], ur: ["ایشین", "سفید فام", "دیگر"] }, image: "https://media.istockphoto.com/id/1466442535/photo/diverse-american-faces.jpg?s=612x612&w=0&k=20&c=op5vaxRkMGyNSodAy-8RQmv2ruBOXiif-5V1c8gQ2qc=" },
    { id: "athlete", text: { en: "Are you an athlete?", ur: "کیا آپ کھلاڑی ہیں؟" }, type: "yesno", image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=500&auto=format&fit=crop&q=60" },
    { id: "muscle_weakness", text: { en: "Do you experience frequent muscle weakness?", ur: "کیا آپ کو اکثر پٹھوں کی کمزوری محسوس ہوتی ہے؟" }, mnd: true, image: "https://media.istockphoto.com/id/513435166/photo/young-man-in-a-preacher-bench-at-the-gym.webp?a=1&b=1&s=612x612&w=0&k=20&c=pmscgmdQmzj0hM4yIx7CGRkbAFc5wRY0N4NBo9y4czM=" },
    { id: "muscle_twitching", text: { en: "Do you experience muscle cramps or twitching?", ur: "کیا آپ کو پٹھوں میں کھنچاؤ یا جھٹکے لگتے ہیں؟" }, mnd: true, image: "https://media.istockphoto.com/id/2245215354/photo/businessman-suffering-back-pain-working-in-office.webp?a=1&b=1&s=612x612&w=0&k=20&c=AryMCL-WJGJaWdxuL0U9SnFn0vooVqG-Utq1_BmvT-U=", skipIf: (ans) => ans.muscle_weakness === "No" },
    { id: "muscle_stiffness", text: { en: "Do you feel stiffness in arms or legs?", ur: "کیا آپ کو بازوؤں یا ٹانگوں میں اکڑن محسوس ہوتی ہے؟" }, mnd: true, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", skipIf: (ans) => ans.muscle_weakness === "No" },
    { id: "muscle_thinning", text: { en: "Have you noticed visible muscle thinning (atrophy)?", ur: "کیا آپ نے پٹھوں کا پتلا ہونا محسوس کیا ہے؟" }, mnd: true, image: "https://zanskarhealth.in/cdn/shop/articles/Muscle_Atrophy.jpg?v=1754389682", skipIf: (ans) => ans.muscle_weakness === "No" },
    { id: "gripping", text: { en: "Do you have difficulty gripping objects?", ur: "کیا آپ کو چیزیں پکڑنے میں دشواری ہے؟" }, mnd: true, image: "https://images.unsplash.com/photo-1692659030629-6a1062e2fae6?w=500&auto=format&fit=crop&q=60", skipIf: (ans) => ans.muscle_weakness === "No" },
    { id: "difficulty_speaking", text: { en: "Do you have difficulty speaking clearly?", ur: "کیا آپ کو واضح طور پر بولنے میں دشواری होती है؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1705883064500-2fd3dfe8cb25?w=500&auto=format&fit=crop&q=60" },
    { id: "slurred_speech", text: { en: "Do you experience slurred or slow speech?", ur: "کیا آپ کی بولنے میں ہکلاہٹ ہے؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1661384366589-6ce62a232f46?w=500&auto=format&fit=crop&q=60", skipIf: (ans) => ans.difficulty_speaking === "No" },
    { id: "swallowing", text: { en: "Do you face problems while swallowing food?", ur: "کیا آپ کو کھانا نگلنے میں مسئلہ ہے؟" }, mnd: true, image: "https://marvel-b1-cdn.bc0a.com/f00000000290269/www.riversideonline.com/-/media/patients-and-visitors/healthy-you/hy-trouble-swallowing.jpg", skipIf: (ans) => ans.difficulty_speaking === "No" },
    { id: "walking_balance", text: { en: "Do you experience difficulty walking or balancing?", ur: "کیا آپ کو چلنے یا توازن برقرار رکھنے میں دشواری ہے؟" }, mnd: true, image: "https://media.istockphoto.com/id/1139743426/photo/male-nurse-helping-senior-man-walk-with-walking-frame.jpg?s=612x612&w=0&k=20&c=YObLxMq7f6Es0gBkO1hj1WHZtl0if7pNwcsnTaIs8m0=" },
    { id: "fatigue", text: { en: "Do you feel unusual fatigue?", ur: "کیا آپ کو غیر معمولی تھکاوٹ محسوس ہوتی ہے؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1665203627191-49b3fde12d98?w=500&auto=format&fit=crop&q=60" },
    { id: "excessive_sleep", text: { en: "Do you sleep excessively?", ur: "کیا آپ بہت زیادہ سوتے ہیں؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1682090466454-11f56a0b0e76?w=500&auto=format&fit=crop&q=60" },
    { id: "covid", text: { en: "Have you ever had COVID-19?", ur: "کیا آپ کو کبھی کووڈ-19 ہوا ہے؟" }, mnd: false, type: "yesno", image: "https://plus.unsplash.com/premium_photo-1661526594984-8b977c7db667?w=500&auto=format&fit=crop&q=60" },
  ];

  const questions = useMemo(() => allQuestions.filter(q => !q.skipIf || !q.skipIf(answers)), [answers]);

  // HANDLERS
  const handleAnswer = (value) => {
    if (questions[step].id === "age") {
        if (value === "" || isNaN(value)) {
            alert("Please enter a valid number.");
            return;
        }
        if (parseInt(value) <= 0) {
            alert("Age must be greater than 0.");
            return;
        }
        if (parseInt(value) > 120) {
            alert("Please enter a realistic age.");
            return;
        }
    }

    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const yesCount = Object.entries(newAnswers).filter(([id, v]) => allQuestions.find(q => q.id === id)?.mnd && v === "Yes").length;
      const result = yesCount >= 3 ? t.riskHigh : (yesCount >= 1 ? t.riskMod : t.riskLow);
      setRiskLevel(result);
      if(result === t.riskLow) {
          alert(t.goodNews);
          setView("portal_select"); setStep(0); setAnswers({});
      } else {
          setView("auth"); setAuthMode("register");
      }
    }
  };

  const handleAuth = async () => {
    setIsLoading(true); setErrorMsg("");
    const emailToUse = authMode === "login" ? loginEmail : email;
    const passwordToUse = authMode === "login" ? loginPassword : password;
    
    if (authMode === "register" && passwordToUse.length < 8) {
        setErrorMsg("Password must be at least 8 characters"); setIsLoading(false); return;
    }
    try {
        const endpoint = authMode === "login" ? "/login" : "/register";
        const payload = authMode === "login" ? { email: loginEmail, password: loginPassword } 
            : { full_name: name, email: email, password: password, role: selectedRole, hospital: hospitalName };

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed");

        if (authMode === "register") {
            const templateParams = {
                to_name: name,
                to_email: email,
                message: "Thank you for registering with NeuroGuard AI."
            };
            emailjs.send(SERVICE_ID, TEMPLATE_ID_REGISTER, templateParams, PUBLIC_KEY);
            if (selectedRole === "patient") await saveScreeningToBackend(data.user.email);
        }

        setCurrentUser({ ...data.user });
        setView(data.user.role === "admin" ? "admin_dashboard" : data.user.role === "doctor" ? "doctor_dashboard" : "patient_dashboard");
    } catch (err) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
      if(!forgotEmail) return alert("Please enter email");
      setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/forgot-password`, {
              method: "POST", headers: {"Content-Type": "application/json"},
              body: JSON.stringify({email: forgotEmail})
          });
          if(res.ok) { 
              const templateParams = { to_email: forgotEmail, reset_link: "http://localhost:3000/reset-password-demo" };
              await emailjs.send(SERVICE_ID, TEMPLATE_ID_RESET, templateParams, PUBLIC_KEY);
              alert("Password reset link sent!"); setShowForgotModal(false); 
          }
          else alert("Email not found");
      } catch(e) { alert("Error sending email"); } finally { setIsLoading(false); }
  };

  const saveScreeningToBackend = async (userEmail) => {
    try {
        await fetch(`${API_URL}/submit-screening`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, risk_level: riskLevel, answers: answers })
        });
    } catch(e) { console.error("Screening save failed", e); }
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
      } catch (err) { alert("Upload failed"); } finally { setIsLoading(false); }
  };

  const sendAppointmentEmail = async () => {
      setIsLoading(true);
      const templateParams = {
          to_email: selectedPatient.email,
          to_name: selectedPatient.name,
          doctor_name: currentUser.name,
          date_time: appointDate,
          message: appointMsg
      };
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_APPOINT, templateParams, PUBLIC_KEY);
        alert(`Appointment Sent to ${selectedPatient.email}`);
        setModalType(null);
      } catch(e) { alert("Failed to send email."); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
      setCurrentUser(null); setView("portal_select"); setStep(0); setUploadAnalysis(null); setAnswers({});
  };
  
  // --- UI RENDER ---
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans text-slate-800 bg-slate-50 selection:bg-blue-200">
      
      {/* BACKGROUND (Enhanced Visuals) */}
      <div className="absolute inset-0 z-0">
        {/* Soft gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/70 to-emerald-50/80 z-10 backdrop-blur-[3px]"></div>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80" alt="Medical BG" className="w-full h-full object-cover opacity-60"/>
      </div>

      <div className="relative z-20 w-full max-w-7xl animate-in fade-in duration-700">
        
        {/* HEADER (Glassmorphism) */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg border border-white/40 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center mb-8 sticky top-4 z-50">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
                  <BrainCircuit className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">
                    Neuro<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Guard</span> AI
                </h1>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Advanced MND Detection System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
                {currentUser && (
                    <div className="hidden md:flex flex-col text-right mr-2 bg-white/50 px-4 py-1 rounded-lg border border-white/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as</span>
                        <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                    </div>
                )}

                {view !== "portal_select" && (
                    <button 
                        onClick={handleGlobalBack} 
                        className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95 ${
                            currentUser 
                            ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/30" 
                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        {currentUser ? <><LogOut className="h-4 w-4"/> Logout</> : <><Home className="h-4 w-4"/> Home</>}
                    </button>
                )}

                <button onClick={() => setLanguage(language === "en" ? "ur" : "en")} className="flex items-center gap-1.5 text-sm font-bold text-blue-700 bg-blue-50/80 px-4 py-2.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                    <Globe className="h-4 w-4" /> {language === "en" ? "اردو" : "English"}
                </button>
            </div>
        </div>

        {/* --- PORTAL SELECT (Visual Cards) --- */}
        {view === "portal_select" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                    <div className="space-y-4">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-200">
                            AI-Powered Healthcare
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
                            Future of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500">MND Care</span>
                        </h1>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
                    We provide early detection, secure reporting, and direct doctor connectivity!!.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                        <div className="w-4 h-1 bg-slate-300 rounded-full"></div>
                        <div className="w-4 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 animate-in slide-in-from-right duration-700 delay-100">
                    {[
                        { id: "patient", icon: User, title: "Patient Portal", desc: "Screening & AI Report Upload", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
                        { id: "doctor", icon: Stethoscope, title: "Doctor Portal", desc: "Manage Patients & Appointments", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
                        { id: "admin", icon: ShieldCheck, title: "Admin Control", desc: "System Oversight & Analytics", color: "from-purple-500 to-indigo-500", bg: "bg-purple-50" }
                    ].map((role) => (
                        <div key={role.id} onClick={() => { setSelectedRole(role.id); setView(role.id === "patient" ? "screening" : "auth"); setAuthMode("login"); }} 
                             className={`group relative bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/60 cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl`}>
                            
                            <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${role.color}`}></div>
                            
                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`p-4 rounded-2xl ${role.bg} text-slate-700 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                    <role.icon className="h-8 w-8"/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{role.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{role.desc}</p>
                                </div>
                                <div className="ml-auto bg-slate-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight className="h-5 w-5"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SCREENING (Glass Card) --- */}
        {view === "screening" && (
             <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-5xl mx-auto border border-white/60 animate-in zoom-in-95 duration-500">
                <button onClick={() => setView("portal_select")} className="text-xs font-bold text-slate-400 mb-8 flex items-center gap-2 hover:text-slate-700 transition-colors"><ArrowLeft className="h-4 w-4"/> BACK TO MENU</button>
                
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-full md:w-1/2 relative group">
                        <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform"></div>
                        <img src={questions[step].image} className="relative w-full h-80 object-cover rounded-3xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500" alt="Q" />
                    </div>
                    
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-6">
                             <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                                Question {step + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
                             </span>
                             <div className="h-2.5 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out" style={{width: `${((step+1)/questions.length)*100}%`}}></div>
                             </div>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-black mb-8 text-slate-800 leading-tight tracking-tight">{questions[step].text[language]}</h2>
                        
                        <div className="space-y-4">
                            {questions[step].type === "number" && (
                                <input type="number" onKeyDown={(e)=> e.key === 'Enter' && handleAnswer(e.target.value)} 
                                className="w-full p-6 border-2 border-slate-200 rounded-2xl text-3xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white/50 transition-all placeholder:text-slate-300" 
                                placeholder="Enter number..." autoFocus />
                            )}
                            
                            {questions[step].type === "select" && questions[step].options[language].map(opt => (
                                <button key={opt} onClick={()=>handleAnswer(opt)} 
                                className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50/50 font-bold text-slate-700 transition-all text-lg shadow-sm hover:shadow-md hover:translate-x-2 flex justify-between group">
                                    {opt} <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"/>
                                </button>
                            ))}
                            
                            {(!questions[step].type || questions[step].type === "yesno") && (
                                <>
                                    {["Yes", "Sometimes", "No"].map(opt => {
                                        if(questions[step].type === "yesno" && opt === "Sometimes") return null;
                                        const colorClass = opt === "Yes" ? "hover:bg-red-50 hover:border-red-500 hover:text-red-600" 
                                            : opt === "No" ? "hover:bg-green-50 hover:border-green-500 hover:text-green-600" 
                                            : "hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-600";
                                        
                                        return (
                                            <button key={opt} onClick={()=>handleAnswer(opt)} 
                                            className={`w-full p-5 border-2 border-slate-100 bg-white rounded-2xl font-bold transition-all text-lg shadow-sm ${colorClass} group flex justify-between items-center`}>
                                                {opt}
                                                <div className={`w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-current flex items-center justify-center`}>
                                                    <div className="w-3 h-3 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- AUTH --- */}
        {view === "auth" && (
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
                <button onClick={() => setView("portal_select")} className="text-xs font-bold text-slate-400 mb-8 flex items-center gap-1 hover:text-blue-600"><ArrowLeft className="h-3 w-3"/> BACK</button>
                <div className="mb-8">
                    <h2 className="text-4xl font-black text-slate-800 mb-2 capitalize tracking-tight">{selectedRole} Access</h2>
                    <p className="text-slate-500 font-medium">Please authenticate to continue.</p>
                </div>
                
                <div className="space-y-5">
                    {authMode === "register" && (
                        <>
                            <div className="relative">
                                <User className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                                <input className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} />
                            </div>
                            {selectedRole === "doctor" && (
                                <div className="relative">
                                    <Hospital className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                                    <input className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all" placeholder="Hospital / Department" value={hospitalName} onChange={e=>setHospitalName(e.target.value)} />
                                </div>
                            )}
                        </>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                        <input className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all" placeholder="Email Address" type="email" value={authMode==="login"?loginEmail:email} onChange={e=> authMode==="login"?setLoginEmail(e.target.value):setEmail(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                        <input className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all" placeholder="Password" type="password" value={authMode==="login"?loginPassword:password} onChange={e=> authMode==="login"?setLoginPassword(e.target.value):setPassword(e.target.value)} />
                    </div>
                    
                    {errorMsg && <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-sm font-bold text-center animate-pulse">{errorMsg}</div>}
                    
                    <button onClick={handleAuth} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center active:scale-95">
                        {isLoading ? <Loader2 className="animate-spin"/> : (authMode==="login"?"Secure Login":"Create Account")}
                    </button>
                    
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode === "login" ? "New User? Register" : "Login Instead"}</p>
                        {authMode === "login" && <p className="text-xs font-bold text-red-400 cursor-pointer hover:text-red-600 transition-colors" onClick={()=>setShowForgotModal(true)}>Forgot Password?</p>}
                    </div>
                </div>
            </div>
        )}

        {/* --- PATIENT DASHBOARD --- */}
        {view === "patient_dashboard" && (
            <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
                {!uploadAnalysis ? (
                    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                        <div className="p-12 md:w-2/3">
                            <div className="mb-8">
                                <h2 className="text-4xl font-black text-slate-900 mb-3">Upload Medical Report</h2>
                                <p className="text-slate-500 text-lg">Upload MRI, EMG, or Blood Reports for AI Analysis.</p>
                            </div>
                            
                            <label className={`block border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${selectedFile ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"}`}>
                                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20"/>
                                <div className="relative z-10 transition-transform group-hover:scale-110 duration-300">
                                    <div className="bg-white p-4 rounded-full shadow-lg w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                        <FileText className={`h-10 w-10 ${selectedFile ? "text-blue-600" : "text-slate-400"}`}/>
                                    </div>
                                    <p className={`font-bold text-lg ${selectedFile ? "text-blue-700" : "text-slate-700"}`}>{selectedFile ? selectedFile.name : "Click or Drag File Here"}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-semibold">PDF, JPG, PNG (Max 10MB)</p>
                                </div>
                            </label>

                            <button onClick={handleFileUpload} disabled={!selectedFile || isLoading} 
                                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-500/20 flex justify-center gap-3 items-center hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? <><Loader2 className="animate-spin h-6 w-6"/> Analyzing...</> : <><BrainCircuit className="h-6 w-6"/> Run AI Analysis</>}
                            </button>
                        </div>
                        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-12 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="relative z-10">
                                <ShieldCheck className="h-16 w-16 mb-6 opacity-90"/>
                                <h3 className="text-2xl font-bold mb-2">Secure & Private</h3>
                                <p className="text-blue-100 opacity-80 leading-relaxed">Your medical data is encrypted end-to-end. Only you and authorized doctors can access it.</p>
                            </div>
                            <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]"></div>
                                    <span className="font-bold tracking-wide text-sm">AI SYSTEM ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className={`p-10 rounded-[2rem] shadow-2xl bg-white border-4 ${uploadAnalysis.risk === "High Risk" ? "border-red-100" : "border-green-100"}`}>
                            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                                <div className={`p-6 rounded-full shadow-lg ${uploadAnalysis.risk === "High Risk" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                    {uploadAnalysis.risk === "High Risk" ? <AlertTriangle className="h-16 w-16"/> : <Smile className="h-16 w-16"/>}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">Analysis Complete</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Risk Assessment:</span>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest ${uploadAnalysis.risk === "High Risk" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-green-500 text-white shadow-lg shadow-green-500/30"}`}>
                                            {uploadAnalysis.risk}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BrainCircuit className="h-4 w-4"/> AI Generated Summary
                                </h3>
                                <p className="text-slate-700 font-medium leading-loose text-lg">{uploadAnalysis.summary}</p>
                            </div>
                            
                            {/* HOSPITAL LIST */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
                                <h3 className="text-blue-900 font-bold mb-6 flex items-center gap-2 text-lg">
                                    <Hospital className="h-6 w-6 text-blue-600"/> Recommended Specialists in Karachi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {karachiHospitals.map((h,i) => (
                                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-blue-100/50 flex justify-between items-center group">
                                            <div>
                                                <p className="font-bold text-slate-800">{h.doctor}</p>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{h.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{h.address}</p>
                                                <p className="text-xs text-blue-600 font-bold mt-2">{h.contact}</p>
                                            </div>
                                            <a href={`tel:${h.contact}`} className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <Phone className="h-5 w-5"/>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                             <button onClick={()=>setUploadAnalysis(null)} className="w-full mt-6 py-4 text-slate-400 text-sm font-bold hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                Upload Another Report
                             </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- DOCTOR DASHBOARD --- */}
        {view === "doctor_dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Queue</p>
                        <h2 className="text-5xl font-black">{doctorPatients.length}</h2>
                        <p className="text-sm text-emerald-100 mt-2 opacity-80">Pending Consultations</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                            <Activity className="text-blue-500"/> Patient Queue
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-6">Patient Details</th>
                                    <th className="p-6">AI Assessment</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {doctorPatients.map((p, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-800 text-base">{p.name}</div>
                                            <div className="text-xs text-slate-400 font-semibold">{p.email}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                                                p.risk === "High Risk" ? "bg-red-100 text-red-600" : 
                                                p.risk === "Moderate Risk" ? "bg-orange-100 text-orange-600" : 
                                                p.risk === "Pending" ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-600"
                                            }`}>
                                                {p.risk}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm font-medium text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="p-6 flex gap-3 justify-end">
                                            <button onClick={()=>{setSelectedPatient(p); setModalType('view_report')}} 
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                                                View Report
                                            </button>
                                            <button onClick={()=>{setSelectedPatient(p); setModalType('appointment')}} 
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all shadow-md">
                                                Book
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {view === "admin_dashboard" && adminStats && (
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Patients</p>
                       <p className="text-4xl font-black text-slate-800">{adminStats.total_patients}</p>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Doctors</p>
                       <p className="text-4xl font-black text-blue-600">{adminStats.total_doctors}</p>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 hover:shadow-xl transition-all relative overflow-hidden">
                       <div className="absolute right-0 top-0 w-20 h-20 bg-red-50 rounded-full -mr-5 -mt-5"></div>
                       <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 relative z-10">High Risk</p>
                       <p className="text-4xl font-black text-red-500 relative z-10">{adminStats.high_risk_cases}</p>
                   </div>
                </div>

                {/* USER MANAGEMENT */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Users className="h-5 w-5 text-slate-400"/> User Database</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-5">Name / Identity</th>
                                    <th className="p-5">System Role</th>
                                    <th className="p-5">Details</th>
                                    <th className="p-5 text-right">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {allUsers.map((u, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-5">
                                            <div className="font-bold text-slate-700 text-base">{u.name || u.full_name}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{u.role}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-slate-500 font-medium">{u.email}</div>
                                            {u.hospital && <div className="text-xs font-bold text-emerald-600 mt-1">{u.hospital}</div>}
                                        </td>
                                        <td className="p-5 flex gap-2 justify-end">
                                            <button onClick={() => { setEditingUser(u); setModalType('edit_user'); }} 
                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit className="h-4 w-4" /></button>
                                            <button onClick={() => handleDeleteUser(u.id)} 
                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODALS (Glass & Rounded) --- */}
        {/* 1. FORGOT PASSWORD */}
        {showForgotModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 scale-100 animate-in zoom-in-95">
                    <h3 className="font-black text-2xl mb-2 text-slate-800">Reset Password</h3>
                    <p className="text-slate-500 text-sm mb-6">Enter your email to receive a reset link.</p>
                    <input type="email" className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl mb-4 font-bold text-slate-700 focus:border-blue-500 outline-none" placeholder="name@example.com" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)}/>
                    <div className="flex gap-3">
                         <button onClick={()=>setShowForgotModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors">Cancel</button>
                         <button onClick={handleForgotPassword} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all">Send Link</button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. GENERIC MODAL */}
        {modalType && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-xl capitalize text-slate-800">{modalType.replace('_', ' ')}</h3>
                        <button onClick={()=>{setModalType(null); setEditingUser(null);}} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6"/></button>
                    </div>
                    
                    <div className="p-8">
                        {modalType === 'view_report' && selectedPatient && (
                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">AI Analysis Summary</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedPatient.summary}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm"><FileText className="h-5 w-5 text-red-500"/></div>
                                        <span className="text-sm font-bold text-slate-700">Original Medical Report</span>
                                    </div>
                                    {selectedPatient.report_url ? 
                                        <a href={selectedPatient.report_url} target="_blank" download 
                                        className="flex items-center gap-2 text-xs bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-black transition-all shadow-md">
                                            <Download className="h-3 w-3"/> Download
                                        </a> 
                                        : <span className="text-xs font-bold text-red-400 bg-red-50 px-3 py-1 rounded-lg">Not Available</span>}
                                </div>
                            </div>
                        )}

                        {modalType === 'appointment' && (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Date & Time</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                                        <input type="datetime-local" className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none" onChange={e=>setAppointDate(e.target.value)}/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Message to Patient</label>
                                    <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 h-32 focus:border-blue-500 outline-none resize-none" placeholder="Write your message here..." onChange={e=>setAppointMsg(e.target.value)}></textarea>
                                </div>
                                <button onClick={sendAppointmentEmail} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 flex justify-center gap-2 transition-all">
                                    {isLoading ? <Loader2 className="animate-spin"/> : <><Mail className="h-5 w-5"/> Send Confirmation</>}
                                </button>
                            </div>
                        )}

                        {modalType === 'edit_user' && editingUser && (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
                                    <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700" value={editingUser.name || editingUser.full_name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">System Role</label>
                                    <div className="relative">
                                        <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 appearance-none" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})}>
                                            <option value="patient">Patient</option><option value="doctor">Doctor</option><option value="admin">Admin</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-4 h-5 w-5 text-slate-400 rotate-90"/>
                                    </div>
                                </div>
                                <button onClick={handleUpdateUser} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex justify-center gap-2 transition-all">
                                    <Save className="h-5 w-5"/> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}