"use client";
import { useState } from "react";
import { 
  Loader2, ArrowLeft, Mail, Lock, 
  User, Hospital, ShieldCheck, Stethoscope 
} from "lucide-react";

export default function AuthScreen({ API_URL, role, setCurrentUser, setView }) {
  // Mode toggle between 'login' and 'register'
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hospital: ""
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Backend endpoint logic
    const endpoint = mode === "login" ? "/login" : "/register";
    
    // Payload preparation
    const payload = mode === "login" 
      ? { email: formData.email, password: formData.password }
      : { 
          full_name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: role, 
          hospital: formData.hospital 
        };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data.user);
        // Redirect to specific dashboard based on role
        setView(`${data.user.role}_dashboard`);
      } else {
        setError(data.detail || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Server is not responding. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white animate-in slide-in-from-bottom-10">
      {/* Back Button */}
      <button 
        onClick={() => setView("portal_select")} 
        className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14}/> BACK TO MAIN MENU
      </button>

      {/* Role Icon & Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          {role === 'patient' ? (
            <User size={20}/>
          ) : role === 'doctor' ? (
            <Stethoscope size={20}/>
          ) : (
            <ShieldCheck size={20}/>
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-800 capitalize">
          {role} {mode}
        </h2>
      </div>
      <p className="text-slate-500 text-sm mb-8">
        Enter your secure credentials to access the NeuroGuard portal.
      </p>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === "register" && (
          <>
            <div className="relative">
              <User className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
              <input 
                required
                className="w-full pl-10 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            {role === "doctor" && (
              <div className="relative">
                <Hospital className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                <input 
                  required
                  className="w-full pl-10 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" 
                  placeholder="Hospital / Clinic Name" 
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                />
              </div>
            )}
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
          <input 
            required
            type="email"
            className="w-full pl-10 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
          <input 
            required
            type="password"
            className="w-full pl-10 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" 
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            mode === "login" ? "Secure Login" : "Create Account"
          )}
        </button>

        <div className="flex justify-center mt-6">
          <p 
            onClick={() => setMode(mode === "login" ? "register" : "login")} 
            className="text-xs font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {mode === "login" 
              ? "New to NeuroGuard? Create an account" 
              : "Already have an account? Login here"
            }
          </p>
        </div>
      </form>
    </div>
  );
}