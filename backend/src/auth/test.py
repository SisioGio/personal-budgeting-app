from handler import lambda_handler

import json
import random

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

if __name__ == "__main__":
    r_digit = random.randint(1,10000)
    email = "testuser2083@example.com"
    password = "password"
    
    # test_register(email,password)
    google_token='eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiYTZlZmVmNWUxNzIxNDk5NzFhMmQzYWJiNWYzMzJlMGY3ODcxNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4MzgxNDc3NzAxNi1jNzJtODhlbWM2YW85aGI4djd0dDlvb2EzMWQ2bDdlZy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjgzODE0Nzc3MDE2LWM3Mm04OGVtYzZhbzloYjh2N3R0OW9vYTMxZDZsN2VnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAyOTgyNjAyNDYwNDM2NDUxNDQ1IiwiZW1haWwiOiJhbGVzc2lvZ2lvdmFubmluaTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3Njc5Nzg3MDQsIm5hbWUiOiJBbGVzc2lvIEdpb3Zhbm5pbmkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmxRc0tILXM2a19UV0FEcUNyODhjRE42LWJPczNKSGN5WVVxSnJSYlBITWJ0LW1RPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFsZXNzaW8iLCJmYW1pbHlfbmFtZSI6Ikdpb3Zhbm5pbmkiLCJpYXQiOjE3Njc5NzkwMDQsImV4cCI6MTc2Nzk4MjYwNCwianRpIjoiODVhZDk2MTRjNmYyM2VmYTU4Yzg1MWNhZmZiODBlMmQzMDYyYjcwNSJ9.cRLCNzx0o2VTpDXbHK68pyU-HOtXanQn62F_Hor8ohDJkc_TQysKMRAuM6DfUbxvi7D-BeNBUQlcl0cEPLPWuDeE8T6JBgg3RIped6_NI1IYtqjPS1HufuVKytbmpvdGrtedpMRFXz-3cTqCwKGYAfFEF57ZtykZfhSy0JViwMDz_q8bv7C5LAObAFirXNzjlTAfUJs613TlR_DRUXICzhKs3c49UGbIpFvpIu9gYzvXrNFM3WMTd3uNkcAKUYrxXulxl-o3gu2YTlciRvP7CXrUwNqgBgcvNRCKnykHxl867VxkEXlCbhg9mSBzHj0fFaCjxgXSwWForQwOUddcZA'
    access_token,refresh_token = test_login_google(google_token)
    