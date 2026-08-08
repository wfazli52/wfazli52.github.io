terraform {
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
  type    = string
  default = "us-east-1"
}

variable "instance_id" {
  type        = string
  description = "Disposable lab EC2 instance ID to monitor."
}

resource "aws_cloudwatch_metric_alarm" "status_check_failed" {
  alarm_name          = "abdul-lab-ec2-status-check-failed"
  alarm_description   = "Lab alarm: EC2 instance or system status check failed."
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "missing"

  dimensions = {
    InstanceId = var.instance_id
  }
}

output "alarm_name" {
  value = aws_cloudwatch_metric_alarm.status_check_failed.alarm_name
}
