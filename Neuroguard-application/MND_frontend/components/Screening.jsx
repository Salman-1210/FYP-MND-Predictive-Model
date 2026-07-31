"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, LayoutDashboard } from "lucide-react";

export default function Screening({ step, setStep, questions, language, handleAnswer, setView, prefillEmail, calculatedRisk, allAnswers }) {
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState("");

  // Email resolution with fallback
  useEffect(() => {
    if (prefillEmail && prefillEmail.trim() !== '') {
      setResolvedEmail(prefillEmail);
      return;
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userEmail');
      if (stored && stored.trim() !== '') {
        setResolvedEmail(stored);
      }
    }
  }, [prefillEmail]);

  const userEmail = resolvedEmail;

  if (showScoreCard) {
    const currentRisk = calculatedRisk || "Low Risk";
    const isHigh = currentRisk === "High Risk";
    const isMod = currentRisk === "Moderate Risk";

    return (
      <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-2xl mx-auto border border-white text-center animate-in zoom-in-95 duration-500">
        <div className="mb-6 flex justify-center">
          {isHigh ? (
            <div className="bg-red-100 p-5 rounded-full text-red-600 animate-bounce"><ShieldAlert size={48} /></div>
          ) : isMod ? (
            <div className="bg-amber-100 p-5 rounded-full text-amber-600"><ShieldWarning size={48} /></div>
          ) : (
            <div className="bg-emerald-100 p-5 rounded-full text-emerald-600"><ShieldCheck size={48} /></div>
          )}
        </div>

        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Screening Assessment Complete</p>
        <h2 className="text-3xl font-black text-slate-800 mb-4">
          {language === "en" ? "Your Risk Status" : "آپ کی تشخیصی رپورٹ"}
        </h2>

        {/* 🔥🔥🔥 BADGE: Sirf "HIGH RISK" — 100% hata diya 🔥🔥🔥 */}
        <div className={`inline-block px-6 py-2.5 rounded-2xl text-lg font-black uppercase mb-6 shadow-sm border ${
          isHigh ? "bg-red-500 text-white border-red-600" :
          isMod ? "bg-amber-500 text-white border-amber-600" :
          "bg-emerald-500 text-white border-emerald-600"
        }`}>
          {currentRisk}
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left">
          <p className="text-slate-700 font-bold mb-2 text-sm uppercase tracking-tight text-slate-500">
            {language === "en" ? "Clinical Recommendations:" : "طبی سفارشات:"}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isHigh ? (
              language === "en" 
                ? "Your responses indicate high-risk indicators associated with motor neuron symptoms. We strongly advise scheduling a clinical consultation with a specialist neurologist immediately."
                : "آپ کی علامات پٹھوں کی شدید کمزوری کی طرف اشارہ کرتی ہیں۔ ہم آپ کو فوری طور پر ماہرِ اعصابی امراض (Neurologist) سے رجوع کرنے کا مشورہ دیتے ہیں۔"
            ) : isMod ? (
              language === "en"
                ? "Moderate indicators detected. While this is not a definitive diagnosis, regular health tracking and monitoring of muscle performance are advised. Consult a physician if symptoms persist."
                : "درمیانے درجے کی علامات ملی ہیں۔ پٹھوں کی کارکردگی اور تھکاوٹ پر نظر رکھیں اور بہتری نہ ہونے کی صورت میں ڈاکٹر سے معائنہ کروائیں۔"
            ) : (
              language === "en"
                ? "Good News! No significant clinical motor neuron risk patterns detected. Continue maintaining a active lifestyle and standard clinical follow-ups."
                : "خوشخبری! پٹھوں یا اعصاب کی کوئی تشویشناک علامات نہیں ملی ہیں۔ آپ بالکل صحت مند لگ رہے ہیں۔"
            )}
          </p>
        </div>

        <button
          onClick={() => setView("patient_dashboard")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          <LayoutDashboard size={18} /> 
          {language === "en" ? "Go to Patient Dashboard" : "ڈیش بورڈ پر جائیں"}
        </button>
      </div>
    );
  }

  if (!questions[step]) {
    return (
      <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-5xl mx-auto border border-white/60 text-center">
        <div className="animate-pulse text-slate-400 font-bold py-12">
          Processing your screening...
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setView("portal_select");
    }
  };

  const submitScreeningToBackend = async (answers, risk, diagnosis) => {
    if (!userEmail || userEmail.trim() === '') {
      console.error("❌ [SCREENING] Email is empty!");
      alert("Error: User email not found. Please login again.");
      return false;
    }

    try {
      console.log("📤 [SCREENING] Submitting...", { email: userEmail, answers_count: Object.keys(answers).length, risk, diagnosis });

      const res = await fetch("http://127.0.0.1:8000/submit-screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          answers: answers,
          calculated_risk: risk,
          diagnosis: diagnosis
        })
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData.detail || errData.message || JSON.stringify(errData);
        } catch {
          const text = await res.text();
          errMsg = text || `HTTP ${res.status}`;
        }
        console.error("❌ [SCREENING] Backend error:", res.status, errMsg);
        alert(`Backend Error ${res.status}: ${errMsg}`);
        return false;
      }

      const data = await res.json();
      console.log("✅ [SCREENING] Saved:", data);
      return true;
    } catch (err) {
      const errorMsg = err?.message || err?.detail || (typeof err === 'string' ? err : 'Unknown network error');
      console.error("❌ [SCREENING] Network error:", err);
      alert("Network error: " + errorMsg);
      return false;
    }
  };

  const handleLocalSubmit = async (finalValue) => {
    if (questions[step].id === "age" && Number(finalValue) <= 0) {
      alert(language === "en" ? "Please enter a valid age greater than 0." : "براہ کرم 0 سے بڑی عمر درج کریں۔");
      return;
    }

    handleAnswer(finalValue);

    if (step === questions.length - 1) {
      if (!userEmail || userEmail.trim() === '') {
        alert("Error: User email not found. Please login again before completing screening.");
        console.error("❌ [SCREENING] Cannot submit — email empty. prefillEmail:", prefillEmail);
        return;
      }

      setIsSubmitting(true);

      const currentAnswers = { ...allAnswers, [questions[step].id]: finalValue };
      const risk = calculatedRisk || "Low Risk";
      const diagnosis = risk === "High Risk" ? "ALS" : 
                        risk === "Moderate Risk" ? "PMA" : "NORMAL";

      const success = await submitScreeningToBackend(currentAnswers, risk, diagnosis);

      if (success) {
        setShowScoreCard(true);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-5xl mx-auto border border-white/60 animate-in zoom-in-95 duration-500">
      <button
        onClick={handleBack}
        className="text-xs font-bold text-slate-400 mb-8 flex items-center gap-2 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> BACK
      </button>

      {userEmail && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100">
          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">
            Screening for: {userEmail}
          </p>
        </div>
      )}

      {!userEmail && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
            ⚠️ Email not loaded — Login required
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/2 relative group">
          <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform"></div>
          <img
            src={questions[step].image}
            className="relative w-full h-80 object-cover rounded-3xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500"
            alt="Q"
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              Question {step + 1} <span className="text-slate-300 mx-1">/</span> {questions.length}
            </span>
            <div className="h-2.5 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-8 text-slate-800 leading-tight tracking-tight">
            {questions[step].text[language]}
          </h2>

          <div className="space-y-4">
            {isSubmitting ? (
              <div className="text-center py-6 text-slate-400 font-bold animate-pulse">
                Evaluating Metrics & Generating Risk Chart...
              </div>
            ) : (
              <>
                {questions[step].type === "number" && (
                  <input
                    type="number"
                    min={questions[step].min || "1"}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const value = Number(e.target.value);
                        if (questions[step].min !== undefined && value < questions[step].min) {
                          alert(language === "en" ? "Please enter a valid age greater than 0." : "براہ کرم 0 سے بڑی عمر درج کریں۔");
                          return;
                        }
                        handleLocalSubmit(e.target.value);
                      }
                    }}
                    className="w-full p-6 border-2 border-slate-200 rounded-2xl text-3xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white/50 transition-all placeholder:text-slate-300"
                    placeholder="Enter number..."
                    autoFocus
                  />
                )}

                {questions[step].type === "select" &&
                  questions[step].options[language].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleLocalSubmit(opt)}
                      className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50/50 font-bold text-slate-700 transition-all text-lg shadow-sm hover:shadow-md hover:translate-x-2 flex justify-between group"
                    >
                      {opt}
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                    </button>
                  ))}

                {(!questions[step].type || questions[step].type === "yesno") && (
                  <>
                    {["Yes", "Sometimes", "No"].map(opt => {
                      if (questions[step].type === "yesno" && opt === "Sometimes") return null;
                      const colorClass =
                        opt === "Yes"       ? "hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                        : opt === "No"      ? "hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                        :                    "hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-600";

                      return (
                        <button
                          key={opt}
                          onClick={() => handleLocalSubmit(opt)}
                          className={`w-full p-5 border-2 border-slate-100 bg-white rounded-2xl font-bold transition-all text-lg shadow-sm ${colorClass} group flex justify-between items-center`}
                        >
                          {opt}
                          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-current flex items-center justify-center">
                            <div className="w-3 h-3 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </>
                  
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}