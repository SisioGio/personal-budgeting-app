import json
from datetime import date, datetime
from common.utils import generate_response
from common.db import execute_query


ALLOWED_TYPES = {"income", "expense"}
ALLOWED_FREQUENCIES = {"one_time", "daily", "weekly", "monthly", "yearly"}


def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if path == "/entries":
        if method == "POST":
            return create_entry(event)
        if method == "GET":
            return get_entries(event)
        if method == "PUT":
            return update_entry(event)
        if method == "DELETE":
            return delete_entry(event)

    return generate_response(400, {"msg": "Invalid route or method"})


# Table entries:
# user_id, name, type, frequency, start_date, end_date, amount, scenario_id

def create_entry(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))

    required_fields = [
        "name", "type", "frequency",
        "start_date", "amount", "scenario_id",'category_id'
    ]

    for field in required_fields:
        if field not in body:
            return generate_response(400, {"msg": f"Missing field: {field}"})

    if body["type"] not in ALLOWED_TYPES:
        return generate_response(400, {"msg": "Invalid type"})
    if body["frequency"] not in ALLOWED_FREQUENCIES:
        return generate_response(400, {"msg": "Invalid frequency"})

    query = """
        INSERT INTO entries
        (user_id, name, type, frequency, start_date, end_date, amount, scenario_id,category_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s)
        RETURNING *
    """
    params = (
        user_id,
        body["name"],
        body["type"],
        body["frequency"],
        body["start_date"],
        body.get("end_date"),
        body["amount"],
        body["scenario_id"],
        body['category_id']
    )

    result = execute_query(query, params, commit=True)
    return generate_response(201, {"msg": "Entry created", "data": result})


def get_entries(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    params = event.get("queryStringParameters") or {}
    scenario_id = params.get("scenario_id")

    if scenario_id:
        query = """
            SELECT * FROM entries
            WHERE user_id = %s AND scenario_id = %s
            ORDER BY start_date
        """
        result = execute_query(query, (user_id, scenario_id))
    else:
        query = """
            SELECT * FROM entries
            WHERE user_id = %s
            ORDER BY start_date
        """
        result = execute_query(query, (user_id,))

    return generate_response(200, {"data": result})


def update_entry(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))

    entry_id = body.get("id")
    if not entry_id:
        return generate_response(400, {"msg": "Missing entry id"})

    fields = []
    values = []

    for key in [
        "name", "type", "frequency",
        "start_date", "end_date",
        "amount", "scenario_id"
    ]:
        if key in body:
            if key == "type" and body[key] not in ALLOWED_TYPES:
                return generate_response(400, {"msg": "Invalid type"})
            if key == "frequency" and body[key] not in ALLOWED_FREQUENCIES:
                return generate_response(400, {"msg": "Invalid frequency"})
            fields.append(f"{key} = %s")
            values.append(body[key])

    if not fields:
        return generate_response(400, {"msg": "No fields to update"})

    query = f"""
        UPDATE entries
        SET {', '.join(fields)}
        WHERE id = %s AND user_id = %s
        RETURNING *
    """
    values.extend([entry_id, user_id])

    result = execute_query(query, tuple(values), commit=True)
    if not result:
        return generate_response(404, {"msg": "Entry not found"})

    return generate_response(200, {"msg": "Entry updated", "data": result})


def delete_entry(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))
    entry_id = body.get("id")

    if not entry_id:
        return generate_response(400, {"msg": "Missing entry id"})

    query = """
        DELETE FROM entries
        WHERE id = %s AND user_id = %s
        RETURNING *
    """
    result = execute_query(query, (entry_id, user_id), commit=True)

    if not result:
        return generate_response(404, {"msg": "Entry not found"})

    return generate_response(200, {"msg": "Entry deleted", "data": result})



