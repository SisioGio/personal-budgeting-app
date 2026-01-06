from handler import lambda_handler

import json
import random

def create_event(method,path,body=None,email=None,params={}):
    event = {
        'methodArn':"method arn",
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body),
        'requestContext':{'authorizer':{'email':email,'principalId':98}},
        'queryStringParameters':params
        
    }
    return event



if __name__ == "__main__":
    
    event = create_event('GET','/actuals',email='testuser2083@example.com')
    print(event)