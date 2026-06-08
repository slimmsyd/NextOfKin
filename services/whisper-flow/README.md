# whisper-flow STT service

Self-hosted speech-to-text for NextOfKin. Replaces ElevenLabs Scribe so family audio
never leaves our infrastructure (resolves the STT logging gate in ADR-002 and the
pre-public launch checklist). Phase 1 is batch (record-then-transcribe); Phase 2 adds
live streaming over WebSocket. See the plan and `src/lib/yourLife/stt.ts`.

## What it does

- `GET /health` -> `{"status":"ok"}`
- `POST /transcribe` (multipart `file=<webm/opus|mp4 blob>`, `Authorization: Bearer <token>`)
  -> decodes to 16 kHz mono PCM via ffmpeg -> `faster-whisper` (base.en) -> `{"text": "..."}`

The Next.js backend calls this server-to-server. The service is never public.

## Local run (no Docker)

```bash
cd services/whisper-flow
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export WHISPER_FLOW_AUTH_TOKEN=testtoken
export WHISPER_MODEL=base.en
uvicorn app.main:app --port 8080
# in another shell:
curl -s localhost:8080/health
curl -s -X POST localhost:8080/transcribe \
  -H "Authorization: Bearer testtoken" -F file=@sample.webm
```

## Docker

```bash
docker build -t whisper-flow services/whisper-flow            # base.en baked in
# or a different model:
docker build --build-arg WHISPER_MODEL=small.en -t whisper-flow services/whisper-flow
docker run --rm -p 8080:8080 -e WHISPER_FLOW_AUTH_TOKEN=testtoken whisper-flow
```

## Deploy to Cloud Run (private, scale-to-zero)

```bash
# Store the shared secret once:
echo -n "$(openssl rand -hex 32)" | gcloud secrets create whisper-flow-token --data-file=-

gcloud run deploy whisper-flow \
  --source services/whisper-flow \
  --region us-east1 \
  --no-allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --cpu 2 --memory 4Gi \
  --concurrency 1 --timeout 300 \
  --set-env-vars WHISPER_MODEL=base.en \
  --set-secrets WHISPER_FLOW_AUTH_TOKEN=whisper-flow-token:latest
```

Then set in the Next.js (Vercel) env:

```
STT_PROVIDER=whisperFlow
WHISPER_FLOW_URL=<the Cloud Run https URL>
WHISPER_FLOW_AUTH_TOKEN=<same value as the secret>
```

`min-instances 0` means $0 at idle and pennies per transcription; the first request
after idle cold-starts (a few seconds, model weights are baked in so no download).
Do not add `--cpu-no-throttling` / `--min-instances 1` until Phase 2 streaming needs a
warm instance.

## Env vars

| Name | Where | Purpose |
|---|---|---|
| `WHISPER_FLOW_AUTH_TOKEN` | service + Next.js | shared bearer secret (rotate via the Cloud Run secret) |
| `WHISPER_MODEL` | service | `base.en` (default) or `small.en` accuracy upgrade |
| `WHISPER_FLOW_URL` | Next.js | the Cloud Run service URL |

## Phase 2 (later)

Add a `ws` streaming endpoint using whisper-flow's `TranscribeSession`, fed by an
in-browser AudioWorklet sending 16 kHz mono PCM chunks. The batch `/transcribe` stays
as the iOS-Safari-safe fallback. Cloud Run supports native WebSocket; set
`--min-instances 1` then to keep the socket warm.
