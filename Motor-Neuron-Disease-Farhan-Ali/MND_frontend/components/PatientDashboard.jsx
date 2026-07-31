"use client";

import { useState, useEffect } from "react";
import {
  FileText, BrainCircuit, ShieldCheck, Loader2,
  Hospital, Phone, User, ArrowRight, AlertTriangle, 
  Brain, Stethoscope, ArrowLeft, CheckCircle2, 
  ShieldAlert, Activity, Heart, Sparkles, Smile, Calendar,
  Camera, ScanLine, Sun, AlertCircle, Check, X, Upload,
  FileImage, File, Eye, Lightbulb, ChevronRight,
  TrendingUp, FileWarning, RotateCcw,
  Copy, ExternalLink, PlayCircle, CheckCheck
} from "lucide-react";

import RiskHistoryChart from "./RiskHistoryChart";

const KARACHI_HOSPITALS = [
  { name: "Aga Khan University Hospital", doctor: "Neuromuscular Center", contact: "+92 21 111 911 911" },
  { name: "Liaquat National Hospital", doctor: "Neurology Department", contact: "+92 21 111 456 456" },
  { name: "Dow University Hospital (Ojha)", doctor: "Neuromuscular OPD", contact: "+92 21 99232660" },
  { name: "Jinnah Postgraduate Medical Centre", doctor: "Neurology Clinic", contact: "+92 21 99201300" }
];

// ── YOUTUBE LINK MAPPING: Exercise titles → tutorial videos ──
const EXERCISE_YOUTUBE_LINKS = {
  "Lingual Strengthening Resistance": "https://www.youtube.com/results?search_query=lingual+tongue+strengthening+exercises+swallowing",
  "Effortful Swallowing Protocol": "https://www.youtube.com/results?search_query=effortful+swallow+exercise+dysphagia",
  "Dexterity Ball Therapy": "https://www.youtube.com/results?search_query=hand+dexterity+ball+exercises+physical+therapy",
  "Passive Wrist Extensions": "https://www.youtube.com/results?search_query=passive+wrist+extension+stretch+physical+therapy",
  "Ankle Pumping Circulation": "https://www.youtube.com/results?search_query=ankle+pump+exercises+circulation+physical+therapy",
  "Deep Breathing Diaphragmatic": "https://www.youtube.com/results?search_query=diaphragmatic+breathing+exercises+als+mnd",
  "Neck Range of Motion": "https://www.youtube.com/results?search_query=neck+range+of+motion+exercises+physical+therapy",
  "Shoulder Blade Squeezes": "https://www.youtube.com/results?search_query=scapular+squeeze+shoulder+blade+exercises",
  "Gentle Jaw Stretches": "https://www.youtube.com/results?search_query=jaw+stretching+exercises+bulbar+palsy",
  "Tongue Protrusion Holds": "https://www.youtube.com/results?search_query=tongue+protrusion+hold+exercises+speech+therapy",
  "Finger Tapping Drills": "https://www.youtube.com/results?search_query=finger+tapping+coordination+exercises+hand",
  "Thumb Opposition Practice": "https://www.youtube.com/results?search_query=thumb+opposition+exercises+fine+motor",
  "Seated Marching": "https://www.youtube.com/results?search_query=seated+marching+leg+exercises+physical+therapy",
  "Heel Slides": "https://www.youtube.com/results?search_query=heel+slide+exercises+knee+mobility+physical+therapy",
  "Gentle Calf Stretches": "https://www.youtube.com/results?search_query=calf+stretch+exercises+physical+therapy",
  "Hip Flexor Stretch": "https://www.youtube.com/results?search_query=hip+flexor+stretch+seated+physical+therapy",
  "Lip Seal Practice": "https://www.youtube.com/results?search_query=lip+seal+exercises+speech+therapy+swallowing",
  "Pursed Lip Breathing": "https://www.youtube.com/results?search_query=pursed+lip+breathing+technique+respiratory",
  "Gentle Neck Flexion": "https://www.youtube.com/results?search_query=neck+flexion+stretch+exercises+physical+therapy",
  "Forearm Pronation/Supination": "https://www.youtube.com/results?search_query=forearm+pronation+supination+exercises+wrist",
  "Hand Open-Close": "https://www.youtube.com/results?search_query=hand+open+close+exercises+fine+motor+therapy",
  "Toe Flex & Point": "https://www.youtube.com/results?search_query=toe+flex+point+exercises+foot+physical+therapy",
  "Core Activation (Pelvic Tilt)": "https://www.youtube.com/results?search_query=pelvic+tilt+core+activation+exercises",
  "Gentle Trunk Rotation": "https://www.youtube.com/results?search_query=seated+trunk+rotation+exercises+spine+mobility",
  "Wall Push-ups": "https://www.youtube.com/results?search_query=wall+push+up+exercises+upper+body+strength",
  "Step-up Practice": "https://www.youtube.com/results?search_query=step+up+exercises+leg+strength+physical+therapy",
  "Balance Training (Single Leg Stand)": "https://www.youtube.com/results?search_query=single+leg+stand+balance+exercises+physical+therapy",
  "Resistance Band Rows": "https://www.youtube.com/results?search_query=resistance+band+row+exercises+back+strength",
  "Bicep Curls (Light Weights)": "https://www.youtube.com/results?search_query=light+bicep+curl+exercises+arm+strength+therapy",
  "Tricep Extensions": "https://www.youtube.com/results?search_query=tricep+extension+exercises+arm+strength+therapy",
  "Side-lying Hip Abduction": "https://www.youtube.com/results?search_query=hip+abduction+exercises+side+lying+physical+therapy",
  "Bridging (Glute Activation)": "https://www.youtube.com/results?search_query=glute+bridge+exercises+hip+strength+physical+therapy",
  "Quadriceps Sets": "https://www.youtube.com/results?search_query=quad+set+exercises+knee+strength+physical+therapy",
  "Hamstring Curls": "https://www.youtube.com/results?search_query=hamstring+curl+exercises+leg+strength+therapy",
  "Standing Calf Raises": "https://www.youtube.com/results?search_query=standing+calf+raise+exercises+lower+leg+strength",
  "Chin Tucks": "https://www.youtube.com/results?search_query=chin+tuck+exercises+neck+posture+physical+therapy",
  "Scapular Retraction": "https://www.youtube.com/results?search_query=scapular+retraction+exercises+shoulder+posture",
  "Wrist Flexor Stretch": "https://www.youtube.com/results?search_query=wrist+flexor+stretch+exercises+forearm+therapy",
  "Wrist Extensor Stretch": "https://www.youtube.com/results?search_query=wrist+extensor+stretch+exercises+forearm+therapy",
  "Finger Spread & Squeeze": "https://www.youtube.com/results?search_query=finger+spread+squeeze+exercises+hand+therapy",
  "Ankle Circles": "https://www.youtube.com/results?search_query=ankle+circle+exercises+mobility+physical+therapy",
  "Knee Flexion/Extension (Seated)": "https://www.youtube.com/results?search_query=seated+knee+flexion+extension+exercises+mobility",
  "Hip Abduction (Seated)": "https://www.youtube.com/results?search_query=seated+hip+abduction+exercises+leg+strength",
  "Shoulder Flexion (Wall Walk)": "https://www.youtube.com/results?search_query=wall+walk+shoulder+flexion+exercises+mobility",
  "Elbow Flexion/Extension": "https://www.youtube.com/results?search_query=elbow+flexion+extension+exercises+arm+mobility",
  "Wrist Circles": "https://www.youtube.com/results?search_query=wrist+circle+exercises+mobility+physical+therapy",
  "Finger Bends": "https://www.youtube.com/results?search_query=finger+bend+exercises+hand+mobility+therapy",
  "Toe Raises": "https://www.youtube.com/results?search_query=toe+raise+exercises+foot+strength+physical+therapy",
  "Heel Raises": "https://www.youtube.com/results?search_query=heel+raise+exercises+calf+strength+physical+therapy",
  "Gentle Back Extension": "https://www.youtube.com/results?search_query=gentle+back+extension+exercises+spine+mobility",
  "Pelvic Floor Activation": "https://www.youtube.com/results?search_query=pelvic+floor+activation+exercises+kegel+therapy",
  "Breath Support for Speech": "https://www.youtube.com/results?search_query=breath+support+speech+exercises+speech+therapy",
  "Oral Motor Exercises": "https://www.youtube.com/results?search_query=oral+motor+exercises+speech+therapy+swallowing",
  "Range of Motion (ROM) - Upper Limb": "https://www.youtube.com/results?search_query=upper+limb+range+of+motion+exercises+physical+therapy",
  "Range of Motion (ROM) - Lower Limb": "https://www.youtube.com/results?search_query=lower+limb+range+of+motion+exercises+physical+therapy",
  "Stretching - Upper Body": "https://www.youtube.com/results?search_query=upper+body+stretching+exercises+physical+therapy",
  "Stretching - Lower Body": "https://www.youtube.com/results?search_query=lower+body+stretching+exercises+physical+therapy",
  "Strengthening - Upper Body": "https://www.youtube.com/results?search_query=upper+body+strengthening+exercises+physical+therapy",
  "Strengthening - Lower Body": "https://www.youtube.com/results?search_query=lower+body+strengthening+exercises+physical+therapy",
  "Postural Training": "https://www.youtube.com/results?search_query=postural+training+exercises+physical+therapy+posture",
  "Gait Training": "https://www.youtube.com/results?search_query=gait+training+exercises+walking+physical+therapy",
  "Transfer Training": "https://www.youtube.com/results?search_query=transfer+training+exercises+bed+mobility+physical+therapy",
  "Energy Conservation Techniques": "https://www.youtube.com/results?search_query=energy+conservation+techniques+als+mnd+fatigue",
  "Relaxation Techniques": "https://www.youtube.com/results?search_query=relaxation+techniques+progressive+muscle+relaxation+therapy",
  "Mindfulness & Meditation": "https://www.youtube.com/results?search_query=mindfulness+meditation+exercises+stress+relief+health",
  "Aquatic Therapy / Water Exercises": "https://www.youtube.com/results?search_query=aquatic+therapy+water+exercises+physical+therapy",
  "Tai Chi for Balance": "https://www.youtube.com/results?search_query=tai+chi+balance+exercises+physical+therapy+fall+prevention",
  "Yoga for Flexibility": "https://www.youtube.com/results?search_query=yoga+flexibility+exercises+beginner+physical+therapy",
  "Pilates for Core Strength": "https://www.youtube.com/results?search_query=pilates+core+strength+exercises+beginner+therapy",
  "Speech & Swallowing Therapy": "https://www.youtube.com/results?search_query=speech+swallowing+therapy+exercises+dysphagia",
  "Respiratory Muscle Training": "https://www.youtube.com/results?search_query=respiratory+muscle+training+exercises+breathing+therapy",
  "Incentive Spirometry": "https://www.youtube.com/results?search_query=incentive+spirometry+exercises+lung+capacity+therapy",
  "Cough Assist Techniques": "https://www.youtube.com/results?search_query=cough+assist+techniques+respiratory+therapy+mnd",
  "Non-invasive Ventilation (NIV) Education": "https://www.youtube.com/results?search_query=non+invasive+ventilation+niv+education+respiratory+therapy",
  "Nutritional Counseling": "https://www.youtube.com/results?search_query=nutrition+counseling+als+mnd+diet+healthy+eating",
  "Psychological Support & Counseling": "https://www.youtube.com/results?search_query=psychological+support+counseling+mental+health+chronic+illness",
  "Caregiver Training": "https://www.youtube.com/results?search_query=caregiver+training+als+mnd+patient+care",
  "Home Safety Assessment": "https://www.youtube.com/results?search_query=home+safety+assessment+fall+prevention+elderly",
  "Adaptive Equipment Training": "https://www.youtube.com/results?search_query=adaptive+equipment+training+disability+assistive+devices",
  "Wheelchair & Seating Assessment": "https://www.youtube.com/results?search_query=wheelchair+seating+assessment+physical+therapy+mobility",
  "Orthotics & Bracing": "https://www.youtube.com/results?search_query=orthotics+bracing+physical+therapy+support",
  "Pain Management Strategies": "https://www.youtube.com/results?search_query=pain+management+strategies+chronic+pain+physical+therapy",
  "Sleep Hygiene Optimization": "https://www.youtube.com/results?search_query=sleep+hygiene+optimization+better+sleep+health",
  "Fatigue Management": "https://www.youtube.com/results?search_query=fatigue+management+chronic+illness+energy+conservation",
  "Spasticity Management": "https://www.youtube.com/results?search_query=spasticity+management+exercises+physical+therapy+stretching",
  "Contracture Prevention": "https://www.youtube.com/results?search_query=contracture+prevention+stretching+exercises+physical+therapy",
  "Pressure Injury Prevention": "https://www.youtube.com/results?search_query=pressure+injury+prevention+bed+sores+positioning",
  "Bowel & Bladder Management": "https://www.youtube.com/results?search_query=bowel+bladder+management+neurogenic+bowel+physical+therapy",
  "Sexual Health & Intimacy": "https://www.youtube.com/results?search_query=sexual+health+intimacy+chronic+illness+relationship+counseling",
  "End-of-Life Planning & Palliative Care": "https://www.youtube.com/results?search_query=end+of+life+planning+palliative+care+hospice+support",
  "Advance Care Directives": "https://www.youtube.com/results?search_query=advance+care+directives+healthcare+planning+legal",
  "Hospice Care Information": "https://www.youtube.com/results?search_query=hospice+care+information+end+of+life+support+family",
  "Bereavement Support": "https://www.youtube.com/results?search_query=bereavement+support+grief+counseling+loss+family",
  "Peer Support Groups": "https://www.youtube.com/results?search_query=peer+support+groups+chronic+illness+community+mental+health",
  "Online Resources & Communities": "https://www.youtube.com/results?search_query=online+resources+communities+als+mnd+support+groups",
  "Clinical Trial Information": "https://www.youtube.com/results?search_query=clinical+trial+information+als+mnd+research+participation",
  "Genetic Counseling": "https://www.youtube.com/results?search_query=genetic+counseling+als+mnd+inherited+risk+family",
  "Assistive Technology": "https://www.youtube.com/results?search_query=assistive+technology+communication+devices+als+mnd",
  "Environmental Control Systems": "https://www.youtube.com/results?search_query=environmental+control+systems+disability+home+automation",
  "Voice Banking": "https://www.youtube.com/results?search_query=voice+banking+als+mnd+communication+preservation",
  "Eye Gaze Technology": "https://www.youtube.com/results?search_query=eye+gaze+technology+communication+als+mnd+disability",
  "Brain-Computer Interface (BCI)": "https://www.youtube.com/results?search_query=brain+computer+interface+bci+als+mnd+communication",
};

// ── HELPER: Get YouTube link for an exercise title ──
const getExerciseYouTubeLink = (title) => {
  if (!title) return null;
  if (EXERCISE_YOUTUBE_LINKS[title]) {
    return EXERCISE_YOUTUBE_LINKS[title];
  }
  const keys = Object.keys(EXERCISE_YOUTUBE_LINKS);
  for (const key of keys) {
    if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) {
      return EXERCISE_YOUTUBE_LINKS[key];
    }
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " exercise physical therapy")}`;
};

// ── HELPER: Copy text to clipboard ──
const copyToClipboard = async (text, setCopiedId, id) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }
};

// ── ERROR MAPPING: Backend OCR/App error codes to user-friendly messages ──
const ERROR_MESSAGES = {
  INVALID_UPLOAD: "File validation failed. Please ensure your file is under 10MB, is a clear JPG/PNG/PDF, and not corrupted.",
  INVALID_IMAGE_CONTENT: "This image doesn't appear to be a medical NCS/EMG report. Please upload a valid nerve conduction or EMG report.",
  INVALID_REPORT_DATA: "Could not extract valid medical data from the image. The report may be blurry, blank, or missing required tables (Motor NCS, Sensory NCS, EMG).",
  IMAGE_LOAD_ERROR: "Failed to load the image. The file may be corrupted. Please try another file.",
  JSON_PARSE_ERROR: "The AI couldn't read the report structure. Please upload a clearer, well-lit image.",
  OCR_FAILURE: "AI extraction engine failed. This may be due to API quota limits. Please try again later.",
  DEFAULT: "Upload failed. Please check the file format and try again."
};

// ── REPORT RESULT PAGE (Patient-Centric Dynamic View) ──
function ReportResultPage({
  uploadAnalysis,
  setUploadAnalysis,
  setSelectedFile,
  user,
  patientName,
  onBack
}) {
  console.log("DEBUG: Upload Analysis Data:", uploadAnalysis);

  const [systemDoctors, setSystemDoctors] = useState([]);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [connectedDoc, setConnectedDoc] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // 🔥 ROBUST: Check all possible nesting levels for data
  let dataPayload = uploadAnalysis;
  if (uploadAnalysis?.data) {
    dataPayload = uploadAnalysis.data;
  } else if (uploadAnalysis?.analysis) {
    dataPayload = uploadAnalysis.analysis;
  }

  // If analysis is nested inside analysis (double nesting from backend)
  if (dataPayload?.analysis && typeof dataPayload.analysis === 'object') {
    const nested = dataPayload.analysis;
    if (nested.visual_mapping || nested.rehab_protocol || nested.diagnosis) {
      dataPayload = nested;
    }
  }

  // Support top-level keys returned by /upload-report (app.py)
  if (uploadAnalysis?.visual_mapping && !dataPayload?.visual_mapping) {
    dataPayload = { ...dataPayload, visual_mapping: uploadAnalysis.visual_mapping };
  }
  if (uploadAnalysis?.rehab_protocol && !dataPayload?.rehab_protocol) {
    dataPayload = { ...dataPayload, rehab_protocol: uploadAnalysis.rehab_protocol };
  }

  console.log("🔥 FULL DATA PAYLOAD:", dataPayload);

  const diagnosis = (dataPayload.diagnosis || "Under Evaluation").toUpperCase();
  const isNormal = diagnosis === "NORMAL";

  // Diagnosis-specific specialist guidance.
  const getSpecialistGuidance = () => {
    if (isNormal) {
      return { searchSpecialty: "General Physician", label: "General Physician", note: null };
    }
    if (diagnosis === "ALS") {
      return {
        searchSpecialty: "Neurologist",
        label: "Neurologist (Neuromuscular Focus)",
        note: "ALS is often managed by a multidisciplinary team. Ask your neurologist about a neuromuscular/ALS clinic and respiratory (pulmonology) support."
      };
    }
    if (diagnosis === "PMA") {
      return {
        searchSpecialty: "Neurologist",
        label: "Neurologist (Neuromuscular Focus)",
        note: "PMA is typically managed by a neuromuscular neurologist focused on preserving motor strength and function."
      };
    }
    if (diagnosis === "PBP") {
      return {
        searchSpecialty: "Neurologist",
        label: "Neurologist (Bulbar/Speech Focus)",
        note: "PBP affects speech and swallowing. In addition to your neurologist, ask about a referral to a Speech-Language Pathologist (SLP)."
      };
    }
    return { searchSpecialty: "Neurologist", label: "Neurologist", note: null };
  };

  const specialistGuidance = getSpecialistGuidance();
  const targetSpecialty = specialistGuidance.searchSpecialty;

  useEffect(() => {
    const fetchRelevantDoctors = async () => {
      setIsFetchingDocs(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/doctors/by-specialty/${encodeURIComponent(targetSpecialty)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSystemDoctors(data);
        }
      } catch (err) {
        console.error("Error fetching filtered doctors:", err);
      } finally {
        setIsFetchingDocs(false);
      }
    };
    fetchRelevantDoctors();
  }, [targetSpecialty]);

  const handleConnectDoctor = async (doctorEmail) => {
    setConnecting(doctorEmail);
    try {
      const res = await fetch("http://127.0.0.1:8000/connect-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_email: user?.email,
          doctor_email: doctorEmail,
        }),
      });
      if (res.ok) {
        setConnectedDoc(doctorEmail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(null);
    }
  };

  if (!uploadAnalysis) return null;

  const risk = dataPayload.risk || "Needs Review";

  let rawVisualMap = {};
  if (dataPayload.visual_mapping && typeof dataPayload.visual_mapping === 'object') {
    rawVisualMap = dataPayload.visual_mapping;
  } else if (dataPayload.data?.visual_mapping) {
    rawVisualMap = dataPayload.data.visual_mapping;
  } else if (dataPayload.analysis?.visual_mapping) {
    rawVisualMap = dataPayload.analysis.visual_mapping;
  }

  const visualMap = {
    bulbar: !!rawVisualMap.bulbar,
    cervical: !!rawVisualMap.cervical,
    thoracic: !!rawVisualMap.thoracic,
    lumbosacral: !!rawVisualMap.lumbosacral
  };

  let rawRehab = [];
  if (dataPayload.rehab_protocol && Array.isArray(dataPayload.rehab_protocol)) {
    rawRehab = dataPayload.rehab_protocol;
  } else if (dataPayload.data?.rehab_protocol) {
    rawRehab = dataPayload.data.rehab_protocol;
  } else if (dataPayload.analysis?.rehab_protocol) {
    rawRehab = dataPayload.analysis.rehab_protocol;
  }
  const rehabPlans = rawRehab;

  console.log("🔥 DEBUG FINAL visualMap:", visualMap);
  console.log("🔥 DEBUG FINAL rehabPlans:", rehabPlans);

  const getUIConfig = () => {
    if (isNormal) {
      return {
        bg: "bg-emerald-600",
        light: "bg-emerald-100", 
        border: "border-emerald-400",
        text: "text-emerald-800",
        icon: <CheckCircle2 className="text-emerald-700 animate-bounce" size={32} />,
        badgeText: "Safe / No MND Risk"
      };
    }
    if (diagnosis === "ALS") {
      return {
        bg: "bg-red-600",
        light: "bg-red-100", 
        border: "border-red-400",
        text: "text-red-800",
        icon: <ShieldAlert className="text-red-700" size={32} />,
        badgeText: risk
      };
    }
    if (diagnosis === "PMA" || diagnosis === "PBP") {
      return {
        bg: "bg-amber-500",
        light: "bg-amber-100", 
        border: "border-amber-400",
        text: "text-amber-800",
        icon: <AlertTriangle className="text-amber-700" size={32} />,
        badgeText: risk
      };
    }
    return {
      bg: "bg-blue-600",
      light: "bg-blue-100",
      border: "border-blue-400",
      text: "text-blue-800",
      icon: <Activity className="text-blue-700" size={32} />,
      badgeText: risk
    };
  };

  const ui = getUIConfig();

  const regionsFlaggedCount = Object.values(visualMap).filter(Boolean).length;
  const scanDateLabel = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const renderSummaryText = () => {
    switch (diagnosis) {
      case "NORMAL":
        return (
          <div className="space-y-3">
            <p className="text-emerald-950 font-black text-lg flex items-center gap-2">
              <Sparkles className="inline text-emerald-700" size={20} /> Congratulations! Your report is completely normal.
            </p>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              Our AI analysis indicates that your nerve conduction pathways and muscle signals show no patterns or signs of Motor Neuron Disease (MND). Your structural response profile is healthy!
            </p>
            <div className="mt-4 p-4 bg-emerald-200 border border-emerald-300 rounded-xl flex items-start gap-3 shadow-inner">
              <Smile className="text-emerald-800 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-emerald-950 text-xs font-bold leading-relaxed">
                <strong>💡 Health Advice:</strong> Keep exercising regularly, maintain active daily stretching, stay hydrated, and be happy! A positive mindset and active lifestyle keep your motor neuro-system robust and healthy.
              </p>
            </div>
          </div>
        );
      case "ALS":
        return (
          <div className="space-y-2">
            <p className="text-red-950 font-black text-base"> Warning: AI Screened Patterns Match ALS</p>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              The neural model has detected mixed active features across both upper and lower limb segments in your electromyography (EMG). While there is no need to panic, these borderline markers require professional correlation with clinical examinations to ensure proper health tracking.
            </p>
          </div>
        );
      case "PMA":
        return (
          <div className="space-y-2">
            <p className="text-amber-950 font-black text-base">🔍 Clinical Marker Note: Structural Neural Mapping (PMA)</p>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              The screening system indicates localized patterns primarily focused inside specific muscle responses, while sensory conduction velocity remains intact. We highly advise bringing these charts to a clinical specialist to properly evaluate physical reflexes.
            </p>
          </div>
        );
      case "PBP":
        return (
          <div className="space-y-2">
            <p className="text-amber-950 font-black text-base">🗣️ Bulbar Mapping Note: Facial Area Synchronization (PBP)</p>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              The structural analysis highlights explicit activation patterns matching the cranial/bulbar muscle parameters. We suggest scheduling an assessment with a neurological team below to comprehensively verify your motor function.
            </p>
          </div>
        );
      default:
        return (
          <p className="text-slate-800 text-sm font-medium leading-relaxed">
            Your report metrics have been securely saved and processed. To get a 100% conclusive assessment, please check the medical expert layout below.
          </p>
        );
    }
  };

  // ──────────────────────────────────────────────────────────
  // 🟢 Builds a professional English clinical-style interpretation
  // ──────────────────────────────────────────────────────────
  const buildClinicalNarrative = () => {
    const affected = Object.entries(visualMap)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const regionsText = affected.length > 0 ? affected.join(", ") : "the tested";

    if (diagnosis === "NORMAL") {
      return {
        motor: "Motor nerve conduction parameters across the tested limbs fall within normal amplitude, distal latency, and conduction velocity ranges.",
        sensory: "Sensory nerve conduction studies show preserved amplitudes, peak latencies, and conduction velocities bilaterally.",
        emg: "Needle EMG analysis did not identify significant spontaneous denervation activity, fibrillation potentials, or neurogenic motor unit changes.",
        impression: "This is a normal electrodiagnostic screening pattern.",
        conclusion: "No electrophysiological evidence of Motor Neuron Disease or peripheral neuropathy was identified in this screening. Routine follow-up is advised only if new symptoms develop."
      };
    }
    if (diagnosis === "ALS") {
      return {
        motor: "Motor nerve conduction studies show reduced compound muscle action potential (CMAP) amplitudes across multiple limb segments, consistent with widespread lower motor neuron involvement.",
        sensory: "Sensory nerve conduction amplitudes and velocities remain largely preserved, a pattern typically expected alongside a predominantly motor neurodegenerative process.",
        emg: `Needle EMG demonstrates active and chronic neurogenic changes involving the ${regionsText} region(s), including denervation activity and motor unit action potentials with reduced recruitment.`,
        impression: "This is an abnormal electrodiagnostic study.",
        conclusion: "The combination of widespread motor involvement with relative sensory sparing is suggestive of Amyotrophic Lateral Sclerosis (ALS). Clinical correlation with a neuromuscular neurologist is strongly recommended."
      };
    }
    if (diagnosis === "PMA") {
      return {
        motor: "Motor nerve conduction studies reveal reduced CMAP amplitudes localized primarily to limb musculature, without significant slowing of conduction velocities.",
        sensory: "Sensory nerve conduction velocities and amplitudes remain within normal limits, supporting a predominantly motor pathology.",
        emg: `Needle EMG shows neurogenic changes concentrated in the ${regionsText} region(s), with features of chronic partial denervation and reinnervation.`,
        impression: "This is an abnormal electrodiagnostic study.",
        conclusion: "Findings are consistent with a pure lower motor neuron syndrome such as Progressive Muscular Atrophy (PMA). Further clinical and neurological evaluation is recommended to confirm this pattern."
      };
    }
    if (diagnosis === "PBP") {
      return {
        motor: "Motor conduction studies of the limbs are largely preserved; findings are more localized to cranial/bulbar motor pathways.",
        sensory: "Sensory nerve conduction studies are within normal limits.",
        emg: "Needle EMG examination of bulbar-innervated muscles (tongue, orbicularis oris) shows active denervation activity, consistent with bulbar motor neuron involvement affecting speech and swallowing function.",
        impression: "This is an abnormal electrodiagnostic study.",
        conclusion: "The findings are consistent with Progressive Bulbar Palsy (PBP). Referral to a neurologist along with a Speech-Language Pathologist (SLP) is advised for comprehensive management."
      };
    }
    return {
      motor: "Motor nerve conduction findings from this screening require further specialist review.",
      sensory: "Sensory nerve conduction findings from this screening require further specialist review.",
      emg: "Needle EMG interpretation is pending detailed clinical correlation.",
      impression: "This study requires further evaluation.",
      conclusion: "Please consult a neurologist for a conclusive clinical interpretation."
    };
  };

  // ──────────────────────────────────────────────────────────
  // 🟢 Builds the anatomical body-map SVG markup
  // ──────────────────────────────────────────────────────────
  const buildBodyDiagramSVG = () => {
    const activeColor = "#ef4444";
    const inactiveColor = "#cbd5e1";
    const bulbarFill = visualMap.bulbar ? activeColor : inactiveColor;
    const cervicalFill = visualMap.cervical ? activeColor : inactiveColor;
    const thoracicFill = visualMap.thoracic ? activeColor : inactiveColor;
    const lumbosacralFill = visualMap.lumbosacral ? activeColor : inactiveColor;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width="180" height="360">
        <path d="M100,20 C110,20 115,30 115,45 C115,55 125,65 135,75 C145,85 160,110 160,150 C160,170 155,200 150,220 C148,225 142,200 140,160 C138,150 135,140 135,160 C135,190 140,240 140,290 C140,320 135,370 130,390 C128,395 122,395 122,380 C122,350 120,300 115,260 C110,240 105,240 100,240 C95,240 90,240 85,260 C80,300 78,350 78,380 C78,395 72,395 70,390 C65,370 60,320 60,290 C60,240 65,190 65,160 C65,140 62,150 60,160 C58,200 52,225 50,220 C45,200 40,170 40,150 C40,110 55,85 65,75 C75,65 85,55 85,45 C85,30 90,20 100,20 Z"
          fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2" />
        <path d="M100 20 L120 50 L100 80 L80 50 Z" fill="${bulbarFill}" opacity="${visualMap.bulbar ? 0.9 : 0.4}" />
        <rect x="85" y="90" width="30" height="40" rx="4" fill="${cervicalFill}" opacity="${visualMap.cervical ? 0.9 : 0.4}" />
        <rect x="80" y="140" width="40" height="60" rx="4" fill="${thoracicFill}" opacity="${visualMap.thoracic ? 0.9 : 0.4}" />
        <rect x="85" y="210" width="30" height="50" rx="4" fill="${lumbosacralFill}" opacity="${visualMap.lumbosacral ? 0.9 : 0.4}" />
      </svg>`;
  };

  // ──────────────────────────────────────────────────────────
  // 🟢 GENERATE FULL REPORT
  // ──────────────────────────────────────────────────────────
  const handleGenerateReport = () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Please allow pop-ups for this site to generate the report.");
      return;
    }

    const generatedAt = new Date().toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const resolvedPatientName = patientName || user?.full_name || user?.name || "Patient";
    const patientEmail = user?.email || "N/A";

    const liveDocs = systemDoctors.slice(0, 4);
    const remainingSlots = 4 - liveDocs.length;
    const fallbackDocs = remainingSlots > 0 ? KARACHI_HOSPITALS.slice(0, remainingSlots) : [];

    const escapeHtml = (str) =>
      String(str ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));

    const doctorsHTML = [
      ...liveDocs.map(doc => `
        <div class="doc-card">
          <h4>Dr. ${escapeHtml(doc.full_name)}</h4>
          <p class="spec">${escapeHtml(doc.specialization || targetSpecialty)}</p>
          <p class="hosp">${escapeHtml(doc.hospital || "Clinical Center")}</p>
          <p class="note">Matched based on your screening category: ${escapeHtml(specialistGuidance.label)}.</p>
        </div>`),
      ...fallbackDocs.map(h => `
        <div class="doc-card">
          <h4>${escapeHtml(h.name)}</h4>
          <p class="spec">${escapeHtml(h.doctor)}</p>
          <p class="hosp">${escapeHtml(h.contact)}</p>
          <p class="note">Recommended facility for ${escapeHtml(specialistGuidance.label)} consultation in Karachi.</p>
        </div>`)
    ].join("");

    const rehabHTML = rehabPlans.length > 0
      ? rehabPlans.map(ex => {
          const ytLink = getExerciseYouTubeLink(ex.title);
          return `
          <div class="rehab-item">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
              <h4 style="margin:0;">${escapeHtml(ex.title)} <span class="tag">${escapeHtml(ex.type)}</span></h4>
              ${ytLink ? `<a href="${ytLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#fee2e2;border:1px solid #fecaca;color:#dc2626;font-size:10px;font-weight:bold;text-decoration:none;white-space:nowrap;">▶ Watch Tutorial</a>` : ""}
            </div>
            <p>${escapeHtml(ex.steps)}</p>
          </div>`;
        }).join("")
      : `<p>No specific rehabilitation protocol assigned. General wellness practices — light activity, hydration, and consistent sleep — are recommended.</p>`;

    const narrative = buildClinicalNarrative();
    const bodyDiagramSVG = buildBodyDiagramSVG();

    const legendItem = (label, active) => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${active ? "#ef4444" : "#cbd5e1"};"></span> ${label}
      </span>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>NeuroGuard AI - Screening Report</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
            position: relative;
            max-width: 900px;
            margin: 0 auto;
          }
          .watermark {
            position: fixed;
            top: 40%;
            left: 12%;
            font-size: 60px;
            color: rgba(79,70,229,0.07);
            font-weight: 900;
            transform: rotate(-30deg);
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
          }
          .header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px;
            position: relative; z-index: 1;
          }
          .header h1 { color: #4f46e5; font-size: 22px; margin: 0; }
          .header span { font-size: 11px; color: #64748b; font-weight: bold; }
          .patient-info {
            display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
            background: #f8fafc; padding: 14px 18px; border-radius: 10px;
            margin-bottom: 20px; font-size: 13px; position: relative; z-index: 1;
          }
          .section { margin-bottom: 22px; position: relative; z-index: 1; }
          .section h3 {
            font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
            color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;
          }
          .badge {
            display: inline-block; padding: 4px 12px; border-radius: 20px;
            font-size: 11px; font-weight: bold; color: #fff; background: #4f46e5;
          }
          .diagram-wrap {
            display: flex; gap: 24px; align-items: center; flex-wrap: wrap;
          }
          .diagram-box { text-align: center; }
          .legend-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; justify-content: center; }
          .legend-item { font-size: 10px; color: #475569; display: flex; align-items: center; gap: 4px; }
          .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
          .narrative-block { flex: 1; min-width: 260px; }
          .narrative-block h4 {
            font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
            color: #334155; margin: 10px 0 4px 0;
          }
          .narrative-block p { font-size: 12px; line-height: 1.6; margin: 0 0 6px 0; color: #334155; }
          .impression-line { font-weight: bold; font-size: 12px; margin-top: 8px; }
          .doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .doc-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
          .doc-card h4 { margin: 0 0 4px 0; font-size: 13px; }
          .doc-card .spec { color: #4f46e5; font-size: 11px; font-weight: bold; margin: 0; }
          .doc-card .hosp { font-size: 11px; color: #64748b; margin: 2px 0; }
          .doc-card .note { font-size: 10px; color: #94a3b8; margin-top: 4px; }
          .rehab-item {
            border-left: 3px solid #4f46e5; padding: 8px 14px; margin-bottom: 10px;
            background: #f8fafc; border-radius: 6px;
          }
          .rehab-item h4 { margin: 0 0 4px 0; font-size: 13px; }
          .tag {
            float: right; font-size: 9px; background: #4f46e5; color: #fff;
            padding: 2px 8px; border-radius: 10px;
          }
          .disclaimer {
            margin-top: 30px; padding: 14px; border: 1px dashed #f59e0b;
            background: #fffbeb; border-radius: 10px; font-size: 11px; color: #92400e;
            position: relative; z-index: 1;
          }
          .footer {
            text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8;
            position: relative; z-index: 1;
          }
          @media print {
            .watermark { color: rgba(79,70,229,0.08); }
          }
        </style>
      </head>
      <body>
        <div class="watermark">NeuroGuard AI</div>
        <div class="header">
          <h1>🧠 NeuroGuard AI — Screening Report</h1>
          <span>Generated: ${generatedAt}</span>
        </div>
        <div class="patient-info">
          <div><strong>Patient Name:</strong> ${escapeHtml(resolvedPatientName)}</div>
          <div><strong>Email:</strong> ${escapeHtml(patientEmail)}</div>
          <div><strong>Report Timestamp:</strong> ${generatedAt}</div>
        </div>
        <div class="section">
          <h3>Screening Result</h3>
          <p><span class="badge">${escapeHtml(diagnosis)}</span> &nbsp; Risk Level: <strong>${escapeHtml(risk)}</strong></p>
        </div>

        <div class="section">
          <h3>Neuro-Mapping &amp; Clinical Interpretation</h3>
          <div class="diagram-wrap">
            <div class="diagram-box">
              ${bodyDiagramSVG}
              <div class="legend-row">
                ${legendItem("Bulbar", visualMap.bulbar)}
                ${legendItem("Cervical", visualMap.cervical)}
                ${legendItem("Thoracic", visualMap.thoracic)}
                ${legendItem("Lumbosacral", visualMap.lumbosacral)}
              </div>
              <p style="font-size:10px;color:#94a3b8;margin-top:6px;max-width:180px;">Regions flagged: ${regionsFlaggedCount} / 4</p>
            </div>
            <div class="narrative-block">
              <h4>Motor Nerve Conduction Studies</h4>
              <p>${narrative.motor}</p>
              <h4>Sensory Nerve Conduction Studies</h4>
              <p>${narrative.sensory}</p>
              <h4>EMG / Needle Exam</h4>
              <p>${narrative.emg}</p>
              <p class="impression-line">Impression: ${narrative.impression}</p>
              <h4>Conclusion</h4>
              <p>${narrative.conclusion}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Recommended Recovery Steps</h3>
          ${rehabHTML}
        </div>
        <div class="section">
          <h3>Matched Specialists</h3>
          <p style="font-size:12px; color:#64748b; margin-top:-4px;">Based on your screening category: <strong>${escapeHtml(specialistGuidance.label)}</strong></p>
          <div class="doc-grid">${doctorsHTML}</div>
        </div>
        <div class="disclaimer">
          ⚠️ <strong>Disclaimer:</strong> This report is generated by an AI screening model and is <strong>not a confirmed medical diagnosis</strong>. AI predictions can be incorrect. Please consult a qualified neurologist to verify these findings before making any medical decisions.
        </div>
        <div class="footer">Generated by NeuroGuard AI &copy; ${new Date().getFullYear()} — Confidential Patient Document</div>
        <script>
          window.onload = function () { window.print(); };
        </script>
      </body>
      </html>`;

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-500">

      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-xs mb-6 hover:text-blue-600 transition-colors tracking-wider">
        <ArrowLeft size={14} /> BACK TO DASHBOARD
      </button>

      {/* ⚠️ MEDICAL / LEGAL DISCLAIMER */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 mb-5 shadow-sm w-fit max-w-full">
        <ShieldAlert className="text-amber-500 flex-shrink-0" size={16} />
        <p className="text-[11px] md:text-xs font-bold text-amber-800 truncate">
          AI screening only — not a medical diagnosis. Please consult a neurologist to confirm.
        </p>
      </div>

      {/* FIXED SOLID DESIGN */}
      <div className={`p-6 rounded-2xl border-2 ${ui.border} ${ui.light} mb-5 shadow-md transition-all`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex-shrink-0">
            {ui.icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">AI Screening Status</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold text-white shadow-sm ${ui.bg}`}>{ui.badgeText}</span>
              <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 text-slate-100 shadow-sm">Type: {diagnosis}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analysis Method</p>
          <p className="text-lg font-black text-slate-900 mt-1">EMG + NCS</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
          <p className="text-lg font-black text-slate-900 mt-1">{risk}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regions Flagged</p>
          <p className="text-lg font-black text-slate-900 mt-1">{regionsFlaggedCount} / 4</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan Date</p>
          <p className="text-lg font-black text-slate-900 mt-1">{scanDateLabel}</p>
        </div>
      </div>

      {/* FIXED SOLID BOX */}
      <div className={`p-6 border-l-4 rounded-xl mb-6 shadow-md ${isNormal ? "bg-emerald-100/90 border-emerald-500" : "bg-blue-100/90 border-blue-500"}`}>
        <h3 className={`font-black text-xs uppercase tracking-widest mb-3 ${isNormal ? "text-emerald-900" : "text-blue-900"}`}>
          {isNormal ? "✨ Wellness Guidance Engine" : "💡 Simple Summary"}
        </h3>
        {renderSummaryText()}
      </div>

      {/* ── VISUAL NEURO-MAPPING ENGINE & REHAB PLATFORM ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* Left Panel: The Anatomical SVG Core Map */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center justify-center min-h-[420px]">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-center">
              <Activity className="text-indigo-600 h-5 w-5" /> Neuro-Mapping Blueprint
            </h3>
            <p className="text-xs text-slate-400 mt-1">Glowing red markers pinpoint muscle regions with active diagnostic irregularities.</p>
          </div>

          <div className="relative w-44 h-auto my-auto flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" className="w-full h-auto drop-shadow-md">
              <path 
                d="M100,20 C110,20 115,30 115,45 C115,55 125,65 135,75 C145,85 160,110 160,150 C160,170 155,200 150,220 C148,225 142,200 140,160 C138,150 135,140 135,160 C135,190 140,240 140,290 C140,320 135,370 130,390 C128,395 122,395 122,380 C122,350 120,300 115,260 C110,240 105,240 100,240 C95,240 90,240 85,260 C80,300 78,350 78,380 C78,395 72,395 70,390 C65,370 60,320 60,290 C60,240 65,190 65,160 C65,140 62,150 60,160 C58,200 52,225 50,220 C45,200 40,170 40,150 C40,110 55,85 65,75 C75,65 85,55 85,45 C85,30 90,20 100,20 Z" 
                fill="#f1f5f9" 
                stroke="#cbd5e1" 
                strokeWidth="2"
              />

              <path d="M100 20 L120 50 L100 80 L80 50 Z" 
                fill={visualMap.bulbar ? "#ef4444" : "#cbd5e1"}
                stroke={visualMap.bulbar ? "#dc2626" : "transparent"}
                strokeWidth={visualMap.bulbar ? "2" : "0"}
                className={visualMap.bulbar ? "animate-pulse" : ""}
                style={{ transition: "all 0.7s ease", opacity: visualMap.bulbar ? 0.9 : 0.4 }}
              />

              <rect x="85" y="90" width="30" height="40" rx="4"
                fill={visualMap.cervical ? "#ef4444" : "#cbd5e1"}
                stroke={visualMap.cervical ? "#dc2626" : "transparent"}
                strokeWidth={visualMap.cervical ? "2" : "0"}
                className={visualMap.cervical ? "animate-pulse" : ""}
                style={{ transition: "all 0.7s ease", opacity: visualMap.cervical ? 0.9 : 0.4 }}
              />

              <rect x="80" y="140" width="40" height="60" rx="4"
                fill={visualMap.thoracic ? "#ef4444" : "#cbd5e1"}
                stroke={visualMap.thoracic ? "#dc2626" : "transparent"}
                strokeWidth={visualMap.thoracic ? "2" : "0"}
                className={visualMap.thoracic ? "animate-pulse" : ""}
                style={{ transition: "all 0.7s ease", opacity: visualMap.thoracic ? 0.9 : 0.4 }}
              />

              <rect x="85" y="210" width="30" height="50" rx="4"
                fill={visualMap.lumbosacral ? "#ef4444" : "#cbd5e1"}
                stroke={visualMap.lumbosacral ? "#dc2626" : "transparent"}
                strokeWidth={visualMap.lumbosacral ? "2" : "0"}
                className={visualMap.lumbosacral ? "animate-pulse" : ""}
                style={{ transition: "all 0.7s ease", opacity: visualMap.lumbosacral ? 0.9 : 0.4 }}
              />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              <span className={`h-2 w-2 rounded-full transition-colors ${visualMap.bulbar ? "bg-red-500" : "bg-slate-300"}`}></span> Bulbar
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              <span className={`h-2 w-2 rounded-full transition-colors ${visualMap.cervical ? "bg-red-500" : "bg-slate-300"}`}></span> Cervical
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              <span className={`h-2 w-2 rounded-full transition-colors ${visualMap.thoracic ? "bg-red-500" : "bg-slate-300"}`}></span> Thoracic
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              <span className={`h-2 w-2 rounded-full transition-colors ${visualMap.lumbosacral ? "bg-red-500" : "bg-slate-300"}`}></span> Lumbosacral
            </span>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-3 px-1">
              <div className="p-2.5 rounded-xl bg-indigo-50 flex-shrink-0">
                <Brain className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Basis</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">Motor & Sensory NCS + EMG Pattern Analysis</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center mt-3 px-2 leading-relaxed">
              This classification is derived from nerve conduction velocities, amplitude readings, and muscle denervation markers extracted from your uploaded report.
            </p>
          </div>
        </div>

        {/* Right Panel: Tailored Home Exercises Rehabilitation Protocols */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 md:col-span-2 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-amber-500 h-5 w-5" /> Target Physical Therapy Protocols
            </h3>
            <p className="text-xs text-slate-400 mt-1">Immediate non-exhausting restorative tasks recommended to stabilize localized motor pathways.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {rehabPlans.length > 0 ? (
              rehabPlans.map((ex, idx) => {
                const ytLink = getExerciseYouTubeLink(ex.title);
                const copyText = `${ex.title}\nType: ${ex.type}\nSteps: ${ex.steps}\nYouTube: ${ytLink || "N/A"}`;
                const isCopied = copiedId === `ex-${idx}`;
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-100 hover:border-indigo-100 transition-all shadow-sm group">
                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <h4 className="font-bold text-indigo-950 text-base md:text-lg">{ex.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-600 text-white rounded-full whitespace-nowrap">
                        {ex.type}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium mb-3">{ex.steps}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ytLink && (
                        <a
                          href={ytLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[11px] font-bold transition-all hover:scale-105"
                        >
                          <PlayCircle size={14} /> Watch Tutorial
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(copyText, setCopiedId, `ex-${idx}`)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all hover:scale-105 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isCopied ? <CheckCheck size={14} /> : <Copy size={14} />}
                        {isCopied ? "Copied!" : "Copy Details"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-400 text-sm">
                <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No rehabilitation protocols assigned for this screening result.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <Heart className="mx-auto text-emerald-600 mb-1" size={18} />
              <p className="text-[9px] font-black text-emerald-800 uppercase tracking-wide">Stay Active</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50">
              <Activity className="mx-auto text-blue-600 mb-1" size={18} />
              <p className="text-[9px] font-black text-blue-800 uppercase tracking-wide">Track Progress</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50">
              <Stethoscope className="mx-auto text-amber-600 mb-1" size={18} />
              <p className="text-[9px] font-black text-amber-800 uppercase tracking-wide">Regular Checkup</p>
            </div>
          </div>
        </div>

      </div>

      {/* 🟢 GENERATE REPORT BUTTON */}
      <button
        type="button"
        onClick={handleGenerateReport}
        className="w-full mb-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
      >
        <FileText size={16} /> Generate Full Report
      </button>

      {/* Doctor Panel Container */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Dynamic Medical Action Panel</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Showing active <span className="text-blue-600">{specialistGuidance.label}</span> registered in system database
            </p>
          </div>
          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${isNormal ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
            🛡️ Match: {targetSpecialty}
          </span>
        </div>

        {specialistGuidance.note && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <Stethoscope className="text-indigo-500 flex-shrink-0 mt-0.5" size={14} />
            <p className="text-[11px] font-semibold text-indigo-900 leading-relaxed">{specialistGuidance.note}</p>
          </div>
        )}

        {isFetchingDocs ? (
          <div className="text-center py-6 text-slate-500 font-bold text-xs"><Loader2 className="animate-spin inline mr-2 text-blue-600" size={16} /> Filtering medical database...</div>
        ) : (
          <div className="space-y-6">

            {systemDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemDoctors.map((doc, i) => (
                  <div key={i} className="p-4 rounded-xl border-2 bg-slate-50 border-slate-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-md hover:border-blue-200">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">Dr. {doc.full_name}</p>
                      <p className="text-[10px] text-blue-600 font-black mt-0.5 uppercase tracking-wider">{doc.hospital || "Clinical Center"}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{doc.specialty || targetSpecialty}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConnectDoctor(doc.email)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all transform active:scale-95 cursor-pointer ${
                        connectedDoc === doc.email ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700 shadow-md"
                      }`}
                    >
                      {connectedDoc === doc.email ? "✓ Connected" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-bold bg-slate-50/50">
                No live {targetSpecialty} panel found matching local network protocols.
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Karachi {targetSpecialty} Facilities:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KARACHI_HOSPITALS.map((hosp, index) => (
                  <div key={index} className="p-3 rounded-xl border-2 bg-white border-slate-100 text-xs flex flex-col justify-between shadow-sm">
                    <div>
                      <p className="font-black text-slate-900">{hosp.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{isNormal ? "General OPD Health" : hosp.doctor}</p>
                    </div>
                    <p className="text-[10px] text-blue-600 font-black mt-2 flex items-center gap-1">
                      <Phone size={10} /> {hosp.contact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <button 
        type="button"
        onClick={() => { setUploadAnalysis(null); setSelectedFile(null); }} 
        className="w-full py-4 bg-slate-900 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-red-200/50 transform active:scale-[0.99] cursor-pointer"
      >
        ✕ Discard and Upload New Report
      </button>

      <p className="text-center text-[10px] font-semibold text-slate-400 mt-4">
        This screening result is an AI-generated estimate, not a clinical diagnosis.
      </p>
    </div>
  );
}

// ── UPLOAD GUIDE COMPONENT ──
function UploadGuideSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: <FileImage className="h-6 w-6" />,
      title: "Prepare Your Report",
      desc: "Gather your EMG, Nerve Conduction Study (NCS), or any medical report. Ensure all pages are clean, unfolded, and text is clearly visible.",
      tips: [
        "Use original reports — avoid photocopies if possible",
        "Remove any staples, paper clips, or tape",
        "Flatten curled edges before scanning"
      ],
      color: "blue"
    },
    {
      icon: <Sun className="h-6 w-6" />,
      title: "Good Lighting is Key",
      desc: "Place your report on a flat surface under bright, even lighting. Avoid shadows, glare, or dim environments that can blur text.",
      tips: [
        "Use natural daylight or a bright desk lamp",
        "Avoid flash photography — it creates glare spots",
        "Ensure no shadows fall on the document text"
      ],
      color: "amber"
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Capture the Full Page",
      desc: "Hold your phone directly above the document. Make sure all four corners and edges are visible in the frame — no cropping!",
      tips: [
        "Keep the camera parallel to the page (not angled)",
        "Leave a small margin around all edges",
        "Capture one page at a time for best results"
      ],
      color: "indigo"
    },
    {
      icon: <ScanLine className="h-6 w-6" />,
      title: "Check Clarity & Upload",
      desc: "Zoom in and verify that all text, numbers, and doctor signatures are readable. Blurry or cut-off images will be rejected.",
      tips: [
        "Text should be sharp enough to read easily",
        "File size: Max 10MB per image/PDF",
        "Supported formats: JPG, PNG, PDF"
      ],
      color: "emerald"
    }
  ];

  const dosDonts = [
    {
      type: "do",
      icon: <Check className="h-4 w-4 text-emerald-600" />,
      items: [
        "Place on a dark contrasting background",
        "Hold phone steady — use both hands",
        "Capture in high resolution",
        "Include all pages of multi-page reports"
      ]
    },
    {
      type: "dont",
      icon: <X className="h-4 w-4 text-red-500" />,
      items: [
        "Don't use flash or direct light on glossy paper",
        "Don't fold, crumple, or wrinkle the report",
        "Don't capture at an angle or from the side",
        "Don't upload screenshots or low-res images"
      ]
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">How to Upload Your Report</h3>
          <p className="text-xs text-slate-500 font-medium">Follow these 4 simple steps for the best AI analysis results</p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeStep === idx
                ? "bg-indigo-600 text-white shadow-md"
                : activeStep > idx
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {activeStep > idx ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs font-black">{idx + 1}</span>}
            {step.title}
          </button>
        ))}
      </div>

      {/* Active Step Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-2xl border-2 bg-${steps[activeStep].color}-50 border-${steps[activeStep].color}-200 transition-all duration-300`}>
          <div className={`p-3 rounded-xl bg-${steps[activeStep].color}-100 w-fit mb-4 text-${steps[activeStep].color}-600`}>
            {steps[activeStep].icon}
          </div>
          <h4 className={`text-lg font-black text-${steps[activeStep].color}-900 mb-2`}>
            Step {activeStep + 1}: {steps[activeStep].title}
          </h4>
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">
            {steps[activeStep].desc}
          </p>
          <div className="space-y-2">
            {steps[activeStep].tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className={`h-4 w-4 text-${steps[activeStep].color}-500 flex-shrink-0 mt-0.5`} />
                <p className="text-xs text-slate-600 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Illustration Placeholder */}
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="p-4 rounded-full bg-white shadow-sm mb-3">
            <Eye className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-500">Visual Preview</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
            {activeStep === 0 && "Lay your report flat on a clean, dark surface"}
            {activeStep === 1 && "Position a lamp above to eliminate shadows"}
            {activeStep === 2 && "Hold camera directly overhead — not at an angle"}
            {activeStep === 3 && "Zoom in to confirm text is sharp and readable"}
          </p>
        </div>
      </div>

      {/* Do's & Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dosDonts.map((section, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border-2 ${section.type === "do" ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <h5 className={`text-sm font-black uppercase tracking-wider ${section.type === "do" ? "text-emerald-800" : "text-red-800"}`}>
                {section.type === "do" ? "✓ Do's" : "✗ Don'ts"}
              </h5>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${section.type === "do" ? "bg-emerald-400" : "bg-red-400"}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* File Requirements Footer */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500">Max Size: <span className="text-slate-800">10MB</span></span>
        </div>
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500">Formats: <span className="text-slate-800">JPG, PNG, PDF</span></span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500">Quality: <span className="text-slate-800">300 DPI recommended</span></span>
        </div>
      </div>
    </div>
  );
}

// ── RISK HISTORY CHART WRAPPER ──
function RiskHistorySection({ userEmail }) {
  if (!userEmail) return null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Screening History Trend</h3>
          <p className="text-xs text-slate-500 font-medium">Track your MND risk assessment over time</p>
        </div>
      </div>
      <RiskHistoryChart userEmail={userEmail} />
    </div>
  );
}

// ── MAIN PATIENT DASHBOARD COMPONENT ──
export default function PatientDashboard({
  user,
  uploadAnalysis,
  setUploadAnalysis,
  selectedFile,
  setSelectedFile,
  isLoading,
  setIsLoading,
}) {
  const [showResultPage, setShowResultPage] = useState(false);
  const [profileName, setProfileName] = useState(user?.full_name || user?.name || "Patient");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.email) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/profile?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.full_name) setProfileName(data.full_name);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (uploadAnalysis && Object.keys(uploadAnalysis).length > 0) {
      setShowResultPage(true);
    } else {
      setShowResultPage(false);
    }
  }, [uploadAnalysis]);

  useEffect(() => {
    if (typeof setSelectedFile === "function") setSelectedFile(null);
  }, [setSelectedFile]);


  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a medical report first.");
      return;
    }
    if (typeof setIsLoading === "function") setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("email", user.email);

      const apiPromise = fetch("http://127.0.0.1:8000/upload-report", {
        method: "POST",
        body: formData,
      });

      const timerPromise = new Promise((resolve) => setTimeout(resolve, 8000));

      const [res] = await Promise.all([apiPromise, timerPromise]);

      const data = await res.json();
      if (data.success && (data.analysis || data.data)) {
        setUploadAnalysis(data.analysis || data.data);
        setShowResultPage(true);
      } else {
        alert("Upload failed. Please check the file format.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not connect to server. Check backend service.");
    } finally {
      if (typeof setIsLoading === "function") setIsLoading(false);
    }
  };

  if (showResultPage && uploadAnalysis) {
    return (
      <ReportResultPage
        uploadAnalysis={uploadAnalysis}
        setUploadAnalysis={(val) => {
          setUploadAnalysis(val);
          if (!val) setShowResultPage(false);
        }}
        setSelectedFile={setSelectedFile}
        user={user}
        patientName={profileName}
        onBack={() => setShowResultPage(false)} 
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500 pb-20">
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Portal</p>
            <h3 className="text-xl font-black text-slate-800">{profileName}</h3>
          </div>
        </div>
        <span className="hidden md:inline px-4 py-2 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">System Online</span>
      </div>

      {/* 🆕 UPLOAD GUIDE SECTION */}
      {showGuide && (
        <div className="relative">
          <UploadGuideSection />
          <button
            onClick={() => setShowGuide(false)}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Hide guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!showGuide && (
        <button
          onClick={() => setShowGuide(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
        >
          <Lightbulb className="h-4 w-4" /> Show Upload Guide
        </button>
      )}

      {/* 🆕 RISK HISTORY CHART SECTION */}
      <RiskHistorySection userEmail={user?.email} />

      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 mb-10">
        <div className="p-12 md:w-2/3">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Medical Report AI</h2>
            <p className="text-slate-500 text-lg">Upload EMG or Conduction reports for MND screening.</p>
          </div>

          <div className="relative group">
            <input type="file" id="file-upload" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
            <label htmlFor="file-upload" className={`block border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${selectedFile ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"}`}>
              <FileText className={`h-16 w-16 mx-auto mb-4 ${selectedFile ? "text-blue-600" : "text-slate-400"}`} />
              <p className="font-bold text-lg">{selectedFile ? selectedFile.name : "Choose Medical Report"}</p>
            </label>
          </div>

          <button type="button" onClick={handleFileUpload} disabled={!selectedFile || isLoading} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all">
            {isLoading ? <><Loader2 className="animate-spin h-6 w-6" /> Analyzing Matrix...</> : <><BrainCircuit className="h-6 w-6" /> Upload & Analyze <ArrowRight size={18} /></>}
          </button>
        </div>

        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-12 md:w-1/3 text-white flex flex-col justify-between">
          <ShieldCheck className="h-16 w-16 mb-6 opacity-90" />
          <p className="text-blue-100 text-sm">Our AI extracts data from your report to calculate MND risk accurately.</p>
          <div className="mt-6 bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-bold text-[10px] uppercase">Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
