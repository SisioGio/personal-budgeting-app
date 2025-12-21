import hashlib
import hmac
import jwt
import os
import json
from dotenv import load_dotenv
from datetime import datetime, date
from decimal import Decimal
load_dotenv()
SECRET_KEY = os.environ.get("JWT_SECRET")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def generate_access_token(user_id,email):
    return jwt.encode({"id": user_id,"email":email}, SECRET_KEY, algorithm="HS256")

def generate_refresh_token(user_id,email):
    return jwt.encode({"id": user_id, "email":email,"type": "refresh"}, SECRET_KEY, algorithm="HS256")

def send_email(to, subject, body):
    # placeholder for SES or other service
    print(f"Sending email to {to}: {subject}")
    
def serialize(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


   
def generate_response(status_code, body,headers=None):
    default_headers = {
        "Access-Control-Allow-Origin": "*",  # Allow all origins
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
    }
    if headers:
        default_headers.update(headers)
        
    return {
        "statusCode": status_code,
        "headers":default_headers,
        "body": json.dumps(body,default=serialize)
    }