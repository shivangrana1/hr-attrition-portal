from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Employee

router = APIRouter()

@router.get("/")
def get_employees(department: str = None, db: Session = Depends(get_db)):
    query = db.query(Employee)
    if department:
        query = query.filter(Employee.department == department)
    return query.all()

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if emp:
        db.delete(emp)
        db.commit()
    return {"message": "Deleted"}