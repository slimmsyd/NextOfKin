FROM python:3.11-slim

# ffmpeg for the webm/opus|mp4 -> PCM decode.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the model into the image (deterministic, offline cold starts).
ARG WHISPER_MODEL=base.en
ENV WHISPER_MODEL=${WHISPER_MODEL}
COPY scripts/ ./scripts/
RUN python scripts/bake_model.py

COPY app/ ./app/

# Cloud Run injects PORT.
ENV PORT=8080
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
