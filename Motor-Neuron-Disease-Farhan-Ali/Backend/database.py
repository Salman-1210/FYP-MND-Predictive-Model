from sqlalchemy import create_engine, MetaData

DATABASE_URL = "postgresql://postgres:password@localhost:5432/database"

engine = create_engine(DATABASE_URL)
metadata = MetaData()
