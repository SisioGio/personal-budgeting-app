import hashlib
import hmac
import jwt
import os
import boto3
from botocore.exceptions import ClientError
import json
from dotenv import load_dotenv
from datetime import datetime, date
from decimal import Decimal
load_dotenv()


def get_secret(secret_name, region_name="eu-central-1"):
    """
    Retrieve a secret from AWS Secrets Manager
    """
    # Create a Secrets Manager client
    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        raise e
    else:
        # Secret is stored either as string or binary
        if 'SecretString' in response:
            return json.loads(response['SecretString'])
        else:
            import base64
            return json.loads(base64.b64decode(response['SecretBinary']))
JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME")
JWT_REFRESH_NAME= os.environ.get("JWT_REFRESH_SECRET_NAME")




def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def generate_access_token(user_id,email):
    JWT_SECRET = get_secret(JWT_SECRET_NAME)
    return jwt.encode({"id": user_id,"email":email}, JWT_SECRET, algorithm="HS256")

def generate_refresh_token(user_id,email):
    JWT_REFRESH_SECRET = get_secret(JWT_REFRESH_NAME)
    return jwt.encode({"id": user_id, "email":email,"type": "refresh"}, JWT_REFRESH_SECRET, algorithm="HS256")

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