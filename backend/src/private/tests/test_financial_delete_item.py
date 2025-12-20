from dotenv import load_dotenv
import os

import pytest

import json
import random
from src.private.handler import lambda_handler
load_dotenv()





def build_event(method="GET", path="/auth/register", body=None, params=None):
    return {
        "httpMethod": method.upper(),
        "path": path,
        "queryStringParameters": params or {},
        "body": json.dumps(body or {}),
        'requestContext':{
          'authorizer':{
            'email':"alessiogiovannini23@gmail.com"
          }
        }
    }


def test_get_items():
    start_date = "2025-11-01"
    body={
        "start_date":start_date,
        "end_date":None,
        "recurrence":"monthly",
        "type":"E",
        "category":"Rent",
        "description":"Rent",
        "amount":1000
    }
    ev = build_event("POST", "/private/financial",body=body)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200
    
    record_id = json.loads(res['body'])['record_id']

    ev = build_event("DELETE", "/private/financial",params={'record_id':record_id,'start_date':start_date})
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200

