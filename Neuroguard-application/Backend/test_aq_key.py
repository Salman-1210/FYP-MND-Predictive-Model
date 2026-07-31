import google.generativeai as genai

API_KEY = "AQ.Ab8RN6LkSkqbgYpyr5t9UgsEuXDSCDFfw86dMXlHBtWKbvCWng"

try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Say hello in one word")
    print("✅ SUCCESS:", response.text)
except Exception as e:
    print("❌ FAILED:", e)

