# Setup Guide to create a new user with password, and assign permissions on the PostgreSQL database

# 1. Create a new user
CREATE USER healthcare_user WITH PASSWORD 'password';

# 2. Grant schema usage
GRANT USAGE ON SCHEMA public TO healthcare_user;

# 3. Grant permissions on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO healthcare_user;

# 4. Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO healthcare_user;

# 5. Grant sequence permissions (needed for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO healthcare_user;

# 6. Test the connection
# Set this environment variable on your server
$env:DATABASE_URL="postgresql+asyncpg://healthcare_user:password@localhost:5432/healthcare_sas"

# Run the following command on your server to test the connection to database
python .\tests\db_connection_test.py

