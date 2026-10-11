import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from config.settings import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    API_PASSWORD,
    API_USERNAME,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_credentials(username: str, password: str) -> bool:
    return secrets.compare_digest(username, API_USERNAME) and secrets.compare_digest(
        password, API_PASSWORD
    )


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_client(token: str = Depends(_oauth2_scheme)) -> str:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise credentials_error

    subject = payload.get("sub")
    if subject is None:
        raise credentials_error
    return subject
