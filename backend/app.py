from flask import Flask, request, jsonify
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import torch
from flask import send_file
from gtts import gTTS
import uuid
import os
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from config import Config
from models import create_user, find_user_by_username, verify_password, get_user_by_id, delete_user_data
from translator import translate_to_english, translate_to_telugu, detect_language
app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
jwt = JWTManager(app)

# Load ML model
model = DistilBertForSequenceClassification.from_pretrained("./moral-classifier-final-new")
tokenizer = DistilBertTokenizerFast.from_pretrained("./moral-classifier-final-new")

id2label = {0:"Negative",1:"Neutral",2:"Positive"}

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/api/auth/register")
def register():
    """Register a new user"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    user = create_user(username, password)
    
    if not user:
        return jsonify({"error": "Username already exists"}), 409
    
    return jsonify({
        "message": "User registered successfully",
        "user_id": user['_id'],
        "username": user['username']
    }), 201

@app.post("/api/auth/login")
def login():
    """Login user and return JWT token"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    user = find_user_by_username(username)
    
    if not user or not verify_password(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=user['_id'])
    
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user['_id'],
            "username": user['username']
        }
    }), 200

@app.get("/api/auth/verify")
@jwt_required()
def verify_token():
    """Verify JWT token is valid"""
    current_user_id = get_jwt_identity()
    user = get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "valid": True,
        "user": {
            "id": user['_id'],
            "username": user['username']
        }
    }), 200

@app.get("/api/auth/me")
@jwt_required()
def get_current_user():
    """Get current user info"""
    current_user_id = get_jwt_identity()
    user = get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user['_id'],
        "username": user['username']
    }), 200
from translator import translate_to_english, translate_to_telugu, detect_language

@app.post("/api/translate/to-english")
def translate_text_to_english():
    """Translate Telugu to English"""
    data = request.json
    text = data.get('text', '')
    
    lang = detect_language(text)
    if lang == 'te':
        translated = translate_to_english(text)
        return jsonify({
            "original": text,
            "translated": translated,
            "detected_language": lang
        })
    else:
        return jsonify({
            "original": text,
            "translated": text,
            "detected_language": lang
        })

@app.post("/api/translate/to-telugu")
def translate_text_to_telugu():
    """Translate English to Telugu"""
    data = request.json
    text = data.get('text', '')
    
    translated = translate_to_telugu(text)
    return jsonify({
        "original": text,
        "translated": translated
    })

# ============ EXISTING ENDPOINTS ============

@app.post("/classify")
def classify():
    data = request.json
    sentence = data["text"]
    print(f"Classifying sentence: {sentence}")
    rel = "friend"
    text = f"Sentence: {sentence}\nRelationship: {rel}"

    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    label = id2label[outputs.logits.argmax(-1).item()]
    return jsonify({"label": label})
@app.post("/api/tts")
def text_to_speech():
    data = request.json
    text = data.get("text", "")
    lang = data.get("lang", "en")  # "te" for Telugu

    try:
        filename = f"tts_{uuid.uuid4()}.mp3"

        tts = gTTS(text=text, lang=lang)
        tts.save(filename)

        return send_file(filename, mimetype="audio/mpeg")

    except Exception as e:
        return {"error": str(e)}, 500
    
@app.route('/delete-user-data', methods=['DELETE'])
def delete_user_data_route():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    result = delete_user_data(user_id)

    return jsonify({
        "message": "User data deleted successfully",
        **result
    })

@app.get("/")
def ping():
    return {"status": "classification server running"}

if __name__ == "__main__":
    app.run(port=5000, debug=True)
