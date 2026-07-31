# Predict Scripts/single_patient_predict_v2.py
# ------------------------------------------------------------
# Single patient prediction using saved artifacts:
#  - rf_mnd_worldwide_model.joblib
#  - rf_mnd_worldwide_features.joblib
#  - rf_mnd_worldwide_label_encoder.joblib
#
# IMPORTANT:
# - This script does NOT train.
# - It only loads model + feature list + label encoder and predicts for ONE JSON file.
# ------------------------------------------------------------

import sys
import json
import numpy as np
from pathlib import Path
import joblib

# -----------------------------
# Utils
# -----------------------------
def safe_float(x):
    try:
        if x is None:
            return np.nan
        if isinstance(x, str) and x.strip().upper() in ("NR", "N/R", "-", ""):
            return np.nan
        return float(str(x).strip())
    except:
        return np.nan

def nanstats(arr):
    arr = np.array(arr, dtype=float)
    if arr.size == 0 or np.all(np.isnan(arr)):
        return 0.0, 0.0, 0.0, 0.0
    return (
        float(np.nanmean(arr)),
        float(np.nanstd(arr)),
        float(np.nanmin(arr)),
        float(np.nanmax(arr)),
    )

def get_any(d: dict, keys, default=None):
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return default

def is_bulbar_muscle(mname: str) -> bool:
    m = (mname or "").lower()
    return ("tongue" in m) or ("genioglossus" in m) or ("orbicularis" in m) or ("bulbar" in m)

def emg_token_to_score(v) -> int:
    s = str(v).strip()
    if s == "" or s.lower() in ("nil", "n", "normal", "nr", "n/r", "-", "td"):
        return 0
    if s == "+":
        return 1
    if s == "++":
        return 2
    if s == "+++":
        return 3
    return 1

# -----------------------------
# Feature extraction (same as training)
# -----------------------------
def extract_features_from_data(data: dict):
    is_worldwide = ("Motor_NCS" in data) or ("Sensory_NCS" in data) or ("EMG_Interpretation" in data)
    is_southcity = ("Motor_Nerve_Conduction_Studies" in data) or ("Sensory_Nerve_Conduction_Studies" in data) or ("Electromyography" in data)

    motor = []
    sensory = []

    # defaults
    m_lat_mean=m_lat_std=m_lat_min=m_lat_max=0.0
    m_amp_mean=m_amp_std=m_amp_min=m_amp_max=0.0
    m_ncv_mean=m_ncv_std=m_ncv_min=m_ncv_max=0.0

    s_lat_mean=s_lat_std=s_lat_min=s_lat_max=0.0
    s_amp_mean=s_amp_std=s_amp_min=s_amp_max=0.0
    s_ncv_mean=s_ncv_std=s_ncv_min=s_ncv_max=0.0

    emg_total_muscles=0.0
    emg_denervation_count=0.0
    emg_denervation_ratio=0.0
    emg_bulbar_abn_count=0.0
    emg_bulbar_abn_ratio=0.0

    active_den=0
    chronic=0
    fasc=0
    reg_count=0
    reg_has_bulbar=0
    reg_has_cerv=0
    reg_has_lumb=0

    fmt_hash=0.0
    lab_hash=0.0

    if is_worldwide:
        motor = data.get("Motor_NCS", []) or []
        sensory = data.get("Sensory_NCS", []) or []
        emg = data.get("EMG_Interpretation", {}) or {}

        m_lat = [safe_float(get_any(m, ["lat_ms", "Latency_ms", "latency_ms"])) for m in motor]
        m_amp = [safe_float(get_any(m, ["cmap_mV", "Amplitude_mv", "amplitude_mv", "amp_mV"])) for m in motor]
        m_ncv = [safe_float(get_any(m, ["ncv_mps", "NCV_ms", "ncv"])) for m in motor]
        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        s_lat = [safe_float(get_any(s, ["lat_ms", "Latency_ms", "latency_ms"])) for s in sensory]
        s_amp = [safe_float(get_any(s, ["snap_uV", "Amplitude_uv", "amplitude_uv", "snap_uv"])) for s in sensory]
        s_ncv = [safe_float(get_any(s, ["ncv_mps", "NCV_ms", "ncv"])) for s in sensory]
        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

        active_den = int(bool(emg.get("active_denervation", False)))
        chronic    = int(bool(emg.get("chronic_neurogenic_changes", False)))
        fasc       = int(bool(emg.get("fasciculations", False)))

        regions = emg.get("regions_involved", []) or []
        regions_l = [str(r).lower() for r in regions]
        reg_count = int(len(regions_l))
        reg_has_bulbar = int("bulbar" in set(regions_l))
        reg_has_cerv   = int(any(r == "cervical" for r in regions_l))
        reg_has_lumb   = int(any(r == "lumbosacral" for r in regions_l))

        format_type = str(data.get("format_type", ""))
        lab_id = str(data.get("lab_id", ""))
        fmt_hash = (hash(format_type) % 1000) / 1000.0 if format_type else 0.0
        lab_hash = (hash(lab_id) % 1000) / 1000.0 if lab_id else 0.0

        emg_total_muscles = 0.0
        emg_denervation_count = float(active_den)
        emg_denervation_ratio = float(active_den)
        emg_bulbar_abn_count = float(reg_has_bulbar if active_den else 0)
        emg_bulbar_abn_ratio = float(reg_has_bulbar if active_den else 0)

    elif is_southcity:
        motor = data.get("Motor_Nerve_Conduction_Studies", []) or []
        sensory = data.get("Sensory_Nerve_Conduction_Studies", []) or []
        emg_rows = data.get("Electromyography", []) or []

        m_lat = [safe_float(get_any(m, ["Latency_ms", "lat_ms"])) for m in motor]
        m_amp = [safe_float(get_any(m, ["Amplitude_mv", "cmap_mV"])) for m in motor]
        m_ncv = [safe_float(get_any(m, ["NCV_ms", "ncv_mps"])) for m in motor]
        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        s_lat = [safe_float(get_any(s, ["Latency_ms", "lat_ms"])) for s in sensory]
        s_amp = [safe_float(get_any(s, ["Amplitude_uv", "snap_uV"])) for s in sensory]
        s_ncv = [safe_float(get_any(s, ["NCV_ms", "ncv_mps"])) for s in sensory]
        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

        emg_total_muscles = float(len(emg_rows))
        den_cnt = 0
        bulbar_den = 0

        for r in emg_rows:
            fibs_sc = emg_token_to_score(r.get("Fibs", "Nil"))
            psw_sc  = emg_token_to_score(r.get("Psw", "Nil"))
            abn = (fibs_sc > 0) or (psw_sc > 0)
            if abn:
                den_cnt += 1
                if is_bulbar_muscle(r.get("Muscles", "")):
                    bulbar_den += 1

        emg_denervation_count = float(den_cnt)
        emg_denervation_ratio = float(den_cnt / len(emg_rows)) if len(emg_rows) else 0.0
        emg_bulbar_abn_count  = float(bulbar_den)
        emg_bulbar_abn_ratio  = float(bulbar_den / len(emg_rows)) if len(emg_rows) else 0.0

        active_den = int(den_cnt > 0)
        chronic = 0
        fasc = 0
        reg_count = 0
        reg_has_bulbar = int(bulbar_den > 0)
        reg_has_cerv = 0
        reg_has_lumb = 0
        fmt_hash = 0.0
        lab_hash = 0.0

    feats = {
        "motor_count": float(len(motor)),
        "sensory_count": float(len(sensory)),

        "m_lat_mean": m_lat_mean, "m_lat_std": m_lat_std, "m_lat_min": m_lat_min, "m_lat_max": m_lat_max,
        "m_amp_mean": m_amp_mean, "m_amp_std": m_amp_std, "m_amp_min": m_amp_min, "m_amp_max": m_amp_max,
        "m_ncv_mean": m_ncv_mean, "m_ncv_std": m_ncv_std, "m_ncv_min": m_ncv_min, "m_ncv_max": m_ncv_max,

        "s_lat_mean": s_lat_mean, "s_lat_std": s_lat_std, "s_lat_min": s_lat_min, "s_lat_max": s_lat_max,
        "s_amp_mean": s_amp_mean, "s_amp_std": s_amp_std, "s_amp_min": s_amp_min, "s_amp_max": s_amp_max,
        "s_ncv_mean": s_ncv_mean, "s_ncv_std": s_ncv_std, "s_ncv_min": s_ncv_min, "s_ncv_max": s_ncv_max,

        "emg_total_muscles": float(emg_total_muscles),
        "emg_denervation_count": float(emg_denervation_count),
        "emg_denervation_ratio": float(emg_denervation_ratio),
        "emg_bulbar_abn_count": float(emg_bulbar_abn_count),
        "emg_bulbar_abn_ratio": float(emg_bulbar_abn_ratio),

        "emg_active_denervation": float(active_den),
        "emg_chronic_changes": float(chronic),
        "emg_fasciculations": float(fasc),
        "emg_regions_count": float(reg_count),
        "emg_has_bulbar": float(reg_has_bulbar),
        "emg_has_cervical": float(reg_has_cerv),
        "emg_has_lumbosacral": float(reg_has_lumb),

        "fmt_hash": float(fmt_hash),
        "lab_hash": float(lab_hash),

        "schema_is_worldwide": float(1.0 if is_worldwide else 0.0),
        "schema_is_southcity": float(1.0 if is_southcity else 0.0),
    }

    return feats

# -----------------------------
# Main predict
# -----------------------------
def main():
    if len(sys.argv) < 2:
        print("Usage: python single_patient_predict_v2.py" "results\result_Nighat Murtaza 2.json")
        sys.exit(1)

    json_path = Path(sys.argv[1])
    if not json_path.exists():
        print(f"❌ File not found: {json_path}")
        sys.exit(1)

    # Load artifacts (adjust paths if needed)
    model = joblib.load("rf_mnd_worldwide_model.joblib")
    feature_names = joblib.load("rf_mnd_worldwide_features.joblib")
    le = joblib.load("rf_mnd_worldwide_label_encoder.joblib")

    with open(json_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    feats = extract_features_from_data(data)

    # Debug (important!)
    print(f"\n📄 File: {json_path.name}")
    print(f"🔎 schema_is_worldwide={feats.get('schema_is_worldwide')} schema_is_southcity={feats.get('schema_is_southcity')}")
    print(f"🔎 emg_denervation_count={feats.get('emg_denervation_count')} emg_denervation_ratio={feats.get('emg_denervation_ratio')}")
    print(f"🔎 emg_has_bulbar={feats.get('emg_has_bulbar')} emg_bulbar_abn_count={feats.get('emg_bulbar_abn_count')}")

    x = np.array([[feats.get(f, 0.0) for f in feature_names]], dtype=float)
    x = np.nan_to_num(x, nan=0.0, posinf=0.0, neginf=0.0)

    pred_enc = model.predict(x)[0]
    pred_label = le.inverse_transform([pred_enc])[0]
    proba = model.predict_proba(x)[0]

    # proba order corresponds to model.classes_ which corresponds to encoded labels
    # We'll map to label names using label encoder
    class_labels = le.inverse_transform(model.classes_)

    print("\n✅ Final Prediction:", pred_label)
    print("\n📊 Probabilities:")
    pairs = sorted(zip(class_labels, proba), key=lambda t: t[1], reverse=True)
    for lab, p in pairs:
        print(f"• {lab:<6s}: {p:.3f}")

if __name__ == "__main__":
    main()
