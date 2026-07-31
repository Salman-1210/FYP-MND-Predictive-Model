//riskhistorychart
"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { AlertTriangle, ShieldCheck, Loader2, TrendingUp, Activity, FileText } from "lucide-react";

export default function RiskHistoryChart({ userEmail }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, highCount: 0, normalCount: 0, highRatio: 0, screeningCount: 0 });

  useEffect(() => {
    if (!userEmail) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/patient/screening-history?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();

        const dateMap = new Map();
        (data.history || []).forEach((h) => {
          const dateKey = new Date(h.date).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
          });
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { sum: 0, count: 0, date: h.date, isScreening: false });
          }
          const entry = dateMap.get(dateKey);
          entry.sum += h.risk_value;
          entry.count += 1;
          if (h.is_screening) entry.isScreening = true;  // 🔥 Track screening
        });

        const formatted = Array.from(dateMap.entries()).map(([label, vals], idx) => ({
          index: idx + 1,
          label,
          shortLabel: label.split(" ").slice(0, 2).join(" "),
          risk_value: parseFloat((vals.sum / vals.count).toFixed(2)),
          reportCount: vals.count,
          fullDate: label,
          isScreening: vals.isScreening,  // 🔥 Pass to tooltip
        }));

        const backendHighCount = data.high_risk_count ?? 0;
        const backendTotal = data.total_reports ?? 0;
        const screeningCount = (data.history || []).filter(h => h.is_screening).length;

        setHistory(formatted);
        setStats({
          total: backendTotal,
          highCount: backendHighCount,
          normalCount: backendTotal - backendHighCount,
          highRatio: data.high_risk_ratio ?? 0,
          screeningCount: screeningCount  // 🔥 Track count
        });
      } catch (err) {
        console.error(err);
        setError("Could not load report history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
        <p className="text-sm font-bold text-slate-400">Loading report history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center text-slate-400 text-sm font-bold">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
        <TrendingUp className="mx-auto text-slate-300 mb-3" size={32} />
        <p className="text-sm font-bold text-slate-400">
          No previous reports yet. Upload a few reports to see your trend here.
        </p>
      </div>
    );
  }

  const { total, highCount, normalCount, highRatio, screeningCount } = stats;

  let statusConfig;
  if (highRatio >= 0.7) {
    statusConfig = {
      watermark: "⚠️ CONSULT NEUROLOGIST",
      watermarkColor: "rgba(220, 38, 38, 0.08)",
      lineColor: "#dc2626",
      areaFill: "url(#gradientRed)",
      bannerBg: "bg-red-50 border-red-200",
      bannerText: "text-red-800",
      bannerIcon: <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />,
      bannerTitle: "Elevated Risk Pattern Detected",
      bannerMsg: "A significant portion of your screenings indicate high-risk markers. We strongly recommend scheduling a consultation with a neurologist for a thorough clinical evaluation."
    };
  } else if (highRatio <= 0.3) {
    statusConfig = {
      watermark: "✓ MONITORING ADEQUATE",
      watermarkColor: "rgba(5, 150, 105, 0.08)",
      lineColor: "#059669",
      areaFill: "url(#gradientGreen)",
      bannerBg: "bg-emerald-50 border-emerald-200",
      bannerText: "text-emerald-800",
      bannerIcon: <ShieldCheck className="text-emerald-600 flex-shrink-0" size={20} />,
      bannerTitle: "Trend Appears Stable",
      bannerMsg: "Your recent screenings predominantly show normal patterns. Continue your routine follow-ups and maintain a healthy lifestyle."
    };
  } else {
    statusConfig = {
      watermark: "● MIXED PATTERN",
      watermarkColor: "rgba(217, 119, 6, 0.08)",
      lineColor: "#d97706",
      areaFill: "url(#gradientAmber)",
      bannerBg: "bg-amber-50 border-amber-200",
      bannerText: "text-amber-800",
      bannerIcon: <Activity className="text-amber-600 flex-shrink-0" size={20} />,
      bannerTitle: "Inconclusive Trend — Monitoring Advised",
      bannerMsg: "Your screening results show a mixed pattern with both normal and elevated readings. Consistent follow-up screenings are recommended."
    };
  }

  // 🔥🔥🔥 UPDATED TOOLTIP with screening badge 🔥🔥🔥
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const riskPct = Math.round(p.risk_value * 100);
    let riskLabel = "Normal";
    let riskColor = "text-emerald-600";
    if (p.risk_value >= 0.7) { riskLabel = "High Risk"; riskColor = "text-red-600"; }
    else if (p.risk_value >= 0.3) { riskLabel = "Mixed"; riskColor = "text-amber-600"; }

    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs min-w-[180px]">
        <p className="font-black text-slate-800 mb-1">{p.fullDate}</p>
        <p className={`font-bold ${riskColor}`}>{riskLabel} ({riskPct}%)</p>
        <p className="text-slate-400 font-semibold mt-0.5">{p.reportCount} report{p.reportCount > 1 ? "s" : ""} on this date</p>
        {/* 🔥 SCREENING BADGE */}
        {p.isScreening && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-bold">
            <FileText size={10} /> Initial Screening
          </span>
        )}
      </div>
    );
  };

  const yTickFormatter = (v) => {
    if (v >= 0.85) return "High Risk";
    if (v <= 0.15) return "Normal";
    if (v >= 0.4 && v <= 0.6) return "Mixed";
    return "";
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600 h-5 w-5" /> Screening Risk Trend
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {total} total reports across {history.length} screening date{history.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-100">
            High Risk: {highCount}
          </span>
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
            Normal: {normalCount}
          </span>
          {/* 🔥 SCREENING COUNT BADGE */}
          {screeningCount > 0 && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <FileText size={10} /> Screenings: {screeningCount}
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full h-[320px] mt-4">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
          style={{
            fontSize: "36px",
            fontWeight: 900,
            color: statusConfig.watermarkColor,
            transform: "rotate(-10deg)",
            letterSpacing: "3px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          {statusConfig.watermark}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />

            <YAxis
              domain={[-0.1, 1.1]}
              ticks={[0, 0.5, 1]}
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              width={70}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />

            <ReferenceLine y={0.7} stroke="#fecaca" strokeDasharray="6 4" strokeOpacity={0.6} />
            <ReferenceLine y={0.3} stroke="#fde68a" strokeDasharray="6 4" strokeOpacity={0.6} />

            <Area
              type="monotone"
              dataKey="risk_value"
              stroke={statusConfig.lineColor}
              strokeWidth={2.5}
              fill={statusConfig.areaFill}
              fillOpacity={1}
              animationDuration={1200}
              dot={{ r: 4, fill: statusConfig.lineColor, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: statusConfig.lineColor, stroke: "#fff", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400">Normal Zone (≤30%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-400">Mixed Zone (30-70%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-slate-400">Elevated Zone (≥70%)</span>
        </div>
      </div>

      <div className={`mt-4 p-4 rounded-2xl border-2 flex items-start gap-3 ${statusConfig.bannerBg}`}>
        {statusConfig.bannerIcon}
        <div>
          <p className={`text-sm font-black ${statusConfig.bannerText}`}>{statusConfig.bannerTitle}</p>
          <p className={`text-xs font-semibold mt-1 leading-relaxed ${statusConfig.bannerText}`}>
            {statusConfig.bannerMsg}
          </p>
        </div>
      </div>

      <p className="text-center text-[10px] font-semibold text-slate-400 mt-3">
        This trend aggregates AI screening results and is not a substitute for clinical diagnosis.
      </p>
    </div>
  );
}