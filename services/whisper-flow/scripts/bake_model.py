"""Build-time only: pre-download the Whisper model so the weights are baked into an
image layer. This makes cold starts deterministic and offline (no Hugging Face fetch
at boot). Reads WHISPER_MODEL (default base.en)."""

import os

from faster_whisper import WhisperModel

model_name = os.environ.get("WHISPER_MODEL", "base.en")
WhisperModel(model_name, device="cpu", compute_type="int8")
print(f"baked model: {model_name}")
