output "app_server_public_ip" {
  description = "Elastic IP of the EC2 app server"
  value       = aws_eip.app_server.public_ip
}

output "app_server_id" {
  value = aws_instance.app_server.id
}

output "rds_endpoint" {
  description = "RDS MySQL connection endpoint (host:port)"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "RDS MySQL host (without port)"
  value       = aws_db_instance.mysql.address
}

output "s3_bucket_name" {
  value = aws_s3_bucket.avatars.bucket
}

output "jwt_secret" {
  value     = random_password.jwt_secret.result
  sensitive = true
}
