


import boto3
import json
import jwt
import bcrypt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta,UTC
load_dotenv()
JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME")
REFRESH_SECRET_NAME= os.environ.get('REFRESH_SECRET_NAME')
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "https://localhost:3000/")
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION', int(3600)))
ACCESS_TOKEN_EXPIRATION = int(os.environ.get('ACCESS_TOKEN_EXPIRATION',int(60*60*24*14)))
APP_NAME=os.getenv("APP_NAME")

def get_secret(secret_name: str, region_name: str = "eu-central-1"):
    """
    Fetch a secret's value from AWS Secrets Manager by name.
    Returns the secret as a dict if it's JSON, otherwise a string.
    """

    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
    except client.exceptions.ResourceNotFoundException:
        raise Exception(f"Secret '{secret_name}' not found")
    except Exception as e:
        raise Exception(f"Error retrieving secret: {e}")

    # The secret is in the "SecretString" key
    secret = response["SecretString"]

    # Try to parse JSON secrets automatically
    try:
        return json.loads(secret)
    except json.JSONDecodeError:
        return secret

SECRET_KEY= get_secret(JWT_SECRET_NAME)
REFRESH_SECRET_KEY=get_secret(REFRESH_SECRET_NAME)


def verify_jwt(token: str) -> dict:
    """Verify JWT and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}




def generate_response(statusCode,message):
    return {
        'statusCode': statusCode,
        'headers': {
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                        },
        'body': json.dumps(message)
    }