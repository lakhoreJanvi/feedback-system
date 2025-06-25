from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend import models, database, schemas, auth
from typing import List
from backend.schemas import UserOut
from backend.schemas import ManagerOut

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email Already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name = user.name,
        email = user.email,
        hashed_password = hashed_password,
        role = user.role,
        manager_id = user.manager_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data = {"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def get_current_user(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user

@router.get("/team", response_model=list[UserOut])
def get_team(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view their team")

    return db.query(models.User).filter(models.User.manager_id == current_user.id).all()

@router.get("/employees", response_model=List[UserOut])
def get_employees(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, details="Only managers can view the employee list")
    return db.query(models.User).filter(models.User.role == "employee").all()

@router.get("/managers", response_model=list[ManagerOut])
def get_managers(db: Session = Depends(database.get_db)):
    managers = db.query(models.User).filter(models.User.role == "manager").all()
    return managers
