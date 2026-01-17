from handler import lambda_handler
import json


def create_event(method,path,body=None,email=None,params={}):
    event = {
        'methodArn':"method arn",
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body),
        'requestContext':{'authorizer':{'email':email,'principalId':103}},
        'queryStringParameters':params
        
    }
    return event


email = 'testuser2083@example.com'
event = create_event(
    "GET",
    '/private/entries',
    email=email,
    params={'scenario_id':29,'forecast_length':20,'time_frame':'weekly'})

res = lambda_handler(event,None)
body=json.loads(res['body'])['data']

for item in body:
    print(f"{item['period_start']} - {item['period_end']}: op {item['opening_balance']} cb {item['closing_balance']} pl {item['profit_loss']} ")
    entries = item.get('entries') if 'entries' in item else []
    for entry in entries:
        print(entry)
        # print(f"{entry['entry_name']}: {entry['entry_amount']} ({entry['entry_date']} - {entry['entry_frequency']})")
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