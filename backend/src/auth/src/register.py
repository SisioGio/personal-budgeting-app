import json
from db import execute_query
from utils import hash_password, send_email,generate_response

def register_user(event):
    try:
        data = json.loads(event["body"])
        email = data["email"]
        password = data["password"]

        hashed_password = hash_password(password)

        query = "INSERT INTO users (email, password_hash,initial_balance) VALUES (%s, %s,0) RETURNING id;"
        result = execute_query(query, (email, hashed_password),commit=True)

        # Send confirmation email (dummy example)
        send_email(email, "Welcome!", "Please confirm your account.")
        return generate_response(201,{"id": result[0]["id"], "msg": "User registered"})

    except Exception as e:
        return generate_response(500,{"msg": str(e)})

