import os
import json
import PIL.Image
from pathlib import Path
# New Standard SDK Package Import Integration
import google.generativeai as genai 

# ──────────────────────────────────────────────────────────────────
#   SECURITY: API Key must be set in environment variable
#   export GEMINI_API_KEY="your-key-here"
# ──────────────────────────────────────────────────────────────────
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY environment variable not set. Please set it before running.")

# ──────────────────────────────────────────────────────────────────
#   CONFIGURATION
# ──────────────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024       # 10MB
MIN_IMAGE_DIMENSION = (400, 400)       # Medical reports are A4-ish, not icons

# Known medical terms for semantic validation
KNOWN_NERVES = {
    'median', 'ulnar', 'radial', 'peroneal', 'tibial', 'femoral', 
    'sural', 'saphenous', 'superficial peroneal', 'musculocutaneous',
    'axillary', 'sciatic', 'phrenic'
}
KNOWN_MUSCLES = {
    'fdi', 'apb', 'adq', 'biceps', 'triceps', 'deltoid', 'quadriceps',
    'tibialis anterior', 'gastrocnemius', 'extensor digitorum brevis',
    'abductor hallucis', 'vastus lateralis', 'lumbrical', 'tongue',
    'genioglossus', 'orbicularis oris', 'orbicularis oculi',
    'interossei', 'thenar', 'hypothenar', 'paraspinal', 'intercostal'
}
KNOWN_MEDICAL_TERMS = {
    'latency', 'amplitude', 'conduction', 'velocity', 'ncv', 'cmap',
    'snap', 'emg', 'fibrillation', 'positive sharp wave', 'psw',
    'mnd', 'als', 'pma', 'pbp', 'motor neuron', 'nerve',
    'electromyography', 'conduction study', 'denervation'
}


def validate_upload(file_path: str) -> tuple[bool, str]:
    """
    Layer 1: File-level validation (size, extension, dimensions, corruption).
    """
    path = Path(file_path)
    
    # Extension check
    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type '{path.suffix}'. Only {', '.join(ALLOWED_EXTENSIONS)} allowed."
    
    # Existence check
    if not path.exists():
        return False, "File not found on server."
    
    # Size check
    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        return False, f"File too large ({file_size / (1024*1024):.1f}MB). Max {MAX_FILE_SIZE / (1024*1024):.0f}MB allowed."
    if file_size < 1024:  # Less than 1KB is suspicious
        return False, "File too small or possibly corrupted."
    
    # Image integrity & dimension check
    try:
        img = PIL.Image.open(file_path)
        img.verify()  # Verify it's a valid image
        img = PIL.Image.open(file_path)  # Re-open after verify
        width, height = img.size
        if width < MIN_IMAGE_DIMENSION[0] or height < MIN_IMAGE_DIMENSION[1]:
            return False, f"Image dimensions too small ({width}x{height}). Minimum {MIN_IMAGE_DIMENSION[0]}x{MIN_IMAGE_DIMENSION[1]} required for a medical report."
        # Check if image is mostly blank/white (simple heuristic)
        img_gray = img.convert('L')
        pixels = list(img_gray.getdata())
        white_pixels = sum(1 for p in pixels if p > 240)
        white_ratio = white_pixels / len(pixels) if pixels else 1.0
        if white_ratio > 0.98:
            return False, "Image appears to be blank or nearly blank. Please upload a readable medical report."
    except Exception as e:
        return False, f"Invalid or corrupted image file: {str(e)}"
        
    return True, "OK"


def is_medical_report_image(image_path: str) -> tuple[bool, str]:
    """
    Layer 2: Visual sanity check using Gemini Vision.
    FAIL OPEN: If API fails, assume it's medical and let Layer 4 handle validation.
    """
    try:
        genai.configure(api_key=API_KEY)
        img = PIL.Image.open(image_path)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = """
        You are a strict medical document classifier. Look at this image carefully.
        
        Does this image contain a medical nerve conduction study (NCS) or EMG report 
        with tables showing clinical data such as nerve names, latency, amplitude, 
        distance, and NCV values? 
        
        Answer with EXACTLY one word: YES or NO.
        Do not add any explanation, markdown, or punctuation.
        """
        
        response = model.generate_content(
            [prompt, img],
            generation_config={"temperature": 0.0, "max_output_tokens": 10}
        )
        
        # 🔥 FIX: Check if response has valid parts before accessing .text
        if not response.parts:
            print(f"⚠️ [GUARD] Empty response from Gemini (finish_reason: {response.candidates[0].finish_reason if response.candidates else 'unknown'}). Bypassing Layer 2.")
            return True, "Layer 2 bypassed — API response issue."
        
        answer = response.text.strip().upper()
        print(f"🔍 [GUARD] Visual check result: {answer}")
        
        if "YES" in answer:
            return True, "Image appears to be a medical report."
        else:
            return False, "This image does not appear to be a medical NCS/EMG report. Please upload a valid nerve conduction or EMG report."
            
    except Exception as e:
        print(f"⚠️ [GUARD ERROR] Pre-check failed: {e}")
        # 🔥 FIX: Fail open — don't block on API errors
        print(f"⚠️ [GUARD] Bypassing Layer 2 due to API error.")
        return True, "Layer 2 bypassed — API error."

def validate_extracted_data(data: dict) -> tuple[bool, str]:
    """
    Layer 4: Post-OCR semantic validation.
    Ensures extracted JSON actually contains medically coherent data.
    """
    if not data or not isinstance(data, dict):
        return False, "Empty or corrupted extraction data."
    
    # Check for error key (from upstream validation)
    if "error" in data:
        return False, data.get("message", "Upstream validation failed.")
    
    # Structure check
    required_keys = [
        'Motor_Nerve_Conduction_Studies',
        'Sensory_Nerve_Conduction_Studies', 
        'Electromyography'
    ]
    for key in required_keys:
        if key not in data:
            return False, f"Missing required section: {key}. Uploaded document may not be a valid NCS/EMG report."
    
    motor = data.get('Motor_Nerve_Conduction_Studies', []) or []
    sensory = data.get('Sensory_Nerve_Conduction_Studies', []) or []
    emg = data.get('Electromyography', []) or []
    
    # Blank page / empty table check
    total_rows = len(motor) + len(sensory) + len(emg)
    if total_rows == 0:
        return False, "No table rows extracted. The uploaded image may be blank or not contain medical tables."
    
    # Collect all text values and check for medical terms
    all_text = []
    numeric_count = 0
    medical_term_hits = 0
    
    for section in [motor, sensory, emg]:
        for row in section:
            if not isinstance(row, dict):
                continue
            for val in row.values():
                if val and str(val).strip():
                    text_lower = str(val).lower().strip()
                    all_text.append(text_lower)
                    # Count numbers (clinical values like latencies, amplitudes)
                    import re
                    if re.search(r'\d+\.?\d*', str(val)):
                        numeric_count += 1
                    # Check medical terminology
                    for term in KNOWN_MEDICAL_TERMS:
                        if term in text_lower:
                            medical_term_hits += 1
    
    # Empty content check (all fields are "" or "NR" or "Nil")
    meaningful_entries = [t for t in all_text if t not in ['', 'nr', 'nil', 'n/a', '-', 'normal']]
    if len(meaningful_entries) < 3:
        return False, "Insufficient medical data extracted. The page may be blank or unreadable."
    
    # Medical terminology check
    if medical_term_hits < 2:
        # Fallback: check for known nerves/muscles
        combined_text = ' '.join(all_text)
        found_nerves = [n for n in KNOWN_NERVES if n in combined_text]
        found_muscles = [m for m in KNOWN_MUSCLES if m in combined_text]
        
        if len(found_nerves) == 0 and len(found_muscles) == 0:
            return False, (
                "No recognized medical terminology found in extracted data. "
                "This does not appear to be a valid NCS/EMG report."
            )
    
    # Numerical data check (real reports have latencies/amplitudes/NCV)
    if numeric_count < 3:
        return False, "No measurable clinical values (latency, amplitude, NCV) found. Invalid or non-medical report."
    
    return True, "Valid medical report."


def extract_text_from_image(image_path):
    """
    Core OCR Engine function hooked directly with services.py endpoint layer.
    Now includes 4-layer validation pipeline:
      1. File validation (size, type, dimensions, blank-check)
      2. Visual sanity check (Gemini classifies if it's a medical report)
      3. OCR extraction (original logic preserved)
      4. Semantic validation (medical coherence check)
    """
    
    # ── LAYER 1: File Validation ──
    print(f"🛡️ [LAYER 1] Validating uploaded file...")
    valid, msg = validate_upload(image_path)
    if not valid:
        print(f"❌ [LAYER 1 BLOCKED]: {msg}")
        return {"error": "INVALID_UPLOAD", "message": msg}
    print(f"✅ [LAYER 1 PASSED]")
    
    # ── LAYER 2: Visual Sanity Check ──
    print(f"🛡️ [LAYER 2] Checking if image is a medical report...")
    is_medical, reason = is_medical_report_image(image_path)
    if not is_medical:
        print(f"❌ [LAYER 2 BLOCKED]: {reason}")
        return {"error": "INVALID_IMAGE_CONTENT", "message": reason}
    print(f"✅ [LAYER 2 PASSED]: {reason}")
    
    # Configure API
    genai.configure(api_key=API_KEY)
    
    # Load the target patient scanned image
    try:
        img = PIL.Image.open(image_path)
        print(f"📸 [OCR ENGINE]: Image loaded successfully: {os.path.basename(image_path)}")
    except Exception as e:
        print(f"❌ [OCR ENGINE ERROR]: Error loading image path: {e}")
        return {"error": "IMAGE_LOAD_ERROR", "message": str(e)}
    
    model_name = 'models/gemini-2.5-flash'
    
    # STRICTLY ALIGNED SCHEMA PROMPT: Synchronized with single_patient_predict_v2.py
    prompt = """
    Extract ALL medical data from this nerve conduction study report and return as VALID JSON only.

    Return EXACTLY this structure:
    {
      "Motor_Nerve_Conduction_Studies": [
        {
          "Nerve_Muscles": "string",
          "Stimulus_Site": "string", 
          "Latency_ms": "string",
          "Distance_cm": "string",
          "Amplitude_mv": "string",
          "NCV_ms": "string"
        }
      ],
      "Sensory_Nerve_Conduction_Studies": [
        {
          "Nerve": "string",
          "Recording_Site": "string",
          "Stimulation_Site": "string",
          "Latency_ms": "string", 
          "Distance_cm": "string",
          "Amplitude_uv": "string",
          "NCV_ms": "string"
        }
      ],
      "Electromyography": [
        {
          "Muscles": "string",
          "Fibs": "string",
          "Psw": "string",
          "Others": "string",
          "Amp": "string",
          "Duration": "string",
          "Polys": "string", 
          "Recruit": "string",
          "Interference": "string"
        }
      ]
    }

    Extract EVERY row from all tables precisely. Be highly accurate with special characters like '+', '++', '+++', or 'Nil' / 'NR'.
    For Electromyography, map the muscle name exactly under the key "Muscles", and fibrillation/positive sharp wave tokens under "Fibs" and "Psw".
    Return ONLY raw valid JSON text markup template, absolutely no markdown wrappers, no backticks, no markdown fence block text.
    """
    
    try:
        print(f"⚙️ [OCR ENGINE]: Invoking Gemini Vision Core API...")
        model = genai.GenerativeModel(model_name)
        
        # Enforcing native structural json generation parameters
        response = model.generate_content(
            [prompt, img], 
            generation_config={"response_mime_type": "application/json"}
        )
        
        response_text = response.text.strip()
        
        # Strict parsing verification layer (Safe Fallback for markdown fence blocks)
        if '```json' in response_text:
            json_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            json_text = response_text.split('```')[1].strip()
        else:
            json_text = response_text
            
        data = json.loads(json_text)
        print(f"🎯 [OCR ENGINE]: Raw data extracted successfully.")
        
        # ── LAYER 4: Semantic Validation ──
        print(f"🛡️ [LAYER 4] Validating extracted medical data...")
        is_valid, validation_msg = validate_extracted_data(data)
        if not is_valid:
            print(f"❌ [LAYER 4 BLOCKED]: {validation_msg}")
            return {"error": "INVALID_REPORT_DATA", "message": validation_msg}
        print(f"✅ [LAYER 4 PASSED]: {validation_msg}")
        
        print(f"🎯 [OCR ENGINE SUCCESS]: Clinical metrics data extraction complete.")
        return data
        
    except json.JSONDecodeError as e:
        print(f"❌ [OCR ENGINE CRASH]: Invalid JSON from API: {e}")
        return {"error": "JSON_PARSE_ERROR", "message": f"The AI returned unreadable data. Please try uploading a clearer image. ({str(e)})"}
    except Exception as e:
        print(f"❌ [OCR ENGINE CRASH]: API transaction extraction failure: {e}")
        return {"error": "OCR_FAILURE", "message": f"Failed to extract data from image: {str(e)}"}


def main():
    print("\\n" + "="*60)
    print("🚀 [TEST MODE]: Running Manual Independent OCR Diagnostics...")
    print("="*60)
    
    BASE_DIR = Path(__file__).resolve().parent
    UPLOADS_DIR = BASE_DIR / "uploads"
    OUTPUT_DIR = BASE_DIR / "extract_data"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Dynamic check: Pick the first available image in the uploads folder dynamically
    image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
    target_image = None
    
    if UPLOADS_DIR.exists():
        for file in UPLOADS_DIR.iterdir():
            if file.suffix.lower() in image_extensions:
                target_image = file
                break
                
    if not target_image or not target_image.exists():
        print(f"⚠️ No sample image found inside the uploads folder directory layout for diagnostics.")
        return
        
    print(f"🔄 Selected test target dynamically: {target_image.name}")
    result = extract_text_from_image(target_image)
    
    # Handle error responses in test mode
    if isinstance(result, dict) and "error" in result:
        print(f"❌ [TEST MODE] Extraction blocked: {result['message']}")
        return
        
    if result:
        json_filename = OUTPUT_DIR / f"result_{target_image.name}.json"
        with open(json_filename, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"💾 Independent validation file written successfully to: {json_filename}")

if __name__ == "__main__":
    main()

'''
# DEVELOPMENT ONLY — Remove in production
with open('/mnt/agents/output/ocr_updated.py', 'w', encoding='utf-8') as f:
    f.write(ocr_py_content)
print("✅ ocr_updated.py written successfully")
'''

'''
# DEVELOPMENT ONLY — Remove in production  
with open('/mnt/agents/output/app_updated.py', 'w', encoding='utf-8') as f:
    f.write(app_py_content)
print("✅ app_updated.py written successfully")
'''

