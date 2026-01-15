import json
from utils import generate_response
from db import execute_query


def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if method == 'GET' and path == '/scenario':
        return get_scenario(event)
    if method == 'POST' and path == '/scenario':
        return create_scenario(event)
    if method == 'PUT' and path == '/scenario':
        return update_scenario(event)
    if method == 'DELETE' and path == '/scenario':
        return delete_scenario(event)

    return generate_response(400, {"msg": "Invalid route or method.", "event": event},event=event)


# Table scenarios: user_id, code, description

def create_scenario(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    code = body.get('code')
    description = body.get('description')

    if not code or not description:
        return generate_response(400, {"msg": "Both 'code' and 'description' are required."},event=event)

    query = """
        INSERT INTO scenarios (user_id, code, description)
        VALUES (%s, %s, %s)
        RETURNING *
    """
    result = execute_query(query, (user_id, code, description),commit=True)
    return generate_response(201, {"msg": "Scenario created", "data": result},event=event)


def get_scenario(event):
    user_id = event['requestContext']['authorizer']['principalId']
    query = "SELECT * FROM scenarios WHERE user_id = %s"
    result = execute_query(query, (user_id,))
    return generate_response(200, {"data": result})


def update_scenario(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    code = body.get('code')
    description = body.get('description')

    if not code:
        return generate_response(400, {"msg": "'code' is required to update a scenario."},event=event)

    query = """
        UPDATE scenarios
        SET description = %s
        WHERE user_id = %s AND code = %s
        RETURNING *
    """
    result = execute_query(query, (description, user_id, code),commit=True)
    if not result:
        return generate_response(404, {"msg": "Scenario not found."},event=event)

    return generate_response(200, {"msg": "Scenario updated", "data": result},event=event)



def delete_scenario(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    code = body.get('code')

    if not code:
        return generate_response(400, {"msg": "'code' is required to delete a scenario."},event=event)

    query = "DELETE FROM scenarios WHERE user_id = %s AND code = %s RETURNING *"
    result = execute_query(query, (user_id, code),commit=True)

    if not result:
        return generate_response(404, {"msg": "Scenario not found."},event=event)

    return generate_response(200, {"msg": "Scenario deleted", "data": result},event=event)
