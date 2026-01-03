from handler import lambda_handler
import json


def create_event(method,path,body=None,email=None):
    event = {
        'methodArn':"method arn",
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body),
        'requestContext':{'authorizer':{'email':email}}
        
    }
    return event


email = 'testuser2083@example.com'
event = create_event("GET",'/private/signin',email=email)
print(lambda_handler(event,None))