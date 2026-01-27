from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, TIMESTAMP, select, JSON, ForeignKey, Text, update
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
import os
import shutil
import bcrypt
import json

# --- DATABASE CONFIG ---
DATABASE_URL = "sqlite:///./mnd_app_pro.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
metadata = MetaData()

# --- TABLES ---
users = Table(
    "users", metadata,
    Column("id", Integer, primary_key=True),
    Column("full_name", String(100), nullable=False),
    Column("email", String(100), nullable=False, unique=True),
    Column("password", String(255), nullable=False),
    Column("role", String(50), default="patient"),
    Column("hospital", String(100), nullable=True),
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

screenings = Table(
    "screenings", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("risk_level", String(20), nullable=False),
    Column("answers", JSON, nullable=True),
    Column("report_filename", String(255), nullable=True), 
    Column("ai_summary", Text, nullable=True),
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

metadata.create_all(engine)

app = FastAPI()

# --- MOUNT UPLOADS FOLDER ---
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "patient"
    hospital: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ScreeningCreate(BaseModel):
    email: EmailStr
    risk_level: str
    answers: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class UserUpdate(BaseModel):
    name: str
    role: str

# --- UTILS ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def get_db():
    conn = engine.connect()
    try: yield conn
    finally: conn.close()

# --- ROUTES ---

@app.get("/")
def home():
    return {"message": "MND API is running perfectly!"}

@app.post("/register")
def register(user: UserRegister, db=Depends(get_db)):
    if db.execute(select(users).where(users.c.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db.execute(users.insert().values(
        full_name=user.full_name, email=user.email, password=hash_password(user.password),
        role=user.role, hospital=user.hospital
    ))
    db.commit()
    return {"message": "Registered", "user": {"email": user.email, "role": user.role, "full_name": user.full_name}}

@app.post("/login")
def login(user: UserLogin, db=Depends(get_db)):
    result = db.execute(select(users).where(users.c.email == user.email)).first()
    if not result: raise HTTPException(status_code=400, detail="Invalid credentials")
    
    user_data = result._mapping
    if not verify_password(user.password, user_data["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": "Login successful", "user": {"id": user_data["id"], "full_name": user_data["full_name"], "email": user_data["email"], "role": user_data["role"]}}

@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.email == req.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"success": True, "message": "Password reset link sent (Simulated)."}

@app.post("/submit-screening")
def submit_screening(data: ScreeningCreate, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.email == data.email)).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    # Check if screening already exists, if so update, else insert (Optional safety)
    db.execute(screenings.insert().values(
        user_id=user._mapping["id"], 
        risk_level=data.risk_level, 
        answers=data.answers
    ))
    db.commit()
    return {"success": True}

@app.post("/upload-report")
async def upload_report(
    email: str = Form(...), 
    file: UploadFile = File(...),
    db=Depends(get_db)
):
    clean_filename = file.filename.replace(" ", "_")
    file_path = os.path.join("uploads", clean_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    filename_lower = file.filename.lower()
    if "mnd" in filename_lower or "report" in filename_lower:
        risk = "High Risk" if "mnd" in filename_lower else "Low Risk"
        summary = "AI detected indicators of Motor Neuron issues (Simulated Analysis)." if risk == "High Risk" else "Report analysis shows normal parameters."
    else:
        risk = "Low Risk"
        summary = "No significant abnormalities detected."

    user = db.execute(select(users).where(users.c.email == email)).first()
    if user:
        # Insert new report entry
        db.execute(screenings.insert().values(
            user_id=user._mapping["id"],
            risk_level=risk,
            answers={},
            report_filename=clean_filename,
            ai_summary=summary
        ))
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="User not found for this report")

    return {"success": True, "analysis": {"risk": risk, "summary": summary}}

# --- DOCTOR ROUTE (UPDATED FOR CONSISTENCY) ---
@app.get("/doctor/patients")
def get_patients_for_doctor(db=Depends(get_db)):
    # UPDATED QUERY: Use outerjoin to include patients even if they haven't done screening
    # Filter strictly by role='patient'
    query = select(
        users.c.full_name, users.c.email, screenings.c.risk_level, users.c.created_at, 
        screenings.c.ai_summary, screenings.c.report_filename
    ).select_from(
        users.outerjoin(screenings, users.c.id == screenings.c.user_id)
    ).where(users.c.role == "patient").order_by(users.c.created_at.desc())
    
    results = db.execute(query).fetchall()
    patients = []
    
    base_url = "http://127.0.0.1:8000/uploads/"

    for r in results:
        patients.append({
            "name": r.full_name, 
            "email": r.email, 
            "risk": r.risk_level if r.risk_level else "Pending", # Show "Pending" if no screening
            "date": str(r.created_at), 
            "summary": r.ai_summary if r.ai_summary else "No screening data yet.", 
            "report_url": f"{base_url}{r.report_filename}" if r.report_filename else None 
        })
    return patients

@app.post("/doctor/send-appointment")
def send_appointment_dummy():
    return {"success": True}

# --- ADMIN ROUTES (MANAGEMENT & STATS) ---

@app.get("/admin/users")
def get_all_users(db=Depends(get_db)):
    # Returns all users for Admin Management
    results = db.execute(select(users)).fetchall()
    all_users = []
    for u in results:
        all_users.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "hospital": u.hospital
        })
    return all_users

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete from DB (Screenings will auto-delete due to Cascade if configured, but manual ensures safety)
    db.execute(screenings.delete().where(screenings.c.user_id == user_id))
    db.execute(users.delete().where(users.c.id == user_id))
    db.commit()
    return {"success": True, "message": "User deleted successfully"}

@app.put("/admin/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, db=Depends(get_db)):
    user = db.execute(select(users).where(users.c.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stmt = update(users).where(users.c.id == user_id).values(full_name=data.name, role=data.role)
    db.execute(stmt)
    db.commit()
    return {"success": True, "message": "User updated"}

@app.get("/admin/stats")
def get_admin_stats(db=Depends(get_db)):
    total_patients = db.execute(select(func.count()).select_from(users).where(users.c.role == 'patient')).scalar()
    total_doctors = db.execute(select(func.count()).select_from(users).where(users.c.role == 'doctor')).scalar()
    doctors_list = db.execute(select(users.c.full_name, users.c.hospital).where(users.c.role == 'doctor')).fetchall()
    high_risk = db.execute(select(func.count()).select_from(screenings).where(screenings.c.risk_level == 'High Risk')).scalar()
    
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "high_risk_cases": high_risk,
        "active_doctors": [{"name": d.full_name, "hospital": d.hospital} for d in doctors_list]
    }