FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/opt/models

WORKDIR /app

# CPU-only torch keeps the image ~1 GB instead of ~4 GB with CUDA
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.*
COPY requirements.txt .
RUN pip install -r requirements.txt

# Bake the MiniLM weights into the image so containers start without network access.
ARG PRELOAD_MODEL=true
RUN if [ "$PRELOAD_MODEL" = "true" ]; then \
      python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"; \
    fi

# Weights are baked in, so never reach out to the Hugging Face hub at runtime
ENV HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1

COPY app ./app

RUN useradd --system --uid 10001 --home /app aiuser && chown -R aiuser /app /opt/models
USER 10001

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers"]
