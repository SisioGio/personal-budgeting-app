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
event = create_event(
    "GET",
    '/private/entries',
    email=email,
    params={'scenario_id':28,'forecast_length':12,'time_frame':'monthly'})

res = lambda_handler(event,None)
print(res)
# body = json.loads(res['body'])['data']

# for item in body:
#     print(item)
    
#     for entry in item['entries']:
#         print(f'{entry['entry_name']}: {entry['entry_amount']}')

# event = create_event("GET",'/private/report/actuals-vs-budget',email=email,params={'scenario_id':28,'period':'2026-01'})
# print(lambda_handler(event,None))

# event = create_event("GET",'/private/report/actuals-history',email=email,params={'scenario_id':28})
# print(lambda_handler(event,None))

# event = create_event("GET",'/private/balance',email=email)
# print(lambda_handler(event,None))
# event = create_event("GET",'/private/report/actuals-vs-budget',email=email,params={'scenario_id':28,'period':'2026-01'})
# print(lambda_handler(event,None))

# event = create_event("GET",'/private/signin',email=email)
# print(lambda_handler(event,None))