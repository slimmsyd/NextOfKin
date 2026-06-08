import os

from fastapi import Header, HTTPException


def require_bearer(authorization: str | None = Header(default=None)) -> None:
    """V1 auth: a shared bearer secret set by the caller (the Next.js backend) and on
    the service via WHISPER_FLOW_AUTH_TOKEN. Phase 1.5 seam: swap this for GCP ID-token
    verification (Cloud Run IAM invoker) to drop the long-lived shared secret."""
    expected = os.environ.get("WHISPER_FLOW_AUTH_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=500, detail="auth not configured")
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="unauthorized")
