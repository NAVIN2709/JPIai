FROM manimcommunity/manim:stable

# Switch to root to install packages
USER root

# Install ffmpeg if not already available
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

WORKDIR /app

# Copy service_b code
COPY . /app/service_b

# Copy watermark (mount also works)
COPY logo.jpg /app/logo.jpg

# Install python deps
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    celery \
    redis \
    cloudinary \
    pillow \
    python-multipart

# Set Python path
ENV PYTHONPATH=/app

EXPOSE 9000

# Switch back to default user if it exists (optional and safe)
# USER manim

CMD ["bash", "-c", "python -m celery -A service_b.worker_server.celery worker --loglevel=info --pool=solo & python -m uvicorn service_b.worker_server:app --host 0.0.0.0 --port 9000"]
