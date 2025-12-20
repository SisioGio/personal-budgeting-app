import boto3
from boto3.dynamodb.conditions import Key
# Logger
from aws_lambda_powertools import Logger

# Metrics
from aws_lambda_powertools import Metrics
from aws_lambda_powertools.metrics import MetricUnit

# Tracer
from aws_lambda_powertools import Tracer



import boto3
import json
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta,UTC
from decimal import Decimal
import uuid

dynamodb = boto3.resource('dynamodb')
load_dotenv()



# TABLES
TABLE_USERS= os.environ.get('TABLE_USERS')
TABLE_ACTUALS = os.environ.get('TABLE_ACTUALS')
TABLE_FINANCIALS=os.environ.get('TABLE_FINANCIALS')
TABLE_FORECAST=os.environ.get('TABLE_FORECAST')


users_table = dynamodb.Table(TABLE_USERS)
actuals_table = dynamodb.Table(TABLE_ACTUALS)
financials_table = dynamodb.Table(TABLE_FINANCIALS)
forecast_table = dynamodb.Table(TABLE_FORECAST)


logger = Logger(service="finance-manager")
metrics = Metrics(namespace="FinanceApp", service="financial-record")
tracer = Tracer(service="finance-manager")








    


def lambda_handler(event, context):
    http_method = event['httpMethod']
    path = event['path']
    print(event)
    if http_method == 'POST' and path == '/private/financial':
        return create_financial_record(event,context)
    if http_method == 'GET' and path == '/private/financial':
        return get_financial_entries(event,context)
    if http_method == 'DELETE' and path == '/private/financial':
        return delete_financial_entry(event,context)
    
    if http_method == 'POST' and path == '/private/actual':
        return add_actual_record(event,context)
    if http_method == 'GET' and path == '/private/actual':
        return get_actuals_entries(event,context)
    if http_method == 'DELETE' and path == '/private/actual':
        return delete_actual_entry(event,context)
    else:
        return generate_response(404, {"message": "Invalid route"})





def validate_body(body,fields): 
    missing_params = [item for item in fields if not item in body] 
    if len(missing_params): 
        return False,generate_response(400,{"message":f"Missing required fields {' '.join(missing_params)}"}) 
    
    return True,None 


@tracer.capture_lambda_handler
@metrics.log_metrics
def create_financial_record(event,context):
    
    
    
    body = json.loads(event['body'])
    logger.info("Creating financial record", extra={"body": body})
    params_required = ['type','amount','category','description','recurrence','start_date','end_date'] 
    valid,response = validate_body(body,params_required) 
    if not valid: 
        return response 
    
    
    req_context = event['requestContext']
    authorizer=req_context['authorizer']
    email=authorizer['email']
    
    # Extract parameters safely
    type_ = body['type']
    amount = body['amount']
    category = body['category']
    description = body['description']
    recurrence = body['recurrence']
    start_date = body['start_date']
    end_date = body['end_date']

    # Call your internal function to save the record
    record_id = add_financial_record(
        email=email,
        type=type_,
        amount=amount,
        category=category,
        description=description,
        recurrence=recurrence,
        start_date=start_date,
        end_date=end_date
    )
    metrics.add_metric(name="RecordsCreated", unit=MetricUnit.Count, value=1) 
    return generate_response(200, {"message": "Financial record created successfully",'record_id':record_id})


def get_financial_entries(event, context):
    # Extract the email from the event (assuming it's passed in JSON)
    print("Retrieving financial entries")
    email = 'user@example.com'
    req_context = event['requestContext']
    authorizer=req_context['authorizer']
    email=authorizer['email']

    try:
        # Query items where 'email' is equal to the given email
        response = financials_table.query(
            IndexName="EmailIndex",               # <-- REQUIRED for GSI
            KeyConditionExpression=Key('email').eq(email)  # <-- use the attribute name, NOT index name
        )
        
        items = response.get('Items', [])

        return generate_response(200,{"items":items})

    except Exception as e:
        return generate_response(500,{"message":str(e)})
    
    
    
def generate_response(statusCode,message):
    return {
        'statusCode': statusCode,
        'headers': {
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                        },
        'body': json.dumps(message,default=decimal_default)
    }
    

    
def add_financial_record(email,type,amount,category,description,recurrence,start_date,end_date):
    
    unique_id = str(uuid.uuid4())
    financials_table.put_item(Item={
        'email':email,
        'record_id':unique_id,
        'start_date':start_date,
        'end_date':end_date,
        'recurrence':recurrence,
        'type':type,
        'category':category,
        'description':description,
        'amount':Decimal(str(amount))
    })
    return unique_id


def delete_financial_entry(event, context):
    # record_id comes from query params: ?record_id=123
    record_id = event["queryStringParameters"]["record_id"]
    start_date = event["queryStringParameters"]["start_date"]
    try:
        # Delete the item by primary key
        financials_table.delete_item(
            Key={"record_id": record_id,"start_date":start_date}
        )

        return generate_response(
            200,
            {"message": f"Record {record_id} deleted successfully"}
        )

    except Exception as e:
        print("Error deleting record:", e)
        return generate_response(
            500,
            {"message": "Error deleting record", "error": str(e)}
        )

    
    
    

      
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


@tracer.capture_lambda_handler
@metrics.log_metrics
def add_actual_record(event,context):

    body = json.loads(event['body'])
    logger.info("Creating actual record", extra={"body": body})
    params_required = ['type','amount','category','description','date'] 
    valid,response = validate_body(body,params_required) 
    if not valid: 
        return response 
    req_context = event['requestContext']
    authorizer=req_context['authorizer']
    email=authorizer['email']
    # Extract parameters safely
    type_ = body['type']
    amount = body['amount']
    category = body['category']
    description = body['description']
    date = body['date']
    
    unique_id = str(uuid.uuid4())
    actuals_table.put_item(Item={
        'email':email,
        'record_id':unique_id,
        'date':date,
        'type':type_,
        'category':category,
        'description':description,
        'amount':Decimal(str(amount))
    })
    
    metrics.add_metric(name="RecordsCreated", unit=MetricUnit.Count, value=1) 
    return generate_response(200, {"message": "Financial record created successfully"})


def get_actuals_entries(event, context):
    # Extract the email from the event (assuming it's passed in JSON)
    print("Retrieving financial entries")
    email = 'user@example.com'
    req_context = event['requestContext']
    authorizer=req_context['authorizer']
    email=authorizer['email']

    try:
        # Query items where 'email' is equal to the given email
        response = actuals_table.query(
            IndexName="EmailIndex",
            KeyConditionExpression=Key('email').eq(email)
        )
        
        items = response.get('Items', [])

        return generate_response(200,{"items":items})

    except Exception as e:
        return generate_response(500,{"message":str(e)})
    

def delete_actual_entry(event, context):
    # record_id comes from query params: ?record_id=123
    record_id = event["queryStringParameters"]["record_id"]
    date = event["queryStringParameters"]["date"]
    try:
        # Delete the item by primary key
        actuals_table.delete_item(
            Key={"record_id": record_id,"date":date}
        )

        return generate_response(
            200,
            {"message": f"Record {record_id} deleted successfully"}
        )

    except Exception as e:
        print("Error deleting record:", e)
        return generate_response(
            500,
            {"message": "Error deleting record", "error": str(e)}
        )
    
