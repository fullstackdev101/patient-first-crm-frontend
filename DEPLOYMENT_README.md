# PatientFirst CRM - EC2 Deployment Guide

## Quick Start

### For Windows Users

1. Open Command Prompt in the `frontend` directory
2. Run the deployment script:
   ```cmd
   deploy-to-ec2.bat YOUR_EC2_PUBLIC_IP
   ```
   Example:
   ```cmd
   deploy-to-ec2.bat 54.123.45.67
   ```

### For Linux/Mac Users

1. Make the script executable:
   ```bash
   chmod +x deploy-to-ec2.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy-to-ec2.sh YOUR_EC2_PUBLIC_IP
   ```
   Example:
   ```bash
   ./deploy-to-ec2.sh 54.123.45.67
   ```

## What the Script Does

1. ✅ Sets the correct API URL for your EC2 instance
2. ✅ Installs all dependencies
3. ✅ Builds the production bundle
4. ✅ Creates a deployment package with all necessary files
5. ✅ Generates deployment instructions

## After Running the Script

You'll get a folder named `deploy-YYYYMMDD-HHMMSS` containing:
- `.next/` - Built application
- `public/` - Static assets
- `package.json` - Dependencies list
- `.env.production` - Production environment config
- `DEPLOY_INSTRUCTIONS.txt` - Step-by-step upload guide

## Upload to EC2

### Using WinSCP (Windows)
1. Download WinSCP: https://winscp.net/
2. Connect to your EC2 instance
3. Upload the entire `deploy-*` folder to `/home/ec2-user/`

### Using SCP (Linux/Mac)
```bash
scp -r deploy-* ec2-user@YOUR_EC2_IP:/home/ec2-user/
```

## On EC2 Instance

1. SSH into EC2:
   ```bash
   ssh ec2-user@YOUR_EC2_IP
   ```

2. Navigate to uploaded folder:
   ```bash
   cd /home/ec2-user/deploy-*
   ```

3. Install dependencies:
   ```bash
   npm install --production
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Access at: `http://YOUR_EC2_IP:3000`

## Using PM2 (Recommended for Production)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "patientfirst-crm" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Security Checklist

- [ ] EC2 Security Group allows port 3000 (frontend)
- [ ] EC2 Security Group allows port 3001 (backend)
- [ ] Backend is running on EC2
- [ ] Consider using nginx as reverse proxy
- [ ] Consider setting up SSL/HTTPS for production

## Troubleshooting

### Build fails
- Check Node.js version (should be 18+)
- Run `npm install` first
- Check for errors in console

### Can't connect after deployment
- Verify EC2 security groups
- Check if ports 3000 and 3001 are open
- Verify backend is running
- Check EC2 instance logs

### Login page not showing
- Clear browser cache
- Check browser console for errors
- Verify API_URL in .env.production
- Check backend accessibility

## Environment Variables

The deployment script automatically creates `.env.production` with:
```
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP:3001/api
```

You can manually edit this file if needed before starting the application.
