# 1) Activate venv (if not active)
.\.venv\Scripts\Activate.ps1

# 2) Ensure backend points to healthcare_sas DB
$env:DATABASE_URL="postgresql+asyncpg://healthcare_user:password@localhost/healthcare_saas"

# 3) Allow React (and optional archived Gradio) origin
$env:CORS_ORIGINS="http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:7860,http://localhost:7860"

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

# 5.2) Optional archived Gradio UI source
# Gradio code is archived under: Gradio_UI_Files/ui

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

