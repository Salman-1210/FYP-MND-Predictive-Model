import { X, Calendar, Loader2, Mail, ChevronRight, Save, FileText, Download } from "lucide-react";

export default function GlobalModals(props) {
  const { 
    showForgotModal, setShowForgotModal, forgotEmail, setForgotEmail, handleForgotPassword,
    modalType, setModalType, setEditingUser, selectedPatient,
    appointDate, setAppointDate, appointMsg, setAppointMsg, sendAppointmentEmail,
    editingUser, handleUpdateUser, isLoading
  } = props;

  return (
    <>
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
                                <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Analysis Summary</p>
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
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 h-32 focus:border-blue-500 outline-none resize-none" placeholder="Write your message here..." onChange={e=>setAppointMsg(e.target.value)}>
                                    
                                </textarea>
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
                                <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700" value={editingUser.name || editingUser.full_name} onChange={e=>props.setEditingUser({...editingUser, name: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">System Role</label>
                                <div className="relative">
                                    <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 appearance-none" value={editingUser.role} onChange={e=>props.setEditingUser({...editingUser, role: e.target.value})}>
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="admin">Admin</option>
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
    </>
  );
}