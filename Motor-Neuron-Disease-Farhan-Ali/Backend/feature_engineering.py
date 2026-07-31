import json
import numpy as np

FEATURE_ORDER = [
    "emg_count", "emg_bulbar_count", "emg_limb_count", "emg_fibs_score", "emg_psw_score",
    "mncs_count", "mncs_nr_count", "mncs_latency_mean", "mncs_amplitude_mean", "mncs_ncv_mean",
    "sncs_count", "sncs_nr_count", "sncs_latency_mean", "sncs_amplitude_mean", "sncs_ncv_mean"
]

BULBAR_KEYWORDS = ["oris", "tongue", "genio", "sternocleidomastoid", "trapezius"]

def safe_float(x):
    if x is None: return np.nan
    s = str(x).strip().upper()
    if s in {"", "-", "--", "N/A", "NA", "NONE", "NR", "N.R.", "NOT RECORDED", "NOT RECORDABLE"}:
        return np.nan
    s = s.replace(",", ".")
    try: return float(s)
    except: return np.nan

def severity_score(val):
    if not val: return 0
    s = str(val).strip().upper().replace(" ", "")
    if any(k in s for k in ["++++", "+4", "4+", "SEVERE"]): return 4
    if any(k in s for k in ["+++", "+3", "3+", "MODERATE-TO-SEVERE"]): return 3
    if any(k in s for k in ["++", "+2", "2+", "MODERATE"]): return 2
    if any(k in s for k in ["+", "1", "1+", "FEW", "MILD", "PRESENT"]): return 1
    return 0

def clean_row_value(v):
    if v is None: return ""
    s = str(v).strip()
    if s.lower() in {"n/a", "na", "-", "--", "none", "null", ""}: return ""
    return s

def normalize_report_json(data):
    cleaned = {
        "Motor_Nerve_Conduction_Studies": [],
        "Sensory_Nerve_Conduction_Studies": [],
        "Electromyography": [],
        "Impression": str(data.get("Impression", "")).strip(),
        "Patient_Name": str(data.get("Patient_Name", "")).strip(),
        "Patient_Age": str(data.get("Patient_Age", "")).strip(),
        "Report_Date": str(data.get("Report_Date", "")).strip()
    }
    seen = set()
    for row in data.get("Motor_Nerve_Conduction_Studies", []):
        r = {
            "Nerve_Muscles": clean_row_value(row.get("Nerve_Muscles")),
            "Stimulus_Site": clean_row_value(row.get("Stimulus_Site")),
            "Latency_ms": clean_row_value(row.get("Latency_ms")),
            "Distance_cm": clean_row_value(row.get("Distance_cm")),
            "Amplitude_mv": clean_row_value(row.get("Amplitude_mv")),
            "NCV_ms": clean_row_value(row.get("NCV_ms")),
        }
        key = ("M", tuple(r.items()))
        if any(r.values()) and key not in seen:
            cleaned["Motor_Nerve_Conduction_Studies"].append(r)
            seen.add(key)
    for row in data.get("Sensory_Nerve_Conduction_Studies", []):
        r = {
            "Nerve": clean_row_value(row.get("Nerve")),
            "Recording_Site": clean_row_value(row.get("Recording_Site")),
            "Stimulation_Site": clean_row_value(row.get("Stimulation_Site")),
            "Latency_ms": clean_row_value(row.get("Latency_ms")),
            "Distance_cm": clean_row_value(row.get("Distance_cm")),
            "Amplitude_uv": clean_row_value(row.get("Amplitude_uv")),
            "NCV_ms": clean_row_value(row.get("NCV_ms")),
        }
        key = ("S", tuple(r.items()))
        if any(r.values()) and key not in seen:
            cleaned["Sensory_Nerve_Conduction_Studies"].append(r)
            seen.add(key)
    for row in data.get("Electromyography", []):
        r = {
            "Muscles": clean_row_value(row.get("Muscles")),
            "Fibs": clean_row_value(row.get("Fibs")),
            "Psw": clean_row_value(row.get("Psw")),
            "Others": clean_row_value(row.get("Others")),
            "Amp": clean_row_value(row.get("Amp")),
            "Duration": clean_row_value(row.get("Duration")),
            "Polys": clean_row_value(row.get("Polys")),
            "Recruit": clean_row_value(row.get("Recruit")),
            "Interference": clean_row_value(row.get("Interference")),
        }
        key = ("E", tuple(r.items()))
        if any(r.values()) and key not in seen:
            cleaned["Electromyography"].append(r)
            seen.add(key)
    return cleaned

def extract_features_from_json(data):
    features = {}
    emg = data.get("Electromyography", [])
    mncs = data.get("Motor_Nerve_Conduction_Studies", [])
    sncs = data.get("Sensory_Nerve_Conduction_Studies", [])
    bulbar_count = limb_count = fibs_sum = psw_sum = 0
    for e in emg:
        m = str(e.get("Muscles", "")).lower()
        if any(k in m for k in BULBAR_KEYWORDS): bulbar_count += 1
        else: limb_count += 1
        fibs_sum += severity_score(e.get("Fibs"))
        psw_sum += severity_score(e.get("Psw"))
    features["emg_count"] = float(len(emg))
    features["emg_bulbar_count"] = float(bulbar_count)
    features["emg_limb_count"] = float(limb_count)
    features["emg_fibs_score"] = float(fibs_sum)
    features["emg_psw_score"] = float(psw_sum)
    lat, amp, ncv = [], [], []
    mncs_nr = 0
    for m in mncs:
        vals = [m.get("Latency_ms"), m.get("Amplitude_mv"), m.get("NCV_ms")]
        if any(str(v).strip().upper() in {"NR", "N.R."} for v in vals if v is not None): mncs_nr += 1
        f1, f2, f3 = safe_float(vals[0]), safe_float(vals[1]), safe_float(vals[2])
        if not np.isnan(f1): lat.append(f1)
        if not np.isnan(f2): amp.append(f2)
        if not np.isnan(f3): ncv.append(f3)
    features["mncs_count"] = float(len(mncs))
    features["mncs_nr_count"] = float(mncs_nr)
    features["mncs_latency_mean"] = float(np.mean(lat)) if lat else 4.0
    features["mncs_amplitude_mean"] = float(np.mean(amp)) if amp else 5.0
    features["mncs_ncv_mean"] = float(np.mean(ncv)) if ncv else 50.0
    s_lat, s_amp, s_ncv = [], [], []
    sncs_nr = 0
    for s in sncs:
        vals = [s.get("Latency_ms"), s.get("Amplitude_uv"), s.get("NCV_ms")]
        if any(str(v).strip().upper() in {"NR", "N.R."} for v in vals if v is not None): sncs_nr += 1
        f1, f2, f3 = safe_float(vals[0]), safe_float(vals[1]), safe_float(vals[2])
        if not np.isnan(f1): s_lat.append(f1)
        if not np.isnan(f2): s_amp.append(f2)
        if not np.isnan(f3): s_ncv.append(f3)
    features["sncs_count"] = float(len(sncs))
    features["sncs_nr_count"] = float(sncs_nr)
    features["sncs_latency_mean"] = float(np.mean(s_lat)) if s_lat else 3.0
    features["sncs_amplitude_mean"] = float(np.mean(s_amp)) if s_amp else 20.0
    features["sncs_ncv_mean"] = float(np.mean(s_ncv)) if s_ncv else 50.0
    return features