# Test Database Setup Script for Healthcare Application (PowerShell)
# This script creates and populates a test database for end-to-end testing

# Database configuration
$TEST_DB_NAME = "healthcare_test"
$TEST_DB_USER = "postgres"
$TEST_DB_PASSWORD = "postgres"
$TEST_DB_HOST = "localhost"
$TEST_DB_PORT = "5432"

Write-Host "Setting up test database for Healthcare Application..." -ForegroundColor Yellow

# Check if PostgreSQL is running
try {
    $result = & pg_isready -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL is not running"
    }
} catch {
    Write-Host "Error: PostgreSQL is not running. Please start PostgreSQL first." -ForegroundColor Red
    exit 1
}

# Create test database
Write-Host "Creating test database: $TEST_DB_NAME" -ForegroundColor Yellow
try {
    & createdb -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER $TEST_DB_NAME
} catch {
    Write-Host "Database might already exist. Continuing..." -ForegroundColor Yellow
}

# Apply the test setup script
Write-Host "Populating test database with test data..." -ForegroundColor Yellow
try {
    & psql -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER -d $TEST_DB_NAME -f test-setup.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test database setup completed successfully!" -ForegroundColor Green
        Write-Host "📊 Test database: $TEST_DB_NAME" -ForegroundColor Green
        Write-Host "👤 Test users created:" -ForegroundColor Green
        Write-Host "   - Admin: admin@test.com (password: password123)" -ForegroundColor Green
        Write-Host "   - Doctor: doctor@test.com (password: password123)" -ForegroundColor Green
        Write-Host "   - Patient: patient@test.com (password: password123)" -ForegroundColor Green
        Write-Host "💊 Test pharmacies: 3 pharmacies created" -ForegroundColor Green
        Write-Host "📅 Test appointments: 3 appointments created" -ForegroundColor Green
        Write-Host "🏥 Test medical records and prescriptions created" -ForegroundColor Green
    } else {
        throw "Test database setup failed"
    }
} catch {
    Write-Host "❌ Test database setup failed!" -ForegroundColor Red
    exit 1
}

Write-Host "To run tests with this database, update your .env file:" -ForegroundColor Yellow
Write-Host "DATABASE_URL=postgresql://$TEST_DB_USER`:$TEST_DB_PASSWORD@$TEST_DB_HOST`:$TEST_DB_PORT/$TEST_DB_NAME" -ForegroundColor Yellow
