#!/bin/bash

# AWS S3 Frontend Deployment Script
# This script builds the React frontend and deploys it to S3 with CloudFront invalidation

set -e

# Configuration
S3_BUCKET="healthcare-frontend-bucket"
CF_DISTRIBUTION_ID="YOUR-CLOUDFRONT-DISTRIBUTION-ID"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting frontend deployment to S3...${NC}"

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")/../frontend"

echo -e "${YELLOW}📁 Frontend project root: $PROJECT_ROOT${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Node.js/npm is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if we're in the frontend directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the correct location.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd "$PROJECT_ROOT"
npm ci --silent

# Build the React application
echo -e "${YELLOW}🔨 Building React application for production...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed. dist directory not found.${NC}"
    exit 1
fi

# Sync files to S3
echo -e "${YELLOW}📤 Syncing files to S3 bucket: $S3_BUCKET${NC}"
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --delete \
    --exclude ".DS_Store" \
    --exclude "Thumbs.db"

# Set index.html for SPA routing
echo -e "${YELLOW}🔧 Setting up SPA routing for index.html...${NC}"
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
    --content-type "text/html" \
    --cache-control "max-age=0,no-cache,no-store,must-revalidate"

# Set cache headers for static assets
echo -e "${YELLOW}🔧 Setting cache headers for static assets...${NC}"

# JS/CSS files - long cache
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --exclude "*" \
    --include "*.js" \
    --include "*.css" \
    --cache-control "max-age=31536000,immutable"

# Images - long cache
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --exclude "*" \
    --include "*.png" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.gif" \
    --include "*.svg" \
    --include "*.ico" \
    --include "*.webp" \
    --cache-control "max-age=31536000"

# Create CloudFront invalidation
echo -e "${YELLOW}🔄 Creating CloudFront invalidation...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CF_DISTRIBUTION_ID \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)

echo -e "${YELLOW}⏳ Waiting for CloudFront invalidation to complete...${NC}"
aws cloudfront wait invalidation-completed \
    --distribution-id $CF_DISTRIBUTION_ID \
    --id $INVALIDATION_ID

# Get the distribution domain name
DOMAIN_NAME=$(aws cloudfront get-distribution \
    --id $CF_DISTRIBUTION_ID \
    --query "Distribution.DomainName" \
    --output text)

echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
echo -e "${GREEN}📍 S3 Bucket: $S3_BUCKET${NC}"
echo -e "${GREEN}🌐 CloudFront Domain: https://$DOMAIN_NAME${NC}"
echo -e "${GREEN}🔄 Invalidation ID: $INVALIDATION_ID${NC}"

echo -e "${GREEN}🎉 Frontend deployment completed!${NC}"
echo -e "${GREEN}🌐 Your application is now available at: https://$DOMAIN_NAME${NC}"
