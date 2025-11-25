from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import openai, anthropic, redis, requests, os, tempfile
import base64
import re
from PIL import Image

app = FastAPI()

#CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_URL = os.getenv("REDIS_URL")
WORKER_URL = os.getenv("WORKER_URL")

# ----------------------------
#   LOAD KEYS
# ----------------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ----------------------------
#   CONFIGURE ONLY IF VALID
# ----------------------------
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# ----------------------------
#   REDIS (Upstash)
# ----------------------------
REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise ValueError("❌ Missing REDIS_URL for Upstash. Copy it from Upstash dashboard.")

# Upstash already uses TLS, no need for ssl args
print("🔗 Connecting to Upstash Redis...")

# Upstash works with CERT_NONE just fine
if REDIS_URL.startswith("redis://"):
    REDIS_URL = REDIS_URL.replace("redis://", "rediss://")

# FINAL clean connection
r = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)

print("✅ Connected to Upstash Redis")
print("PING →", r.ping())
    
SYSTEM_PROMPT = """MANIM ANIMATION GENERATOR

Output ONLY executable Python code. No markdown, no explanatory text.
Start with 3-7 bullet checklist explaining approach before code.

FRAME SPECS (16:9, 1920×1080):
- Dimensions: 14.22w × 8h units, origin (0,0) at center
- X: -7.11 to +7.11 (use -7 to +7), Y: -4 to +4
- SAFE ZONES: x∈[-6.5,6.5], y∈[-3.5,3.5] (0.5 unit margins mandatory)

LAYOUT:
┌──────────────────────────────┐
│ TITLE: y=3.0-3.5 (buff=0.3)  │
├──────────────┬───────────────┤
│ LEFT x=-3.5  │ RIGHT x=3.5   │
│ (visuals)    │ (equations)   │
│ x:-6 to -1   │ x:1 to 6      │
│ y:-3 to 2.5  │ y:-3 to 2.5   │
└──────────────┴───────────────┘

POSITIONING:
title.to_edge(UP,buff=0.3) | obj.move_to(LEFT*3.5) | eq.move_to(RIGHT*3.5) | summary.move_to(ORIGIN)

CODE STRUCTURE:
from manim import *
class MainScene(Scene):
    def construct(self):
        # PHASE 1: TITLE (0-5s)
        # PHASE 2: SETUP (5-15s)
        # PHASE 3: DEMO (15-35s)
        # PHASE 4: ANALYSIS (35-60s)
        # PHASE 5: RESULTS (60-75s)
        # PHASE 6: SUMMARY (75-80s)

PHASE RULES:
- Only use basic animations: Write, FadeIn, FadeOut, Transform, Create, wait
- Wait: 1s after equations, 2s after answers, 3s at end
- FadeOut intermediates before showing new elements
- Phase 1 title: font_size=40-48, color=BLUE/GOLD, Write(title), wait(1)
- Phase 2: LEFT visuals, RIGHT equations font_size=28, stack with .next_to(..., buff=0.3)
- Phase 3-6: Animate with Transform/Create/FadeIn/FadeOut only
- Max 10 elements on screen, track and clear aggressively
- All content must stay within [-6.5,6.5]×[-3.5,3.5]

TYPOGRAPHY:
Title:40-48 | Headers:28-32 | Equations:24-30 | Labels:22-28 | Answers:32-38
If equation width>4 units: reduce font_size by 4-6pts or split lines

CHECKLIST:
✓ Use only basic animations ✓ Explicit font_size/colors ✓ buff in .next_to() ✓ title.to_edge(UP,buff=0.3)
✓ LEFT x<-1, RIGHT x>1 ✓ All in [-6.5,6.5]×[-3.5,3.5] ✓ FadeOut before 5+ equations ✓ wait() after animations
✓ Phase comments ✓ No undefined vars ✓ Clear content aggressively ✓ Position precisely

ERROR: If concept invalid/missing, output: # ERROR: [reason]. Cannot generate.

REMINDERS:
1. Clear content aggressively with FadeOut 2. Position precisely 3. Smaller fonts > cutoff text 4. Max 10 elements on screen
5. Phases need FadeOut transitions 6. Center summary clearly 7. Output ONLY Python
8. Comment each phase 9. No explanations outside code


BEGIN CODE GENERATION."""

# ------------------------------------------------------
#   CODE VALIDATION & CLEANING
# ------------------------------------------------------
def validate_and_clean_code(code: str) -> dict:
    """
    Validates and cleans generated code.
    Returns dict with 'valid' (bool), 'code' (str), 'errors' (list)
    """
    errors = []
    original_code = code
    
    # 1. Check if code is empty
    if not code or not code.strip():
        return {"valid": False, "code": None, "errors": ["Generated code is empty"]}
    
    # 2. Remove markdown code blocks if present
    if "```python" in code or "```" in code:
        # Extract code from markdown blocks
        match = re.search(r'```(?:python)?\n(.*?)```', code, re.DOTALL)
        if match:
            code = match.group(1)
            print("⚠️ Removed markdown code blocks")
        else:
            # Try to remove just the backticks
            code = code.replace("```python", "").replace("```", "")
            print("⚠️ Removed markdown backticks")
    
    # 3. Check if code starts with valid import or comment
    code_stripped = code.strip()
    valid_starts = ["from manim import", "import manim", "# ", "from math import"]
    
    if not any(code_stripped.startswith(start) for start in valid_starts):
        errors.append(f"Code doesn't start with valid import. Starts with: {code_stripped[:50]}")
    
    # 4. Check for required imports
    if "from manim import" not in code and "import manim" not in code:
        errors.append("Missing 'from manim import *' statement")
    
    # 5. Check for MainScene class
    if "class MainScene" not in code:
        errors.append("Missing 'class MainScene(Scene):' definition")
    
    # 6. Check for construct method
    if "def construct(self)" not in code:
        errors.append("Missing 'def construct(self):' method")
    
    # 7. Check for error messages in code
    if "# ERROR:" in code or "#ERROR:" in code:
        error_match = re.search(r'#\s*ERROR:\s*(.+)', code)
        if error_match:
            errors.append(f"AI returned error: {error_match.group(1)}")
    
    # 8. Basic syntax checks
    lines = code.split('\n')
    for i, line in enumerate(lines, 1):
        # Check for common syntax issues
        if line.strip().startswith("class ") and not line.strip().endswith(":"):
            errors.append(f"Line {i}: Class definition missing colon")
        if line.strip().startswith("def ") and not line.strip().endswith(":"):
            errors.append(f"Line {i}: Function definition missing colon")
    
    # 9. Check minimum code length (valid Manim code should be substantial)
    if len(code.strip()) < 100:
        errors.append(f"Code too short ({len(code)} chars). Likely incomplete.")
    
    # 10. Log the code for debugging
    print(code)    
    if errors:
        print("\n⚠️ VALIDATION ERRORS:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("✓ Code validation passed")
    
    return {
        "valid": len(errors) == 0,
        "code": code,
        "errors": errors,
        "original": original_code
    }


# ------------------------------------------------------
#   FALLBACK ENGINE (SKIPS MODELS WITH INVALID KEYS)
# ------------------------------------------------------
def try_generate_with_fallback(image_path):

    # ---------------------------------------
    # 1️⃣ Gemini 2.5 Flash (CHEAPEST & BEST VALUE)
    # ---------------------------------------
    if GOOGLE_API_KEY:
        try:
            print("🔄 Trying Gemini 2.5 Pro...")
            model = genai.GenerativeModel(
                "gemini-2.5-pro",
                system_instruction=SYSTEM_PROMPT
            )
            
            pil_image = Image.open(image_path)
            
            result = model.generate_content([
                pil_image,
                "Analyze this problem and generate the complete Manim animation code following the system prompt instructions."
            ])
            
            if result.text:
                print("✓ Gemini generated response")
                return result.text

        except Exception as e:
            print(f"❌ Gemini failed: {e}")

    # ---------------------------------------
    # 1.5️⃣ Groq (OpenAI-compatible endpoint)
    # ---------------------------------------
    if GROQ_API_KEY:
        try:
            print("🔄 Trying Groq (openai-compatible)...")
            # Create a client that points to Groq's OpenAI-compatible endpoint
            groq_client = openai.OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")

            with open(image_path, "rb") as img:
                image_b64 = base64.b64encode(img.read()).decode('utf-8')

            # Build a multimodal input: system prompt, instruction, and the image as a data URI
            prompt = [
                {"type": "text", "text": SYSTEM_PROMPT},
                {"type": "text", "text": "Analyze this handwritten physics/math problem and generate the complete Manim animation code."},
                {"type": "image", "image_url": f"data:image/png;base64,{image_b64}"}
            ]

            resp = groq_client.responses.create(
                model="openai/gpt-oss-20b",
                input=prompt,
            )

            # Try to extract text from common response shapes
            output_text = None
            if hasattr(resp, 'output_text') and resp.output_text:
                output_text = resp.output_text
            else:
                out = getattr(resp, 'output', None)
                if out:
                    for item in out:
                        if isinstance(item, dict) and 'content' in item:
                            for c in item['content']:
                                if isinstance(c, dict) and c.get('type') in ('output_text', 'text'):
                                    output_text = c.get('text') or c.get('value')
                                    break
                            if output_text:
                                break

            if output_text:
                print("✓ Groq generated response")
                return output_text

        except Exception as e:
            print(f"❌ Groq failed: {e}")

    # ---------------------------------------
    # 2️⃣ OpenAI (only if key exists)
    # ---------------------------------------
    if OPENAI_API_KEY:
        try:
            print("🔄 Trying OpenAI GPT-4o-mini...")
            with open(image_path, "rb") as img:
                image_b64 = base64.b64encode(img.read()).decode('utf-8')
            
            completion = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": "Analyze this handwritten physics/math problem and generate the complete Manim animation code."},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}}
                        ]
                    }
                ]
            )
            print("✓ OpenAI generated response")
            return completion.choices[0].message.content

        except Exception as e:
            print(f"❌ OpenAI failed: {e}")

    # ---------------------------------------
    # 3️⃣ Claude (only if key exists)
    # ---------------------------------------
    if ANTHROPIC_API_KEY:
        try:
            print("🔄 Trying Claude 3.5 Sonnet...")
            with open(image_path, "rb") as img:
                image_b64 = base64.b64encode(img.read()).decode('utf-8')
            
            msg = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user", 
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_b64
                            }
                        },
                        {
                            "type": "text",
                            "text": "Analyze this handwritten physics/math problem and generate the complete Manim animation code."
                        }
                    ]
                }]
            )
            print("✓ Claude generated response")
            return msg.content[0].text

        except Exception as e:
            print(f"❌ Claude failed: {e}")

    print("❌ All AI models failed")
    return None

# ------------------------------------------------------
#   GENERATE ENDPOINT
# ------------------------------------------------------
@app.post("/generate")
async def generate(image: UploadFile):
    
    # Validate uploaded file
    if not image.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PNG/JPG images allowed")

    # Save image temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        content = await image.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        tmp.write(content)
        tmp_path = tmp.name

    print(f"\n📸 Image saved: {tmp_path} ({len(content)} bytes)")

    # RUN FALLBACK FUNCTION
    raw_code = try_generate_with_fallback(tmp_path)

    if not raw_code:
        return {
            "error": "All valid AI models failed or no valid API keys provided",
        }

    # VALIDATE CODE
    validation_result = validate_and_clean_code(raw_code)
    
    if not validation_result["valid"]:
        print("\n❌ CODE VALIDATION FAILED")
        return {
            "error": "Generated code validation failed",
            "validation_errors": validation_result["errors"],
            "raw_code_preview": validation_result["original"][:500]
        }
    
    code = validation_result["code"]

    # Job ID
    job_id = os.path.basename(tmp_path).split(".")[0]
    r.hset(job_id, mapping={"status": "processing", "code_length": len(code)})

    # Send to worker
    try:
        print(f"\n🚀 Sending to worker: {WORKER_URL}")
        response = requests.post(
            WORKER_URL,
            files={"file": ("script.py", code.encode("utf-8"))},
            data={"job_id": job_id},
            timeout=10
        )
        
        print(f"✓ Worker response: {response.status_code}")
        
        return {
            "job_id": job_id,
            "message": "Task submitted successfully",
            "worker_status": response.status_code,
            "worker_response": response.text[:200]
        }
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Worker request failed: {e}")
        r.hset(job_id, mapping={"status": "failed", "error": str(e)})
        return {
            "error": "Failed to submit to worker",
            "job_id": job_id,
            "details": str(e)
        }


# ------------------------------------------------------
#   CHECK JOB STATUS
# ------------------------------------------------------
@app.get("/status/{job_id}")
def get_status(job_id: str):
    status = r.hgetall(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status

@app.post("/ping")
def ping_server():
    return {
        "status": "ok",
        "message": "Server is alive",
    }

