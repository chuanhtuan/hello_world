locals {
  s3_bucket_name = "${var.project_name}-avatars-${var.aws_account_id}"
}

resource "aws_s3_bucket" "avatars" {
  bucket = local.s3_bucket_name

  tags = { Name = "${var.project_name}-avatars" }
}

resource "aws_s3_bucket_public_access_block" "avatars" {
  bucket = aws_s3_bucket.avatars.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "avatars" {
  bucket = aws_s3_bucket.avatars.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_cors_configuration" "avatars" {
  bucket = aws_s3_bucket.avatars.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# Avatars are served as public read-only images (profile pictures);
# uploads are only ever performed server-side via the backend's IAM role.
resource "aws_s3_bucket_policy" "avatars_public_read" {
  bucket = aws_s3_bucket.avatars.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadAvatars",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.avatars.arn}/avatars/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.avatars]
}
