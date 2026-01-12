#!/usr/bin/env python3
import aws_cdk as cdk
from stack import MyApiStack
import os
app = cdk.App()

db_password = os.getenv("DB_PASSWORD")
db_host =  os.getenv("DB_HOST")
db_user =  os.getenv("DB_USER")
config = {
    'DB_HOST':db_host,
    'DB_USER':db_user,
    'DB_PASSWORD':db_password
}
MyApiStack(app, "Finalyzer",
    db_host=db_host,
    db_user=db_user,
    db_password=db_password,)


app.synth()


