import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv


# Global connection to reuse across Lambda invocations
_conn = None

def get_connection():
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(
            host=os.environ["DB_HOST"],
            database=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            cursor_factory=RealDictCursor
        )
    return _conn

def execute_query(query, params=None, fetch=True,commit = False):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            result = cur.fetchall() if fetch else None
        if commit:
            conn.commit()
        return result
    finally:
        conn.close()
