"use client";
import { useState } from "react";
import { FileText, Loader2, BrainCircuit, ShieldCheck, FileSearch, Stethoscope, Phone, ArrowRight, HeartPulse } from "lucide-react";

const karachiHospitals = [
  { name: "Aga Khan University Hospital", doctor: "Dr. Sarwar Jamil", contact: "021-34861000", address: "Stadium Road, Karachi" },
  { name: "Liaquat National Hospital", doctor: "Dr. Arif Herekar", contact: "021-34412000", address: "Gulshan-e-Iqbal, Karachi" },
  { name: "South City Hospital", doctor: "Dr. Mughis Sheerani", contact: "021-35862301", address: "Clifton, Karachi" },
  { name: "Dow University Hospital", doctor: "Dr. Naila Shahbaz", contact: "021-99232660", address: "Ojha Campus, Karachi" },
];

export default function PatientDashboard({ user, API_URL }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", user.email);

    try {
      const res = await fetch(`${API_URL}/upload-report`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert("AI Analysis failed. Please try a clearer document.");
      }
    } catch (e) {
      alert("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-500">
      {!analysis ? (
        /* مرحلہ 1: رپورٹ اپ لوڈ کرنے کا آپشن */
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white">
          <div className="p-10 md:w-2/3">
            <h2 className="text-3xl font-black text-slate-800 mb-2">خوش آمدید، {user.full_name}</h2>
            <p className="text-slate-500 mb-8">اسکریننگ مکمل ہو چکی ہے۔ اب اپنی میڈیکل رپورٹ (MRI/EMG) اپ لوڈ کریں تاکہ اے آئی اس کا تجزیہ کر سکے۔</p>
            
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center relative hover:bg-blue-50 transition-all cursor-pointer">
              <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
              <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4"/>
              <p className="font-bold text-blue-900">{selectedFile ? selectedFile.name : "فائل منتخب کرنے کے لیے یہاں کلک کریں"}</p>
            </div>

            <button onClick={handleUpload} disabled={!selectedFile || loading} className="mt-6 w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center gap-2 items-center">
              {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <BrainCircuit className="h-5 w-5"/>} AI تجزیہ شروع کریں
            </button>
          </div>
          <div className="bg-blue-600 p-10 md:w-1/3 text-white flex flex-col justify-between">
            <ShieldCheck className="h-12 w-12 mb-4 opacity-80"/>
            <p className="text-sm leading-relaxed">آپ کا ڈیٹا مکمل طور پر محفوظ اور انکرپٹڈ ہے۔ صرف مستند ڈاکٹرز ہی آپ کی رپورٹس دیکھ سکتے ہیں۔</p>
            <div className="bg-blue-700/50 p-4 rounded-xl border border-blue-400/30 text-xs font-bold uppercase">AI Status: Online</div>
          </div>
        </div>
      ) : (
        /* مرحلہ 2: اے آئی کا نتیجہ اور ڈاکٹرز کی لسٹ */
        <div className="space-y-6">
          <div className={`p-8 rounded-2xl border-l-8 shadow-xl bg-white ${analysis.risk === "High Risk" ? "border-red-500" : "border-emerald-500"}`}>
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <FileSearch className="h-10 w-10 text-slate-700"/>
              <h2 className="text-3xl font-black text-slate-800">میڈیکل رپورٹ کا نتیجہ</h2>
            </div>
            
            <div className={`p-6 rounded-xl border mb-8 ${analysis.risk === "High Risk" ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
              <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
                <HeartPulse className="h-4 w-4"/> اے آئی تجزیہ کا خلاصہ
              </h3>
              <p className="text-slate-800 font-medium text-lg leading-relaxed">
                {analysis.risk === "High Risk" 
                  ? "آپ کی رپورٹ میں کچھ ایسی علامات ملی ہیں جو توجہ طلب ہیں۔ پریشان ہونے کی ضرورت نہیں، یہ صرف ایک ابتدائی مشینی تجزیہ ہے۔ بہتر ہے کہ آپ کسی ماہر ڈاکٹر سے مشورہ کریں۔"
                  : "آپ کی رپورٹ بظاہر نارمل لگ رہی ہے۔ اپنی مکمل تسلی کے لیے آپ نیچے دیے گئے کسی بھی ڈاکٹر سے رجوع کر سکتے ہیں۔"}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-bold text-slate-400 uppercase">
                خطرے کی سطح: <span className={analysis.risk === "High Risk" ? "text-red-600" : "text-emerald-600"}>{analysis.risk}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
              <h3 className="text-slate-800 font-black text-xl mb-4 flex items-center gap-2">
                <Stethoscope className="text-blue-600"/> کراچی کے ماہر ڈاکٹرز کی لسٹ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {karachiHospitals.map((h, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-xl border flex justify-between items-center group hover:border-blue-500 transition-all">
                    <div>
                      <p className="font-bold text-lg text-slate-800">{h.doctor}</p>
                      <p className="text-xs text-slate-500 uppercase">{h.name}</p>
                      <p className="text-sm text-blue-600 font-bold mt-2"><Phone size={12} className="inline"/> {h.contact}</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-blue-600"/>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setAnalysis(null)} className="mt-8 w-full py-4 text-slate-400 text-sm font-bold hover:text-slate-600">دوسری رپورٹ اپ لوڈ کریں</button>
          </div>
        </div>
      )}
    </div>
  );
}