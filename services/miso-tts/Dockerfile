# GPU image for MisoTTS (Miso TTS 8B). Needs a 24 GB GPU host to run. Used two ways:
#   - one-off render:  docker run ... python services/miso-tts/scripts/render_scenes.py
#   - Phase B live:    Cloud Run GPU (L4), serving app.main:app
# Model weights (~30-40 GB) download from Hugging Face on first run (not baked: too big).
FROM pytorch/pytorch:2.4.0-cuda12.1-cudnn9-runtime

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv

# Install MisoTTS (top-level `generator` module). Verify the ref/install against the repo.
RUN git clone https://github.com/MisoLabsAI/MisoTTS.git /opt/misotts \
    && pip install --no-cache-dir -e /opt/misotts
ENV PYTHONPATH=/opt/misotts:/srv

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY scripts/ ./scripts/

ENV PORT=8080 MISO_DEVICE=cuda
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
