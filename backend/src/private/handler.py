import boto3
from boto3.dynamodb.conditions import Key
# Logger
from aws_lambda_powertools import Logger
import pandas as pd
# Metrics
from aws_lambda_powertools import Metrics
from aws_lambda_powertools.metrics import MetricUnit

# Tracer
from aws_lambda_powertools import Tracer
from db import execute_query

import json
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta,UTC
from decimal import Decimal
import uuid
from utils import *
from db import *

from dateutil.relativedelta import relativedelta

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
    elif http_method == 'PUT' and path == '/private/balance':
        return update_user(event,context)
    elif http_method == 'GET' and path == '/private/entries':
        return get_entries_report(event,context)
    elif http_method == 'GET' and path == '/private/report/actuals-vs-budget':
        return get_actuals_report(event,context)
    
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

        # with db_conn.cursor() as cur:
        #     cur.execute(
        #         "SELECT id, email,initial_balance FROM users WHERE email = %s",
        #         (email,)
        #     )
        #     row = cur.fetchone()
        row = execute_query("SELECT id, email,initial_balance FROM users WHERE email = %s",(email,))

        if not row or len(row) ==0:
            return generate_response(404, {"error": "User not found"})
        row = row[0]
        user_id=row['id']
        user_email = row['email']
        initial_balance = row['initial_balance']
        user = {
            "id": user_id,
            "email": user_email,
            "initial_balance":initial_balance
        }

        return generate_response(200, {"data": user})

    except Exception as e:
        logger.exception("Failed to get user profile")
        return generate_response(500, {"error": "Internal server error"})

@tracer.capture_lambda_handler
@metrics.log_metrics
def update_user(event,context):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    initial_balance = body.get('initial_balance')
    
    if not initial_balance:
        return generate_response(400, {"msg": "'code' is required to update a scenario."})

    query = """
        UPDATE users
        SET initial_balance = %s
        WHERE id = %s 
        RETURNING *
    """
    result = execute_query(query, (initial_balance, user_id),commit=True)
    if not result:
        return generate_response(404, {"msg": "User not found."})

    return generate_response(200, {"msg": "User updated", "data": result})

def get_entries(user_id,scenario_id):
    # Fetch entries
    query = """
        SELECT
            e.id            AS entry_id,
            e.name          AS entry_name,
            e.type          AS entry_type,
            e.frequency     AS entry_frequency,
            e.start_date    AS entry_start_date,
            e.end_date      AS entry_end_date,
            e.amount        AS entry_amount,
            e.scenario_id   AS entry_scenario_id,
            e.category_id   AS entry_category_id,
            c.id            AS category_id,
            c.name          AS category_name
        FROM entries AS e
        JOIN category AS c
            ON e.category_id = c.id
        WHERE e.user_id = %s AND e.scenario_id = %s
        ORDER BY e.start_date
    """
    rows = execute_query(query, (user_id, scenario_id))
    return rows

FREQUENCY_MAP = {
    "one_time": None,   # occurs once
    "monthly": relativedelta(months=1),
    "yearly": relativedelta(years=1),
}
def generate_forecast(entries,user_id, start_date=None, periods=12, simulate_years=1, time_frame="monthly"):
    """
    entries: list of dicts from DB query
    start_date: date to start the forecast (optional, default today)
    periods: number of periods per year (12 for monthly)
    simulate_years: how many years to simulate
    time_frame: 'monthly', 'quarterly', 'yearly'
    """
    if start_date is None:
        start_date = datetime.today().replace(day=1)

    # Determine the end date
    if time_frame == "monthly":
        delta = relativedelta(months=1)
    elif time_frame == "quarterly":
        delta = relativedelta(months=3)
    elif time_frame == "yearly":
        delta = relativedelta(years=1)
    else:
        raise ValueError("Invalid time_frame")

    total_periods = periods * simulate_years
    forecast = []

    for i in range(total_periods):
        period_start = start_date + i * delta
        period_end = period_start + delta - timedelta(days=1)
        
        period_start = datetime(period_start.year, period_start.month, period_start.day)
        period_end = datetime(period_end.year, period_end.month, period_end.day, 23, 59, 59)
        print(f"Checking for {period_start}:{period_end}")

        period_entries = []

        for e in entries:
            print(f"Entry: {e['entry_name']}")
            freq = e["entry_frequency"]
            freq_delta = FREQUENCY_MAP.get(freq)

            # Only add if this period should include the entry
            e_start = e["entry_start_date"]
            e_end = e["entry_end_date"] if e["entry_end_date"] else e_start
            
            # repeat logic
            current = e_start
            while freq_delta and current <= period_end.date():
                print(f"Checking for date {current} ({period_start.date()} - {period_end.date()})")
                if current > e_end:
                    break
                if period_start.date() <= current <= period_end.date():
                    period_entries.append({**e, "entry_date": current})
                current += freq_delta

            # one_time entries
            if freq == "one_time" and period_start.date() <= e_start <= period_end.date():
                period_entries.append({**e, "entry_date": e_start})

        forecast.append({
            "period_start": period_start.strftime("%Y-%m-%d"),
            "period_end": period_end.strftime("%Y-%m-%d"),
            "entries": period_entries,
            "opening_balance": 0,  # can be calculated cumulatively
            "closing_balance": 0,
            "profit_loss": sum(e["entry_amount"] if e["entry_type"]=="income" else -e["entry_amount"] for e in period_entries)
        })

    # Optionally calculate cumulative balance
    
        
    balance = 0
    rows = execute_query("SELECT initial_balance from users where id = %s",(user_id,))
    if len(rows)==1:
        balance= rows[0]['initial_balance']
    
    for p in forecast:
        p["opening_balance"] = balance
        balance += p["profit_loss"]
        p["closing_balance"] = balance

    return forecast

    
@tracer.capture_lambda_handler
@metrics.log_metrics
def get_entries_report(event, context):
    try:
        logger.info("Generating entries report with natural periods")

        user_id = event["requestContext"]["authorizer"]["principalId"]
        params = event.get("queryStringParameters") or {}
        scenario_id = params.get("scenario_id")
        time_frame = params.get("time_frame", "monthly").lower()
        simulate_years = int(params.get("simulate_years", 1))

        if not scenario_id:
            return generate_response(400, {"error": "scenario_id is required"})

        freq_map = {"daily": "D", "weekly": "W-MON", "monthly": "MS"}  # MS = Month Start


        if time_frame not in freq_map:
            return generate_response(400, {"error": "time_frame must be daily, weekly, or monthly"})
        entries = get_entries(user_id,scenario_id)

        if not entries:
            return generate_response(200, {"data": []})
        forecast = generate_forecast(entries,user_id, periods=12, simulate_years=1, time_frame="monthly")
        return generate_response(200, {"data": forecast})

    except Exception as e:
        logger.exception("Failed to generate entries report")
        return generate_response(500, {"error": "Internal server error"})
    
    

@tracer.capture_lambda_handler
@metrics.log_metrics
def get_actuals_report(event, context):
    logger.info("Generating actuals vs budget report")

    user_id = event["requestContext"]["authorizer"]["principalId"]

    qs = event.get("queryStringParameters") or {}
    scenario_id = qs.get("scenario_id")
    period = qs.get("period") 

    if not scenario_id or not period:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "msg": "scenario_id and period (YYYY-MM) are required"
            })
        }

    query = """
        SELECT
            %s                              AS period,
            e.id                            AS entry_id,
            e.name                          AS entry_name,
            e.amount                        AS budget,
            COALESCE(
                SUM(
                    CASE
                        WHEN a.type = 'expense' THEN a.amount
                        ELSE - a.amount
                    END
                ), 0
            )                               AS actual,
            (e.amount - COALESCE(
                SUM(
                    CASE
                        WHEN a.type = 'expense' THEN a.amount
                        ELSE a.amount
                    END
                ), 0
            ))                              AS delta
        FROM entries e
        LEFT JOIN actuals a
            ON a.entry_id = e.id
            AND TO_CHAR(a.actual_date, 'YYYY-MM') = %s
        WHERE
            e.user_id = %s
            AND e.scenario_id = %s
        GROUP BY
            e.id,
            e.name,
            e.amount
        ORDER BY
            e.name ASC
    """

    params = (period, period, user_id, scenario_id)

    logger.info("SQL PARAMS: %s", params)

    rows = execute_query(query, params)
    return generate_response(200,{"data":rows})
  
    
    
        
        

     
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
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()  # "YYYY-MM-DD"
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

