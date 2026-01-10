import json
from db import execute_query
from utils import verify_password, generate_access_token, generate_refresh_token,generate_response
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import os
load_dotenv()

def login_google(event):
    try:
        data = json.loads(event["body"])
        google_token = data["google_token"]
        idinfo = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            audience=os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        query = "SELECT id FROM users WHERE email=%s;"
        users = execute_query(query, (email,))
        if not users:
            
            query = "INSERT INTO users (email,password_hash) VALUES (%s,%s) RETURNING id;"
            ids = execute_query(query, (email,google_token[:100]),commit=True)
            id=ids[0]['id']
        else:
            id = users[0]['id']

        access_token = generate_access_token(id,email)
        refresh_token = generate_refresh_token(id,email)
        return generate_response(200,{
                "access_token": access_token,
                "refresh_token": refresh_token
            })
        
    except Exception as e:
    
        return generate_response(500,{"msg": str(e)})
    except ValueError as e:
        # Token verification failed
        return generate_response(500,{"msg": "Invalid Google token"})
    except Exception as e:
        return generate_response(500,{"msg": str(e)})