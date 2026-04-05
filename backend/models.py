from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId
from config import Config

bcrypt = Bcrypt()
client = MongoClient(Config.MONGO_URI)
db = client["moral_ai"]
# ✅ Collections
users_collection = db["users"]

def create_user(username, password):
    """Create a new user with hashed password"""
    if users_collection.find_one({"username": username}):
        return None  # User already exists
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = {
        "username": username,
        "password": hashed_password
    }
    result = users_collection.insert_one(user)
    user['_id'] = str(result.inserted_id)
    return user

def find_user_by_username(username):
    """Find user by username"""
    user = users_collection.find_one({"username": username})
    if user:
        user['_id'] = str(user['_id'])
    return user

def verify_password(stored_password, provided_password):
    """Verify password against hash"""
    return bcrypt.check_password_hash(stored_password, provided_password)

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return user
    except:
        return None
    return None
