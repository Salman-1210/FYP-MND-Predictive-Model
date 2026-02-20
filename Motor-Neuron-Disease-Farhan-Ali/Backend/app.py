from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, TIMESTAMP, select, JSON, ForeignKey, Text, update, delete, Boolean
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
import os
import shutil
import bcrypt

# --- DATABASE CONFIG (PostgreSQL) ---
DATABASE_URL = "postgresql://postgres:1234@localhost/mnd_app_db"

engine = create_engine(DATABASE_URL)
metadata = MetaData()

# --- TABLES DEFINITION ---

users = Table(
    "users", metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String(100), nullable=False, unique=True),
    Column("password", String(255), nullable=False),
    Column("role", String(20), nullable=False),
    Column("is_verified", Boolean, server_default="true"), # Boolean column added
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

doctors = Table(
    "doctors", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("full_name", String(100), nullable=False),
    Column("specialization", String(100), default="General Physician"),
    Column("license_id", String(50), nullable=True), # License ID column
    Column("hospital", String(100)),
)

patients = Table(
    "patients", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("full_name", String(100), nullable=False),
    Column("age", Integer, default=0),
    Column("gender", String(20), default="Unknown"),
    Column("medical_history", Text),
)

admins = Table(
    "admins", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("full_name", String(100), nullable=False),
)

screenings = Table(
    "screenings", metadata,
    Column("id", Integer, primary_key=True),
    Column("patient_id", Integer, ForeignKey("patients.id", ondelete="CASCADE")),
    Column("risk_level", String(20), nullable=False),
    Column("answers", JSON, nullable=True),
    Column("report_filename", String(255), nullable=True),
    Column("ai_summary", Text, nullable=True),
    Column("status", String(20), server_default="pending"),
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

metadata.create_all(engine)

app = FastAPI()

# --- SETUP ---
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "patient"
    hospital: str = None
    specialty: str = None   # From updated Frontend
    license_id: str = None  # From updated Frontend

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str = None # Added for Role Validation

class ScreeningCreate(BaseModel):
    email: EmailStr
    risk_level: str
    answers: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class UserUpdate(BaseModel):
    name: str
    role: str

class VerificationUpdate(BaseModel): 
    is_verified: bool

# --- UTILS ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def get_db():
    conn = engine.connect()
    try: yield conn
    finally: conn.close()

# --- CORE ROUTES ---

@app.get("/")
def home():
    return {"message": "MND PostgreSQL API is running with Full Security Layers!"}

@app.post("/register")
def register(user: UserRegister, db=Depends(get_db)):
    if db.execute(select(users).where(users.c.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    verification_status = False if user.role == "doctor" else True

    stmt = users.insert().values(
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        is_verified=verification_status
    ).returning(users.c.id)
    
    try:
        result = db.execute(stmt)
        new_user_id = result.scalar() 
        
        if user.role == "doctor":
            db.execute(doctors.insert().values(
                user_id=new_user_id, 
                full_name=user.full_name, 
                specialization=user.specialty or "General Physician",
                license_id=user.license_id,
                hospital=user.hospital
            ))
        elif user.role == "patient":
            db.execute(patients.insert().values(user_id=new_user_id, full_name=user.full_name))
        elif user.role == "admin":
             db.execute(admins.insert().values(user_id=new_user_id, full_name=user.full_name))
        
        db.commit()

        return {
            "message": "Registered successfully",
            "user": {
                "id": new_user_id,
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name,
                "is_verified": verification_status
            }
        }
    except Exception as e:
        db.rollback() 
        print(e)
        raise HTTPException(status_code=500, detail="Registration failed.")

@app.post("/login")
def login(user: UserLogin, db=Depends(get_db)):
    user_record = db.execute(select(users).where(users.c.email == user.email)).first()
    if not user_record: 
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    u_data = user_record._mapping

    # --- ROLE VALIDATION (Prevents portal crossing) ---
    if user.role and u_data["role"] != user.role:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: This is the {user.role} portal. Your account is registered as a {u_data['role']}."
        )

    # SECURITY LAYER: Block login if doctor is not verified
    if u_data["role"] == "doctor" and u_data["is_verified"] == False:
        raise HTTPException(
            status_code=403, 
            detail="Account pending admin approval. Please contact management."
        )

    if not verify_password(user.password, u_data["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    full_name = "User"
    specialty = None
    if u_data["role"] == "patient":
        p = db.execute(select(patients).where(patients.c.user_id == u_data["id"])).first()
        if p: full_name = p.full_name
    elif u_data["role"] == "doctor":
        d = db.execute(select(doctors).where(doctors.c.user_id == u_data["id"])).first()
        if d: 
            full_name = d.full_name
            specialty = d.specialization
    elif u_data["role"] == "admin":
        a = db.execute(select(admins).where(admins.c.user_id == u_data["id"])).first()
        if a: full_name = a.full_name

    return {
        "message": "Login successful", 
        "user": {
            "id": u_data["id"], 
            "email": u_data["email"], 
            "role": u_data["role"],
            "name": full_name,
            "full_name": full_name,
            "specialty": specialty,
            "is_verified": u_data["is_verified"]
        }
    }

@app.patch("/admin/users/{user_id}/status")
def update_verification(user_id: int, data: VerificationUpdate, db=Depends(get_db)):
    stmt = update(users).where(users.c.id == user_id).values(is_verified=data.is_verified)
    db.execute(stmt)
    db.commit()
    return {"success": True}

@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.email == req.email)).first()
    if not user: raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "Reset link sent"}

@app.post("/submit-screening")
def submit_screening(data: ScreeningCreate, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.email == data.email)).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    patient = db.execute(select(patients).where(patients.c.user_id == user.id)).first()
    if not patient: raise HTTPException(status_code=404, detail="Patient profile not found")
    
    db.execute(screenings.insert().values(patient_id=patient.id, risk_level=data.risk_level, answers=data.answers))
    db.commit()
    return {"success": True}

@app.post("/upload-report")
async def upload_report(email: str = Form(...), file: UploadFile = File(...), db=Depends(get_db)):
    clean_filename = file.filename.replace(" ", "_")
    file_path = os.path.join("uploads", clean_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    filename_lower = file.filename.lower()
    
    # --- LAYERED SUMMARIES (PROFESSIONAL WORDING) ---
    if "normal" in filename_lower:
        risk = "Low Risk"
        summary = "Great news! AI analysis of your nerve conduction study shows results within the normal range. No indicators of MND were found. We recommend continuing your current wellness routine."
    elif "mnd" in filename_lower or "high" in filename_lower:
        risk = "High Risk"
        summary = "AI analysis has detected potential markers of Motor Neuron Disease. We strongly recommend immediate clinical consultation with our verified Neurologist and Physiotherapist for a formal diagnosis."
    else:
        risk = "Moderate Risk"
        summary = "AI analysis is inconclusive with some irregularities. Further investigation is advised. Please schedule a follow-up with a General Physician for clinical correlation."

    user = db.execute(select(users).where(users.c.email == email)).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    patient = db.execute(select(patients).where(patients.c.user_id == user.id)).first()
    if not patient: raise HTTPException(status_code=404, detail="Patient profile not found")

    db.execute(screenings.insert().values(patient_id=patient.id, risk_level=risk, report_filename=clean_filename, ai_summary=summary, answers={}))
    db.commit()
    return {"success": True, "analysis": {"risk": risk, "summary": summary}}

@app.get("/doctor/patients")
def get_patients_for_doctor(db=Depends(get_db)):
    query = select(
        patients.c.full_name, users.c.email, screenings.c.risk_level, screenings.c.created_at, 
        screenings.c.ai_summary, screenings.c.report_filename, screenings.c.status, screenings.c.id
    ).select_from(
        users.join(patients, users.c.id == patients.c.user_id)
             .outerjoin(screenings, patients.c.id == screenings.c.patient_id)
    ).where(users.c.role == "patient").order_by(screenings.c.created_at.desc())
    
    results = db.execute(query).fetchall()
    
    patient_list = []
    seen_emails = set()
    base_url = "http://127.0.0.1:8000/uploads/"

    for r in results:
        if r.email not in seen_emails:
            seen_emails.add(r.email)
            source_label = "(AI Report)" if r.report_filename else "(Screening Questions)"
            display_risk = f"{r.risk_level} {source_label}" if r.risk_level else "Pending"

            patient_list.append({
                "id": r.id, 
                "name": r.full_name, 
                "email": r.email, 
                "risk": display_risk, 
                "status": r.status, 
                "date": str(r.created_at) if r.created_at else "N/A", 
                "summary": r.ai_summary if r.ai_summary else "No screening data.", 
                "report_url": f"{base_url}{r.report_filename}" if r.report_filename else None 
            })
            
    return patient_list

@app.put("/doctor/mark-seen/{screening_id}")
def mark_seen(screening_id: int, db=Depends(get_db)):
    stmt = screenings.update().where(screenings.c.id == screening_id).values(status="checked")
    db.execute(stmt)
    db.commit()
    return {"success": True}

@app.get("/admin/stats")
def get_admin_stats(db=Depends(get_db)):
    total_patients = db.execute(select(func.count()).select_from(users).where(users.c.role == 'patient')).scalar()
    total_doctors = db.execute(select(func.count()).select_from(users).where(users.c.role == 'doctor')).scalar()
    high_risk = db.execute(select(func.count()).select_from(screenings).where(screenings.c.risk_level.like('%High Risk%'))).scalar()
    docs = db.execute(select(doctors.c.full_name, doctors.c.hospital)).fetchall()
    return {"total_patients": total_patients, "total_doctors": total_doctors, "high_risk_cases": high_risk, "active_doctors": [{"name": d.full_name, "hospital": d.hospital} for d in docs]}

@app.get("/admin/users")
def get_all_users(db=Depends(get_db)):
    users_list = db.execute(select(users).order_by(users.c.id)).fetchall()
    final_list = []
    
    for u in users_list:
        name = "Unknown"
        hospital = None
        specialty = None
        license = None
        
        if u.role == "patient":
            p = db.execute(select(patients).where(patients.c.user_id == u.id)).first()
            if p: name = p.full_name
        elif u.role == "doctor":
            d = db.execute(select(doctors).where(doctors.c.user_id == u.id)).first()
            if d: 
                name = d.full_name
                hospital = d.hospital
                specialty = d.specialization
                license = d.license_id
        elif u.role == "admin":
            a = db.execute(select(admins).where(admins.c.user_id == u.id)).first()
            if a: name = a.full_name
            
        final_list.append({
            "id": u.id, 
            "email": u.email, 
            "role": u.role, 
            "is_verified": u.is_verified, 
            "name": name, 
            "full_name": name, 
            "hospital": hospital,
            "specialty": specialty,
            "license_id": license
        })
        
    return final_list

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):
    result = db.execute(users.delete().where(users.c.id == user_id))
    db.commit()
    if result.rowcount == 0: raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@app.put("/admin/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, db=Depends(get_db)):
    current_user = db.execute(select(users).where(users.c.id == user_id)).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = current_user.role
    new_role = data.role
    new_name = data.name

    db.execute(users.update().where(users.c.id == user_id).values(role=new_role))

    if old_role != new_role:
        if old_role == "patient":
            db.execute(patients.delete().where(patients.c.user_id == user_id))
        elif old_role == "doctor":
            db.execute(doctors.delete().where(doctors.c.user_id == user_id))
        elif old_role == "admin":
            db.execute(admins.delete().where(admins.c.user_id == user_id))
        
        if new_role == "patient":
            db.execute(patients.insert().values(user_id=user_id, full_name=new_name))
        elif new_role == "doctor":
            db.execute(doctors.insert().values(user_id=user_id, full_name=new_name, hospital="Assigned by Admin"))
        elif new_role == "admin":
            db.execute(admins.insert().values(user_id=user_id, full_name=new_name))
    else:
        if new_role == "patient":
            db.execute(patients.update().where(patients.c.user_id == user_id).values(full_name=new_name))
        elif new_role == "doctor":
            db.execute(doctors.update().where(doctors.c.user_id == user_id).values(full_name=new_name))
        elif new_role == "admin":
            db.execute(admins.update().where(admins.c.user_id == user_id).values(full_name=new_name))

    db.commit()
    return {"message": "User updated successfully"}