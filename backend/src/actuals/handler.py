import json
from datetime import date, datetime
from utils import generate_response
from db import execute_query
from datetime import datetime

ALLOWED_TYPES = {"income", "expense"}


def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if path == "/actuals":
        if method == "POST":
            return create(event)
        if method == "GET":
            return get(event)
        if method == "PUT":
            return put(event)
        if method == "DELETE":
            return delete(event)

    return generate_response(400, {"msg": "Invalid route or method"})


# Table entries:
# user_id, name, type, frequency, start_date, end_date, amount, scenario_id

def create(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))

    required_fields = [
        "actual_date", "amount",'type',"entry_id"
    ]

    for field in required_fields:
        if field not in body:
            return generate_response(400, {"msg": f"Missing field: {field}"})

    query = """
        INSERT INTO actuals
        (user_id, actual_date, amount,type,comment,entry_id)
        VALUES (%s, %s, %s, %s,%s,%s)
        RETURNING *
    """
    act_type = body['type']
    if not act_type in ALLOWED_TYPES:
        return generate_response(400,{"msg":f"Type must be income or expense"})
    params = (
        user_id,
        body["actual_date"],
        body["amount"],
        act_type,
        body.get("comment"),
        body['entry_id']
    )

    result = execute_query(query, params, commit=True)
    return generate_response(201, {"msg": "Actual created", "data": result})


def get(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    params = event.get("queryStringParameters") or {}

    from_date_str = params.get("from_date")
    to_date_str = params.get("to_date")
    period = params.get("period")
    # Parse dates if provided, else set sensible defaults
    try:
        from_date = datetime.fromisoformat(from_date_str).date() if from_date_str else None
    except ValueError:
        return generate_response(400, {"msg": "Invalid from_date format, expected YYYY-MM-DD"})

    try:
        to_date = datetime.fromisoformat(to_date_str).date() if to_date_str else None
    except ValueError:
        return generate_response(400, {"msg": "Invalid to_date format, expected YYYY-MM-DD"})

    # Build dynamic WHERE clause
    query = "SELECT * FROM actuals WHERE user_id = %s "
    params_list = [user_id]

    if from_date:
        query += " AND actual_date >= %s"
        params_list.append(from_date)
    if to_date:
        query += " AND actual_date <= %s"
        params_list.append(to_date)
    if period:
        query += " AND TO_CHAR(actual_date,'YYYY-MM') = %s"
        params_list.append(period)  

    query += " ORDER BY actual_date"

    result = execute_query(query, tuple(params_list))

    return generate_response(200, {"data": result})


def put(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))

    actual_id = body.get("id")
    if not actual_id:
        return generate_response(400, {"msg": "Missing actual id"})

    fields = []
    values = []

    for key in ["actual_date", "amount", "category_id",'comment','type']:
        if key in body:
            if key =='type' and not body[key] in ALLOWED_TYPES:
                return generate_response(400,{"msg":"Type must be income or expense"})
            fields.append(f"{key} = %s")
            values.append(body[key])

    if not fields:
        return generate_response(400, {"msg": "No fields to update"})

    query = f"""
        UPDATE actuals
        SET {', '.join(fields)}
        WHERE id = %s AND user_id = %s
        RETURNING *
    """
    values.extend([actual_id, user_id])

    result = execute_query(query, tuple(values), commit=True)
    if not result:
        return generate_response(404, {"msg": "Actual not found"})

    return generate_response(200, {"msg": "Actual updated", "data": result})


def delete(event):
    user_id = event["requestContext"]["authorizer"]["principalId"]
    body = json.loads(event.get("body", "{}"))
    id = body.get("id")

    if not id:
        return generate_response(400, {"msg": "Missing  id"})

    query = """
        DELETE FROM actuals
        WHERE id = %s AND user_id = %s
        RETURNING *
    """
    result = execute_query(query, (id, user_id), commit=True)

    if not result:
        return generate_response(404, {"msg": "Actual not found"})

    return generate_response(200, {"msg": "Actual deleted", "data": result})



