# miso-tts service

Self-hosted MisoTTS (Miso TTS 8B) for NextOfKin narration. Replaces the ElevenLabs
voice. Because narration is a small fixed set of scenes, **Phase A renders the clips
offline once and the app serves them statically** (`TTS_PROVIDER=static`). The same
service is wired to run live on Cloud Run GPU later (Phase B) for spoken agent replies.

> Gates before relying on this: (1) confirm MisoTTS's commercial-use **license** (the
> repo README does not state one; output is watermarked via SilentCipher, inaudible),
> and (2) verify the `generator` import/API against the repo. Needs a **24 GB GPU**.

## Phase A: render the fixed scenes (do this now)

The 5 scene texts are the single shared source `src/lib/voice/scenes.data.json`. The
render script reads them and writes `public/voice/{scene}.mp3` (committed).

On a GPU host (local 24 GB GPU, or a rented one-off Modal/RunPod/GCE-L4 box):

```bash
# Option A: with Docker (recommended; pins CUDA + MisoTTS)
docker build -t miso-tts services/miso-tts
docker run --rm --gpus all \
  -v "$PWD/src/lib/voice:/srv/src/lib/voice:ro" \
  -v "$PWD/public/voice:/srv/public/voice" \
  -e MISO_TTS_SPEAKER=0 \
  miso-tts python scripts/render_scenes.py

# Option B: bare (clone MisoTTS, install, then)
MISO_DEVICE=cuda MISO_TTS_SPEAKER=0 python services/miso-tts/scripts/render_scenes.py
```

Then back on your dev machine:

```bash
git add public/voice/*.mp3
git commit -m "chore(tts): render narration scenes with MisoTTS"
```

Set `TTS_PROVIDER=static` (the default) in the app env. Done: narration now plays the
self-hosted clips, no ElevenLabs.

### Voice selection
`speaker=0` is the default MisoTTS voice. To use a specific warm "Ava" voice, clone it
by passing a `context` of (transcript, reference-audio) segments to `generate(...)`
(see MisoTTS docs) and thread it through `render_scenes.py`. Re-render to apply.

## Phase B: live spoken replies (later, not built)

Deploy this same image to Cloud Run **GPU**, scale-to-zero:

```bash
gcloud run deploy miso-tts \
  --source services/miso-tts \
  --region us-east1 \
  --no-allow-unauthenticated \
  --gpu 1 --gpu-type nvidia-l4 \
  --min-instances 0 --max-instances 1 \
  --cpu 4 --memory 16Gi --timeout 300 \
  --set-secrets MISO_TTS_AUTH_TOKEN=miso-tts-token:latest
```

Then add a `misoService` provider to the app's TTS seam that POSTs dynamic text to
`/synthesize`. Cost note: a warm 24 GB GPU is ~$400-600/mo; scale-to-zero trades that
for cold starts. If too costly, keep MisoTTS for the pre-rendered hero scenes and use a
CPU model (Kokoro) for dynamic replies.

## Endpoints (Phase B)
- `GET /health` -> `{"status":"ok"}`
- `POST /synthesize` (`{text, speaker}`, `Authorization: Bearer <MISO_TTS_AUTH_TOKEN>`)
  -> `audio/wav`
