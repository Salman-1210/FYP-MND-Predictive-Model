import { ArrowLeft, PlayCircle, Activity } from "lucide-react";

export default function Exercises({ setView, user }) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 max-w-5xl mx-auto border border-white/50">
      <div className="flex items-center gap-4 mb-8 border-b pb-4">
        <button 
          onClick={() => setView("patient_dashboard")} 
          className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Activity className="text-blue-600" /> Recommended Exercises
          </h2>
          <p className="text-slate-500 font-medium">Personalized physiotherapy routines for MND management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exercise Card 1 */}
        <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
          <PlayCircle className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Breathing Exercises</h3>
          <p className="text-slate-600">Techniques to improve respiratory muscle strength and maintain lung capacity.</p>
        </div>

        {/* Exercise Card 2 */}
        <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
          <PlayCircle className="h-12 w-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Range of Motion (ROM)</h3>
          <p className="text-slate-600">Gentle daily stretches to maintain joint flexibility and prevent stiffness.</p>
        </div>
      </div>
    </div>
  );
}