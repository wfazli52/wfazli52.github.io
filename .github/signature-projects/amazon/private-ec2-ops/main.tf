terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  description = "AWS region for the disposable lab."
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  description = "Small instance type for the lab."
  default     = "t3.micro"
}

data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_vpc" "lab" {
  cidr_block           = "10.61.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "abdul-private-ops-lab" }
}

resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = "10.61.10.0/24"
  map_public_ip_on_launch = false

  tags = { Name = "abdul-private-ops" }
}

resource "aws_security_group" "instance" {
  name        = "abdul-private-instance"
  description = "No inbound administration ports. Egress is allowed for private service endpoints."
  vpc_id      = aws_vpc.lab.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "endpoints" {
  name        = "abdul-ssm-endpoints"
  description = "Allow HTTPS from the lab VPC to SSM-related interface endpoints."
  vpc_id      = aws_vpc.lab.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.lab.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "instance" {
  name = "abdul-private-ops-ssm"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "instance" {
  name = "abdul-private-ops"
  role = aws_iam_role.instance.name
}

locals {
  interface_services = toset([
    "ssm",
    "ssmmessages",
    "ec2messages"
  ])
}

resource "aws_vpc_endpoint" "ssm" {
  for_each            = local.interface_services
  vpc_id              = aws_vpc.lab.id
  service_name        = "com.amazonaws.${var.aws_region}.${each.value}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private.id]
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true

  tags = { Name = "abdul-${each.value}" }
}

resource "aws_instance" "lab" {
  ami                         = data.aws_ssm_parameter.al2023.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.private.id
  associate_public_ip_address = false
  vpc_security_group_ids      = [aws_security_group.instance.id]
  iam_instance_profile        = aws_iam_instance_profile.instance.name

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = { Name = "abdul-private-ssm-node" }
}

output "instance_id" {
  value = aws_instance.lab.id
}

output "private_ip" {
  value = aws_instance.lab.private_ip
}

output "public_ip" {
  value       = aws_instance.lab.public_ip
  description = "Expected to be empty."
}

output "ssm_endpoint_ids" {
  value = { for name, endpoint in aws_vpc_endpoint.ssm : name => endpoint.id }
}
