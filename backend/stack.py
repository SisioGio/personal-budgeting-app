from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_dynamodb as dynamo,
    aws_secretsmanager as secretsmanager,
    aws_iam as iam,
    RemovalPolicy   ,
    CfnOutput
)
from constructs import Construct
from aws_cdk import Duration


def generate_name(name,env,type):
    return f"{name}-{env}-{type}"
class MyApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        
        # Create one shared execution role
        shared_lambda_role = iam.Role(
            self, generate_name('lambdarole','dev','table'),
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )



        # Db table for users
        table_users = dynamo.Table(self,generate_name('users','dev','table'),
                                   table_name=generate_name('users','dev','table'),
                                   partition_key=dynamo.Attribute(
                                        name="email",
                                        type=dynamo.AttributeType.STRING
                                    ))
        table_actuals = dynamo.Table(
            self,
            generate_name('actuals', 'dev', 'table'),
            table_name=generate_name('actuals', 'dev', 'table'),
            partition_key=dynamo.Attribute(
                name="record_id",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="date",
                type=dynamo.AttributeType.STRING
            ),
            removal_policy=RemovalPolicy.DESTROY
        )
        
        # GSI to query by email
        table_actuals.add_global_secondary_index(
            index_name="EmailIndex",
            partition_key= dynamo.Attribute(
                name="email",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="date",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )
        
        table_forecasts = dynamo.Table(
            self,
            generate_name('forecast', 'dev', 'table'),  # CDK logical ID
            table_name=generate_name('forecast', 'dev', 'table'),  # actual table name
            partition_key=dynamo.Attribute(
                name="record_id",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="forecast_id",
                type=dynamo.AttributeType.STRING  # or NUMBER if it’s a timestamp
            ),
            removal_policy=RemovalPolicy.DESTROY  # optional, for dev environment
        )
        # GSI to query by email
        table_forecasts.add_global_secondary_index(
            index_name="EmailIndex",
            partition_key=dynamo.Attribute(
                name="email",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="forecast_id",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )
        
        
        
        # Main DynamoDB table
        table_financials = dynamo.Table(
            self,
            "FinancialsTable",
            table_name="financialsdt-dev",
            partition_key=dynamo.Attribute(
                name="record_id",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="start_date",
                type=dynamo.AttributeType.STRING
            ),
            removal_policy=RemovalPolicy.DESTROY  # Use RETAIN in production
        )
        # GSI to query by recurrence and type
        table_financials.add_global_secondary_index(
            index_name="EmailIndex",
            partition_key=dynamo.Attribute(
                name="email",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="start_date",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )
        
        # GSI to query by recurrence and type
        table_financials.add_global_secondary_index(
            index_name="RecurrenceTypeIndex",
            partition_key=dynamo.Attribute(
                name="recurrence",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="type",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )
        # Another optional GSI: category-based queries
        table_financials.add_global_secondary_index(
            index_name="CategoryIndex",
            partition_key=dynamo.Attribute(
                name="category",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="start_date",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )

        # You can now use table_financials in Lambda or other services
        self.table_financials = table_financials

        
        
        # JWT secret in Secrets Manager
        jwt_secret = secretsmanager.Secret(
            self,
            "JwtSecretKey",
            secret_name=generate_name('jwtkey','dev','secret'),
            description="JWT signing key for development",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_punctuation=True,
                include_space=False,
                password_length=32
            )
        )
        jwt_refresh_secret = secretsmanager.Secret(
            self,
            "JwtRefreshSecretKey",
            secret_name=generate_name('jwt-refresh-key','dev','secret'),
            description="JWT Refresh signing key for development",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_punctuation=True,
                include_space=False,
                password_length=64
            )
        )
        
        
        # Give that role access to DynamoDB tables
        for table in [table_users, table_actuals, table_financials,table_forecasts]:
            table.grant_read_write_data(shared_lambda_role)
            
        # Grant read access to secrets
        for secret in [jwt_secret,jwt_refresh_secret]:
            secret.grant_read(shared_lambda_role)
        
        
        # ---- Global environment dict ----
        global_env = {
            "JWT_SECRET_NAME": jwt_secret.secret_arn,
            "REFRESH_SECRET_NAME":jwt_refresh_secret.secret_arn,
            "TABLE_USERS": table_users.table_name,
            "TABLE_ACTUALS": table_actuals.table_name,
            "TABLE_FINANCIALS": table_financials.table_name,
            "TABLE_FORECAST":table_forecasts.table_name,
            "ENVIRONMENT": "dev",
            "FRONTEND_BASE_URL":"https://localhost:3000/",
            "JWT_EXPIRATION":"3600",
            "ACCESS_TOKEN_EXPIRATION":"3600",
            "APP_NAME":"MyFinancialAdvisor"
            
        }

        
        utils_layer = _lambda.LayerVersion(
            self, "UtilsLayer",
            code=_lambda.Code.from_asset("src/layer"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_12],
            description="Shared utils"
        )
        
        # # --- Lambda functions ---
        authorizer_lambda = _lambda.Function(
            self, generate_name('authorizer', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.authorizer",
            code=_lambda.Code.from_asset("src/authorizer"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer]
        )
        
   

        auth_lambda = _lambda.Function(
            self, generate_name('auth', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/auth"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer]
        )

        public_lambda = _lambda.Function(
            self, generate_name('public', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/public"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer]
        )

        private_lambda = _lambda.Function(
            self, generate_name('private', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/private"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer]
        )
        

        # --- Create the API Gateway ---
        api = apigw.RestApi(
            self,
            generate_name('restapi', 'dev', 'apigateway'),
            rest_api_name="Financial API (dev)",
            endpoint_configuration=apigw.EndpointConfiguration(
                types=[apigw.EndpointType.REGIONAL]
            ),
            deploy_options=apigw.StageOptions(stage_name="dev"),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,  # or list of allowed origins
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allow_headers=["Authorization", "Content-Type", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"],
                max_age=Duration.seconds(3600)
            )
        )
        
        # --- Create Lambda integrations ---
        public_integration = apigw.LambdaIntegration(public_lambda)
        private_integration = apigw.LambdaIntegration(private_lambda)
        
        auth_integration = apigw.LambdaIntegration(auth_lambda)
        
        
        # --- Define a Lambda authorizer ---
        token_authorizer = apigw.TokenAuthorizer(
            self,
            "LambdaTokenAuthorizer",
            handler=authorizer_lambda,
            identity_source=apigw.IdentitySource.header("Authorization")
        )
        

        # /auth (for login/register)
        auth_resource = api.root.add_resource("auth")
        auth_resource.add_method("POST", auth_integration)  # public
        
        # /public (unprotected route)
        public_resource = api.root.add_resource("public")
        public_resource.add_method("GET", public_integration)  # no auth

        # /private (protected route)
        private_resource = api.root.add_resource("private")
        proxy = private_resource.add_resource("{proxy+}")
        proxy.add_method(
            "ANY",
            private_integration,
            authorizer=token_authorizer,
            authorization_type=apigw.AuthorizationType.CUSTOM,
            method_responses=[
                apigw.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Origin": True,
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                    },
                )
            ],
        )

        
        
        # Output API URL
        self.api_url = api.url
        
        
        resources_to_output = {
            "Tables": [table_users, table_actuals, table_financials,table_forecasts],
            "Lambdas": [public_lambda, private_lambda, auth_lambda, authorizer_lambda],
            "Secrets": [jwt_secret,jwt_refresh_secret],
            "Api": [api]
        }
        
        
        # Tables
        for t in resources_to_output["Tables"]:
            CfnOutput(self, f"{t.node.id}Name", value=t.table_name)

        # Lambdas
        for fn in resources_to_output["Lambdas"]:
            CfnOutput(self, f"{fn.node.id}Arn", value=fn.function_arn)

        # Secrets
        for s in resources_to_output["Secrets"]:
            CfnOutput(self, f"{s.node.id}Arn", value=s.secret_arn)

        # API Gateway
        CfnOutput(self, "ApiEndpoint", value=api.url)