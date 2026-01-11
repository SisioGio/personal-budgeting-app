import json
import jwt
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
from utils import get_secret,get_cookie
load_dotenv()

JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME",'jwtkey-dev-secret')




def authorizer(event, context):
    print(event)
    token = event['authorizationToken']
    try:
        # token = token.split(' ')[-1]
        secret_value = get_secret(JWT_SECRET_NAME)
        token = get_cookie(event, "access_token")
        decoded = jwt.decode(token, secret_value, algorithms=['HS256'])
        principal_id = decoded['id']
        
        policy = generate_policy(principal_id, 'Allow', event['methodArn'],context=decoded)
        print(policy)
        return policy
    except jwt.ExpiredSignatureError:
        raise Exception('Token Expired')  # Token has expired
    except jwt.InvalidTokenError:
        raise Exception('Unauthorized')  # Invalid token

def generate_policy(principal_id, effect, resource,context=None):
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
    if context:
        # Must be all strings, numbers, or booleans
        sanitized_context = {k: str(v) for k, v in context.items()}
        policy['context'] = sanitized_context

    return policy




# authorizer({'methodArn':'testing','authorizationToken':"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6eyJpZCI6MTAwfSwiZW1haWwiOiJhbGVzc2lvZ2lvdmFubmluaTIzQGdtYWlsLmNvbSJ9.03oNniuoCHBLGJEjabIoz1NG004yr6qPYUWmb80kiBs"},None)