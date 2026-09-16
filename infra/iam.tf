data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_app_role" {
  name               = "${var.project_name}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

data "aws_iam_policy_document" "s3_avatar_access" {
  statement {
    actions = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.avatars.arn}/avatars/*"]
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.avatars.arn]
  }
}

resource "aws_iam_policy" "s3_avatar_access" {
  name   = "${var.project_name}-s3-avatar-access"
  policy = data.aws_iam_policy_document.s3_avatar_access.json
}

resource "aws_iam_role_policy_attachment" "ec2_s3_access" {
  role       = aws_iam_role.ec2_app_role.name
  policy_arn = aws_iam_policy.s3_avatar_access.arn
}

resource "aws_iam_instance_profile" "ec2_app_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_app_role.name
}
