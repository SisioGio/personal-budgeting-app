from dotenv import load_dotenv
import os
from src.auth.handler import sum
import pytest

import json
import random

from src.authorizer.handler import authorizer
from src.auth.handler import lambda_handler
import jwt
from datetime import datetime, timedelta,UTC
from src.utils.utils import get_secret
load_dotenv()






JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME")

SECRET_KEY = get_secret(JWT_SECRET_NAME)


def random_user():
    uid = random.randint(1, 10_000_000)
    return {
        "email": f"user_{uid}@gmail.com",
        "password": f"pass_{uid}",
        "name": f"user_{uid}"
    }


def build_event(method="GET", path="/auth/register", body=None, params=None):
    return {
        "httpMethod": method.upper(),
        "path": path,
        "queryStringParameters": params or {},
        "body": json.dumps(body or {})
    }


def test_full_auth_flow():
    user = random_user()

    # Register
    ev = build_event("POST", "/auth/register", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200

    # Login
    ev = build_event("POST", "/auth/login", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200

    tokens = json.loads(res["body"])
    access = tokens["access_token"]

    # Authorize
    ev = {
        "headers": {"Authorization": f"Bearer {access}"},
        'methodArn':"arn:..."
    }

    authz = authorizer(ev, {})
    assert "principalId" in authz


def test_invalid_email():
    user = random_user()



    # Login
    ev = build_event("POST", "/auth/login", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 404


def test_invalid_password():
    user = random_user()

    # Register
    ev = build_event("POST", "/auth/register", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200
    user['password']='wrong password'
    # Login
    ev = build_event("POST", "/auth/login", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 403

    

def test_invalid_bearer():
    user = random_user()

    # Register
    ev = build_event("POST", "/auth/register", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200

    # Login
    ev = build_event("POST", "/auth/login", user)
    res = lambda_handler(ev, {})
    assert res["statusCode"] == 200

    tokens = json.loads(res["body"])
    access = tokens["access_token"]

    # Authorize
    ev = {
        "headers": {"Authorization": f"Bearer WRONG_TOKEN"},
        'methodArn':"arn:..."
    }

    with pytest.raises(Exception) as exc_info:
        authorizer(ev, {})

    assert str(exc_info.value) == "Unauthorized"


def test_authorizer_expired_token():
    # Create an expired token
    expired_token = jwt.encode(
        {"id": "user123", "exp": datetime.now(UTC) - timedelta(seconds=10)},  # expired 10 seconds ago
        SECRET_KEY,
        algorithm="HS256"
    )

    event = {
        "headers": {"Authorization": f"Bearer {expired_token}"},
        "methodArn": "arn:aws:execute-api:region:account-id:api-id/stage/GET/resource"
    }

    # Assert that the authorizer raises 'Unauthorized' for expired token
    with pytest.raises(Exception) as exc_info:
        authorizer(event, {})

    assert str(exc_info.value) == "Token Expired"
    