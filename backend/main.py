from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import auth, employees, predict

app = FastAPI(title="HR Attrition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(predict.router,   prefix="/predict",   tags=["Predict"])

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "HR Attrition API is running"}