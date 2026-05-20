from flask import Flask, request, jsonify
from flask_cors import CORS

from supabase import create_client, Client
from openai import OpenAI
from config import SUPABASE_URL, SUPABASE_KEY
import os
import tempfile
from datetime import datetime
from dotenv import load_dotenv

import joblib
import numpy as np

load_dotenv()

app = Flask(__name__)

# Allow frontend (Live Server)
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5500", "http://127.0.0.1:5501"]}})

# ---------------- LOAD ASL MODEL ----------------
model = joblib.load("Sign_model/asl_model.pkl")
print("ASL model loaded successfully ✅")

# ---------------- SUPABASE ----------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabase client initialized ✅")

# ---------------- OPENAI ----------------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if not os.getenv("OPENAI_API_KEY"):
    print("⚠ WARNING: OPENAI_API_KEY not set!")

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "SignBridge Backend Running 🚀"

# ---------------- IN-MEMORY HISTORY ----------------
user_histories = {}

# ---------------- TOKEN VERIFICATION ----------------
def get_user_from_token(auth_header):
    if not auth_header:
        return None

    try:
        token = auth_header.replace("Bearer ", "")
        response = supabase.auth.get_user(token)
        return response.user.id
    except Exception:
        return None

# ---------------- SPEECH TO TEXT ----------------
@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    token = request.headers.get("Authorization")
    user_id = get_user_from_token(token)

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if "audio" not in request.files:
        return jsonify({"error": "No audio file received"}), 400

    audio_file = request.files["audio"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        audio_file.save(temp.name)
        temp_path = temp.name

    try:
        text = "[Speech recognition temporarily disabled]"
    except Exception as e:
        text = f"Error processing audio: {str(e)}"
    finally:
        os.remove(temp_path)

    item = {
        "type": "voice-to-sign",
        "content": text,
        "timestamp": datetime.utcnow().isoformat()
    }

    user_histories.setdefault(user_id, []).insert(0, item)

    return jsonify({"text": text})

# ---------------- HISTORY ----------------
@app.route("/history", methods=["GET", "POST", "DELETE"])
def history():
    token = request.headers.get("Authorization")
    user_id = get_user_from_token(token)

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if request.method == "GET":
        return jsonify({"history": user_histories.get(user_id, [])})

    if request.method == "POST":
        data = request.get_json()
        type_ = data.get("type")
        content = data.get("content")

        if not type_ or not content:
            return jsonify({"error": "Type and content required"}), 400

        item = {
            "type": type_,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }

        user_histories.setdefault(user_id, []).insert(0, item)

        return jsonify({"success": True, "item": item})

    if request.method == "DELETE":
        user_histories[user_id] = []
        return jsonify({"success": True})

# ---------------- AI CHAT ----------------
@app.route("/ai-chat", methods=["POST"])
def ai_chat():
    data = request.get_json()
    user_message = data.get("message", "")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert sign language teacher and assistant. Answer all questions knowledgeably about sign language (ASL/BSL), learning tips, translations, history, best practices, deaf culture, and general questions. Be helpful, friendly, concise. Use emojis where appropriate. If not sign-related, still answer helpfully."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=300,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()
    except Exception as e:
        if "insufficient_quota" in str(e).lower() or "429" in str(e):
            reply = "🤖 AI quota exceeded. Using smart local assistant. Ask about sign language!\\n\\n" + get_local_reply(user_message)
        else:
            reply = f"🤖 Service temp unavailable: {str(e)[:100]}... Ask about sign language!"
    

        return jsonify({"reply": reply})

def get_local_reply(message):
    msg = message.lower()
    if "hello" in msg or "hi" in msg:
        return "Hello! 👋 How can I help with sign language?"
    elif "thank" in msg or "thanks" in msg:
        return "You're welcome! 😊 Keep signing!"
    elif "how" in msg and "are" in msg:
        return "I'm your sign language helper! Ready to assist."
    elif "asl" in msg or "american sign language" in msg:
        return "ASL is visual language using hands, face, body. Developed in 19th century USA."
    elif "bsl" in msg or "british" in msg:
        return "BSL is British Sign Language, two-handed alphabet, rich grammar."
    elif "learn" in msg:
        return "Start with alphabet, practice daily, mirror signing, join deaf community! 📚"
    elif "history" in msg:
        return "Sign language history: Old French Sign Language → ASL by Thomas Gallaudet."
    else:
        return "Great question! Tell me more about sign language topic (alphabet, numbers, greetings, etc.) 🖐️"


# ---------------- ASL PREDICTION ----------------
@app.route("/predict_sign", methods=["POST"])
def predict_sign():
    try:
        data = request.json.get("landmarks")

        print("Received landmarks:", data)
        print("Length:", len(data) if data else "None")

        if not data or len(data) != 63:
            return jsonify({"error": "Invalid landmarks"}), 400

        landmarks = np.array(data)

        # 🔥 NORMALIZATION
        wrist_x, wrist_y, wrist_z = landmarks[0], landmarks[1], landmarks[2]

        for i in range(0, 63, 3):
            landmarks[i] -= wrist_x
            landmarks[i+1] -= wrist_y
            landmarks[i+2] -= wrist_z

        landmarks = landmarks.reshape(1, -1)

        prediction = model.predict(landmarks)[0]

        return jsonify({"letter": prediction})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)