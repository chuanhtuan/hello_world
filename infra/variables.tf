variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  description = "Named AWS CLI profile to use (configured for account 610734023706 / chuanhtuan)"
  type        = string
  default     = "chuanhtuan"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Short name used to prefix resource names"
  type        = string
  default     = "hello-world"
}

variable "aws_account_id" {
  description = "AWS account ID resources are deployed into (used to build globally-unique names)"
  type        = string
  default     = "610734023706"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (EC2 app server)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (RDS)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the backend app server"
  type        = string
  default     = "t3.micro"
}

variable "ssh_key_name" {
  description = "Name of an existing EC2 key pair (for SSH access). Create one in the AWS console first, e.g. `hello-world-key`."
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into the EC2 instance (restrict to your IP, e.g. 1.2.3.4/32)"
  type        = string
}

variable "db_name" {
  description = "MySQL database name"
  type        = string
  default     = "hello_world"
}

variable "db_username" {
  description = "MySQL master username"
  type        = string
  default     = "hello_world_app"
}

variable "db_password" {
  description = "MySQL master password (min 8 chars). Pass via TF_VAR_db_password or a .tfvars file that is gitignored."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "github_repo_ssh_url" {
  description = "SSH URL of the GitHub repo the EC2 instance will clone/pull on deploy"
  type        = string
  default     = "git@github.com:chuanhtuan/hello_world.git"
}
