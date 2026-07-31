from sqlalchemy import create_engine, inspect
from database import Base, DATABASE_URL

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

# Check karo table kahan bana hai
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables found in database: {tables}")
print(f"Engine URL: {engine.url}")