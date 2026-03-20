You are an expert cloud architect and full-stack engineer. I have a healthcare SaaS application built with the following stack:

* Backend: Python with FastAPI
* Frontend: React with TypeScript
* Database: PostgreSQL (already migrated to AWS RDS)
* Current state: Monolithic local application

I want to refactor and restructure this application for deployment on AWS using a scalable, modular, and production-ready architecture.

Target AWS Architecture:

* Frontend hosted on Amazon S3 and served via CloudFront CDN
* Backend deployed as a containerized FastAPI service on AWS ECS (Fargate)
* Database hosted on Amazon RDS (PostgreSQL)
* Optional: Use AWS Secrets Manager for storing sensitive credentials
* Optional: Use Application Load Balancer (ALB) for routing traffic to backend services

Your task is to:

1. **Analyze and Decompose the Application**

   * Break the monolithic project into clearly defined components:

     * frontend/
     * backend/
     * shared/ (if needed)
     * infrastructure/ (IaC-ready structure)
   * Identify boundaries between frontend and backend responsibilities
   * Ensure backend is stateless and suitable for containerization

2. **Restructure Backend (FastAPI)**

   * Organize backend into:

     * app/

       * api/
       * models/
       * schemas/
       * services/
       * db/
       * core/ (config, security, settings)
   * Externalize configuration using environment variables
   * Replace local DB connection with AWS RDS connection using DATABASE_URL
   * Ensure async DB usage (asyncpg)
   * Add health check endpoint (/health)

3. **Prepare Backend for Containerization**

   * Generate a production-ready Dockerfile
   * Add requirements.txt or poetry config
   * Ensure proper startup command (uvicorn/gunicorn)
   * Remove local dependencies and OS-specific assumptions

4. **Restructure Frontend (React + TypeScript)**

   * Ensure environment-based API configuration (e.g., VITE_API_URL)
   * Separate build and runtime configs
   * Optimize for static build output (npm run build)
   * Ensure API calls point to backend (via ALB endpoint)

5. **Define Infrastructure Structure**

   * Create a folder structure for infrastructure:

     * infrastructure/

       * ecs/
       * ecr/
       * rds/
       * s3/
       * cloudfront/
       * alb/
   * Provide Terraform or AWS CLI templates (optional)

6. **Environment Configuration**

   * Define required environment variables:

     * DATABASE_URL
     * SECRET_KEY
     * API_BASE_URL
   * Ensure secrets are not hardcoded
   * Recommend AWS Secrets Manager usage

7. **Deployment Strategy**

   * Backend:

     * Build Docker image
     * Push to ECR
     * Deploy via ECS Fargate
   * Frontend:

     * Build React app
     * Upload to S3
     * Serve via CloudFront
   * Explain CI/CD approach (GitHub Actions preferred)

8. **Networking and Security**

   * Ensure backend can connect to RDS securely
   * Recommend VPC setup (public/private subnets)
   * Configure security groups:

     * ALB → ECS
     * ECS → RDS
   * Avoid public DB exposure in production

9. **Provide Final Deliverables**

   * Suggested folder structure
   * Sample Dockerfile
   * Sample environment config (.env)
   * Deployment steps checklist
   * Any code snippets needed for migration

Constraints:

* Keep solution practical and implementable
* Avoid overengineering
* Focus on real-world deployment readiness
* Prefer AWS-native services

Output format:

* Clear sections
* Folder structures in tree format
* Code snippets where needed
* Step-by-step actionable guidance
