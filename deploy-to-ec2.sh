#!/bin/bash

# PatientFirst CRM - EC2 Deployment Script
# This script helps deploy the frontend to AWS EC2

echo "🚀 PatientFirst CRM - Frontend Deployment Script"
echo "=================================================="
echo ""

# Check if EC2 IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: EC2 Public IP address is required"
    echo ""
    echo "Usage: ./deploy-to-ec2.sh YOUR_EC2_PUBLIC_IP"
    echo "Example: ./deploy-to-ec2.sh 54.123.45.67"
    exit 1
fi

EC2_IP=$1
API_URL="http://${EC2_IP}:3001/api"

echo "📋 Deployment Configuration:"
echo "   EC2 IP: $EC2_IP"
echo "   API URL: $API_URL"
echo ""

# Step 1: Set environment variable
echo "1️⃣  Setting environment variable..."
export NEXT_PUBLIC_API_URL=$API_URL
echo "   ✅ NEXT_PUBLIC_API_URL=$API_URL"
echo ""

# Step 2: Install dependencies
echo "2️⃣  Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "   ❌ Failed to install dependencies"
    exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Build production bundle
echo "3️⃣  Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo "   ❌ Build failed"
    exit 1
fi
echo "   ✅ Build completed successfully"
echo ""

# Step 4: Create deployment package
echo "4️⃣  Creating deployment package..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r .next $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/ 2>/dev/null || true
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/ 2>/dev/null || true
cp next.config.ts $DEPLOY_DIR/

# Create environment file for EC2
echo "NEXT_PUBLIC_API_URL=$API_URL" > $DEPLOY_DIR/.env.production

echo "   ✅ Deployment package created: $DEPLOY_DIR"
echo ""

# Step 5: Create deployment instructions
cat > $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt << EOF
PatientFirst CRM - Deployment Instructions
==========================================

1. Upload this entire folder to your EC2 instance:
   scp -r $DEPLOY_DIR ec2-user@$EC2_IP:/home/ec2-user/

2. SSH into your EC2 instance:
   ssh ec2-user@$EC2_IP

3. Navigate to the uploaded directory:
   cd /home/ec2-user/$DEPLOY_DIR

4. Install dependencies:
   npm install --production

5. Start the application:
   npm start

   Or use PM2 for process management:
   npm install -g pm2
   pm2 start npm --name "patientfirst-crm" -- start
   pm2 save
   pm2 startup

6. Access your application:
   http://$EC2_IP:3000

Environment Configuration:
- API URL: $API_URL
- This is already configured in .env.production

Security Notes:
- Make sure port 3000 (frontend) and 3001 (backend) are open in EC2 security groups
- Consider using nginx as a reverse proxy
- Use HTTPS in production with SSL certificates
EOF

echo "📦 Deployment Package Ready!"
echo ""
echo "📝 Next Steps:"
echo "   1. Upload the '$DEPLOY_DIR' folder to your EC2 instance"
echo "   2. Follow instructions in '$DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt'"
echo ""
echo "💡 Quick Upload Command:"
echo "   scp -r $DEPLOY_DIR ec2-user@$EC2_IP:/home/ec2-user/"
echo ""
echo "✅ Deployment preparation complete!"
