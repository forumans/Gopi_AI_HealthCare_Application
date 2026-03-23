# 🚀 AWS Quick Deployment Checklist

### 1) Set up AWS credentials in GitHub Actions
- [ ] In GitHub repo: Settings → Secrets and variables → Actions
- [ ] Add secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- [ ] Verify IAM user has permissions for ECS, ECR, S3, CloudFront, Secrets Manager, and CloudWatch

### 2) Create ECR repository and ECS cluster
- [ ] Create ECR repository
```bash
aws ecr create-repository --repository-name healthcare-backend --region us-east-1 --image-scanning-configuration scanOnPush=true
```
- [ ] Create ECS cluster
```bash
aws ecs create-cluster --cluster-name healthcare-cluster --region us-east-1
```
- [ ] (Optional) Enable container insights for monitoring
```bash
aws ecs update-cluster-settings --cluster healthcare-cluster --settings name=containerInsights,value=enabled
```

### 3) Configure environment variables for production
- [ ] Create database URL secret in Secrets Manager
```bash
aws secretsmanager create-secret --name healthcare-db-url --secret-string '{"DATABASE_URL": "postgresql+asyncpg://user:pass@host:5432/db"}'
```
- [ ] Create JWT secret
```bash
aws secretsmanager create-secret --name healthcare-jwt-secret --secret-string '{"JWT_SECRET": "strong-production-secret"}'
```
- [ ] Create CORS origins secret
```bash
aws secretsmanager create-secret --name healthcare-cors-origins --secret-string '{"CORS_ORIGINS": "https://your-domain.com"}'
```
- [ ] Note the secret ARNs for next step

### 4) Deploy first version using the scripts provided
#### Backend (ECS/Fargate)
- [ ] Update `infrastructure/ecs/task-definition.json`:
  - Replace `ACCOUNT-ID` with your AWS account ID
  - Replace secret ARNs with actual values from step 3
- [ ] Build and push Docker image
```bash
cd infrastructure/ecr
chmod +x build-and-push.sh
./build-and-push.sh
```
- [ ] Register ECS task definition
```bash
aws ecs register-task-definition --cli-input-json file://infrastructure/ecs/task-definition.json
```
- [ ] Create Application Load Balancer (ALB)
```bash
aws elbv2 create-load-balancer --name healthcare-backend-alb --subnets subnet-xxx subnet-yyy --security-groups sg-xxx --scheme internet-facing --type application
```
- [ ] Create target group with health check
```bash
aws elbv2 create-target-group --name healthcare-backend-targets --protocol HTTP --port 8000 --vpc-id vpc-xxx --health-check-path /api/health --health-check-interval-seconds 30 --health-check-timeout-seconds 5 --healthy-threshold-count 2 --unhealthy-threshold-count 3
```
- [ ] Create ECS service
```bash
aws ecs create-service --cluster healthcare-cluster --service-name healthcare-backend-service --task-definition healthcare-backend --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```
- [ ] Configure ALB listener to forward to target group

#### Frontend (S3/CloudFront)
- [ ] Create S3 bucket (unique name)
```bash
aws s3 mb s3://your-unique-healthcare-frontend-bucket
```
- [ ] Enable static website hosting on the bucket
- [ ] Set bucket policy for public read access
- [ ] Build React app
```bash
cd frontend
npm run build
```
- [ ] Deploy to S3
```bash
cd ../infrastructure/s3
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```
- [ ] Create CloudFront distribution with S3 origin
- [ ] Configure default root object (`index.html`)
- [ ] Set up custom error pages for SPA routing

### 5) Test all functionality in AWS environment
- [ ] Backend health check: `http://<ALB-DNS>/api/health`
- [ ] Backend docs: `http://<ALB-DNS>/docs`
- [ ] Frontend loads via CloudFront domain
- [ ] Test API calls from frontend to backend
- [ ] Verify CORS is working
- [ ] Test authentication flow
- [ ] Test database connectivity (via health endpoint)

### 6) Set up monitoring and alerting
- [ ] Enable CloudWatch container insights (if not done in step 2)
- [ ] Create CloudWatch alarms for:
  - ECS service CPU/memory utilization
  - ALB unhealthy host count
  - ALB target group response time
- [ ] Set up CloudWatch log groups for ECS (`/ecs/healthcare-backend`)
- [ ] Enable CloudFront access logs
- [ ] Configure S3 access logs (optional)
- [ ] Set up AWS Budgets alerts (optional)

---

## 🎯 Post-deployment verification

- [ ] All services are running: ECS service, ALB, S3, CloudFront
- [ ] Health checks are passing
- [ ] Application is accessible via CloudFront domain
- [ ] CI/CD workflows trigger on pushes to main/master
- [ ] Logs are flowing to CloudWatch
- [ ] Monitoring alarms are configured

---

## 📝 One-time manual setup notes

- Replace placeholder values (`subnet-xxx`, `sg-xxx`, `vpc-xxx`, `your-domain.com`) with your actual AWS resources
- Ensure your IAM role has permissions for all services listed
- For production, consider:
  - Multi-AZ deployment for RDS (if using RDS)
  - Auto-scaling policies for ECS
  - WAF for CloudFront
  - Custom domain with ACM SSL certificate

---

## 🚀 Rollback plan

- If deployment fails:
  - ECS: `aws ecs update-service --cluster healthcare-cluster --service healthcare-backend-service --desired-count 0`
  - Frontend: Restore previous S3 content or disable CloudFront distribution
  - Use previous task definition revision if needed

---

**This checklist combines your 6-step list with the concrete substeps from the deployment guide.**
