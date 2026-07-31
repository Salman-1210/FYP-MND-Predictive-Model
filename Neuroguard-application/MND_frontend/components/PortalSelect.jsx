//portalselect
import { User, Stethoscope, ShieldCheck, ChevronRight, Activity, Shield, Zap } from "lucide-react";

export default function PortalSelect({ setView, setSelectedRole, setAuthMode }) {
  const roles = [
    { 
      id: "patient", 
      icon: User, 
      title: "Patient Portal", 
      desc: "Screening & Clinical Routing", 
      color: "from-blue-600 to-cyan-500", 
      bg: "bg-blue-50/50" 
    },
    { 
      id: "doctor", 
      icon: Stethoscope, 
      title: "Doctor Portal", 
      desc: "Diagnostic Queue & Analysis", 
      color: "from-emerald-600 to-teal-500", 
      bg: "bg-emerald-50/50" 
    },
    { 
      id: "admin", 
      icon: ShieldCheck, 
      title: "Admin Control", 
      desc: "System Management & Oversight", 
      color: "from-indigo-600 to-purple-500", 
      bg: "bg-indigo-50/50" 
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto py-12">
      
      {/* ── LEFT SIDE: BRANDING ── */}
      <div className="space-y-8 animate-in slide-in-from-left duration-700">
        <div className="space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-700 text-[10px] font-black uppercase tracking-[0.25em] border border-blue-200/50 backdrop-blur-sm inline-flex items-center gap-2">
            <Zap size={12} className="fill-blue-600" />
            Advanced Neuro-Diagnostic Protocol
          </span>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-medical-3d">
            Future of <br/>
            <span className="neuro-glow tracking-tighter">MND Care</span>
          </h1>
        </div>

        <p className="text-lg text-slate-600 leading-relaxed max-w-md font-bold border-l-4 border-blue-600 pl-6 py-1">
          Precision screening and secure clinical connectivity. Streamlining the pathway to specialized neurological consultation.
        </p>

        {/* Status Indicators */}
        <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Systems Online</span>
            </div>
            <div className="flex items-center gap-2">
                <Shield size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted Data Vault</span>
            </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: COMPACT ROLE CARDS ── */}
      <div className="grid grid-cols-1 gap-5 animate-in slide-in-from-right duration-700 delay-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 ml-1">Select Access Point</p>
        
        {roles.map((role) => (
          <div 
            key={role.id} 
            onClick={() => { 
              setSelectedRole(role.id); 
              // --- FIX: Sab roles (including patient) pehle "auth" (Login) par jayenge ---
              setView("auth"); 
              setAuthMode("login"); 
            }} 
            className="medical-glass-card group relative p-6 cursor-pointer overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
          >
            {/* Minimal Side Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${role.color} opacity-80`}></div>
            
            <div className="flex items-center gap-6 relative z-10">
              {/* Icon Container */}
              <div className={`p-4 rounded-2xl ${role.bg} text-slate-700 shadow-inner group-hover:scale-110 group-hover:bg-white transition-all duration-500 border border-transparent group-hover:border-slate-100`}>
                <role.icon className="h-8 w-8 text-slate-900" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none mb-2">
                  {role.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide opacity-80 truncate">
                  {role.desc}
                </p>
              </div>

              {/* Minimal Circle Button */}
              <div className="bg-slate-50 w-10 h-10 flex items-center justify-center rounded-full border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                <ChevronRight className="h-5 w-5"/>
              </div>
            </div>

            {/* Subtle Ghost Icon */}
            <role.icon className="absolute -bottom-6 -right-6 h-24 w-24 text-slate-900/[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-700" />
          </div>
        ))}
      </div>

    </div>
  );
}