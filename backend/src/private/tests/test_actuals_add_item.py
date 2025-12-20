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

def test_actuals_add_items():

    body={

        "date":"2025-11-15",
        "type":"E",
        "category":"Other",
        "description":"Dinner",
        "amount":15
    }
    ev = build_event("POST", "/private/actual",body=body)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200