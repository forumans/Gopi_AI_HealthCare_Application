#!/bin/bash

# AWS ECR Build and Push Script for Healthcare Backend
# This script builds the Docker image and pushes it to Amazon ECR

set -e

# Configuration
REGION="us-east-1"
REPO_NAME="healthcare-backend"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
ECR_REPO="${ECR_URI}/${REPO_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting ECR build and push process...${NC}"

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")/../backend"

echo -e "${YELLOW}📁 Project root: $PROJECT_ROOT${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if we're logged into ECR
echo -e "${YELLOW}🔐 Checking ECR login status...${NC}"
if ! aws ecr get-authorization-token --region $REGION > /dev/null 2>&1; then
    echo -e "${RED}❌ Failed to authenticate with AWS ECR. Please check your AWS credentials.${NC}"
    exit 1
fi

# Log in to ECR
echo -e "${YELLOW}🔐 Logging into Amazon ECR...${NC}"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI

# Create repository if it doesn't exist
echo -e "${YELLOW}📦 Creating ECR repository if it doesn't exist...${NC}"
aws ecr describe-repositories --repository-names $REPO_NAME --region $REGION > /dev/null 2>&1 || \
    aws ecr create-repository --repository-name $REPO_NAME --region $REGION --image-scanning-configuration scanOnPush=true

# Build the Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
cd "$PROJECT_ROOT"
docker build -t $REPO_NAME:latest .

# Tag the image for ECR
echo -e "${YELLOW}🏷️  Tagging image for ECR...${NC}"
docker tag $REPO_NAME:latest $ECR_REPO:latest

# Generate a unique tag based on commit hash (if in git repo)
if [ -d ".git" ]; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    UNIQUE_TAG="${COMMIT_HASH}-${TIMESTAMP}"
    
    echo -e "${YELLOW}🏷️  Tagging image with unique tag: $UNIQUE_TAG${NC}"
    docker tag $REPO_NAME:latest $ECR_REPO:$UNIQUE_TAG
fi

# Push the image to ECR
echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker push $ECR_REPO:latest

if [ ! -z "$UNIQUE_TAG" ]; then
    echo -e "${YELLOW}📤 Pushing tagged image to ECR...${NC}"
    docker push $ECR_REPO:$UNIQUE_TAG
fi

# Clean up local images (optional)
echo -e "${YELLOW}🧹 Cleaning up local images...${NC}"
docker rmi $REPO_NAME:latest 2>/dev/null || true
docker rmi $ECR_REPO:latest 2>/dev/null || true

if [ ! -z "$UNIQUE_TAG" ]; then
    docker rmi $ECR_REPO:$UNIQUE_TAG 2>/dev/null || true
fi

echo -e "${GREEN}✅ Successfully built and pushed image to ECR!${NC}"
echo -e "${GREEN}📍 ECR Repository: $ECR_REPO${NC}"

if [ ! -z "$UNIQUE_TAG" ]; then
    echo -e "${GREEN}🏷️  Unique Tag: $UNIQUE_TAG${NC}"
fi

echo -e "${GREEN}🎉 Build and push process completed!${NC}"
