"""Offline one-off render of the fixed narration scenes with MisoTTS.

Reads the 5 scene texts from the SINGLE shared source
(src/lib/voice/scenes.data.json) and writes public/voice/{scene}.mp3, which the app
serves statically (TTS_PROVIDER=static). Run this once on a GPU host; commit the mp3s.
Re-run only when a scene script changes.

    MISO_DEVICE=cuda MISO_TTS_SPEAKER=0 python services/miso-tts/scripts/render_scenes.py

Requires a 24 GB GPU and ffmpeg. Verify the MisoTTS `generator` API against the repo.
"""

import json
import os
import subprocess
import tempfile
from pathlib import Path

import torchaudio
from generator import load_miso_8b  # type: ignore

REPO_ROOT = Path(__file__).resolve().parents[3]
SCENES_JSON = REPO_ROOT / "src" / "lib" / "voice" / "scenes.data.json"
OUT_DIR = REPO_ROOT / "public" / "voice"


def to_mp3(wav_path: Path, mp3_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame", "-q:a", "2",
            str(mp3_path),
        ],
        check=True,
    )


def main() -> None:
    speaker = int(os.environ.get("MISO_TTS_SPEAKER", "0"))
    device = os.environ.get("MISO_DEVICE", "cuda")
    max_ms = int(os.environ.get("MISO_MAX_AUDIO_MS", "60000"))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    scenes: dict[str, str] = json.loads(SCENES_JSON.read_text())

    generator = load_miso_8b(device=device)
    for key, text in scenes.items():
        audio = generator.generate(
            text=text, speaker=speaker, context=[], max_audio_length_ms=max_ms
        )
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wav_path = Path(tmp.name)
        torchaudio.save(str(wav_path), audio.unsqueeze(0).cpu(), generator.sample_rate)
        mp3_path = OUT_DIR / f"{key}.mp3"
        to_mp3(wav_path, mp3_path)
        wav_path.unlink(missing_ok=True)
        print(f"rendered {key} -> {mp3_path}")

    print(f"done: {len(scenes)} scenes -> {OUT_DIR}")


if __name__ == "__main__":
    main()
