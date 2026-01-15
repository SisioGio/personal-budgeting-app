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
    return f"finalyze-{name}-{env}-{type}"
class MyApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, db_host,db_user,db_password,**kwargs):
        super().__init__(scope, construct_id, **kwargs)

        
        # Create one shared execution role
        shared_lambda_role = iam.Role(
            self, generate_name('lambdarole','dev','table'),
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )



        
        
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
        # db secret name
        db_secret = secretsmanager.Secret.from_secret_name_v2(self,"DbSecretName","rds!db-efc52989-89c8-4009-a2c3-e211a33ba1bd")
        

            
        # Grant read access to secrets
        for secret in [jwt_secret,jwt_refresh_secret,db_secret]:
            secret.grant_read(shared_lambda_role)
        
        
        # ---- Global environment dict ----
        global_env = {
            "JWT_SECRET_NAME": jwt_secret.secret_arn,
            "REFRESH_SECRET_NAME":jwt_refresh_secret.secret_arn,
            "ENVIRONMENT": "dev",
            "FRONTEND_BASE_URL":"https://localhost:3000/",
            "JWT_EXPIRATION":"3600",
            "ACCESS_TOKEN_EXPIRATION":"3600",
            "APP_NAME":"MyFinancialAdvisor",
            "DB_USER":db_user,
            "DB_PASSWORD":db_password,
            "DB_HOST":db_host,
            "DB_NAME":'budget',
            "DB_PORT":'5432',
            "JWT_SECRET_NAME":"finalyze-jwtkey-dev-secret",
            "JWT_REFRESH_SECRET_NAME":"finalyze-jwt-refresh-key-dev-secret",
            "DB_SECRET_NAME":"rds!db-efc52989-89c8-4009-a2c3-e211a33ba1bd",
            "ACCESS_TOKEN_EXPIRATION":"600",
            "REFRESH_TOKEN_EXPIRATION":"86400",
            "DEFAULT_CORS_ORIGIN":"https://finalyze.alessiogiovannini.com"
            
        }
        

        
        utils_layer = _lambda.LayerVersion(
            self, "UtilsLayer",
            code=_lambda.Code.from_asset("layer"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_12],
            description="Shared utils"
        )
        
        common_layer = _lambda.LayerVersion(
            self, "CommonLayer",
            code=_lambda.Code.from_asset("src/common"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_12],
            description="Shared Functions"
        )
        # Lambda functions ---
        authorizer_lambda = _lambda.Function(
            self, generate_name('authorizer', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.authorizer",
            code=_lambda.Code.from_asset("src/authorizer"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer]
        )
        
   

        auth_lambda = _lambda.Function(
            self, generate_name('auth', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/auth"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            timeout=Duration.seconds(90),
            memory_size=1024
        )

        public_lambda = _lambda.Function(
            self, generate_name('public', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/public"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer]
        )

        private_lambda = _lambda.Function(
            self, generate_name('private', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/private"),
            environment=global_env,
            role=shared_lambda_role,
            timeout= Duration.seconds(30),
            layers=[utils_layer,common_layer],
            memory_size=2048
            
        )
        
        actuals_lambda = _lambda.Function(
            self, generate_name('actuals', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/actuals"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
        )
        
        category_lambda = _lambda.Function(
            self, generate_name('category', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/category"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
        )
        
        entries_lambda = _lambda.Function(
            self, generate_name('entries', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/entries"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
        )
        scenario_lambda = _lambda.Function(
            self, generate_name('scenario', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/scenario"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
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
                allow_origins=[
                    "http://localhost:3000",
                    "https://finalyze.alessiogiovannini.com"
                ],
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allow_headers=["Authorization", "Content-Type", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"],
                allow_credentials=True,
                max_age=Duration.seconds(3600)
            )
        )
        
        # --- Create Lambda integrations ---
        public_integration = apigw.LambdaIntegration(public_lambda)
        private_integration = apigw.LambdaIntegration(private_lambda)
        actuals_integration = apigw.LambdaIntegration(actuals_lambda)
        category_integration = apigw.LambdaIntegration(category_lambda)
        entries_integration = apigw.LambdaIntegration(entries_lambda)
        scenario_integration = apigw.LambdaIntegration(scenario_lambda)
        auth_integration = apigw.LambdaIntegration(auth_lambda)
        
        
        # --- Define a Lambda authorizer ---
        authorizer = apigw.RequestAuthorizer(
            self,
            "LambdaRequestAuthorizer",
            handler=authorizer_lambda,
            identity_sources=[
                apigw.IdentitySource.header("Cookie")
            ],
            results_cache_ttl=Duration.seconds(0)  # disable cache while debugging
        )
        

        # /auth (for login/register)
        auth_resource = api.root.add_resource("auth")
        proxy = auth_resource.add_resource("{proxy+}")
        proxy.add_method(
            "ANY",
            auth_integration,
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
        
        
        # /public (unprotected route)
        public_resource = api.root.add_resource("public")
        proxy = public_resource.add_resource("{proxy+}")
        
        proxy.add_method(
            "ANY",
            public_integration,
            authorizer=authorizer,
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

        # /private (protected route)
        private_resource = api.root.add_resource("private")
        proxy = private_resource.add_resource("{proxy+}")
        proxy.add_method(
            "ANY",
            private_integration,
            authorizer=authorizer,
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
        
        
        # /actuals (protected route)
        actuals_resource = api.root.add_resource("actuals")
        # proxy = actuals_resource.add_resource("{proxy+}")
        actuals_resource.add_method(
            "ANY",
            actuals_integration,
            authorizer=authorizer,
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
        
        # /category (protected route)
        category_resource = api.root.add_resource("category")
        # proxy = category_resource.add_resource("{proxy+}")
        category_resource.add_method(
            "ANY",
            category_integration,
            authorizer=authorizer,
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
        
        # /entries (protected route)
        entries_resource = api.root.add_resource("entries")
        # proxy = entries_resource.add_resource("{proxy+}")
        entries_resource.add_method(
            "ANY",
            entries_integration,
            authorizer=authorizer,
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
        
        
        # /scenario (protected route)
        scenario_resource = api.root.add_resource("scenario")
        # proxy = scenario_resource.add_resource("{proxy+}")
        scenario_resource.add_method(
            "ANY",
            scenario_integration,
            authorizer=authorizer,
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
            "Lambdas": [public_lambda, private_lambda, auth_lambda, authorizer_lambda],
            "Secrets": [jwt_secret,jwt_refresh_secret],
            "Api": [api]
        }
        
        


        # Lambdas
        for fn in resources_to_output["Lambdas"]:
            CfnOutput(self, f"{fn.node.id}Arn", value=fn.function_arn)

        # Secrets
        for s in resources_to_output["Secrets"]:
            CfnOutput(self, f"{s.node.id}Arn", value=s.secret_arn)

        # API Gateway
        CfnOutput(self, "ApiEndpoint", value=api.url)