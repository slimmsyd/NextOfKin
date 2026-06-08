import os

import numpy as np
from faster_whisper import WhisperModel

# Loaded once per process. With Cloud Run min-instances=0 this loads on cold start
# (weights are baked into the image, so no network), then stays resident while warm.
_MODEL_NAME = os.environ.get("WHISPER_MODEL", "base.en")
_model = WhisperModel(_MODEL_NAME, device="cpu", compute_type="int8")


def transcribe_pcm(pcm: bytes) -> str:
    """16 kHz mono int16 PCM -> transcript. faster-whisper takes a float32 array in
    [-1, 1]."""
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segments, _ = _model.transcribe(audio, language="en", beam_size=5)
    return "".join(seg.text for seg in segments).strip()
