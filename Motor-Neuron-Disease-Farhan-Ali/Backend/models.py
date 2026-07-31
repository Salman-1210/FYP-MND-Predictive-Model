# Backend/models.py
from sqlalchemy import Table, Column, Integer, String, Text, ForeignKey, TIMESTAMP, JSON, Boolean
from sqlalchemy.sql import func
from database import metadata, engine # database.py se engine aur metadata import ho raha hai

# 1. MAIN USERS TABLE
users = Table(
    "users", metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String(100), nullable=False, unique=True, index=True),
    Column("password", String(255), nullable=False),
    Column("role", String(20), nullable=False), 
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

# 2. DOCTORS TABLE
doctors = Table(
    "doctors", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True),
    Column("full_name", String(100), nullable=False),
    Column("specialization", String(100)),
    Column("license_number", String(50), unique=True),
    Column("hospital", String(100)),
    Column("is_verified", Boolean, default=False), # Admin approval ke liye zaroori
)

# 3. PATIENTS TABLE
patients = Table(
    "patients", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True),
    Column("full_name", String(100), nullable=False),
    Column("age", Integer, nullable=False),
    Column("gender", String(20)),
    Column("medical_history", Text),
    Column("risk_level", String(20), default="routine"), # Admin toggle ke liye zaroori
)

# 4. ADMINS TABLE
admins = Table(
    "admins", metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True),
    Column("full_name", String(100), nullable=False),
    Column("access_level", String(50), default="superadmin"),
)

# 5. SCREENINGS & 6. REPORTS (Aapka original code)
screenings = Table(
    "screenings", metadata,
    Column("id", Integer, primary_key=True),
    Column("patient_id", Integer, ForeignKey("patients.id", ondelete="CASCADE")),
    Column("risk_level", String(20), nullable=False),
    Column("answers", JSON, nullable=True),
    Column("visit_time", TIMESTAMP, server_default=func.now()),
    Column("analysis", JSON, nullable=True),
    
)

reports = Table(
    "reports", metadata,
    Column("id", Integer, primary_key=True), 
    Column("patient_id", Integer, ForeignKey("patients.id", ondelete="CASCADE")),
    Column("screening_id", Integer, ForeignKey("screenings.id", ondelete="CASCADE")),
    Column("report_summary", Text),
    Column("created_at", TIMESTAMP, server_default=func.now()),
)

# Tables create karne ka trigger
if __name__ == "__main__":
    metadata.create_all(engine)
    print("✅ Tables created successfully.")