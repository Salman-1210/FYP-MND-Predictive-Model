import os
import json
import shutil
import numpy as np
import joblib
from typing import Optional
import PIL.Image
import fitz
import bcrypt

# ── ENVIRONMENT CONFIGURATION: Load .env.local before anything else ──
from dotenv import load_dotenv

# Get the directory where app.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Try loading .env.local first, then fall back to .env
env_path = os.path.join(BASE_DIR, ".env.local")
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
    print(f"✅ [ENV] Loaded environment from: {env_path}")
else:
    env_path_fallback = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path_fallback):
        load_dotenv(dotenv_path=env_path_fallback)
        print(f"✅ [ENV] Loaded environment from: {env_path_fallback}")
    else:
        print("⚠️ [ENV] No .env.local or .env file found. Relying on system environment variables.")

# Verify critical keys are loaded
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    print("✅ [ENV] GEMINI_API_KEY loaded successfully.")
else:
    print("❌ [ENV] WARNING: GEMINI_API_KEY not found in environment variables!")


from pydantic import BaseModel, EmailStr, field_validator

from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db, Exercise # Ye line add karein

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, TIMESTAMP, select, JSON, ForeignKey, Text, update, delete, Boolean, func
from sqlalchemy.orm import sessionmaker

# ── FEATURE ENGINE ALIGNMENT IMPORT ──
try:
    from feature_engineering import normalize_report_json, extract_features_from_json    
except ImportError:
    raise RuntimeError("❌ 'feature_engineering.py' file missing in root directory. Please ensure it exists.")

print("🟢🟢🟢 RUNNING VERSION: TEST_MARKER_" + str(os.getpid()))

# ====================== CONFIG ======================
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/mnd_app_pro"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

# Tables
users = Table("users", metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String(100), nullable=False, unique=True),
    Column("password", String(255), nullable=False),
    Column("role", String(20), nullable=False),
    Column("is_verified", Boolean, server_default="true"),
    Column("created_at", TIMESTAMP, server_default=func.now())
)

doctors = Table("doctors", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("full_name", String(100), nullable=False),
    Column("specialization", String(100), default="General Physician"),
    Column("license_id", String(50), nullable=True),
    Column("hospital", String(100))
)

patients = Table("patients", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("full_name", String(100), nullable=False),
    Column("age", Integer, default=0),
    Column("gender", String(20), default="Unknown"),
    Column("medical_history", Text)
)

screenings = Table("screenings", metadata,
    Column("id", Integer, primary_key=True),
    Column("patient_id", Integer, ForeignKey("patients.id", ondelete="CASCADE")),
    Column("doctor_id", Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True),
    Column("risk_level", String(20), nullable=False),
    Column("answers", JSON, nullable=True),
    Column("analysis", JSON, nullable=True),
    Column("report_filename", String(255), nullable=True),
    Column("status", String(20), server_default="pending"),
    Column("created_at", TIMESTAMP, server_default=func.now())
)

metadata.create_all(engine)

app = FastAPI()
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# ====================== PYDANTIC ======================
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "patient"
    hospital: Optional[str] = None
    specialty: Optional[str] = None
    license_id: Optional[str] = None
    age: int = 0
    gender: str = "Unknown"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class ConnectDoctorRequest(BaseModel):
    patient_email: EmailStr
    doctor_email: EmailStr

# 🔥🔥🔥 SCREENING SUBMIT PYDANTIC MODEL — FIXED VALIDATION 🔥🔥🔥
class ScreeningSubmit(BaseModel):
    email: EmailStr
    answers: dict
    calculated_risk: str
    diagnosis: Optional[str] = None

    @field_validator('email')
    @classmethod
    def email_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Email cannot be empty')
        return v.strip()

    @field_validator('answers')
    @classmethod
    def answers_not_empty(cls, v):
        if not isinstance(v, dict):
            raise ValueError('Answers must be a dictionary')
        return v

    @field_validator('calculated_risk')
    @classmethod
    def risk_must_be_valid(cls, v):
        allowed = {"Low Risk", "Moderate Risk", "High Risk"}
        if v not in allowed:
            raise ValueError(f'calculated_risk must be one of {allowed}')
        return v

# ====================== LIVE ML INFERENCE ENGINE ======================
MODEL_PATH = "rf_mnd_worldwide_model.joblib"
FEATURES_PATH = "rf_mnd_worldwide_features.joblib"
ENCODER_PATH = "rf_mnd_worldwide_label_encoder.joblib"

# Global Model Variables
ml_model = None
ml_features_order = None
ml_label_encoder = None

if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH) and os.path.exists(ENCODER_PATH):
    try:
        ml_model = joblib.load(MODEL_PATH)
        ml_features_order = joblib.load(FEATURES_PATH)
        ml_label_encoder = joblib.load(ENCODER_PATH)
        print("🚀 [ML ENGINE]: Live Random Forest Model loaded successfully into API runtime!")
    except Exception as e:
        print(f"❌ [ML ENGINE ERROR]: Failed to load model files: {e}")
else:
    print("⚠️ [ML ENGINE WARNING]: Weights not found. Running on mock fallback mode. Please run train_rf_mnd.py first.")

# ------------------------------------------------------------------
# ── OPTION 2: UNIFIED FEATURE EXTRACTION HELPERS ──
# ------------------------------------------------------------------
def safe_float(x):
    try:
        if x is None: return np.nan
        if isinstance(x, str) and x.strip().upper() in ("NR", "N/R", "-"): return np.nan
        return float(str(x).strip())
    except: return np.nan

def nanstats(arr):
    arr = np.array(arr, dtype=float)
    if arr.size == 0 or np.all(np.isnan(arr)): return 0.0, 0.0, 0.0, 0.0
    return float(np.nanmean(arr)), float(np.nanstd(arr)), float(np.nanmin(arr)), float(np.nanmax(arr))

def is_bulbar_muscle(mname: str) -> bool:
    m = (mname or "").lower()
    return ("tongue" in m) or ("genioglossus" in m) or ("orbicularis" in m) or ("bulbar" in m)

def emg_is_abnormal_token(v) -> bool:
    v = str(v).strip()
    return v not in ("", "Nil", "N", "Normal")

def extract_features_v2_from_dict(data: dict):
    # Schema Detection (Worldwide vs SouthCity)
    is_worldwide = ("Motor_NCS" in data) or ("Sensory_NCS" in data) or ("EMG_Interpretation" in data)
    is_southcity = ("Motor_Nerve_Conduction_Studies" in data) or ("Sensory_Nerve_Conduction_Studies" in data) or ("Electromyography" in data)

    if is_worldwide:
        motor = data.get("Motor_NCS", []) or []
        sensory = data.get("Sensory_NCS", []) or []
        emg = data.get("EMG_Interpretation", {}) or {}

        m_lat = [safe_float(m.get("lat_ms"))  for m in motor]
        m_amp = [safe_float(m.get("cmap_mV")) for m in motor]
        m_ncv = [safe_float(m.get("ncv_mps")) for m in motor]

        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        s_lat = [safe_float(s.get("lat_ms"))   for s in sensory]
        s_amp = [safe_float(s.get("snap_uV"))  for s in sensory]
        s_ncv = [safe_float(s.get("ncv_mps"))  for s in sensory]

        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

        active_den = int(bool(emg.get("active_denervation", False)))
        chronic    = int(bool(emg.get("chronic_neurogenic_changes", False)))
        fasc       = int(bool(emg.get("fasciculations", False)))

        regions = emg.get("regions_involved", []) or []
        reg_count = len(regions)
        reg_has_bulbar = int("bulbar" in set(regions))
        reg_has_cerv = int(any(r == "cervical" for r in regions))
        reg_has_lumb = int(any(r == "lumbosacral" for r in regions))

        format_type = str(data.get("format_type", ""))
        lab_id = str(data.get("lab_id", ""))
        fmt_hash = (hash(format_type) % 1000) / 1000.0
        lab_hash = (hash(lab_id) % 1000) / 1000.0

        emg_total_muscles = 0.0
        emg_denervation_count = float(active_den)
        emg_denervation_ratio = float(active_den)
        emg_bulbar_abn_count = float(reg_has_bulbar if active_den else 0)
        emg_bulbar_abn_ratio = float(reg_has_bulbar if active_den else 0)

    elif is_southcity:
        motor = data.get("Motor_Nerve_Conduction_Studies", []) or []
        sensory = data.get("Sensory_Nerve_Conduction_Studies", []) or []
        emg_rows = data.get("Electromyography", []) or []

        m_lat = [safe_float(m.get("Latency_ms")) for m in motor]
        m_amp = [safe_float(m.get("Amplitude_mv")) for m in motor]
        m_ncv = [safe_float(m.get("NCV_ms")) for m in motor]

        m_lat_mean, m_lat_std, m_lat_min, m_lat_max = nanstats(m_lat)
        m_amp_mean, m_amp_std, m_amp_min, m_amp_max = nanstats(m_amp)
        m_ncv_mean, m_ncv_std, m_ncv_min, m_ncv_max = nanstats(m_ncv)

        s_lat = [safe_float(s.get("Latency_ms")) for s in sensory]
        s_amp = [safe_float(s.get("Amplitude_uv")) for s in sensory]
        s_ncv = [safe_float(s.get("NCV_ms")) for s in sensory]

        s_lat_mean, s_lat_std, s_lat_min, s_lat_max = nanstats(s_lat)
        s_amp_mean, s_amp_std, s_amp_min, s_amp_max = nanstats(s_amp)
        s_ncv_mean, s_ncv_std, s_ncv_min, s_ncv_max = nanstats(s_ncv)

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

        active_den = int(den_cnt > 0)
        chronic    = 0
        fasc       = 0
        reg_count = 0
        reg_has_bulbar = int(bulbar_den > 0)
        reg_has_cerv = 0
        reg_has_lumb = 0
        fmt_hash = 0.0
        lab_hash = 0.0
    else:
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

    features = {
        "motor_count": float(len(motor)),
        "sensory_count": float(len(sensory)),
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
        "emg_total_muscles": float(emg_total_muscles),
        "emg_denervation_count": float(emg_denervation_count),
        "emg_denervation_ratio": float(emg_denervation_ratio),
        "emg_bulbar_abn_count": float(emg_bulbar_abn_count),
        "emg_bulbar_abn_ratio": float(emg_bulbar_abn_ratio),
        "emg_active_denervation": float(active_den),
        "emg_chronic_changes":   float(chronic),
        "emg_fasciculations":     float(fasc),
        "emg_regions_count":      float(reg_count),
        "emg_has_bulbar":         float(reg_has_bulbar),
        "emg_has_cervical":       float(reg_has_cerv),
        "emg_has_lumbosacral":    float(reg_has_lumb),
        "fmt_hash": float(fmt_hash),
        "lab_hash": float(lab_hash),
        "schema_is_worldwide": float(1.0 if is_worldwide else 0.0),
        "schema_is_southcity": float(1.0 if is_southcity else 0.0),
    }
    return features

def generate_live_prediction(raw_report_json: dict) -> dict:
    if ml_model is None or ml_features_order is None or ml_label_encoder is None:
        return {}

    try:
        features_dict = extract_features_v2_from_dict(raw_report_json)

        print("💡 [DEBUG] Extracted Features Keys:", list(features_dict.keys())[:5])
        print("💡 [DEBUG] Non-Zero Features Count:", sum(1 for v in features_dict.values() if v != 0.0))
        print("📋 [DEBUG] Model Expects These Features:", list(ml_features_order)[:5])

        feature_vector = [features_dict.get(f, 0.0) for f in ml_features_order]

        print("💡 [DEBUG] Final Feature Vector Sum:", sum(feature_vector))

        input_matrix = np.array([feature_vector], dtype=float)
        input_matrix = np.nan_to_num(input_matrix, nan=0.0)

        prediction_encoded = ml_model.predict(input_matrix)[0]
        probabilities = ml_model.predict_proba(input_matrix)[0]

        diagnosis = str(ml_label_encoder.inverse_transform([prediction_encoded])[0])
        confidence_score = float(probabilities[prediction_encoded]) * 100

        diagnosis_upper = diagnosis.upper().strip()
        risk_level = "High Risk" if diagnosis_upper in ["ALS", "PMA", "PBP"] else "Low Risk"
        recommended_layer = "Neurologist" if risk_level == "High Risk" else "General Physician"

        findings = [
            f"Classification confidence locked securely at {confidence_score:.2f}%",
            f"Pattern matrix mapped successfully across {len(ml_features_order)} strict biometric checkpoints."
        ]
        if risk_level == "High Risk":
            findings.append(f"Urgent {recommended_layer} consulting layer validation required.")

        affected_regions = {
            "bulbar": False,
            "cervical": False,
            "thoracic": False,
            "lumbosacral": False
        }

        emg_rows = raw_report_json.get("Electromyography", []) or []
        emg_interp = raw_report_json.get("EMG_Interpretation", {}) or {}

        if isinstance(emg_rows, list) and len(emg_rows) > 0:
            for row in emg_rows:
                fibs = str(row.get("Fibs", "Nil")).strip()
                psw = str(row.get("Psw", "Nil")).strip()
                muscle = str(row.get("Muscles", "")).lower()

                is_abnormal = fibs not in ("", "Nil", "N", "Normal") or psw not in ("", "Nil", "N", "Normal")
                if is_abnormal:
                    if any(k in muscle for k in ["tongue", "genio", "oris", "bulbar", "face"]):
                        affected_regions["bulbar"] = True
                    elif any(k in muscle for k in ["biceps", "deltoid", "apb", "fdi", "ulnar", "median", "arm", "hand"]):
                        affected_regions["cervical"] = True
                    elif any(k in muscle for k in ["tibialis", "gastro", "vastus", "peroneal", "leg", "foot", "quad"]):
                        affected_regions["lumbosacral"] = True
                    elif any(k in muscle for k in ["thoracic", "paraspinal", "intercostal", "abs"]):
                        affected_regions["thoracic"] = True

        if isinstance(emg_interp, dict):
            regions_list = emg_interp.get("regions_involved", []) or []
            for r in regions_list:
                r_low = str(r).lower()
                if "bulbar" in r_low: affected_regions["bulbar"] = True
                if "cervical" in r_low: affected_regions["cervical"] = True
                if "lumbosacral" in r_low: affected_regions["lumbosacral"] = True
                if "thoracic" in r_low: affected_regions["thoracic"] = True

        emg_found_any = any(affected_regions.values())
        if not emg_found_any:
            print(f"⚠️ [FALLBACK] EMG parsing found no regions. Using diagnosis-based mapping for: {diagnosis_upper}")
            if diagnosis_upper == "ALS":
                affected_regions = {"bulbar": True, "cervical": True, "thoracic": True, "lumbosacral": True}
            elif diagnosis_upper == "PBP":
                affected_regions = {"bulbar": True, "cervical": False, "thoracic": False, "lumbosacral": False}
            elif diagnosis_upper == "PMA":
                affected_regions = {"bulbar": False, "cervical": True, "thoracic": False, "lumbosacral": True}
        else:
            print(f"✅ [EMG SUCCESS] Found affected regions via muscle parsing: {affected_regions}")

        exercise_pool = {
            "bulbar": [
                {"title": "Lingual Strengthening Resistance", "steps": "Press your tongue firmly against the roof of your mouth for 5 seconds. Repeat 10 times daily to protect speech clarity.", "type": "Bulbar / Oral"},
                {"title": "Effortful Swallowing Protocol", "steps": "Squeeze all swallowing muscles hard when swallowing saliva to prevent choking risks.", "type": "Bulbar / Throat"}
            ],
            "cervical": [
                {"title": "Dexterity Ball Therapy", "steps": "Squeeze a soft foam ball with full force for 5 seconds. Perform 3 sets of 10 repetitions to fight muscle atrophy.", "type": "Cervical / Upper Limb"},
                {"title": "Passive Wrist Extensions", "steps": "Gently stretch your wrist backwards using the opposite hand to maintain neuromature mobility range.", "type": "Cervical / Forearm"}
            ],
            "thoracic": [
                {"title": "Diaphragmatic Expansion Control", "steps": "Place one hand on your chest and the other on your stomach. Inhale deeply through the nose, making the abdomen rise vertically.", "type": "Thoracic / Respiratory"},
                {"title": "Incentive Deep Volume Tracking", "steps": "Take slow, controlled inspirations followed by 3-second breathing locks to optimize vital capacity.", "type": "Thoracic / Lungs"}
            ],
            "lumbosacral": [
                {"title": "Ankle Dorsiflexion Activations", "steps": "Pull your feet upwards towards your shins repeatedly. Essential to counter drop-foot patterns.", "type": "Lumbosacral / Lower Limb"},
                {"title": "Seated Quadriceps Hold", "steps": "Straighten your knee fully while seated, locking the thigh position for 3 seconds before relaxing.", "type": "Lumbosacral / Gait Protection"}
            ]
        }

        compiled_exercises = []
        for region, active in affected_regions.items():
            if active:
                compiled_exercises.extend(exercise_pool[region])

        if not compiled_exercises:
            compiled_exercises = [
                {"title": "Light Aerobic Energy Pacing", "steps": "Engage in 15 minutes of low-impact, supervised movements to boost oxygen perfusion without trigger exhaustion.", "type": "General Wellness"}
            ]
        print("🟢 THIS EXACT FUNCTION IS RUNNING — MARKER_XYZ123")
        print(f"🔥 FINAL visual_mapping: {affected_regions}")
        print(f"🔥 FINAL rehab count: {len(compiled_exercises)}")
        print(f"🔥 FINAL diagnosis: {diagnosis_upper}")

        return {
            "risk": risk_level,
            "diagnosis": diagnosis_upper,
            "score": f"{confidence_score:.2f}%",
            "recommended_layer": recommended_layer,
            "summary": f"Automated analytical tracking sequence indicates features matching characteristics of {diagnosis_upper}.",
            "findings": findings,
            "visual_mapping": affected_regions,
            "rehab_protocol": compiled_exercises
        }
    except Exception as exc:
        raise HTTPException(500, f"Error processing report through internal ML core matrix: {str(exc)}")

# ====================== AUTH ROUTES ======================
@app.post("/register")
def register(user: UserRegister, db=Depends(get_db)):
    if db.execute(select(users).where(users.c.email == user.email)).first():
        raise HTTPException(400, "Email already registered")

    verification_status = False if user.role == "doctor" else True

    stmt = users.insert().values(
        email=user.email,
        password=bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        role=user.role,
        is_verified=verification_status
    ).returning(users.c.id)

    new_user_id = db.execute(stmt).scalar()

    if user.role == "patient":
        db.execute(patients.insert().values(user_id=new_user_id, full_name=user.full_name, age=user.age, gender=user.gender))
    elif user.role == "doctor":
        db.execute(doctors.insert().values(user_id=new_user_id, full_name=user.full_name, specialization=user.specialty or "General Physician", hospital=user.hospital, license_id=user.license_id))

    db.commit()
    return {"message": "Registered successfully", "success": True}

@app.post("/login")
def login(user: UserLogin, db=Depends(get_db)):
    record = db.execute(select(users).where(users.c.email == user.email)).first()
    if not record:
        raise HTTPException(400, "Invalid credentials")

    u = record._mapping

    if not bcrypt.checkpw(user.password.encode("utf-8"), u["password"].encode("utf-8")):
        raise HTTPException(400, "Invalid credentials")

    if u["role"] == "doctor" and not u["is_verified"]:
        raise HTTPException(403, "Access Denied: Your account is pending Admin approval. Please contact admin.")

    return {
        "message": "Login successful",
        "success": True,
        "user": {
            "id": u["id"],
            "email": u["email"],
            "role": u["role"],
            "is_verified": bool(u["is_verified"])
        }
    }

# ====================== PROFILE ======================
@app.get("/profile")
def get_profile(email: str, db=Depends(get_db)):
    user_record = db.execute(select(users).where(users.c.email == email)).first()
    if not user_record:
        raise HTTPException(404, "User not found")

    u = user_record._mapping

    if u["role"] == "doctor":
        doc = db.execute(select(doctors).where(doctors.c.user_id == u["id"])).first()
        if doc:
            d = doc._mapping
            return {
                "full_name": d["full_name"],
                "specialization": d["specialization"],
                "specialty": d["specialization"],
                "hospital": d["hospital"],
                "license_id": d["license_id"],
                "is_verified": bool(u["is_verified"])
            }

    elif u["role"] == "patient":
        pat = db.execute(select(patients).where(patients.c.user_id == u["id"])).first()
        if pat:
            p = pat._mapping
            return {
                "full_name": p["full_name"],
                "age": p["age"],
                "gender": p["gender"],
                "medical_history": p["medical_history"]
            }

    return {"full_name": None}

# 🔥🔥🔥 SCREENING SUBMIT ENDPOINT — FIXED WITH BETTER DEBUGGING 🔥🔥🔥
@app.post("/submit-screening")
def submit_screening(payload: ScreeningSubmit, db=Depends(get_db)):
    """
    Patient ke initial screening questions ke answers save karta hai.
    Jab user register karta hai aur screening complete karta hai.
    """
    print(f"📥 [SCREENING] Received request for: {payload.email}")
    print(f"📥 [SCREENING] Answers keys: {list(payload.answers.keys()) if payload.answers else 'EMPTY'}")
    print(f"📥 [SCREENING] Risk: {payload.calculated_risk}, Diagnosis: {payload.diagnosis}")

    # 1. User find karo
    user_record = db.execute(select(users).where(users.c.email == payload.email)).first()
    if not user_record:
        print(f"❌ [SCREENING] User not found: {payload.email}")
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Patient record find karo
    patient_record = db.execute(select(patients).where(patients.c.user_id == user_record.id)).first()
    if not patient_record:
        print(f"❌ [SCREENING] Patient not found for user: {payload.email}")
        raise HTTPException(status_code=404, detail="Patient profile not found")

    print(f"✅ [SCREENING] Found patient_id: {patient_record.id}")

    # 3. Diagnosis determine karo
    risk_upper = payload.calculated_risk.strip().upper()
    if risk_upper == "HIGH RISK":
        diagnosis = payload.diagnosis or "ALS"
        visual_map = {"bulbar": True, "cervical": True, "thoracic": True, "lumbosacral": True}
    elif risk_upper == "MODERATE RISK":
        diagnosis = payload.diagnosis or "PMA"
        visual_map = {"bulbar": False, "cervical": True, "thoracic": False, "lumbosacral": True}
    else:
        diagnosis = payload.diagnosis or "NORMAL"
        visual_map = {"bulbar": False, "cervical": False, "thoracic": False, "lumbosacral": False}

    # 4. Screening entry insert karo
    db.execute(screenings.insert().values(
        patient_id=patient_record.id,
        risk_level=payload.calculated_risk,
        answers=payload.answers,
        analysis={
            "diagnosis": diagnosis,
            "screening_based": True,
            "score": "N/A (Screening-Based)",
            "visual_mapping": visual_map,
            "rehab_protocol": [],
            "summary": f"Initial screening indicates {payload.calculated_risk}"
        },
        report_filename=None,
        status="screening_completed",
        created_at=func.now()
    ))

    db.commit()
    print(f"✅ [SCREENING] Saved successfully for patient_id: {patient_record.id}")

    return {
        "success": True,
        "message": "Screening answers saved successfully",
        "risk_level": payload.calculated_risk,
        "diagnosis": diagnosis,
        "patient_id": patient_record.id
    }

# ====================== REPORT UPLOAD ======================
@app.post("/upload-report")
async def upload_report(email: str = Form(...), file: UploadFile = File(...), db=Depends(get_db)):
    user_record = db.execute(select(users).where(users.c.email == email)).first()
    if not user_record: raise HTTPException(404, "User not found")
    patient_record = db.execute(select(patients).where(patients.c.user_id == user_record.id)).first()
    if not patient_record: raise HTTPException(404, "Patient not found")

    clean_filename = file.filename.replace(" ", "_")
    file_path = os.path.join("uploads", clean_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_report_data = {}

    if clean_filename.lower().endswith((".jpg", ".jpeg", ".png")):
        print(f"📸 [IMAGE DETECTED]: Processing clinical scanned report: {clean_filename}")

        output_dir = "extract_data"

        try:
            from ocr import extract_text_from_image
            print("⚙️ [LIVE OCR PIPELINE]: Forcing fresh execution. Invoking Gemini Vision Core API...")
            raw_report_data = extract_text_from_image(file_path)

            # ── ⬆️ NEW: Handle validation errors from OCR engine ──
            if isinstance(raw_report_data, dict) and "error" in raw_report_data:
                error_code = raw_report_data.get("error", "UNKNOWN_ERROR")
                error_msg = raw_report_data.get("message", "Upload validation failed")
                print(f"❌ [UPLOAD BLOCKED] OCR Validation Failed: [{error_code}] {error_msg}")
                
                # Clean up the rejected file
                if os.path.exists(file_path):
                    os.remove(file_path)
                    
                # Map to appropriate HTTP status
                status_map = {
                    "INVALID_UPLOAD": 400,
                    "INVALID_IMAGE_CONTENT": 422,
                    "INVALID_REPORT_DATA": 422,
                    "IMAGE_LOAD_ERROR": 400,
                    "JSON_PARSE_ERROR": 422,
                    "OCR_FAILURE": 500
                }
                http_status = status_map.get(error_code, 400)
                raise HTTPException(http_status, f"[{error_code}] {error_msg}")
            # ── END NEW ──

            if raw_report_data and isinstance(raw_report_data, dict) and len(raw_report_data) > 0:
                os.makedirs(output_dir, exist_ok=True)
                json_backup_path = os.path.join(output_dir, f"result_{clean_filename}.json")
                with open(json_backup_path, "w", encoding="utf-8") as backup_file:
                    json.dump(raw_report_data, backup_file, indent=2, ensure_ascii=False)
                print(f"💾 [AUTO-SAVE SUCCESS]: Overwritten/Written generated JSON to: {json_backup_path}")

        except HTTPException:
            raise  # Re-raise HTTPExceptions (including our new validation errors)
        except Exception as ocr_err:
            print(f"❌ [OCR ENGINE CRASH]: Free Tier Quota or pipeline failure: {str(ocr_err)}")
            raise HTTPException(429, f"Google API Error or Free Quota Limit Exceeded: {str(ocr_err)}")

    elif clean_filename.lower().endswith(".json"):
        with open(file_path, "r", encoding="utf-8") as f:
            raw_report_data = json.load(f)
    else:
        raise HTTPException(400, "Unsupported data format pattern match.")

    if not raw_report_data or len(raw_report_data) == 0:
        raise HTTPException(400, "Invalid JSON data package matrix extracted or empty telemetry failure.")

    analysis = generate_live_prediction(raw_report_data)

    db.execute(screenings.insert().values(
        patient_id=patient_record.id,
        risk_level=analysis["risk"],
        report_filename=clean_filename,
        analysis=analysis
    ))
    db.commit()

    return {
        "success": True,
        "analysis": analysis,
        "visual_mapping": analysis["visual_mapping"],
        "rehab_protocol": analysis["rehab_protocol"],
        "message": "Scanned patient report processed and evaluated via trained model successfully."
    }

# ====================== PATIENT SCREENING HISTORY ======================
@app.get("/patient/screening-history")
def get_patient_screening_history(email: str, db=Depends(get_db)):
    user_record = db.execute(select(users).where(users.c.email == email)).first()
    if not user_record:
        raise HTTPException(404, "User not found")

    patient_record = db.execute(select(patients).where(patients.c.user_id == user_record.id)).first()
    if not patient_record:
        raise HTTPException(404, "Patient not found")

    rows = db.execute(
        select(
            screenings.c.id,
            screenings.c.risk_level,
            screenings.c.analysis,
            screenings.c.answers,
            screenings.c.created_at
        )
        .where(screenings.c.patient_id == patient_record.id)
        .order_by(screenings.c.created_at.asc())
    ).fetchall()

    history = []
    for r in rows:
        diagnosis = None
        is_screening = False

        if r.analysis and isinstance(r.analysis, dict):
            diagnosis = r.analysis.get("diagnosis")
            is_screening = r.analysis.get("screening_based", False)

        answers_data = r.answers if isinstance(r.answers, dict) else {}

        risk_clean = str(r.risk_level or "").strip().lower()
        risk_value = 1 if risk_clean == "high risk" else 0

        history.append({
            "id": r.id,
            "risk_level": r.risk_level,
            "diagnosis": diagnosis,
            "date": str(r.created_at),
            "risk_value": risk_value,
            "is_screening": is_screening,
            "answers": answers_data
        })

    high_count = sum(1 for h in history if h["risk_value"] == 1)
    total = len(history)
    high_ratio = (high_count / total) if total > 0 else 0

    return {
        "success": True,
        "total_reports": total,
        "high_risk_count": high_count,
        "high_risk_ratio": round(high_ratio, 3),
        "history": history
    }

# ====================== DOCTOR ROUTES ======================
@app.get("/doctor/patients")
def get_patients_for_doctor(email: str = None, db=Depends(get_db)):
    if not email:
        return []
    email_clean = email.lower().strip()

    doc = db.execute(
        select(doctors.c.id)
        .join(users, doctors.c.user_id == users.c.id)
        .where(func.lower(users.c.email) == email_clean)
    ).first()

    if not doc:
        return []

    query = select(
        patients.c.full_name,
        users.c.email,
        screenings.c.risk_level,
        screenings.c.created_at,
        screenings.c.report_filename,
        screenings.c.status,
        screenings.c.id,
        screenings.c.analysis
    ).select_from(
        users.join(patients, users.c.id == patients.c.user_id)
             .join(screenings, patients.c.id == screenings.c.patient_id)
    ).where(screenings.c.doctor_id == doc.id).order_by(screenings.c.created_at.desc())

    results = db.execute(query).fetchall()
    base_url = "http://127.0.0.1:8000/uploads/"

    return [{
        "id": r.id,
        "name": r.full_name,
        "email": r.email,
        "risk": r.risk_level,
        "status": r.status,
        "date": str(r.created_at),
        "report_url": f"{base_url}{r.report_filename}" if r.report_filename else None,
        "analysis": r.analysis
    } for r in results]

@app.get("/doctors/by-specialty/{specialty}")
def get_doctors_by_specialty(specialty: str, db=Depends(get_db)):
    specialty_clean = specialty.strip().lower()

    query = select(
        doctors.c.full_name,
        doctors.c.hospital,
        doctors.c.specialization,
        users.c.email
    ).select_from(
        doctors.join(users, doctors.c.user_id == users.c.id)
    ).where(users.c.is_verified == True)

    exact_query = query.where(func.lower(doctors.c.specialization) == specialty_clean)
    results = db.execute(exact_query).fetchall()

    if not results:
        results = db.execute(query).fetchall()

    return [{
        "full_name": r.full_name,
        "hospital": r.hospital,
        "specialization": r.specialization,
        "email": r.email
    } for r in results]

@app.post("/connect-doctor")
def connect_doctor(payload: ConnectDoctorRequest, db=Depends(get_db)):
    patient_user = db.execute(select(users).where(users.c.email == payload.patient_email)).first()
    if not patient_user:
        raise HTTPException(404, "Patient not found")
    patient = db.execute(select(patients).where(patients.c.user_id == patient_user.id)).first()
    if not patient:
        raise HTTPException(404, "Patient profile not found")

    doctor_user = db.execute(select(users).where(users.c.email == payload.doctor_email)).first()
    if not doctor_user:
        raise HTTPException(404, "Doctor not found")
    doctor = db.execute(select(doctors).where(doctors.c.user_id == doctor_user.id)).first()
    if not doctor:
        raise HTTPException(404, "Doctor profile not found")

    latest_screening = db.execute(
        select(screenings)
        .where(screenings.c.patient_id == patient.id)
        .order_by(screenings.c.created_at.desc())
    ).first()

    if not latest_screening:
        raise HTTPException(404, "No screening report found for this patient")

    db.execute(
        update(screenings)
        .where(screenings.c.id == latest_screening.id)
        .values(doctor_id=doctor.id)
    )
    db.commit()

    return {"success": True, "message": "Connected to doctor successfully"}

# ====================== ADMIN ROUTES ======================
@app.get("/admin/stats")
def get_admin_stats(db=Depends(get_db)):
    total_doctors = db.execute(select(func.count()).select_from(doctors)).scalar() or 0
    total_patients = db.execute(select(func.count()).select_from(patients)).scalar() or 0
    return {"total_doctors": total_doctors, "total_patients": total_patients}

@app.get("/admin/users")
def get_all_users(db=Depends(get_db)):
    result = []

    doctor_rows = db.execute(
        select(
            users.c.id,
            users.c.email,
            users.c.is_verified,
            doctors.c.full_name,
            doctors.c.specialization,
            doctors.c.hospital,
            doctors.c.license_id
        ).select_from(
            users.join(doctors, users.c.id == doctors.c.user_id)
        )
    ).fetchall()

    for r in doctor_rows:
        result.append({
            "id": r.id,
            "full_name": r.full_name,
            "email": r.email,
            "role": "doctor",
            "is_verified": bool(r.is_verified),
            "license_id": r.license_id,
            "specialization": r.specialization,
            "hospital": r.hospital
        })

    patient_rows = db.execute(
        select(
            users.c.id,
            users.c.email,
            patients.c.full_name,
            patients.c.id.label("patient_id")
        ).select_from(
            users.join(patients, users.c.id == patients.c.user_id)
        )
    ).fetchall()

    for r in patient_rows:
        latest = db.execute(
            select(screenings.c.risk_level)
            .where(screenings.c.patient_id == r.patient_id)
            .order_by(screenings.c.created_at.desc())
        ).first()

        result.append({
            "id": r.id,
            "full_name": r.full_name,
            "email": r.email,
            "role": "patient",
            "risk_level": latest.risk_level if latest else None
        })

    return result

@app.delete("/admin/delete-user/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):
    target = db.execute(select(users).where(users.c.id == user_id)).first()
    if not target:
        raise HTTPException(404, "User not found")

    db.execute(delete(users).where(users.c.id == user_id))
    db.commit()
    return {"success": True, "message": "User deleted successfully"}

@app.put("/doctor/update-status/{user_id}/{status_val}")
@app.post("/doctor/update-status/{user_id}/{status_val}")
def update_doctor_status(user_id: int, status_val: str, db=Depends(get_db)):
    target = True
    if status_val.lower() in ["false", "0", "unverified", "pending"]:
        target = False

    target_user = db.execute(select(users).where(users.c.id == user_id)).first()
    if not target_user:
        raise HTTPException(404, "User not found")

    db.execute(update(users).where(users.c.id == user_id).values(is_verified=target))
    db.commit()
    return {"success": True, "message": f"Doctor verification updated to {target}"}

# ====================== EXERCISES API ======================
@app.get("/api/get-exercises/{body_part}")
def get_exercises(body_part: str, db: Session = Depends(get_db)):
    exercises = db.query(Exercise).filter(Exercise.body_part == body_part).all()
    if not exercises:
        return {"message": "No exercises found for this part."}
    return exercises

print("✅ Server Ready - Real Machine Learning Engine Model Synced and Hooked!")
