from fastapi import FastAPI, UploadFile, Form
from celery import Celery
import subprocess, cloudinary, cloudinary.uploader
import tempfile, os, redis, traceback

app = FastAPI()

# ==================================================
# ENVIRONMENT & CONFIG
# ==================================================
REDIS_URL = os.getenv("REDIS_URL")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Watermark location inside Docker
WATERMARK_PATH = os.getenv("WATERMARK_PATH", "/app/logo.jpg")
DEFAULT_WATERMARK = "/app/default_logo.jpg"  # fallback watermark

# Redis / Celery setup
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
celery = Celery(__name__, broker=REDIS_URL, backend=REDIS_URL)

# Cloudinary authentication
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# ==================================================
# CELERY TASK
# ==================================================
@celery.task(bind=True)
def render_and_upload(self, job_id, file_content):
    try:
        r.hset(job_id, mapping={"status": "received", "msg": "Code received"})
        print(f"🔵 [JOB {job_id}] Code received")

        # ---------------------------------------------
        # Create temporary directory for files
        # ---------------------------------------------
        with tempfile.TemporaryDirectory() as tmpdir:
            script_path = os.path.join(tmpdir, "main.py")

            print("📝 Creating script file...")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(file_content)

            # ---------------------------------------------
            # Render video using manim with real-time output
            # ---------------------------------------------
            r.hset(job_id, mapping={"status": "rendering", "msg": "Manim started"})
            print("🎬 Running Manim render...")

            manim_cmd = [
                "manim",
                "-qm",            # medium quality, shows progress
                script_path,
                "MainScene"
            ]

            process = subprocess.Popen(
                manim_cmd,
                cwd=tmpdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )

            # Stream Manim output line by line
            for line in process.stdout:
                print(line, end="")  # real-time output

            process.wait()
            if process.returncode != 0:
                error = f"Manim failed with return code {process.returncode}"
                print("❌", error)
                r.hset(job_id, mapping={"status": "failed", "error": error})
                return

            print("✅ Manim completed successfully")

            # ---------------------------------------------
            # Find rendered video (Manim output folder)
            # ---------------------------------------------
            video_path = None
            media_dir = os.path.join(tmpdir, "media", "videos")
            if not os.path.isdir(media_dir):
                error = "Manim media directory not found"
                print("❌", error)
                r.hset(job_id, mapping={"status": "failed", "error": error})
                return

            # Walk the media/videos folder and find the MainScene .mp4
            for root, _, files in os.walk(media_dir):
                for file in files:
                    if file.endswith(".mp4") and "MainScene" in file:
                        video_path = os.path.join(root, file)
                        break
                if video_path:
                    break

            if not video_path:
                error = "Rendered MainScene video not found in media/videos"
                print("❌", error)
                r.hset(job_id, mapping={"status": "failed", "error": error})
                return

            print("📹 Located video:", video_path)

            # ---------------------------------------------
            # Add watermark using FFmpeg (scaled to smaller size)
            # ---------------------------------------------
            watermark_to_use = WATERMARK_PATH
            if not os.path.isfile(WATERMARK_PATH):
                print(f"⚠️ {WATERMARK_PATH} not found, using default watermark")
                watermark_to_use = DEFAULT_WATERMARK

            if not os.path.isfile(watermark_to_use):
                err = f"No valid watermark found at {WATERMARK_PATH} or default"
                print("❌", err)
                r.hset(job_id, mapping={"status": "failed", "error": err})
                return

            print(f"💧 Adding watermark using {watermark_to_use}...")

            final_out = os.path.join(tmpdir, "final.mp4")

            # Scale watermark to 10% of video width (small)
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", video_path,
                "-i", watermark_to_use,
                "-filter_complex", "[1]scale=iw*0.1:-1[wm];[0][wm]overlay=W-w-10:H-h-10",
                "-codec:a", "copy",
                final_out
            ]

            ffmpeg_process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            for line in ffmpeg_process.stdout:
                print(line, end="")  # show ffmpeg progress
            ffmpeg_process.wait()

            if ffmpeg_process.returncode != 0:
                print("❌ FFmpeg failed")
                r.hset(job_id, mapping={"status": "failed", "error": "FFmpeg failed"})
                return

            print("✨ Watermark added successfully")

            # ---------------------------------------------
            # Upload to Cloudinary
            # ---------------------------------------------
            print("📤 Uploading to Cloudinary...")
            upload = cloudinary.uploader.upload(
                final_out,
                resource_type="video",
                folder="manim-renders"
            )

            secure_url = upload.get("secure_url")
            if not secure_url:
                print("❌ Cloudinary upload failed")
                r.hset(job_id, mapping={"status": "failed", "error": "Cloudinary upload error"})
                return

            print("✅ Upload done:", secure_url)
            r.hset(job_id, mapping={"status": "done", "url": secure_url})
            return secure_url

    except Exception:
        error = traceback.format_exc()
        print("🔥 Fatal Error:", error)
        r.hset(job_id, mapping={"status": "failed", "error": error})
        return

# ==================================================
# FASTAPI ROUTES
# ==================================================
@app.post("/process")
async def process(file: UploadFile, job_id: str = Form(...)):
    code = (await file.read()).decode("utf-8", errors="ignore")
    r.hset(job_id, mapping={"status": "queued", "msg": "Job queued"})
    render_and_upload.delay(job_id, code)
    return {"job_id": job_id, "status": "queued"}


@app.get("/status/{job_id}")
def check_status(job_id: str):
    return r.hgetall(job_id)


@app.post("/ping")
def ping():
    return {"status": "ok"}
