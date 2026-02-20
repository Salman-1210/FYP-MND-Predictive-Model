import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Screening({ step, questions, language, handleAnswer, setView }) {
  if (!questions[step]) return null;

  return (
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
  );
}