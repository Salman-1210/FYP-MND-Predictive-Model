import { ArrowLeft, User, Hospital, Mail, Lock, Loader2, CheckCircle2, Stethoscope, BadgeCheck } from "lucide-react";

export default function AuthForm(props) {
  const { 
    authMode, setAuthMode, setView, selectedRole, 
    name, setName, hospitalName, setHospitalName,
    loginEmail, setLoginEmail, email, setEmail,
    loginPassword, setLoginPassword, password, setPassword,
    specialty, setSpecialty, 
    licenseId, setLicenseId,
    isLoading, errorMsg, handleAuth, setShowForgotModal
  } = props;

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
      <button onClick={() => setView("portal_select")} className="text-xs font-bold text-slate-400 mb-8 flex items-center gap-1 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-3 w-3"/> BACK TO PORTAL
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
           <h2 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{selectedRole}</h2>
           {selectedRole === 'doctor' && <BadgeCheck className="text-blue-500 h-6 w-6" />}
        </div>
        <p className="text-slate-500 font-medium">
          {authMode === "login" ? "Welcome back! Please login." : "Register for official medical access."}
        </p>
      </div>
      
      <div className="space-y-5">
        {authMode === "register" && (
          <>
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
              <input 
                className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" 
                placeholder="Full Name" 
                value={name} 
                autoComplete="off"
                onChange={e=>setName(e.target.value)} 
              />
            </div>

            {selectedRole === "doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-4 h-5 w-5 text-slate-400 z-10"/>
                  <select 
                    className="w-full pl-12 p-4 bg-blue-50/50 rounded-xl border border-blue-100 focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="" disabled>Select Your Specialty</option>
                    <option value="General Physician">General Physician (GP)</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                    <option value="Speech Therapist">Speech Therapist</option>
                  </select>
                </div>

                <div className="relative">
                  <BadgeCheck className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                  <input 
                    className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" 
                    placeholder="Medical License ID (e.g. PMC-12345)" 
                    value={licenseId} 
                    autoComplete="off"
                    onChange={e=>setLicenseId(e.target.value)} 
                  />
                  <p className="text-[9px] text-slate-400 mt-1 ml-2 font-bold uppercase tracking-wider italic">* Admin will verify this ID</p>
                </div>

                <div className="relative">
                  <Hospital className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
                  <input 
                    className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" 
                    placeholder="Hospital Name / Clinic" 
                    value={hospitalName} 
                    autoComplete="off"
                    onChange={e=>setHospitalName(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* --- EMAIL FIELD (Updated with Autofill Fix) --- */}
        <div className="relative">
          <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
          <input 
            className="w-full pl-12 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" 
            placeholder="Email Address" 
            type="email" 
            name={`${selectedRole}_email`} // Role specific name
            autoComplete="off" 
            value={authMode==="login"?loginEmail:email} 
            onChange={e=> authMode==="login"?setLoginEmail(e.target.value):setEmail(e.target.value)} 
          />
        </div>

        {/* --- PASSWORD FIELD (Updated with Autofill Fix) --- */}
        <div className="relative">
          <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400"/>
          <input 
            className={`w-full pl-12 p-4 bg-slate-50 rounded-xl border ${
              authMode === "register" && password.length > 0 && password.length < 8 
                ? "border-red-300 bg-red-50/30" 
                : "border-slate-200"
            } focus:border-blue-500 outline-none font-bold text-slate-700 transition-all`} 
            placeholder="Password" 
            type="password" 
            name={`${selectedRole}_password`} // Role specific name
            autoComplete="new-password" // Prevents browser from filling saved passwords
            value={authMode==="login"?loginPassword:password} 
            onChange={e=> authMode==="login"?setLoginPassword(e.target.value):setPassword(e.target.value)} 
          />
          
          {authMode === "register" && (
            <div className="flex items-center gap-1.5 mt-2 ml-2">
               {password.length >= 8 ? (
                 <CheckCircle2 className="h-3 w-3 text-emerald-500" />
               ) : (
                 <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
               )}
               <p className={`text-[10px] font-bold uppercase tracking-wider ${
                 password.length >= 8 ? "text-emerald-600" : "text-slate-400"
               }`}>
                 {password.length >= 8 ? "Password Strength: Secure" : "Minimum 8 characters required"}
               </p>
            </div>
          )}
        </div>
        
        {errorMsg && <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-sm font-bold text-center animate-pulse">{errorMsg}</div>}
        
        <button onClick={handleAuth} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:shadow-2xl text-white font-bold py-4 rounded-xl transition-all flex justify-center active:scale-95 group">
          {isLoading ? <Loader2 className="animate-spin"/> : (
            <span className="flex items-center gap-2">
               {authMode==="login" ? "Secure Login" : "Submit for Verification"}
               <BadgeCheck className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all ${selectedRole === 'doctor' ? 'block' : 'hidden'}`} />
            </span>
          )}
        </button>
        
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
          {selectedRole !== "admin" ? (
            <p className="text-xs font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>
              {authMode === "login" ? "New Medical User? Register" : "Already have an account? Login"}
            </p>
          ) : (
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Admin Authorization Only</div> 
          )}
          {authMode === "login" && <p className="text-xs font-bold text-red-400 cursor-pointer hover:text-red-600 transition-colors" onClick={()=>setShowForgotModal(true)}>Forgot Password?</p>}
        </div>
      </div>
    </div>
  );
}