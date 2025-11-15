def handler(event, context):
    # Simple test Lambda handler
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"message": "Hello from private"}'
    }
