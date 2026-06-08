from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.auth import require_bearer

# Live TTS endpoint for TTS Phase B (spoken agent replies). NOT used in Phase A
# (Phase A serves pre-rendered static clips from public/voice). Deploy this to Cloud
# Run GPU only when dynamic narration is wanted.

app = FastAPI(title="miso-tts")


class SynthBody(BaseModel):
    text: str
    speaker: int = 0


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/synthesize")
def synthesize_ep(body: SynthBody, _: None = Depends(require_bearer)) -> Response:
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="empty text")
    # Imported lazily so /health and auth failures never pay the model load cost.
    from app.synth import synthesize

    wav = synthesize(body.text, body.speaker)
    return Response(content=wav, media_type="audio/wav")
