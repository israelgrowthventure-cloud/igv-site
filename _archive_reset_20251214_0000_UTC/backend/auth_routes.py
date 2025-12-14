"""
Authentication routes for admin access
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
# Removed passlib import
import jwt # Using PyJWT
from datetime import datetime, timedelta
import os
import logging

router = APIRouter(prefix="/auth", tags=["authentication"])

# Security
import hashlib as hash_lib
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    email: str
    role: str
    name: str

# Hardcoded admin users (replace with DB in production)
# SHA256 of "admin123"
ADMIN_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" 

ADMIN_USERS = {
    "admin@israelgrowthventure.com": {
        "password_hash": ADMIN_HASH,
        "role": "admin",
        "name": "Administrator"
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Standard SHA256 check
    return hash_lib.sha256(plain_password.encode()).hexdigest() == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # PyJWT encode returns str in v2+, bytes in older. v2.8.0+ returns str.
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        # PyJWT decode
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return User(email=email, role=payload.get("role", "viewer"), name=payload.get("name", "User"))
    except Exception as e: # Catch all JWT errors
        logging.error(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login endpoint for admin users"""
    user = ADMIN_USERS.get(request.email)
    
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(
        data={"sub": request.email, "role": user["role"], "name": user["name"]}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={"email": request.email, "role": user["role"], "name": user["name"]}
    )

@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user
