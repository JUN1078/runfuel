from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, UnauthorizedError, ConflictError
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token_pair,
    hash_token,
)
from app.config import get_settings
from app.models.user import User
from app.models.refresh_token import RefreshToken

settings = get_settings()


async def register_user(db: AsyncSession, email: str, password: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ConflictError("Email already registered")

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    await db.flush()
    return user


async def login_user(
    db: AsyncSession, email: str, password: str
) -> tuple[User, str, str]:
    """Returns (user, access_token, refresh_token_raw)."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedError("Account is deactivated")

    access_token = create_access_token(user.id)
    raw_refresh, token_hash = create_refresh_token_pair()

    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_record)
    await db.flush()

    return user, access_token, raw_refresh


async def refresh_tokens(
    db: AsyncSession, raw_refresh_token: str
) -> tuple[str, str]:
    """Returns (new_access_token, new_refresh_token_raw)."""
    token_hash = hash_token(raw_refresh_token)

    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    token_record = result.scalar_one_or_none()

    if not token_record:
        raise UnauthorizedError("Invalid refresh token")

    # Reuse detection: if token was already revoked, revoke ALL user tokens
    if token_record.is_revoked:
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == token_record.user_id)
            .values(is_revoked=True)
        )
        raise UnauthorizedError("Token reuse detected. All sessions revoked.")

    if token_record.expires_at < datetime.now(timezone.utc):
        raise UnauthorizedError("Refresh token expired")

    # Revoke old token
    token_record.is_revoked = True

    # Create new pair
    new_access = create_access_token(token_record.user_id)
    new_raw_refresh, new_hash = create_refresh_token_pair()

    new_record = RefreshToken(
        user_id=token_record.user_id,
        token_hash=new_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_record)
    await db.flush()

    token_record.replaced_by = new_record.id

    return new_access, new_raw_refresh


async def logout_user(db: AsyncSession, user_id: str, raw_refresh_token: str) -> None:
    token_hash = hash_token(raw_refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == user_id,
        )
    )
    token_record = result.scalar_one_or_none()
    if token_record:
        token_record.is_revoked = True
