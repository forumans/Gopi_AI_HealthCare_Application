# Environment Setup Script
# This script helps set up environment variables from .env file

Write-Host "Setting up environment variables from .env file..." -ForegroundColor Green

$envFiles = @(".env", ".env.local")
$loadedAny = $false

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "Found $envFile. Loading environment variables..." -ForegroundColor Yellow
        $loadedAny = $true

        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^([^=]+)=(.*)$") {
                $name = $matches[1]
                $value = $matches[2]
                Set-Item -Path "env:$name" -Value $value
                Write-Host "Set $name = $value" -ForegroundColor Cyan
            }
        }
    }
}

if ($loadedAny) {
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
    Write-Host "Current DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Yellow
    Write-Host "Current CORS_ORIGINS: $env:CORS_ORIGINS" -ForegroundColor Yellow
} else {
    Write-Host "Error: Neither .env nor .env.local was found in current directory!" -ForegroundColor Red
    Write-Host "Please create .env.local for your local configuration." -ForegroundColor Red
}

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
