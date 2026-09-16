resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.ssh_key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_app_profile.name

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    github_repo_ssh_url = var.github_repo_ssh_url
    domain_name          = aws_eip.app_server.public_ip
    db_host              = aws_db_instance.mysql.address
    db_name              = var.db_name
    db_username          = var.db_username
    db_password          = var.db_password
    jwt_secret           = random_password.jwt_secret.result
    aws_region           = var.aws_region
    s3_bucket_name       = local.s3_bucket_name
  })

  tags = { Name = "${var.project_name}-app-server" }
}

resource "aws_eip" "app_server" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-app-eip" }
}

resource "aws_eip_association" "app_server" {
  instance_id   = aws_instance.app_server.id
  allocation_id = aws_eip.app_server.id
}
