import hmac

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    """Only the Express backend may call the AI service.

    The token is compared in constant time. If no token is configured the
    service refuses every protected request rather than running open.
    """
    expected = get_settings().internal_service_token
    if not expected:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "INTERNAL_SERVICE_TOKEN is not configured")
    if not x_internal_token or not hmac.compare_digest(x_internal_token, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid internal service token")
