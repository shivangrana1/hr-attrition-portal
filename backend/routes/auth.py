from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import BaseModel
from database import get_db, User
import hashlib
import os

router = APIRouter()
SECRET = "hr-secret-key-2024"

class RegisterInput(BaseModel):
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    salt = "hr_attrition_salt_2024"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

@router.post("/register")
def register(data: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        db.delete(existing)
        db.commit()
    user = User(email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    return {"message": "Account created successfully"}

@router.post("/login")
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(401, "No account found with this email")
    if not verify_password(data.password, user.password):
        raise HTTPException(401, "Wrong password")
    token = jwt.encode(
        {"sub": str(user.id), "email": user.email},
        SECRET,
        algorithm="HS256"
    )
    return {"access_token": token, "token_type": "bearer"}