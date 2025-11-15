import json
import os
import boto3
from botocore.exceptions import ClientError
import bcrypt
import jwt
from utils.utils import *
from datetime import datetime, timedelta,UTC
from dotenv import load_dotenv
from static.emails import PASSWORD_RESET_TEMPLATE,ACCOUNT_CONFIRMATION_TEMPLATE
load_dotenv()
ses_client = boto3.client('ses')
dynamodb = boto3.resource('dynamodb')






TABLE_USERS = os.getenv("TABLE_USERS",'restaurant-crm-RestaurantsTable-XHVLN058UT37')

table_users = dynamodb.Table(TABLE_USERS)
ses_client = boto3.client('ses')
dynamodb = boto3.resource('dynamodb')



def sum(a,b):
    return a +b

def lambda_handler(event, context):
    # Determine the HTTP method
    method = event.get("httpMethod")

    if method == 'POST' and event['path'] == '/auth/register':
        return register_user(event)
    if method == 'POST' and event['path'] == '/auth/login':
        return login_user(event)
    if method == 'POST' and event['path'] == '/auth/confirm':
        return verify_account(event)
    if method == 'GET' and event['path'] == '/auth/confirm':
        return send_confirmation_email(event)
    if method == 'POST' and event['path'] == '/auth/refresh':
        return refresh_access_token(event)
    if method == 'POST' and event['path'] == '/auth/request-password-reset':
        return request_password_reset(event)
    if method == 'POST' and event['path'] == '/auth/reset-password':
        return reset_password(event)
    else:
        return generate_response(400,{"msg":'Invalid route or method.','event':event})

def request_password_reset(event):
    try:
        # Get the email from the request body
        body = json.loads(event.get('body'))
        email = body.get('email')
        print("Generating email for password reset")
        if not email:
            return generate_response(400, {'message': 'Email is required'})
        # Generate a password reset token (JWT)

        payload = {
            'email': email,
            'mode':'password-reset',
            'exp':datetime.now(UTC) + timedelta(seconds=ACCESS_TOKEN_EXPIRATION)
        }
        reset_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        reset_url = f"{FRONTEND_BASE_URL}/reset-password?token={reset_token}"

        subject = "🔑 Reset Your Password and Regain Access to Your Account"
        body = PASSWORD_RESET_TEMPLATE.replace("{{reset_url}}", reset_url)
        send_email(email, subject, body)
        return generate_response(200, {'message': 'Password reset email sent successfully'})
        
    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        

def reset_password(event):
    try:
        body = json.loads(event.get('body'))
        token = body.get('token')
        new_password = body.get('newPassword')
        # Validate token (decode JWT token)
        payload = verify_jwt(token,SECRET_KEY)
        if 'error' in payload:
            return generate_response(400, {'message': 'Invalid or expired token'})
        # Extract email from the token payload
        email = payload['email']
        # Update password in the database
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        table_users.update_item(
            Key={"email": email},
            UpdateExpression="SET password = :val",
            ExpressionAttributeValues={":val": hashed_password.decode("utf-8")},
            ReturnValues="UPDATED_NEW"
        )
        return generate_response(200, {'message': 'Password reset successfully'})
        
    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        

def verify_account(event):
    try:
        body = json.loads(event.get('body', '{}'))
        token = body.get('token', '')
        # Verify JWT

        payload = verify_jwt(token)
        
        if "error" in payload:
            return generate_response(400, {'message': 'Invalid or expired token'})
            
        email = payload["email"]
        # Update DynamoDB to set 'verified' to True
        response = table_users.update_item(
            Key={"email": email},
            UpdateExpression="SET verified = :val",
            ExpressionAttributeValues={":val": True},
            ReturnValues="UPDATED_NEW"
        )
        return generate_response(200, {'message': 'Account verified successfully'})
        
    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        

def send_email(recipient, subject, body):
    try:
        # """Send email via SES."""
        response = ses_client.send_email(
            Source= os.environ.get('SES_SENDER_EMAIL','notification@agents4people.com'),
            Destination={'ToAddresses': [recipient]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Html': {'Data': body}}
            }
        )
        return response
    except Exception as e:
        print(e)
        return False
    

def generate_url(email: str, mode: str) -> str:
    """Generate URL with JWT for frontend."""
    access_payload = {
            'email': email,
            'mode':mode,
            'exp':datetime.now(UTC) + timedelta(seconds=ACCESS_TOKEN_EXPIRATION)
        }
    token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')
    path = "confirm" if mode == "confirm" else "reset"
    url = f"{FRONTEND_BASE_URL}/{path}?token={token}"
    return url

def send_confirmation_email(event):
    try:
        email = event['queryStringParameters']['email']
        # Check if user exists
        user = get_user_by_email(email)
        if not user:
            return generate_response(404, {'message': 'User not found'})
        confirmation_url = generate_url(email, "confirm")
        subject = "You're Almost There! Confirm Your Registration for Agents4People"
        body = ACCOUNT_CONFIRMATION_TEMPLATE.replace("{{confirmation_url}}", confirmation_url)
        send_email(email, subject, body)
        print(confirmation_url)
        return generate_response(200, {'message': 'Confirmation email sent successfully'})
        
    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        

def login_user(event):
    try:
        body = json.loads(event.get('body','{}'))
        password = body.get('password','')
        email = body.get('email','')
        # Check if user exists
        user = get_user_by_email(email)
        if not user:
            return generate_response(404, {'message': 'User not found'})
            
        password_is_correct = bcrypt.checkpw(password.encode('utf-8'),user['password'].encode('utf-8'))
        if not password_is_correct:
            print(password_is_correct)
            return generate_response(403, {'message': 'Invalid password'})
        # Generate JWT access token
        payload = {
            'id':user.get('restaurant_id'),
            'email': user.get('email'),
            'name':user.get('name','N/A'),
            'verified': user.get('verified',False),
            'exp': datetime.now(UTC) + timedelta(seconds=ACCESS_TOKEN_EXPIRATION)
        }
        print(payload)
        token = jwt.encode(payload,SECRET_KEY, algorithm='HS256')
        # Generate refresh token
        refresh_payload = {
            'email': email,
            'exp': datetime.now(UTC) + timedelta(days=30)
        }

        refresh_token = jwt.encode(refresh_payload, REFRESH_SECRET_KEY, algorithm='HS256')
        table_users.update_item(
                Key={'email': email},
                UpdateExpression='SET refresh_token = :val1',
                ExpressionAttributeValues={
                    ':val1': refresh_token
                }
            )
        return generate_response(200, {'message': 'Login successful', 'user': {'email': email}, 'access_token': token, 'refreshToken': refresh_token})
        
    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        


def get_user_by_email(email):
    res = table_users.get_item(Key={'email':email})
    if 'Item' in res:
        print(f"Found user {res}")
        return res['Item']
    else:
        return None
    

def get_user(email):
    res = table_users.get_item(Key={'email':email})
    if 'Item' in res:
        print(res)
        return res['Item']
    else:
        return None
    
    


def register_user(event):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        if not all([ password, email,name]):
            return generate_response(400, {'message': 'restaurant_id, password, and email are required'})
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        confirmation_url = generate_url(email, "confirm")
        subject = f"You have been added to {APP_NAME}! Confirm Your Registration"
        body = ACCOUNT_CONFIRMATION_TEMPLATE.replace("{{confirmation_url}}", confirmation_url)
        send_email(email, subject, body)
        # Store user details in DynamoDB
        user ={
                'email':email,
                'name':name,
                'password': hashed_password.decode('utf-8'),
                'verified':False
            } 
        table_users.put_item(
            Item=user
        )
        return generate_response(200, {'message': 'Restaurant registered successfully',"debug":user})
        

    except Exception as e:
        return generate_response(500, {'message': f'Error: {str(e)}'}) 


def refresh_access_token(event):
    try:
        body = json.loads(event['body'])
        refresh_token = body['refreshToken']
        
        # Decode and verify the refresh token
        try:
            payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=['HS256'])
            email = payload.get('email')
        except jwt.ExpiredSignatureError:
            return generate_response(401, {'message': 'Refresh token has expired'})
            
        except jwt.InvalidTokenError:
            return generate_response(401, {'message': 'Invalid refresh token'})
            
        # Retrieve user from DynamoDB
        response = table_users.get_item(
            Key={'email': email}
        )
        
        if 'Item' not in response or response['Item'].get('refresh_token') != refresh_token:
            return generate_response(401, {'message': 'Invalid refresh token'})
            
        # Generate new access token
        access_payload = {
            'email': email,
            'exp':datetime.now(UTC) + timedelta(seconds=ACCESS_TOKEN_EXPIRATION)
        }
        access_token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')
        
        # Generate new refresh token
        new_refresh_payload = {
            'email': email,
            'exp': datetime.now(UTC) + timedelta(days=30)
        }
        new_refresh_token =jwt.encode(new_refresh_payload, REFRESH_SECRET_KEY, algorithm='HS256')
        
        # Update refresh token in DynamoDB
        table_users.update_item(
            Key={'email': email},
            UpdateExpression='SET refresh_token = :val1',
            ExpressionAttributeValues={
                ':val1': new_refresh_token
            }
        )
        return generate_response(200, {'message': 'Access token refreshed', 'access_token': access_token, 'refreshToken': new_refresh_token})
        
    except ClientError as e:
        return generate_response(500, {'message': f'Error: {str(e)}'})
        


