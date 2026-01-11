from handler import lambda_handler

import json
import random
from utils import generate_refresh_token
def create_event(method,path,body):
    event = {
        'methodArn':"method arn",
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body)
    }
    return event


def test_register(email,password):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/register',body)
    response = lambda_handler(event,None)
    print(response)
    return response
    

def test_login(email,password):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/login',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token

def test_reset_refresh_token(email,password):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/login',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token


def test_login_google(token):
    body = {
        'google_token':token
    }
    event = create_event('POST','/auth/google',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token


def test_refresh_token(token):
    body = {
        'refreshToken':token
    }
    event = create_event('POST','/auth/refresh',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token


if __name__ == "__main__":
    r_digit = random.randint(1,10000)
    email = "testuser2083@example.com"
    password = "password"
    
    # test_register(email,password)
    google_token='eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiYTZlZmVmNWUxNzIxNDk5NzFhMmQzYWJiNWYzMzJlMGY3ODcxNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4MzgxNDc3NzAxNi1jNzJtODhlbWM2YW85aGI4djd0dDlvb2EzMWQ2bDdlZy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjgzODE0Nzc3MDE2LWM3Mm04OGVtYzZhbzloYjh2N3R0OW9vYTMxZDZsN2VnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAyOTgyNjAyNDYwNDM2NDUxNDQ1IiwiZW1haWwiOiJhbGVzc2lvZ2lvdmFubmluaTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3Njc5ODI5OTYsIm5hbWUiOiJBbGVzc2lvIEdpb3Zhbm5pbmkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmxRc0tILXM2a19UV0FEcUNyODhjRE42LWJPczNKSGN5WVVxSnJSYlBITWJ0LW1RPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFsZXNzaW8iLCJmYW1pbHlfbmFtZSI6Ikdpb3Zhbm5pbmkiLCJpYXQiOjE3Njc5ODMyOTYsImV4cCI6MTc2Nzk4Njg5NiwianRpIjoiZGMyYWJlMDQxMTY2N2YwM2Y4NGVhZjk1YTRkOTE2NjlhN2Y5Njg1YiJ9.M6kcFEIUn4igMJxx18laWJj14iHFr-tT2q-2iKLsgpHFbMLQC0Resf-Pg6yDQnWX4GYKLPlHzLw9Wom_5ZQCJD6l74E5A9Cxaa7eHvzKbv-0PNry6OeLE1gjXT4d8zqVAw3V6OnqV2lmVpZjZd9okdNB27e6mPXa--nr2wl3hmFLBftDJBkwpGv8PfnZJi3AtDzguaiQg9xHkG4CA2mdWUbwsl2JfV-OaZh8747bPvw8GeseCVil7_1HJ3Qu8WM7yfLgWv73kHyHU-poDgKV5QJOy7-sJ35Jfnih2fZ6z99WYKV0iAQiUZptTz3xMXOyHoU8t3_X6yNWRmsAEogk-Q'
    refresh_token = generate_refresh_token(103,'alessiogiovannini23@gmail.com')
    access_token,refresh_token = test_refresh_token(refresh_token)
    