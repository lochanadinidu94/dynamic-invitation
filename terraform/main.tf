provider "aws" {
  region = "ap-southeast-2"
}

# --- 1. S3 BUCKET FOR STATIC WEBSITE ---
resource "aws_s3_bucket" "rinnah_bucket" {
  bucket = "rinnah-2026-portal"
}

resource "aws_s3_bucket_website_configuration" "web_config" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "public_read_policy" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.rinnah_bucket.arn}/*"
    }]
  })
}

# --- 2. LAMBDA FUNCTION ---
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda_function.py"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "rsvp_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "rinnah-rsvp-handler"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# --- 3. IAM ROLE FOR LAMBDA ---
resource "aws_iam_role" "lambda_exec_role" {
  name = "rinnah_lambda_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_s3_access" {
  role = aws_iam_role.lambda_exec_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.rinnah_bucket.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# --- 4. API GATEWAY (HTTP API) ---
resource "aws_apigatewayv2_api" "rsvp_api" {
  name          = "rinnah-rsvp-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.rsvp_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.rsvp_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "rsvp_route" {
  api_id    = aws_apigatewayv2_api.rsvp_api.id
  route_key = "POST /rsvp"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "prod_stage" {
  api_id      = aws_apigatewayv2_api.rsvp_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rsvp_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.rsvp_api.execution_arn}/*/*"
}

# --- 5. OUTPUTS ---
output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.web_config.website_endpoint
}

output "rsvp_api_endpoint" {
  value = "${aws_apigatewayv2_api.rsvp_api.api_endpoint}/rsvp"
}