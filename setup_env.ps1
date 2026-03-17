# Environment Setup Script
# This script helps set up environment variables from .env file

Write-Host "Setting up environment variables from .env file..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "Found .env file. Loading environment variables..." -ForegroundColor Yellow
    
    # Read and set environment variables from .env file
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
            Write-Host "Set $name = $value" -ForegroundColor Cyan
        }
    }
    
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
    Write-Host "Current DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Yellow
    Write-Host "Current CORS_ORIGINS: $env:CORS_ORIGINS" -ForegroundColor Yellow
} else {
    Write-Host "Error: .env file not found in current directory!" -ForegroundColor Red
    Write-Host "Please create a .env file with your configuration." -ForegroundColor Red
}

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
