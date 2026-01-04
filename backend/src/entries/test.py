from handler import lambda_handler

import json
import random

def create_event(method,path,body=None,email=None):
    event = {
        'methodArn':"method arn",
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body),
        'requestContext':{'authorizer':{'email':email,'principalId':98}}
        
    }
    return event


if __name__ == "__main__":

    email = f"testuser2083@example.com"


    body = {"name":"Oerlikon Bonus","type":"income","frequency":"one_time","start_date":"2026-04-24","end_date":"","amount":3700,"category_id":"39","scenario_id":"28"}
    event = create_event('POST',"/entries",body=body,email=email)
    print(lambda_handler(event,None))