# 1) Activate venv (if not active)
.\.venv\Scripts\Activate.ps1

# 2) Configure environment variables
# Option A: Use the setup script (recommended)
.\setup_env.ps1

# Option B: Manual setup
# Edit the .env file in the project root to set your database and other configurations
# The .env file contains:
# DATABASE_URL=postgresql+asyncpg://your_username:your_password@localhost/healthcare_saas
# TEST_DATABASE_URL=postgresql+asyncpg://your_username:your_password@localhost/test_healthcare_db
# CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

# 3) Allow React origin (automatically loaded from .env file)
# $env:CORS_ORIGINS will be set from the .env file when the application starts

# 4) Start FastAPI
python -m uvicorn server.app.main:app --host 127.0.0.1 --port 8000 --reload

# 4.1) FastAPI docs
http://127.0.0.1:8000/docs

# 4.2) FastAPI Health check
http://127.0.0.1:8000/health

# 5) Start React + TypeScript frontend
cd frontend
npm install
npm run dev

# 5.1) Frontend URL
http://127.0.0.1:5173

# 6) Test the connection to database
python .\tests\db_connection_test.py

# 7) JWT Settings
$env:JWT_SECRET="change-me-in-production"
$env:JWT_ALGORITHM="HS256"

# 8) SMTP Settings on Hotmail
$env:SMTP_HOST="smtp-mail.outlook.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="pegopi@hotmail.com"
$env:SMTP_PASSWORD="Gopikris27"
$env:SMTP_FROM="GopiKrishna@example.com"

# 9) Run the E2E tests
cd test_healthcare_saas_app
npx playwright test

# 9.1) View test reports
npx playwright show-report

# 9.2) Run smoke tests (quick health checks)
npm run test:smoke

# 9.3) Run tests in UI mode (interactive)
npm run test:ui
