import { User, Stethoscope, ShieldCheck, ChevronRight } from "lucide-react";

export default function PortalSelect({ setView, setSelectedRole, setAuthMode }) {
  const roles = [
    { id: "patient", icon: User, title: "Patient Portal", desc: "Screening & AI Report Upload", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
    { id: "doctor", icon: Stethoscope, title: "Doctor Portal", desc: "Manage Patients & Appointments", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
    { id: "admin", icon: ShieldCheck, title: "Admin Control", desc: "System Oversight", color: "from-purple-500 to-indigo-500", bg: "bg-purple-50" }
  ];

  return (
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
        {roles.map((role) => (
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
  );
}