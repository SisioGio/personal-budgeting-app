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
from utils import *
from db import *


dynamodb = boto3.resource('dynamodb')
load_dotenv()





logger = Logger(service="finance-manager")
metrics = Metrics(namespace="FinanceApp", service="financial-record")
tracer = Tracer(service="finance-manager")








db_conn = get_connection()


def lambda_handler(event, context):
    http_method = event['httpMethod']
    path = event['path']
    print(event)
    if http_method == 'GET' and path == '/private/signin':
        return signin(event,context)
    
    else:
        return generate_response(404, {"message": "Invalid route"})





def validate_body(body,fields): 
    missing_params = [item for item in fields if not item in body] 
    if len(missing_params): 
        return False,generate_response(400,{"message":f"Missing required fields {' '.join(missing_params)}"}) 
    
    return True,None 


@tracer.capture_lambda_handler
@metrics.log_metrics
def signin(event, context):
    try:
        logger.info("Getting user profile")

        req_context = event.get("requestContext", {})
        authorizer = req_context.get("authorizer", {})
        email = authorizer.get("email")

        if not email:
            return generate_response(401, {"error": "Unauthorized"})

        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT id, email FROM users WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()

        if not row:
            return generate_response(404, {"error": "User not found"})

        user_id=row['id']
        user_email = row['email']

        user = {
            "id": user_id,
            "email": user_email
        }

        return generate_response(200, {"data": user})

    except Exception as e:
        logger.exception("Failed to get user profile")
        return generate_response(500, {"error": "Internal server error"})



    
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
    

      
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

