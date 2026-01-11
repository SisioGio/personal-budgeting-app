import json
from db import execute_query
from utils import verify_password, generate_access_token, generate_refresh_token,generate_response,get_secret,decode_token,get_cookie
import jwt
def refresh_access_token(event):
    try:

        refresh_token = get_cookie(event, "refresh_token")
        decoded = decode_token(refresh_token,'refresh')
        principal_id = decoded['id']
        email = decoded['email']
        access_token = generate_access_token(principal_id,email)
        refresh_token = generate_refresh_token(principal_id,email)
        return generate_response(200,{
                'msg':'new_token',
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            access_token=access_token,refresh_token=refresh_token,event=event)
        
    except jwt.ExpiredSignatureError:
        return generate_response(401, {"error": "Refresh token expired"},event=event)

    except jwt.InvalidTokenError:
        return generate_response(401, {"error": "Invalid refresh token"},event=event)