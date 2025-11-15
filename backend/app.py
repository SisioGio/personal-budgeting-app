#!/usr/bin/env python3
import aws_cdk as cdk
from backend.stack import MyApiStack

app = cdk.App()
MyApiStack(app, "MyApiStack")
app.synth()
