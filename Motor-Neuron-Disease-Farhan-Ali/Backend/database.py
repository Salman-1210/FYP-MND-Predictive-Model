from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError

# 1. Database URL (Isay check karlo, password 1234 hi hai na?)
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/mnd_app_pro"

# 2. Engine and Session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. Exercise Model
class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    body_part = Column(String, index=True)
    exercise_name = Column(String)
    video_url = Column(String)
    risk_level = Column(String)
    disclaimer = Column(String, default="Consult your doctor before starting.")

# 4. Initialize Database
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables initialized/verified.")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. Simple Connection Test
try:
    with engine.connect() as conn:
        print("✅ Database Connection Successful!")
except Exception as e:
    print(f"❌ Database Connection Failed: {e}")
    print(f"DEBUG: Connecting to DB at -> {DATABASE_URL}")