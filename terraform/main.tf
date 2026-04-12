# Default Provider for Sydney
provider "aws" {
  region = "ap-southeast-2"
}

# Provider for ACM Certificate (Must be in N. Virginia for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# --- S3 BUCKET ---
resource "aws_s3_bucket" "rinnah_bucket" {
  bucket = "rinnah-2026-portal"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  index_document { suffix = "index.html" }
}

# --- PUBLIC ACCESS & POLICY ---
resource "aws_s3_bucket_public_access_block" "public" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "allow_public" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.rinnah_bucket.arn}/*"
    }]
  })
}

# --- ACM SSL CERTIFICATE ---
# Note: This uses the default CloudFront cert if you don't provide a domain.
# If you have a domain, uncomment the lines below and update domain_name.
/*
resource "aws_acm_certificate" "cert" {
  provider          = aws.us_east_1
  domain_name       = "your-domain.com"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}
*/

# --- CLOUDFRONT (HTTPS) ---
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.rinnah_bucket.bucket_regional_domain_name
    origin_id   = "S3-RINNAH"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-RINNAH"

    forwarded_values {
      query_string = true # REQUIRED to keep your ?id=1 parameter working
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Uses *.cloudfront.net HTTPS
    # If using custom domain:
    # acm_certificate_arn = aws_acm_certificate.cert.arn
    # ssl_support_method  = "sni-only"
  }
}

# --- OUTPUTS ---
output "s3_url" {
  value = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "secure_url" {
  description = "Use this URL for HTTPS"
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}