from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import dependencies
from app.crud.crud_user import user
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_active_user),
) -> Any:
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(dependencies.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(dependencies.get_current_active_user),
) -> Any:
    user_obj = user.update(db, db_obj=current_user, obj_in=user_in)
    return user_obj

@router.post("/register", response_model=UserSchema)
def create_user_open(
    *,
    db: Session = Depends(dependencies.get_db),
    user_in: UserCreate,
) -> Any:
    user_obj = user.get_by_email(db, email=user_in.email)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_obj = user.get_by_username(db, username=user_in.username)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    user_obj = user.create(db, obj_in=user_in)
    return user_obj