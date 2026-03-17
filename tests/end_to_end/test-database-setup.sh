#!/bin/bash

# Test Database Setup Script for Healthcare Application
# This script creates and populates a test database for end-to-end testing

set -e

# Database configuration
TEST_DB_NAME="healthcare_test"
TEST_DB_USER="postgres"
TEST_DB_PASSWORD="postgres"
TEST_DB_HOST="localhost"
TEST_DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up test database for Healthcare Application...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER; then
    echo -e "${RED}Error: PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    exit 1
fi

# Create test database
echo -e "${YELLOW}Creating test database: $TEST_DB_NAME${NC}"
createdb -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER $TEST_DB_NAME || {
    echo -e "${YELLOW}Database might already exist. Continuing...${NC}"
}

# Apply the test setup script
echo -e "${YELLOW}Populating test database with test data...${NC}"
psql -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER -d $TEST_DB_NAME -f test-setup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test database setup completed successfully!${NC}"
    echo -e "${GREEN}📊 Test database: $TEST_DB_NAME${NC}"
    echo -e "${GREEN}👤 Test users created:${NC}"
    echo -e "${GREEN}   - Admin: admin@test.com (password: password123)${NC}"
    echo -e "${GREEN}   - Doctor: doctor@test.com (password: password123)${NC}"
    echo -e "${GREEN}   - Patient: patient@test.com (password: password123)${NC}"
    echo -e "${GREEN}💊 Test pharmacies: 3 pharmacies created${NC}"
    echo -e "${GREEN}📅 Test appointments: 3 appointments created${NC}"
    echo -e "${GREEN}🏥 Test medical records and prescriptions created${NC}"
else
    echo -e "${RED}❌ Test database setup failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}To run tests with this database, update your .env file:${NC}"
echo -e "${YELLOW}DATABASE_URL=postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME${NC}"
