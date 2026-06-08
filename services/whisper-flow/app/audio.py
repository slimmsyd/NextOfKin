import subprocess


def decode_to_pcm16(audio_bytes: bytes) -> bytes:
    """Decode browser audio to the format Whisper expects.

    The browser's MediaRecorder produces webm/opus (and mp4/AAC on Safari). ffmpeg
    autodetects the input container; we force 16 kHz mono signed 16-bit little-endian
    PCM. Doing the decode here keeps the Next.js side thin (no ffmpeg on Vercel).
    """
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            "pipe:0",
            "-f",
            "s16le",
            "-acodec",
            "pcm_s16le",
            "-ac",
            "1",
            "-ar",
            "16000",
            "pipe:1",
        ],
        input=audio_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if proc.returncode != 0:
        raise ValueError(f"ffmpeg decode failed: {proc.stderr.decode()[:300]}")
    return proc.stdout
