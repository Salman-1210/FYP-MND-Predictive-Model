///authforn
import { useState } from "react";
import { ArrowLeft, User, Hospital, Mail, Lock, Loader2, CheckCircle2, Stethoscope, BadgeCheck, ShieldAlert, HeartPulse, Sparkles } from "lucide-react";
import { ALL_QUESTIONS } from "../app/utils/constants";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

export default function AuthForm(props) {
  const { 
    authMode, setAuthMode, setView, selectedRole, 
    name, setName, hospitalName, setHospitalName,
    loginEmail, setLoginEmail, email, setEmail,
    loginPassword, setLoginPassword, password, setPassword,
    specialty, setSpecialty, 
    licenseId, setLicenseId,
    isLoading, errorMsg, handleAuth, setShowForgotModal,
    answers 
  } = props;

  // --- PRIVACY POLICY GATE (Register only) ---
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- UNIVERSAL PASSWORD VALIDATOR ---
  const currentPassword = authMode === "login" ? loginPassword : password;
  const isPasswordValid = currentPassword.length >= 8;

  // --- SCORING LOGIC (Kept Intact) ---
  const getRiskData = () => {
    // Logic updated: Only show risk data if answers exist AND it's a patient registration
    if (authMode !== "register" || selectedRole !== "patient" || !answers || Object.keys(answers).length === 0) return null;
    
    let score = 0;
    ALL_QUESTIONS.forEach(q => {
      if (q.mnd && answers[q.id]) {
        if (answers[q.id] === "Yes") score += 2;
        if (answers[q.id] === "Sometimes") score += 1;
      }
    });

    if (score >= 6) return { 
        level: "High Risk", 
        color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
        icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
        msg: "Our AI analysis has noted some significant indicators. Don't worry, early detection is key to better management. Please register so our specialists can review your case."
    };
    if (score >= 3) return { 
        level: "Moderate Risk", 
        color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
        icon: <HeartPulse className="h-8 w-8 text-orange-500" />,
        msg: "Your results show some mild irregularities. It's best to keep a professional eye on this. Register now to track your health patterns with our medical team."
    };
    return { 
        level: "Low Risk", 
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
        icon: <Sparkles className="h-8 w-8 text-emerald-500" />,
        msg: "Great news! Your responses show no significant motor neuron concerns. Stay active, stay healthy, and keep enjoying your life to the fullest!"
    };
  };

  const riskData = getRiskData();
  const isLowRisk = riskData?.level === "Low Risk";

  // --- FINAL BUTTON GATE ---
  // Registration additionally requires the privacy policy checkbox to be ticked.
  const isSubmitDisabled =
    isLoading ||
    !isPasswordValid ||
    (authMode === "register" && !agreedToPolicy);

  // 🔒 SECURITY: Admin portal mein register mode allow nahi hai
  if (selectedRole === "admin" && authMode === "register") {
    setAuthMode("login");
  }

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* 1. DUMMY INPUTS PREVENT AUTOFILL */}
      <div style={{ opacity: 0, position: 'absolute', height: 0, overflow: 'hidden', zIndex: -1 }}>
        <input type="text" name="fake_email_prevent_autofill" tabIndex="-1" />
        <input type="password" name="fake_password_prevent_autofill" tabIndex="-1" />
      </div>

      <button onClick={() => setView("portal_select")} className="text-xs font-bold text-slate-400 mb-8 flex items-center gap-1 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-3 w-3"/> BACK TO PORTAL
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
           <h2 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{selectedRole}</h2>
           {selectedRole === 'doctor' && <BadgeCheck className="text-blue-500 h-6 w-6" />}
        </div>
        <p className="text-slate-500 font-medium">
          {authMode === "login" ? "Welcome back! Please login." : "Official medical access portal."}
        </p>
      </div>

      {/* --- DYNAMIC RISK ASSESSMENT VIEW (Shows if screening done) --- */}
      {riskData && (
        <div className={`mb-8 p-5 rounded-3xl border-2 ${riskData.bg} ${riskData.border} animate-in zoom-in-95 duration-500`}>
          <div className="flex items-center gap-3 mb-2">
            {riskData.icon}
            <h3 className={`text-lg font-black uppercase tracking-tight ${riskData.color}`}>{riskData.level} Detected</h3>
          </div>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">{riskData.msg}</p>
        </div>
      )}
      
      <div className="space-y-5">
        {authMode === "register" && (
          <>
            {/* If screening done and risk is low, show back button. Otherwise, show form. */}
            {isLowRisk ? (
              <button onClick={() => setView("portal_select")} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
                Back to Home Page
              </button>
            ) : (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                  <input 
                    className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    autoComplete="off"
                  />
                </div>

                {selectedRole === "doctor" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <Stethoscope className="absolute left-4 top-4 h-5 w-5 text-slate-400 z-10"/>
                      <select className="w-full pl-12 p-4 bg-blue-50/50 rounded-xl border border-blue-100 focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                        <option value="" disabled>Select Your Specialty</option>
                        <option value="General Physician">General Physician (GP)</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Physiotherapist">Physiotherapist</option>
                      </select>
                    </div>
                    <div className="relative">
                      <BadgeCheck className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                      <input 
                        className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700" 
                        placeholder="License ID (e.g. PMC-12345)" 
                        value={licenseId} 
                        onChange={e=>setLicenseId(e.target.value)} 
                        autoComplete="off"
                      />
                    </div>
                    <div className="relative">
                      <Hospital className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                      <input 
                        className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700" 
                        placeholder="Hospital Name" 
                        value={hospitalName} 
                        onChange={e=>setHospitalName(e.target.value)} 
                        autoComplete="off"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Form fields visibility logic: Hide if it's low risk registration */}
        {(!isLowRisk || authMode === "login") && (
          <>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
              <input 
                className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700" 
                placeholder="Email Address" 
                type="email" 
                value={authMode==="login"?loginEmail:email} 
                onChange={e=> authMode==="login"?setLoginEmail(e.target.value):setEmail(e.target.value)} 
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
              <input 
                className={`w-full pl-12 p-4 bg-slate-50 rounded-xl border ${currentPassword.length > 0 && currentPassword.length < 8 ? "border-red-300 bg-red-50/20" : "border-slate-200"} focus:border-blue-500 outline-none font-bold text-slate-700 transition-all`} 
                placeholder="Password" 
                type="password" 
                value={authMode==="login"?loginPassword:password} 
                onChange={e=> authMode==="login"?setLoginPassword(e.target.value):setPassword(e.target.value)} 
                autoComplete="new-password"
              />
              {currentPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-2 ml-2">
                  {isPasswordValid ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                  )}
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isPasswordValid ? "text-emerald-600" : "text-red-400"}`}>
                    {isPasswordValid ? "Password Strength: Secure" : "Security minimum: 8 characters required"}
                  </p>
                </div>
              )}
            </div>

            {/* --- PRIVACY POLICY CONSENT (Register only, Google-style inline link) --- */}
            {authMode === "register" && (
              <label className="flex items-start gap-3 px-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600 cursor-pointer rounded"
                />
                <span className="text-xs font-bold text-slate-500 leading-relaxed">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                  >
                    Privacy Policy and Terms of Service
                  </button>
                </span>
              </label>
            )}
            
            {errorMsg && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold text-center">{errorMsg}</div>}
            
            <button 
              onClick={handleAuth} 
              disabled={isSubmitDisabled} 
              className={`w-full font-bold py-4 rounded-xl shadow-lg flex justify-center group transition-all active:scale-95 ${
                !isSubmitDisabled 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin"/> : (
                <span className="flex items-center gap-2">
                   {authMode==="login" ? "Secure Login" : "Start Medical Journey"}
                </span>
              )}
            </button>
          </>
        )}
        
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
          {/* Show Register/Login toggle only if not low risk screen AND not admin portal */}
          {!isLowRisk && selectedRole !== "admin" && (
            <p className="text-xs font-bold text-slate-400 cursor-pointer hover:text-blue-600" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>
              {authMode === "login" ? "New User? Register" : "Have an account? Login"}
            </p>
          )}
          {authMode === "login" && <p className="text-xs font-bold text-red-400 cursor-pointer hover:text-red-600" onClick={()=>setShowForgotModal(true)}>Forgot Password?</p>}
        </div>
      </div>

      <PrivacyPolicyModal open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}
