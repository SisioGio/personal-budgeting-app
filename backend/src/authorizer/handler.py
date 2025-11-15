import json
import jwt
from botocore.exceptions import ClientError
import os
from .utils import *


JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME")

SECRET_KEY = get_secret(JWT_SECRET_NAME)


def authorizer(event, context):
    print(event)
    token = event['headers']['Authorization']
    try:
        token = token.split(' ')[-1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        principal_id = decoded['id']
        
        policy = generate_policy(principal_id, 'Allow', event['methodArn'])
        return policy
    except jwt.ExpiredSignatureError:
        raise Exception('Token Expired')  # Token has expired
    except jwt.InvalidTokenError:
        raise Exception('Unauthorized')  # Invalid token

def generate_policy(principal_id, effect, resource):
    policy = {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
    }
    return policy
