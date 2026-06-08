from fastapi import Depends, FastAPI, File, HTTPException, UploadFile

from app.audio import decode_to_pcm16
from app.auth import require_bearer

app = FastAPI(title="whisper-flow STT")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    _: None = Depends(require_bearer),
) -> dict:
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="no audio")
    try:
        pcm = decode_to_pcm16(audio_bytes)
    except ValueError:
        raise HTTPException(status_code=400, detail="undecodable audio")

    # Imported lazily so /health and auth failures never pay the model load cost.
    from app.transcribe import transcribe_pcm

    text = transcribe_pcm(pcm)
    return {"text": text}
