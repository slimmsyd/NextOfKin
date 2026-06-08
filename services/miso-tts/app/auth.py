import os

from fastapi import Header, HTTPException


def require_bearer(authorization: str | None = Header(default=None)) -> None:
    """Shared bearer secret for the live Phase B /synthesize endpoint. The offline
    render script does not use this. Set MISO_TTS_AUTH_TOKEN on the service and the
    caller. Phase 1.5: swap for GCP ID-token verification."""
    expected = os.environ.get("MISO_TTS_AUTH_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=500, detail="auth not configured")
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="unauthorized")
