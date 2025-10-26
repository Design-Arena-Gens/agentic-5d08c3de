from flask import Flask, render_template, request, jsonify, send_from_directory
from google import genai
from google.genai import types
import time
import os

# Expect API key via environment var for safety
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')

app = Flask(__name__)

# Initialize Gemini client
try:
    if not GEMINI_API_KEY:
        raise ValueError("Missing GEMINI_API_KEY/GOOGLE_API_KEY env var")
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("✅ Gemini client initialized successfully!")
except Exception as e:
    print(f"❌ Error initializing Gemini client: {e}")
    client = None

def generate_response(prompt, temperature=0.5):
    try:
        if client is None:
            return {"success": False, "error": "Gemini client not initialized"}

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature=temperature,
            response_mime_type="text/plain"
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=generate_content_config
        )
        return {"success": True, "response": response.text}

    except Exception as e:
        return {"success": False, "error": f"API Error: {str(e)}"}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data received"})

        prompt = data.get('prompt', '').strip()
        temperature = float(data.get('temperature', 0.5))

        if not prompt:
            return jsonify({"success": False, "error": "No prompt provided"})

        print(f"📨 Received request - Prompt: {prompt[:50]}..., Temperature: {temperature}")
        result = generate_response(prompt, temperature)
        print(f"📤 Sending response - Success: {result['success']}")

        return jsonify(result)

    except Exception as e:
        return jsonify({"success": False, "error": f"Server error: {str(e)}"})

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("📋 Available routes:")
    print("   http://127.0.0.1:5000/ - Main page")
    print("   http://127.0.0.1:5000/generate - API endpoint")
    app.run(debug=True, port=5000)
