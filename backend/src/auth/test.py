from handler import lambda_handler

import json
import random
from utils import generate_refresh_token
def create_event(method,path,body,cookies=None):
    event = {
        'headers':{'Cookie':cookies,'Origin':"http://localhost:3000"},
        'methodArn':"method arn",
        "cookies":cookies,
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

def test_reset_refresh_token(email,passwordc,cookies):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/login',body,cookies=cookies)
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


def test_refresh_token(event):


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
    cookies = f"refresh_token={refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/refresh"
    
    event= {'resource': '/auth/{proxy+}', 'path': '/auth/google', 'httpMethod': 'POST', 'headers': {'accept': 'application/json, text/plain, */*', 'accept-encoding': 'gzip, deflate, br, zstd', 'accept-language': 'en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7,pl;q=0.6', 'content-type': 'application/json', 'Host': '5uovigzzsf.execute-api.eu-central-1.amazonaws.com', 'origin': 'http://localhost:3000', 'priority': 'u=1, i', 'referer': 'http://localhost:3000/', 'sec-ch-ua': '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"', 'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"Windows"', 'sec-fetch-dest': 'empty', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'cross-site', 'sec-fetch-storage-access': 'active', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'X-Amzn-Trace-Id': 'Root=1-69654d9b-7fd2a4fc704012f90febca15', 'X-Forwarded-For': '91.35.18.240', 'X-Forwarded-Port': '443', 'X-Forwarded-Proto': 'https'}, 'multiValueHeaders': {'accept': ['application/json, text/plain, */*'], 'accept-encoding': ['gzip, deflate, br, zstd'], 'accept-language': ['en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7,pl;q=0.6'], 'content-type': ['application/json'], 'Host': ['5uovigzzsf.execute-api.eu-central-1.amazonaws.com'], 'origin': ['http://localhost:3000'], 'priority': ['u=1, i'], 'referer': ['http://localhost:3000/'], 'sec-ch-ua': ['"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"'], 'sec-ch-ua-mobile': ['?0'], 'sec-ch-ua-platform': ['"Windows"'], 'sec-fetch-dest': ['empty'], 'sec-fetch-mode': ['cors'], 'sec-fetch-site': ['cross-site'], 'sec-fetch-storage-access': ['active'], 'User-Agent': ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'], 'X-Amzn-Trace-Id': ['Root=1-69654d9b-7fd2a4fc704012f90febca15'], 'X-Forwarded-For': ['91.35.18.240'], 'X-Forwarded-Port': ['443'], 'X-Forwarded-Proto': ['https']}, 'queryStringParameters': None, 'multiValueQueryStringParameters': None, 'pathParameters': {'proxy': 'google'}, 'stageVariables': None, 'requestContext': {'resourceId': 'z9dlfv', 'resourcePath': '/auth/{proxy+}', 'httpMethod': 'POST', 'extendedRequestId': 'XFkQZFLKFiAEHdQ=', 'requestTime': '12/Jan/2026:19:38:03 +0000', 'path': '/dev/auth/google', 'accountId': '495348364820', 'protocol': 'HTTP/1.1', 'stage': 'dev', 'domainPrefix': '5uovigzzsf', 'requestTimeEpoch': 1768246683706, 'requestId': '8ef4a168-9595-4b2d-bc91-ddbfc4f949e4', 'identity': {'cognitoIdentityPoolId': None, 'accountId': None, 'cognitoIdentityId': None, 'caller': None, 'sourceIp': '91.35.18.240', 'principalOrgId': None, 'accessKey': None, 'cognitoAuthenticationType': None, 'cognitoAuthenticationProvider': None, 'userArn': None, 'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'user': None}, 'domainName': '5uovigzzsf.execute-api.eu-central-1.amazonaws.com', 'deploymentId': 'woib45', 'apiId': '5uovigzzsf'}, 'body': '{"google_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiZjU5NTQ4OWEwYmIxNThiMDg1ZTIzZTdiNTJiZjk4OTFlMDQ1MzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4MzgxNDc3NzAxNi1jNzJtODhlbWM2YW85aGI4djd0dDlvb2EzMWQ2bDdlZy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjgzODE0Nzc3MDE2LWM3Mm04OGVtYzZhbzloYjh2N3R0OW9vYTMxZDZsN2VnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAyOTgyNjAyNDYwNDM2NDUxNDQ1IiwiZW1haWwiOiJhbGVzc2lvZ2lvdmFubmluaTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NjgyNDYzODIsIm5hbWUiOiJBbGVzc2lvIEdpb3Zhbm5pbmkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmxRc0tILXM2a19UV0FEcUNyODhjRE42LWJPczNKSGN5WVVxSnJSYlBITWJ0LW1RPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFsZXNzaW8iLCJmYW1pbHlfbmFtZSI6Ikdpb3Zhbm5pbmkiLCJpYXQiOjE3NjgyNDY2ODIsImV4cCI6MTc2ODI1MDI4MiwianRpIjoiMGNjMDliMjI2Yjc4YmYzZWRmNGQ0YmQwNzAyYWFhYTBiMjAwN2RmNiJ9.dlg9WoL9YdKuV3NaD9REuzzVztnKiZijosvc9lJagFOXQX1_KaIhxGMlZ25qhDsS3VPsRuNnhJAoBgoq2Q0bgW__eLFaXt7kkbQZVjCL8jg-f9Pze7kye0SH964TByoaeq_-0V4-JxYGjMutwDiTivXepx4p2NeCEfVySdYCVQ5AwkGiIBVSC3I-ktkrBpRJkA27gDTE6sUUgzjlgRZxZT15BibnNvE9Uw0vBFBvyOnCFjJJzhbpnN9faca7cqsZ4YKxzOzqUJk58bU00V_53iZwLP1jlilksEcBgCY7s3GrM_o0K0MnMRKFcptYei78xNtjNkP3Db5Yh_7382nFzw"}', 'isBase64Encoded': False}
    access_token,refresh_token = test_refresh_token(event)
    