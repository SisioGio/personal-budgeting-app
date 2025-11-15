


import boto3
import json


def get_secret(secret_name: str, region_name: str = "eu-central-1"):
    """
    Fetch a secret's value from AWS Secrets Manager by name.
    Returns the secret as a dict if it's JSON, otherwise a string.
    """

    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
    except client.exceptions.ResourceNotFoundException:
        raise Exception(f"Secret '{secret_name}' not found")
    except Exception as e:
        raise Exception(f"Error retrieving secret: {e}")

    # The secret is in the "SecretString" key
    secret = response["SecretString"]

    # Try to parse JSON secrets automatically
    try:
        return json.loads(secret)
    except json.JSONDecodeError:
        return secret

