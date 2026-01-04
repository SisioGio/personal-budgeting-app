from handler import lambda_handler
import json


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


email = 'testuser2083@example.com'
# event = create_event("GET",'/private/entries',email=email,params={'scenario_id':28,'simulate_year':2,'time_frame':'monthly'})
# print(lambda_handler(event,None))

event = create_event("GET",'/private/signin',email=email,params={'scenario_id':28,'simulate_year':2,'time_frame':'monthly'})
print(lambda_handler(event,None))