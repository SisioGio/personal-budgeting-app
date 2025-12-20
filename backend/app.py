#!/usr/bin/env python3
import aws_cdk as cdk
from stack import MyApiStack

app = cdk.App()
MyApiStack(app, "TemplateServerlessApp")
app.synth()
