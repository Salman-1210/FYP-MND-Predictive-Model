from sqlalchemy import create_engine, Table, MetaData, insert
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:1234@localhost:5432/mnd_app_pro"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Table link
exercises_table = Table("exercises", metadata, autoload_with=engine)

def add_all_data():
    # Sahi list structure
    data = [
        {"body_part": "left-arm", "exercise_name": "Seated Arm Stretches", "video_url": "https://www.youtube.com/shorts/QBm72rJ9pnA", "risk_level": "Low"},
        {"body_part": "left-arm", "exercise_name": "Wrist Flexion Exercise", "video_url": "https://www.youtube.com/watch?v=F8dJEqO8Htg", "risk_level": "Low"},
        {"body_part": "right-arm", "exercise_name": "Shoulder Blade Squeezes", "video_url": "https://www.youtube.com/watch?v=Ac_YCJ3zBTc", "risk_level": "Low"},
        {"body_part": "right-arm", "exercise_name": "Bicep Curls (Light Weight)", "video_url": "https://youtu.be/lMxK8aAy7e8", "risk_level": "Medium"},
        {"body_part": "neck", "exercise_name": "Neck Range of Motion", "video_url": "https://www.youtube.com/watch?v=j3_8btE4X-w", "risk_level": "Low"},
        {"body_part": "neck", "exercise_name": "Chin Tucks", "video_url": "https://www.youtube.com/watch?v=u8C5LgpK3r4", "risk_level": "Low"},
        {"body_part": "left-leg", "exercise_name": "Ankle Pumps", "video_url": "https://www.youtube.com/watch?v=KxfFzSOAT7g", "risk_level": "Low"},
        {"body_part": "right-leg", "exercise_name": "Seated Leg Extensions", "video_url": "https://www.youtube.com/watch?v=EAymwps5x0s", "risk_level": "Medium"},
        {"body_part": "back", "exercise_name": "Cat-Cow Stretch", "video_url": "https://www.youtube.com/watch?v=LIVJZZyZ2qM", "risk_level": "Low"}
    ]
    
    db.execute(insert(exercises_table), data)
    db.commit()
    print("✅ Saara data successfully daal diya gaya hai!")

if __name__ == "__main__":
    add_all_data()