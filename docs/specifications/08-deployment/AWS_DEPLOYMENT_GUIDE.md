# 🚀 AWS Deployment Guide for Healthcare Application

## 📋 Overview

This guide provides a complete step-by-step process for deploying the Healthcare SaaS application to AWS using a scalable, production-ready architecture.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│     S3 Bucket   │────│  React Frontend │
│      CDN        │    │   (Static)      │    │     Build       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │ Application     │
                       │ Load Balancer   │
                       │     (ALB)       │
                       └─────────────────┘
                                │
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   ECS Fargate   │────│   AWS RDS       │
                       │  (FastAPI App)  │    │  (PostgreSQL)   │
                       └─────────────────┘    └─────────────────┘
```

## 📁 Final Project Structure

```
HealthCare_Application/
├── backend/                   # ✅ FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes + health checks
│   │   ├── core/              # Config, security, AWS secrets
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Custom middleware
│   │   └── main.py            # FastAPI entrypoint
│   ├── Dockerfile             # ✅ Production-ready container
│   ├── requirements.txt       # ✅ Dependencies with AWS support
│   └── .env.example           # ✅ Environment template
├── frontend/                  # ✅ React Frontend
│   ├── src/
│   ├── dist/                  # Build output
│   ├── vite.config.ts         # ✅ Production optimized
│   └── .env.example           # ✅ Environment template
├── infrastructure/            # ✅ AWS Deployment Scripts
│   ├── ecs/
│   │   └── task-definition.json
│   ├── ecr/
│   │   └── build-and-push.sh
│   ├── s3/
│   │   └── deploy-frontend.sh
│   ├── alb/
│   │   └── application-load-balancer.json
│   ├── security/
│   │   └── security-groups.json
│   └── rds/
├── .github/workflows/         # ✅ CI/CD Pipelines
│   ├── backend-deploy.yml
│   └── frontend-deploy.yml
└── docs/                      # ✅ Documentation
```

## 🚀 Deployment Steps

### Phase 1: AWS Account Setup

#### 1.1 Prerequisites
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Node.js 18+ and Python 3.11+

#### 1.2 Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region name: us-east-1
# Enter default output format: json
```

### Phase 2: Backend Deployment (FastAPI)

#### 2.1 Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name healthcare-backend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

#### 2.2 Build and Push Docker Image
```bash
cd infrastructure/ecr
chmod +x build-and-push.sh
./build-and-push.sh
```

#### 2.3 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name healthcare-cluster \
  --region us-east-1
```

#### 2.4 Create Task Definition
```bash
# Update task-definition.json with your AWS Account ID
# Replace ACCOUNT-ID with your actual AWS account ID

aws ecs register-task-definition \
  --cli-input-json file://infrastructure/ecs/task-definition.json
```

#### 2.5 Create Application Load Balancer
```bash
aws elbv2 create-load-balancer \
  --name healthcare-backend-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyy-yyyy \
  --security-groups sg-xxxxxxxxx \
  --scheme internet-facing \
  --type application
```

#### 2.6 Create Target Group
```bash
aws elbv2 create-target-group \
  --name healthcare-backend-targets \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxxxxxx \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3
```

#### 2.7 Create ECS Service
```bash
aws ecs create-service \
  --cluster healthcare-cluster \
  --service-name healthcare-backend-service \
  --task-definition healthcare-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:account-id:targetgroup/healthcare-backend-targets,containerName=healthcare-backend,containerPort=8000"
```

### Phase 3: Frontend Deployment (React)

#### 3.1 Create S3 Bucket
```bash
aws s3 mb s3://healthcare-frontend-bucket
aws s3 website s3://healthcare-frontend-bucket \
  --index-document index.html \
  --error-document index.html
```

#### 3.2 Build and Deploy Frontend
```bash
cd infrastructure/s3
chmod +x deploy-frontend.sh

# Update the script with your bucket name and CloudFront ID
./deploy-frontend.sh
```

#### 3.3 Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "healthcare-frontend-2026",
    "Comment": "Healthcare frontend distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3-healthcare-frontend-bucket",
        "DomainName": "healthcare-frontend-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-healthcare-frontend-bucket",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
  }'
```

### Phase 4: Security Configuration

#### 4.1 Create Secrets in AWS Secrets Manager
```bash
# Database URL Secret
aws secretsmanager create-secret \
  --name healthcare-db-url \
  --secret-string '{"DATABASE_URL": "postgresql+asyncpg://user:password@rds-endpoint:5432/dbname"}'

# JWT Secret
aws secretsmanager create-secret \
  --name healthcare-jwt-secret \
  --secret-string '{"JWT_SECRET": "your-super-secret-jwt-key"}'

# CORS Origins
aws secretsmanager create-secret \
  --name healthcare-cors-origins \
  --secret-string '{"CORS_ORIGINS": "https://your-domain.com"}'
```

#### 4.2 Update Task Definition with Secrets
Edit `infrastructure/ecs/task-definition.json` to use the secret ARNs.

### Phase 5: CI/CD Setup

#### 5.1 GitHub Actions Secrets
Set these in your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

#### 5.2 Update Environment Variables
Update `.github/workflows/backend-deploy.yml` and `.github/workflows/frontend-deploy.yml` with your actual values:
- `S3_BUCKET`: Your S3 bucket name
- `CF_DISTRIBUTION_ID`: Your CloudFront distribution ID
- `ECS_CLUSTER`: Your ECS cluster name
- `ECS_SERVICE`: Your ECS service name

## 🔧 Environment Configuration

### Backend Environment Variables
Copy `server/.env.example` to `server/.env` and update:

```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:password@rds-endpoint:5432/dbname
JWT_SECRET=your-super-secret-key
CORS_ORIGINS=https://your-domain.com

# Optional
AWS_SECRETS_MANAGER_ENABLED=true
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:account-id:secret:healthcare-jwt-secret
DATABASE_URL_ARN=arn:aws:secretsmanager:us-east-1:account-id:secret:healthcare-db-url
```

### Frontend Environment Variables
Copy `frontend/.env.example` to `frontend/.env` and update:

```bash
VITE_API_BASE_URL=https://your-alb-domain.com/api
```

## 🔍 Health Checks

### Backend Health Endpoints
- **Basic Health**: `GET /api/health`
- **Readiness Check**: `GET /api/health/ready`
- **Liveness Check**: `GET /api/health/live`

### Testing Health Checks
```bash
# Test health endpoint
curl https://your-alb-domain.com/api/health

# Expected response
{
  "status": "healthy",
  "service": "healthcare-backend",
  "database": "connected",
  "version": "1.0.0"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check RDS security groups allow ECS access
# Verify DATABASE_URL is correct
# Check VPC routing
```

#### Frontend Not Loading
```bash
# Check S3 bucket policy
# Verify CloudFront distribution
# Check API_BASE_URL environment variable
```

#### Container Health Check Failing
```bash
# Check health endpoint is accessible
# Verify port 8000 is exposed
# Check Docker logs
```

### Debug Commands

#### ECS Service Issues
```bash
aws ecs describe-services --cluster healthcare-cluster --services healthcare-backend-service
aws ecs describe-tasks --cluster healthcare-cluster --tasks task-id
```

#### Load Balancer Issues
```bash
aws elbv2 describe-load-balancers --names healthcare-backend-alb
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/healthcare-targets
```

## 📊 Production Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] SSL certificates configured
- [ ] Security groups properly set
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking enabled

### Post-deployment
- [ ] Health endpoints responding
- [ ] Database connectivity verified
- [ ] Frontend loading correctly
- [ ] API endpoints accessible
- [ ] Logs being collected
- [ ] Metrics being tracked
- [ ] User testing completed

## 🔄 CI/CD Pipeline

### Backend Deployment Flow
1. **Code Push** → GitHub Actions triggered
2. **Tests Run** → Unit and integration tests
3. **Docker Build** → Create production image
4. **Push to ECR** → Store in container registry
5. **Update ECS** → Deploy new task definition
6. **Health Check** → Verify deployment success

### Frontend Deployment Flow
1. **Code Push** → GitHub Actions triggered
2. **Tests Run** → Type checking and unit tests
3. **Build App** → Create production bundle
4. **Deploy to S3** → Upload static files
5. **CloudFront** → Invalidate CDN cache
6. **Health Check** → Verify deployment success

## 📞 Support

### AWS Documentation
- [ECS User Guide](https://docs.aws.amazon.com/ecs/)
- [Fargate User Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [ECR User Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/)
- [CloudFront User Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)

### Common Commands
```bash
# Check ECS service status
aws ecs describe-services --cluster healthcare-cluster --services healthcare-backend-service

# View CloudWatch logs
aws logs tail /ecs/healthcare-backend --follow

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR-DISTRIBUTION-ID
```

---

## 🎉 Success!

Your healthcare application is now running on AWS with:
- ✅ Scalable backend on ECS Fargate
- ✅ Fast frontend on CloudFront CDN
- ✅ Secure database on RDS
- ✅ Automated CI/CD pipelines
- ✅ Production-ready monitoring

**🚀 Your Healthcare SaaS platform is live and ready for users!**
