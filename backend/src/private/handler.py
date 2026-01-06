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
    elif http_method == 'GET' and path == '/private/entries':
        return get_entries_report(event,context)
    
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
        row = execute_query("SELECT id, email FROM users WHERE email = %s",(email,))

        if not row or len(row) ==0:
            return generate_response(404, {"error": "User not found"})
        row = row[0]
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



@tracer.capture_lambda_handler
@metrics.log_metrics
def get_entries_report(event, context):
    try:
        logger.info("Generating entries report with natural periods")

        user_id = event["requestContext"]["authorizer"]["principalId"]
        params = event.get("queryStringParameters") or {}
        scenario_id = params.get("scenario_id")
        time_frame = params.get("time_frame", "monthly").lower()
        simulate_years = int(params.get("simulate_years", 2))

        if not scenario_id:
            return generate_response(400, {"error": "scenario_id is required"})

        freq_map = {"daily": "D", "weekly": "W-MON", "monthly": "MS"}  # MS = Month Start
        default_periods = {"daily": 30, "weekly": 12, "monthly": 12}

        if time_frame not in freq_map:
            return generate_response(400, {"error": "time_frame must be daily, weekly, or monthly"})


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
        if not rows:
            return generate_response(200, {"data": []})

        df = pd.DataFrame(rows)
        df['entry_start_date'] = pd.to_datetime(df['entry_start_date'])
        df['entry_end_date'] = pd.to_datetime(df['entry_end_date'])
        df['signed_amount'] = df.apply(
            lambda x: x['entry_amount'] if x['entry_type'] == 'income' else -x['entry_amount'], axis=1
        )

        # Align start/end for periods naturally
        start_date = df['entry_start_date'].min()
        end_date = df['entry_start_date'].max() + pd.DateOffset(years=simulate_years)
        period_idx = pd.date_range(start=start_date, end=end_date, freq=freq_map[time_frame])

        report = []

        for period_start in period_idx:
            if time_frame == 'daily':
                period_end = period_start
            elif time_frame == 'weekly':
                period_end = period_start + pd.DateOffset(days=6)
            elif time_frame == 'monthly':
                # Get last day of month
                next_month = period_start + pd.DateOffset(months=1)
                period_end = next_month - pd.Timedelta(days=1)

            # Select entries in this period (simulate recurring)
            entries_in_period = []
            for _, row in df.iterrows():
                recur_dates = []
                entry_start = row['entry_start_date']
                entry_end = row['entry_end_date']
                freq = row['entry_frequency']

                # Determine the effective end date for this entry
                # Use entry's end_date if specified, otherwise use simulation end_date
                effective_end = entry_end if pd.notna(entry_end) else end_date

                if freq == 'daily':
                    recur_dates = pd.date_range(start=entry_start, end=effective_end, freq='D')
                elif freq == 'weekly':
                    recur_dates = pd.date_range(start=entry_start, end=effective_end, freq='W-MON')
                elif freq == 'monthly':
                    recur_dates = pd.date_range(start=entry_start, end=effective_end, freq='MS')
                else:  # one-off
                    recur_dates = [entry_start]

                if any((d >= period_start) and (d <= period_end) for d in recur_dates):
                    entries_in_period.append({
                        "entry_id": row['entry_id'],
                        "entry_name": row['entry_name'],
                        "entry_type": row['entry_type'],
                        "entry_amount": row['entry_amount'],
                        "category_id": row['category_id'],
                        "category_name": row['category_name'],
                        "entry_frequency": row['entry_frequency'],
                        "entry_date": row['entry_start_date'].date().isoformat(),
                        "entry_end_date": row['entry_end_date'].date().isoformat()
                    })

            profit_loss = sum(
                e['entry_amount'] if e['entry_type'] == 'income' else -e['entry_amount'] 
                for e in entries_in_period
            )
            opening_balance = report[-1]['closing_balance'] if report else 0
            closing_balance = opening_balance + profit_loss
            pct_change = ((closing_balance - opening_balance) / opening_balance * 100) if opening_balance != 0 else 0

            report.append({
                "period_start": period_start.date().isoformat(),
                "period_end": period_end.date().isoformat(),
                "opening_balance": opening_balance,
                "closing_balance": closing_balance,
                "profit_loss": profit_loss,
                "%_change": pct_change,
                "entries": entries_in_period
            })



        return generate_response(200, {"data": report})

    except Exception as e:
        logger.exception("Failed to generate entries report")
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

