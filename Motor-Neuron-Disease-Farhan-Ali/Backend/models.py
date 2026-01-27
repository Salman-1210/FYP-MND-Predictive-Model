from sqlalchemy import Table, Column, Integer, String, TIMESTAMP, JSON, ForeignKey
from database import metadata, engine

# ---------------- USERS TABLE ----------------
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("full_name", String(100), nullable=False),
    Column("email", String(100), nullable=False, unique=True),
    Column("password", String(255), nullable=False),
    Column("created_at", TIMESTAMP, server_default="CURRENT_TIMESTAMP")
)

# ---------------- SCREENINGS TABLE ----------------
screenings = Table(
    "screenings",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("risk_level", String(20), nullable=False),
    Column("answers", JSON, nullable=False),
    Column("created_at", TIMESTAMP, server_default="CURRENT_TIMESTAMP")
)

# Create tables
metadata.create_all(engine)
