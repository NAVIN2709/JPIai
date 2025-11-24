FROM python:3.11-slim

WORKDIR /app

# Copy ONLY service_a
COPY . /app/service_a

# Install dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    google-generativeai \
    openai \
    anthropic \
    redis \
    requests \
    python-multipart \
    Pillow

# Set python path so service_a is importable
ENV PYTHONPATH=/app

ENV PORT=8000
EXPOSE ${PORT}

CMD ["sh", "-c", "uvicorn service_a.ai_server:app --host 0.0.0.0 --port ${PORT}"]
