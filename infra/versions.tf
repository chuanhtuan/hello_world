terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Optional remote state backend. Uncomment and fill in once you've
  # created an S3 bucket + DynamoDB table for state locking, or leave
  # commented to use local state for a first deploy.
  # backend "s3" {
  #   bucket         = "hello-world-tfstate-610734023706"
  #   key            = "hello-world/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "hello-world-tf-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "hello-world"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
