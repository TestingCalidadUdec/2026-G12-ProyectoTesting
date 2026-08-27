from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import dependencies
from app.core import security
from app.core.config import settings
from app.crud.crud_user import user
from app.schemas.user import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(dependencies.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user_obj = user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active(user_obj):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user_obj.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }