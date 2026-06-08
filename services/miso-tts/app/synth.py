import io
import os

import torchaudio

# MisoTTS (Miso TTS 8B). NOTE: this follows the MisoTTS README API
# (`from generator import load_miso_8b` -> `generator.generate(...)`). Verify the
# exact import path and signature against https://github.com/MisoLabsAI/MisoTTS when
# you run it; the repo is inference-only and may move symbols. Model weights (~30-40 GB)
# download from Hugging Face on first load, so this needs a 24 GB GPU host.
from generator import load_miso_8b  # type: ignore

_DEVICE = os.environ.get("MISO_DEVICE", "cuda")
_MAX_MS = int(os.environ.get("MISO_MAX_AUDIO_MS", "45000"))

# Loaded once per process (warm). Heavy: only run on a GPU host.
_generator = load_miso_8b(device=_DEVICE)


def sample_rate() -> int:
    return int(_generator.sample_rate)


def synthesize(text: str, speaker: int = 0) -> bytes:
    """text -> WAV bytes. speaker 0 is the default voice; voice cloning would pass a
    `context` of prior (text, audio) segments (see render_scenes / MisoTTS docs)."""
    audio = _generator.generate(
        text=text,
        speaker=speaker,
        context=[],
        max_audio_length_ms=_MAX_MS,
    )
    buf = io.BytesIO()
    torchaudio.save(buf, audio.unsqueeze(0).cpu(), _generator.sample_rate, format="wav")
    return buf.getvalue()
