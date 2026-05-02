from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "mysql+pymysql://root:@localhost:3306/hr_attrition"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    role     = Column(String(20), default="hr")

class Employee(Base):
    __tablename__ = "employees"
    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(100))
    department       = Column(String(100))
    age              = Column(Integer)
    years_at_company = Column(Float)
    monthly_income   = Column(Float)
    job_satisfaction = Column(Integer)
    attrition_risk   = Column(Float, default=0.0)
    risk_label       = Column(String(10), default="Low")
    uploaded_at      = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)