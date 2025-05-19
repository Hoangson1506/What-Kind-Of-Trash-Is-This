from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Annotated
from auth import get_current_user, verify_password, create_access_token, get_hashed_password
from config import ACCESS_TOKEN_EXPIRE_MINUTES
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db import get_db
from models.adminAccounts import AdminAccounts
from schemas import AdminSignUp

router = APIRouter()


@router.post("/signup")
async def signup(admin: AdminSignUp, db: AsyncSession = Depends(get_db)):
    data = await db.execute(select(AdminAccounts).where(AdminAccounts.login_name == admin.username))
    if data.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    hashed_password = get_hashed_password(admin.password)
    new_admin = AdminAccounts(
        login_name=admin.username,
        hashed_password=hashed_password
    )
    db.add(new_admin)
    await db.commit()
    return {"message": "User created successfully"}


@router.post("/admin/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    admin = await db.execute(select(AdminAccounts).where(AdminAccounts.login_name == form_data.username))
    user = admin.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Can't find user! Please sign up!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password! Please try again!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES)    # create token
    access_token = create_access_token(
        data={"sub": user.login_name}, expires_delta=access_token_expires
    )

    print(f"Generated token: {access_token}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me")
async def read_users_me(current_user: AdminAccounts = Depends(get_current_user)):
    print(f"Got username: {current_user.login_name}")
    return {"username": current_user.login_name}
