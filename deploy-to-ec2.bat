@echo off
REM PatientFirst CRM - EC2 Deployment Script for Windows
REM This script helps deploy the frontend to AWS EC2

echo ========================================
echo PatientFirst CRM - Frontend Deployment
echo ========================================
echo.

REM Check if EC2 IP is provided
if "%1"=="" (
    echo ERROR: EC2 Public IP address is required
    echo.
    echo Usage: deploy-to-ec2.bat YOUR_EC2_PUBLIC_IP
    echo Example: deploy-to-ec2.bat 54.123.45.67
    exit /b 1
)

set EC2_IP=%1
set API_URL=http://%EC2_IP%:3001/api

echo Deployment Configuration:
echo    EC2 IP: %EC2_IP%
echo    API URL: %API_URL%
echo.

REM Step 1: Set environment variable
echo [1/5] Setting environment variable...
set NEXT_PUBLIC_API_URL=%API_URL%
echo    NEXT_PUBLIC_API_URL=%API_URL%
echo.

REM Step 2: Install dependencies
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo    ERROR: Failed to install dependencies
    exit /b 1
)
echo    Dependencies installed successfully
echo.

REM Step 3: Build production bundle
echo [3/5] Building production bundle...
call npm run build
if errorlevel 1 (
    echo    ERROR: Build failed
    exit /b 1
)
echo    Build completed successfully
echo.

REM Step 4: Create deployment package
echo [4/5] Creating deployment package...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set DEPLOY_DIR=deploy-%mydate%-%mytime%

mkdir %DEPLOY_DIR%

xcopy /E /I /Y .next %DEPLOY_DIR%\.next
xcopy /E /I /Y public %DEPLOY_DIR%\public 2>nul
copy package.json %DEPLOY_DIR%\
copy package-lock.json %DEPLOY_DIR%\ 2>nul
copy next.config.ts %DEPLOY_DIR%\

REM Create environment file for EC2
echo NEXT_PUBLIC_API_URL=%API_URL% > %DEPLOY_DIR%\.env.production

echo    Deployment package created: %DEPLOY_DIR%
echo.

REM Step 5: Create deployment instructions
(
echo PatientFirst CRM - Deployment Instructions
echo ==========================================
echo.
echo 1. Upload this entire folder to your EC2 instance using WinSCP or similar tool
echo    - Host: %EC2_IP%
echo    - Username: ec2-user ^(or ubuntu depending on your AMI^)
echo    - Upload folder: %DEPLOY_DIR%
echo    - Destination: /home/ec2-user/
echo.
echo 2. SSH into your EC2 instance using PuTTY or similar:
echo    ssh ec2-user@%EC2_IP%
echo.
echo 3. Navigate to the uploaded directory:
echo    cd /home/ec2-user/%DEPLOY_DIR%
echo.
echo 4. Install dependencies:
echo    npm install --production
echo.
echo 5. Start the application:
echo    npm start
echo.
echo    Or use PM2 for process management:
echo    npm install -g pm2
echo    pm2 start npm --name "patientfirst-crm" -- start
echo    pm2 save
echo    pm2 startup
echo.
echo 6. Access your application:
echo    http://%EC2_IP%:3000
echo.
echo Environment Configuration:
echo - API URL: %API_URL%
echo - This is already configured in .env.production
echo.
echo Security Notes:
echo - Make sure port 3000 ^(frontend^) and 3001 ^(backend^) are open in EC2 security groups
echo - Consider using nginx as a reverse proxy
echo - Use HTTPS in production with SSL certificates
) > %DEPLOY_DIR%\DEPLOY_INSTRUCTIONS.txt

echo [5/5] Deployment Package Ready!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Upload the '%DEPLOY_DIR%' folder to your EC2 instance
echo 2. Follow instructions in '%DEPLOY_DIR%\DEPLOY_INSTRUCTIONS.txt'
echo.
echo Recommended Tools for Upload:
echo - WinSCP: https://winscp.net/
echo - FileZilla: https://filezilla-project.org/
echo.
echo Deployment preparation complete!
echo ========================================
