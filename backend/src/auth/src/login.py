import json
from db import execute_query
from utils import verify_password, generate_access_token, generate_refresh_token,generate_response

def login_user(event):
    try:
        data = json.loads(event["body"])
        email = data["email"]
        password = data["password"]

        query = "SELECT * FROM users WHERE email=%s;"
        users = execute_query(query, (email,))
        if not users:
            return generate_response(401,{"msg": "Invalid credentials"})


        user = users[0]
        if not verify_password(password, user["password_hash"]):

            return generate_response(401,{"msg": "Invalid credentials"})
        access_token = generate_access_token(user["id"],user['email'])
        refresh_token = generate_refresh_token(user["id"],user['email'])
        return generate_response(200,{
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            access_token=access_token,refresh_token=refresh_token)
        
    except Exception as e:
    
        return generate_response(500,{"msg": str(e)})