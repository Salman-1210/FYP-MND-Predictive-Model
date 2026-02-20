import { FileText, BrainCircuit, ShieldCheck, Loader2, Smile, AlertTriangle, Hospital, Phone, User } from "lucide-react";
import { KARACHI_HOSPITALS } from "../app/utils/constants";

export default function PatientDashboard({ user, uploadAnalysis, setUploadAnalysis, selectedFile, setSelectedFile, handleFileUpload, isLoading }) {
  
  // Screening ka result jo login ke waqt milta hai
  const screeningRisk = user?.risk_level || null;

  return (
    <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500 pb-20">
      
      {/* --- WELCOME HEADER --- */}
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
            <h3 className="text-xl font-black text-slate-800">{user?.full_name || user?.name || "Patient"}</h3>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
            Account Active
          </span>
        </div>
      </div>

      {/* --- SCREENING RISK MESSAGE (Sirf High ya Moderate par dikhega) --- */}
      {screeningRisk && (screeningRisk.includes("High") || screeningRisk.includes("Moderate")) && (
        <div className={`mb-8 p-6 rounded-3xl border-2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-700 ${
          screeningRisk.includes("High") 
          ? "bg-red-50 border-red-100 text-red-700" 
          : "bg-orange-50 border-orange-100 text-orange-700"
        }`}>
          <div className={`p-3 rounded-full ${screeningRisk.includes("High") ? "bg-red-500 text-white" : "bg-orange-500 text-white"}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-70">Screening Alert</p>
            <h4 className="text-lg font-bold">Your initial screening indicates a <span className="underline">{screeningRisk}</span>. Please proceed with the report analysis below.</h4>
          </div>
        </div>
      )}

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
              {isLoading ? <><Loader2 className="animate-spin h-6 w-6"/> Analyzing Report...</> : <><BrainCircuit className="h-6 w-6"/> Run AI Analysis</>}
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
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* --- ANALYSIS RESULTS --- */}
          <div className={`p-10 rounded-[2rem] shadow-2xl bg-white border-4 ${uploadAnalysis.risk === "High Risk" ? "border-red-100" : "border-green-100"}`}>
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className={`p-6 rounded-full shadow-lg ${uploadAnalysis.risk === "High Risk" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                {uploadAnalysis.risk === "High Risk" ? <AlertTriangle className="h-16 w-16 animate-bounce" /> : <Smile className="h-16 w-16"/>}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-2">Analysis Complete</h2>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Risk Assessment:</span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-2 ${
                    uploadAnalysis.risk === "High Risk" 
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse" 
                    : "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  }`}>
                    {uploadAnalysis.risk === "High Risk" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    {uploadAnalysis.risk}
                  </span>
                </div>
              </div>
            </div>

            {uploadAnalysis.risk === "High Risk" && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-red-700 text-sm font-bold">Important: High Risk detected. Please consult a specialist immediately.</p>
              </div>
            )}

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4"/> AI Generated Summary
              </h3>
              <p className="text-slate-700 font-medium leading-loose text-lg">{uploadAnalysis.summary}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
              <h3 className="text-blue-900 font-bold mb-6 flex items-center gap-2 text-lg">
                <Hospital className="h-6 w-6 text-blue-600"/> Recommended Specialists in Karachi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KARACHI_HOSPITALS.map((h,i) => (
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
  );
}