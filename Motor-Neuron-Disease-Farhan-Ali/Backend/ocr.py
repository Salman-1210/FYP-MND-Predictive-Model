import google.generativeai as genai
import PIL.Image
import json
import os
import time

def extract_medical_data_with_gemini(image_path):
    API_KEY = "AIzaSyCRfpiH8WjwtmTrEBqewPRe95HNDYndorw"
    genai.configure(api_key=API_KEY)
    
    # Load the image
    try:
        img = PIL.Image.open(image_path)
        print(f" Image loaded: {image_path}")
    except Exception as e:
        print(f" Error loading image: {e}")
        return None
    
    # Use the latest available models that support vision
    models_to_try = [
        'models/gemini-2.5-flash',
    ]
    print(f" Processing: {os.path.basename(image_path)}")
    
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

    Extract EVERY row from all tables. Be precise with numbers and labels. Return ONLY JSON, no other text.
    """
    
    for model_name in models_to_try:
        try:
            print(f" Trying model to extract data: ")
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content([prompt, img])
            
            print(" Response received!")
            
            # Clean the response to get pure JSON
            response_text = response.text.strip()
            print("Raw response preview:", response_text[:200] + "..." if len(response_text) > 200 else response_text)
            
            if '```json' in response_text:
                json_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                json_text = response_text.split('```')[1].strip()
            else:
                json_text = response_text
                
            # Parse JSON
            data = json.loads(json_text)
            print(f" Data Extracted Successfully ")
            return data
            
        except Exception as e:
            print(f" Failed with : {e}")
            continue
    
    return None

def get_all_images_from_current_folder():
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
    current_folder = r"C:\Users\dell\OneDrive\Desktop\MND_frontend\Backend"
    
    image_files = []
    for file in os.listdir(current_folder):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            image_files.append(os.path.join(current_folder, file))
    
    return image_files


def main():
    print("[INFO] Medical Report Extraction Started")
    print("=" * 50)
    
    # Get all images from current folder
    image_files = get_all_images_from_current_folder()
    
    if not image_files:
        print("[ERROR] No image files found in current folder")
        print("[HINT] Supported formats: .jpg, .jpeg, .png, .bmp, .tiff, .webp")
        return
    
    print(f"[FILES] Found {len(image_files)} images in folder:")
    for img in image_files:
        print(f"   - {img}")
    
    all_results = {}
    
    # Process each image
    for i, image_file in enumerate(image_files, 1):
        print(f"\n{'='*60}")
        print(f"[PROCESS] Processing image {i}/{len(image_files)}: {image_file}")
        print(f"{'='*60}")
        
        if i > 1:
            print("[WAIT] Waiting 15 seconds to avoid rate limits...")
            time.sleep(15)
        
        result = extract_medical_data_with_gemini(image_file)
        
        if result:
            all_results[image_file] = result
            
            base_name = os.path.splitext(os.path.basename(image_file))[0]
            json_filename = os.path.join(
                r"C:\Users\dell\OneDrive\Desktop\MND_frontend\Backend",
                f"result_{base_name}.json"
            )


            with open(json_filename, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"[SAVE] Individual result saved to: {json_filename}")
            
            print(f"\n[SUMMARY] Extraction summary for {image_file}:")
            print(f"   - Motor Nerves: {len(result.get('Motor_Nerve_Conduction_Studies', []))}")
            print(f"   - Sensory Nerves: {len(result.get('Sensory_Nerve_Conduction_Studies', []))}")
            print(f"   - EMG Entries: {len(result.get('Electromyography', []))}")
        else:
            print(f"[ERROR] Failed to extract data from: {image_file}")
            all_results[image_file] = {"error": "Extraction failed"}
    
    with open("all_extracted_data.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n[DONE] All done! Processed {len(image_files)} images")
    successful = sum(1 for result in all_results.values() if "error" not in result)
    print(f"[SUMMARY] Successfully extracted: {successful}/{len(image_files)} images")

if __name__ == "__main__":
    main()
