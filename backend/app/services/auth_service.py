from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)

    def register(self, payload: RegisterRequest) -> tuple[User, str]:
        if self.users.get_by_email(payload.email.lower()) is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email уже занят")
        user = self.users.create(payload.email.lower(), hash_password(payload.password))
        token = create_access_token(str(user.id))
        return user, token

    def login(self, payload: LoginRequest) -> tuple[User, str]:
        user = self.users.get_by_email(payload.email.lower())
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
            )
        token = create_access_token(str(user.id))
        return user, token
