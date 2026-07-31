# train_worldwide_rf_mnd.py (UPDATED for 3 patterns + mixed schemas)
# ------------------------------------------------------------
# Train source:
#   generated/
#     awaji_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#     elescorial_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#     southcity_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#
# Test (holdout) source (optional):
#   test_data/
#     awaji_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#     elescorial_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#     southcity_pattern/{ALS,PMA,PBP,NORMAL}/*.json
#
# IMPORTANT:
# - No train_test_split.
# - Trains ONLY on generated/ and tests ONLY on test_data/ (if exists).
# - Supports BOTH schemas:
#   (A) Worldwide: Motor_NCS, Sensory_NCS, EMG_Interpretation
#   (B) SouthCity: Motor_Nerve_Conduction_Studies, Sensory_Nerve_Conduction_Studies, Electromyography
# - Ignores leakage fields if present.
# ------------------------------------------------------------
import json
import numpy as np
from pathlib import Path
from collections import Counter

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib

# -----------------------------
# Paths
# -----------------------------
TRAIN_ROOT = Path("generated")
TEST_ROOT  = Path("test_data")  # optional

LABELS = ["ALS", "PMA", "PBP", "NORMAL"]
SEED = 42

# -----------------------------
# Utils
# -----------------------------
def safe_float(x):
    """Convert to float. Treat 'NR' / missing as NaN."""
    try:
        if x is None:
            return np.nan
        if isinstance(x, str) and x.strip().upper() in ("NR", "N/R", "-"):
            return np.nan
        return float(str(x).strip())
    except:
        return np.nan

def nanstats(arr):
    """Return mean/std/min/max with NaN-safe handling."""
    arr = np.array(arr, dtype=float)
    if arr.size == 0 or np.all(np.isnan(arr)):
        return 0.0, 0.0, 0.0, 0.0
    return (
        float(np.nanmean(arr)),
        float(np.nanstd(arr)),
        float(np.nanmin(arr)),
        float(np.nanmax(arr)),
    )

def list_json_files(root: Path):
    return sorted(root.glob("*.json"))

def is_bulbar_muscle(mname: str) -> bool:
    m = (mname or "").lower()
    return ("tongue" in m) or ("genioglossus" in m) or ("orbicularis" in m) or ("bulbar" in m)

def emg_is_abnormal_token(v) -> bool:
    v = str(v).strip()
    return v not in ("", "Nil", "N", "Normal")

# -----------------------------
# Unified Feature extraction (Mixed schemas)
# -----------------------------
def extract_features(json_path: Path):
    """
    Outputs the SAME feature set for BOTH schemas (worldwide + southcity)
    """

    with open(json_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    # ---------
    # Detect schema
    # ---------
    is_worldwide = ("Motor_NCS" in data) or ("Sensory_NCS" in data) or ("EMG_Interpretation" in data)
    is_southcity = ("Motor_Nerve_Conduction_Studies" in data) or ("Sensory_Nerve_Conduction_Studies" in data) or ("Electromyography" in data)

    # ---------
    # Worldwide schema
    # ---------
    if is_worldwide:
        motor = data.get("Motor_NCS", []) or []
        sensory = data.get("Sensory_NCS", []) or []
        emg = data.get("EMG_Interpretation", {}) or {}

        # Motor arrays
        m_lat = [safe_float(m.get("lat_ms"))  for m in motor]
        m_amp = [safe_float(m.get("cmap_mV")) for m in motor]
        m_ncv = [safe_float(m.get("ncv_mps")) for m in motor]

        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        # Sensory arrays
        s_lat = [safe_float(s.get("lat_ms"))   for s in sensory]
        s_amp = [safe_float(s.get("snap_uV"))  for s in sensory]
        s_ncv = [safe_float(s.get("ncv_mps"))  for s in sensory]

        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

        # EMG flags
        active_den = int(bool(emg.get("active_denervation", False)))
        chronic    = int(bool(emg.get("chronic_neurogenic_changes", False)))
        fasc       = int(bool(emg.get("fasciculations", False)))

        regions = emg.get("regions_involved", []) or []
        reg_count = len(regions)
        reg_has_bulbar = int("bulbar" in set(regions))
        reg_has_cerv = int(any(r == "cervical" for r in regions))
        reg_has_lumb = int(any(r == "lumbosacral" for r in regions))

        # Non-leaky stability helpers
        format_type = str(data.get("format_type", ""))
        lab_id = str(data.get("lab_id", ""))

        fmt_hash = (hash(format_type) % 1000) / 1000.0
        lab_hash = (hash(lab_id) % 1000) / 1000.0

        # Also create "southcity-like" EMG counters from interpretation
        # (so feature set stays aligned)
        emg_total_muscles = 0.0
        emg_denervation_count = float(active_den)  # coarse proxy
        emg_denervation_ratio = float(active_den)
        emg_bulbar_abn_count = float(reg_has_bulbar if active_den else 0)
        emg_bulbar_abn_ratio = float(reg_has_bulbar if active_den else 0)

    # ---------
    # South City schema
    # ---------
    elif is_southcity:
        motor = data.get("Motor_Nerve_Conduction_Studies", []) or []
        sensory = data.get("Sensory_Nerve_Conduction_Studies", []) or []
        emg_rows = data.get("Electromyography", []) or []

        # Motor arrays
        m_lat = [safe_float(m.get("Latency_ms")) for m in motor]
        m_amp = [safe_float(m.get("Amplitude_mv")) for m in motor]
        m_ncv = [safe_float(m.get("NCV_ms")) for m in motor]

        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        # Sensory arrays
        s_lat = [safe_float(s.get("Latency_ms")) for s in sensory]
        s_amp = [safe_float(s.get("Amplitude_uv")) for s in sensory]
        s_ncv = [safe_float(s.get("NCV_ms")) for s in sensory]

        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

        # EMG derived flags
        emg_total_muscles = float(len(emg_rows))
        den_cnt = 0
        bulbar_den = 0

        for r in emg_rows:
            fibs = r.get("Fibs", "Nil")
            psw  = r.get("Psw", "Nil")
            abn = emg_is_abnormal_token(fibs) or emg_is_abnormal_token(psw)
            if abn:
                den_cnt += 1
                if is_bulbar_muscle(r.get("Muscles", "")):
                    bulbar_den += 1

        emg_denervation_count = float(den_cnt)
        emg_denervation_ratio = float(den_cnt / len(emg_rows)) if len(emg_rows) else 0.0
        emg_bulbar_abn_count  = float(bulbar_den)
        emg_bulbar_abn_ratio  = float(bulbar_den / len(emg_rows)) if len(emg_rows) else 0.0

        # Map to worldwide-like EMG flags
        active_den = int(den_cnt > 0)
        chronic    = 0  # not directly available in SC
        fasc       = 0  # optional; not reliable in SC list

        reg_count = 0
        reg_has_bulbar = int(bulbar_den > 0)
        reg_has_cerv = 0
        reg_has_lumb = 0

        fmt_hash = 0.0
        lab_hash = 0.0

    else:
        # Unknown schema → return safe zeros (but this usually means your JSON is wrong)
        motor = []
        sensory = []
        m_lat_mean=m_lat_std=m_lat_min=m_lat_max=0.0
        m_amp_mean=m_amp_std=m_amp_min=m_amp_max=0.0
        m_ncv_mean=m_ncv_std=m_ncv_min=m_ncv_max=0.0
        s_lat_mean=s_lat_std=s_lat_min=s_lat_max=0.0
        s_amp_mean=s_amp_std=s_amp_min=s_amp_max=0.0
        s_ncv_mean=s_ncv_std=s_ncv_min=s_ncv_max=0.0
        active_den=chronic=fasc=0
        reg_count=reg_has_bulbar=reg_has_cerv=reg_has_lumb=0
        emg_total_muscles=emg_denervation_count=emg_denervation_ratio=0.0
        emg_bulbar_abn_count=emg_bulbar_abn_ratio=0.0
        fmt_hash=lab_hash=0.0

    # -----------------------------
    # FINAL unified feature dict
    # -----------------------------
    features = {
        # counts
        "motor_count": float(len(motor)),
        "sensory_count": float(len(sensory)),

        # motor stats
        "m_lat_mean": m_lat_mean,
        "m_lat_std":  m_lat_std,
        "m_lat_min":  m_lat_min,
        "m_lat_max":  m_lat_max,

        "m_amp_mean": m_amp_mean,
        "m_amp_std":  m_amp_std,
        "m_amp_min":  m_amp_min,
        "m_amp_max":  m_amp_max,

        "m_ncv_mean": m_ncv_mean,
        "m_ncv_std":  m_ncv_std,
        "m_ncv_min":  m_ncv_min,
        "m_ncv_max":  m_ncv_max,

        # sensory stats
        "s_lat_mean": s_lat_mean,
        "s_lat_std":  s_lat_std,
        "s_lat_min":  s_lat_min,
        "s_lat_max":  s_lat_max,

        "s_amp_mean": s_amp_mean,
        "s_amp_std":  s_amp_std,
        "s_amp_min":  s_amp_min,
        "s_amp_max":  s_amp_max,

        "s_ncv_mean": s_ncv_mean,
        "s_ncv_std":  s_ncv_std,
        "s_ncv_min":  s_ncv_min,
        "s_ncv_max":  s_ncv_max,

        # emg (fine-grained from SC, coarse proxy from worldwide)
        "emg_total_muscles": float(emg_total_muscles),
        "emg_denervation_count": float(emg_denervation_count),
        "emg_denervation_ratio": float(emg_denervation_ratio),
        "emg_bulbar_abn_count": float(emg_bulbar_abn_count),
        "emg_bulbar_abn_ratio": float(emg_bulbar_abn_ratio),

        # emg (worldwide interpretation flags / mapped flags)
        "emg_active_denervation": float(active_den),
        "emg_chronic_changes":    float(chronic),
        "emg_fasciculations":     float(fasc),
        "emg_regions_count":      float(reg_count),
        "emg_has_bulbar":         float(reg_has_bulbar),
        "emg_has_cervical":       float(reg_has_cerv),
        "emg_has_lumbosacral":    float(reg_has_lumb),

        # non-leaky robustness helpers (worldwide only; SC gets 0)
        "fmt_hash": float(fmt_hash),
        "lab_hash": float(lab_hash),

        # schema flag
        "schema_is_worldwide": float(1.0 if is_worldwide else 0.0),
        "schema_is_southcity": float(1.0 if is_southcity else 0.0),
    }

    return features

# -----------------------------
# Dataset loader (AUTO patterns)
# -----------------------------
def load_dataset(root: Path, split_name: str):
    X, y = [], []
    missing = []
    patterns_found = []

    if not root.exists():
        raise FileNotFoundError(f"{split_name}: root not found: {root.resolve()}")

    # auto patterns
    for pattern_dir in sorted([p for p in root.iterdir() if p.is_dir()]):
        patterns_found.append(pattern_dir.name)
        for label in LABELS:
            cls_dir = pattern_dir / label
            if not cls_dir.exists():
                missing.append(str(cls_dir))
                continue

            files = list_json_files(cls_dir)
            for fp in files:
                feats = extract_features(fp)
                X.append(feats)
                y.append(label)

    if missing:
        raise FileNotFoundError(
            f"{split_name}: Some folders are missing.\n" + "\n".join(missing)
        )

    if not X:
        raise RuntimeError(f"{split_name}: No data loaded from {root.resolve()}")

    feature_names = list(X[0].keys())
    X_mat = np.array([[row[f] for f in feature_names] for row in X], dtype=float)
    X_mat = np.nan_to_num(X_mat, nan=0.0, posinf=0.0, neginf=0.0)

    return X_mat, y, feature_names, patterns_found

# -----------------------------
# Main
# -----------------------------
def main():
    # Load train
    X_train, y_train, feature_names, train_patterns = load_dataset(TRAIN_ROOT, "TRAIN")

    print("✅ Loaded TRAIN dataset")
    print("TRAIN patterns:", train_patterns)
    print("Train shape:", X_train.shape)
    print("Train label counts:", dict(Counter(y_train)))

    # Encode labels
    le = LabelEncoder()
    y_train_enc = le.fit_transform(y_train)

    # Model
    model = RandomForestClassifier(
        n_estimators=1200,
        max_depth=18,
        min_samples_leaf=4,
        min_samples_split=8,
        class_weight="balanced_subsample",
        random_state=SEED,
        n_jobs=-1
    )

    model.fit(X_train, y_train_enc)

    # If test_data exists, evaluate
    if TEST_ROOT.exists():
        X_test, y_test, _, test_patterns = load_dataset(TEST_ROOT, "TEST")

        print("\n✅ Loaded TEST dataset")
        print("TEST patterns:", test_patterns)
        print("Test shape:", X_test.shape)
        print("Test label counts:", dict(Counter(y_test)))

        y_test_enc = le.transform(y_test)
        y_pred = model.predict(X_test)

        print("\n==============================")
        print("📌 HOLDOUT TEST RESULTS (test_data)")
        print("==============================\n")

        print("Classification Report:\n")
        print(classification_report(y_test_enc, y_pred, target_names=le.classes_))

        print("Confusion Matrix:\n")
        print(confusion_matrix(y_test_enc, y_pred))

    else:
        print("\n⚠️ test_data folder not found. Skipping holdout evaluation.")

    # Save artifacts
    joblib.dump(model, "rf_mnd_worldwide_model.joblib")
    joblib.dump(feature_names, "rf_mnd_worldwide_features.joblib")
    joblib.dump(le, "rf_mnd_worldwide_label_encoder.joblib")

    print("\n✅ Saved:")
    print(" - rf_mnd_worldwide_model.joblib")
    print(" - rf_mnd_worldwide_features.joblib")
    print(" - rf_mnd_worldwide_label_encoder.joblib")

if __name__ == "__main__":
    main()
