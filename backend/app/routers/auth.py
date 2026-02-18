# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

from .. import schemas, crud
from ..db import SessionLocal
from ..auth import create_access_token, SECRET_KEY, ALGORITHM   # make sure these exist

router = APIRouter(prefix="/api/auth", tags=["auth"])

# token URL used by OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ------------------------ DB SESSION ------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------ REGISTER ------------------------
@router.post(
    "/register",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_in: schemas.UserRegister,
    db: Session = Depends(get_db)
):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = crud.create_user(db, user_in)

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "department": user.department,
        "role": user.role.value,
        "joined_at": user.joined_at,
    }


# ------------------------ LOGIN ------------------------
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWT contains user id as sub
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


# ------------------------ CURRENT USER (NEW) ------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Decodes JWT token, extracts user ID, loads user from DB.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # decode token using SECRET_KEY + ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    # find user in DB
    user = crud.get_user(db, int(user_id))
    if not user:
        raise credentials_exc

    return user


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user=Depends(get_current_user)):
    """
    Returns the currently authenticated user.
    Frontend will call this endpoint after login.
    """
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "department": current_user.department,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role,
        "joined_at": current_user.joined_at,
    }
