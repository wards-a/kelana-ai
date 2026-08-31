import bcrypt
from sqlalchemy.exc import IntegrityError
from database import SessionLocal
from models.user import User
from datetime import datetime, timedelta
from typing import Optional
import jwt
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# HTTP Bearer scheme for token extraction
security = HTTPBearer()

class RegistrationError(Exception):
    """Custom exception for registration errors"""
    pass

class LoginError(Exception):
    """Custom exception for login errors"""
    pass

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
    """
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain text password against a hash
    
    Args:
        password: Plain text password
        password_hash: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def register_user(name: str, email: str, password: str) -> dict:
    """
    Register a new user with email and password
    
    Args:
        name: User's full name
        email: User's email address
        password: Plain text password
        
    Returns:
        Dictionary containing user information (id, name, email, created_at)
        
    Raises:
        RegistrationError: If registration fails (e.g., email already exists)
    """
    print("Yes")
    db = SessionLocal()
    try:
        # Hash the password
        password_hash = hash_password(password)
        
        # Create new user
        user = User(
            name=name,
            email=email,
            password_hash=password_hash
        )
        
        # Add and commit to database
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Return user data (excluding password hash)
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        }
    
    except IntegrityError as e:
        db.rollback()
        # Check if error is due to duplicate email
        if "unique constraint" in str(e).lower() or "email" in str(e).lower():
            raise RegistrationError(f"Email '{email}' is already registered")
        raise RegistrationError("Failed to register user: Database constraint violation")
    
    except Exception as e:
        db.rollback()
        raise RegistrationError(f"Failed to register user: {str(e)}")
    
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing claims to encode in token
        expires_delta: Optional custom expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def login_user(email: str, password: str) -> dict:
    """
    Authenticate user and return JWT token
    
    Args:
        email: User's email address
        password: Plain text password
        
    Returns:
        Dictionary containing access token, token type, and user info
        
    Raises:
        LoginError: If credentials are invalid or user not found
    """
    db = SessionLocal()
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise LoginError("Invalid email or password")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise LoginError("Invalid email or password")
        
        # Create JWT token
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "name": user.name
            }
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
            }
        }
    
    except LoginError:
        raise
    except Exception as e:
        raise LoginError(f"Login failed: {str(e)}")
    
    finally:
        db.close()

def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string to verify
        
    Returns:
        Dictionary containing token claims
        
    Raises:
        LoginError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise LoginError("Token has expired")
    except jwt.InvalidTokenError:
        raise LoginError("Invalid token")
    except Exception as e:
        raise LoginError(f"Token verification failed: {str(e)}")

def get_current_user(credentials = Depends(security)) -> dict:
    """
    Dependency to extract and verify current user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from request
        
    Returns:
        Dictionary containing user claims (id, email, name)
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials
    try:
        payload = verify_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return payload
    except LoginError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
