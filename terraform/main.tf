provider "aws" {
  region = "ap-southeast-2"
}

resource "aws_s3_bucket" "rinnah_bucket" {
  bucket = "rinnah-2026-portal"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.rinnah_bucket.id
  index_document { suffix = "index.html" }
}

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