# PatientFirst CRM - Quick Deployment Checklist

## Pre-Deployment
- [ ] Node.js 18+ installed on EC2
- [ ] Backend is deployed and running on EC2
- [ ] EC2 Security Groups configured (ports 3000, 3001)
- [ ] You have your EC2 public IP address

## Deployment Steps

### 1. Prepare Deployment Package
```cmd
# Windows
deploy-to-ec2.bat YOUR_EC2_IP

# Linux/Mac
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh YOUR_EC2_IP
```

### 2. Upload to EC2
- Upload the generated `deploy-*` folder to EC2
- Use WinSCP, FileZilla, or scp command

### 3. On EC2 Instance
```bash
# SSH into EC2
ssh ec2-user@YOUR_EC2_IP

# Navigate to folder
cd /home/ec2-user/deploy-*

# Install dependencies
npm install --production

# Start with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "patientfirst-crm" -- start
pm2 save
pm2 startup
```

### 4. Verify
- [ ] Access `http://YOUR_EC2_IP:3000`
- [ ] Login page loads within 3 seconds
- [ ] Can login successfully
- [ ] Dashboard loads correctly

## Quick Commands

### Check PM2 Status
```bash
pm2 status
pm2 logs patientfirst-crm
```

### Restart Application
```bash
pm2 restart patientfirst-crm
```

### Stop Application
```bash
pm2 stop patientfirst-crm
```

### View Logs
```bash
pm2 logs patientfirst-crm --lines 100
```

## Troubleshooting

### Application won't start
```bash
# Check Node version
node --version  # Should be 18+

# Check npm
npm --version

# Reinstall dependencies
rm -rf node_modules
npm install --production
```

### Can't access from browser
```bash
# Check if app is running
pm2 status

# Check port
netstat -tulpn | grep 3000

# Check EC2 security groups in AWS Console
```

### Backend connection issues
```bash
# Test backend
curl http://localhost:3001/health

# Check environment variable
cat .env.production
```

## Important Files

- `deploy-to-ec2.bat` - Windows deployment script
- `deploy-to-ec2.sh` - Linux/Mac deployment script
- `DEPLOYMENT_README.md` - Full deployment guide
- `ecosystem.config.json` - PM2 configuration
- `.env.production` - Auto-generated during deployment

## Support

For detailed instructions, see `DEPLOYMENT_README.md`
