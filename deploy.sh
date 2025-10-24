#!/bin/bash

# LiveKart AWS Deployment Script
# This script automates the deployment of the LiveKart infrastructure

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="livekart-production"
REGION="us-east-1"
TEMPLATE_FILE="infra/cloudformation-template.yml"

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   LiveKart AWS Deployment Script         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Run 'aws configure' to set up your credentials"
    exit 1
fi

echo -e "${GREEN}✓${NC} AWS CLI configured"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓${NC} AWS Account ID: $ACCOUNT_ID"

# Get SES verified email
echo ""
echo -e "${YELLOW}Enter your verified SES email address:${NC}"
read -p "Email: " SES_EMAIL

if [ -z "$SES_EMAIL" ]; then
    echo -e "${RED}Error: Email address is required${NC}"
    exit 1
fi

# Validate CloudFormation template
echo ""
echo -e "${YELLOW}Validating CloudFormation template...${NC}"
if aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Template is valid"
else
    echo -e "${RED}Error: Template validation failed${NC}"
    exit 1
fi

# Check if stack already exists
echo ""
echo -e "${YELLOW}Checking if stack exists...${NC}"
if aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION > /dev/null 2>&1; then
    
    echo -e "${YELLOW}Stack already exists. Do you want to update it? (yes/no)${NC}"
    read -p "Update: " UPDATE_STACK
    
    if [ "$UPDATE_STACK" = "yes" ]; then
        echo -e "${YELLOW}Updating stack...${NC}"
        aws cloudformation update-stack \
            --stack-name $STACK_NAME \
            --template-body file://$TEMPLATE_FILE \
            --parameters \
                ParameterKey=EnvironmentName,ParameterValue=production \
                ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL \
            --capabilities CAPABILITY_NAMED_IAM \
            --region $REGION
        
        OPERATION="update"
    else
        echo "Skipping stack update"
        exit 0
    fi
else
    # Create new stack
    echo -e "${YELLOW}Creating new stack...${NC}"
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=EnvironmentName,ParameterValue=production \
            ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    OPERATION="create"
fi

# Wait for stack operation to complete
echo ""
echo -e "${YELLOW}Waiting for stack operation to complete...${NC}"
echo "(This may take 5-10 minutes)"
echo ""

if [ "$OPERATION" = "create" ]; then
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
else
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION
fi

# Get stack outputs
echo ""
echo -e "${GREEN}✓${NC} Stack operation completed successfully!"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Stack Outputs                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output text)

echo "$OUTPUTS"

# Save outputs to .env file
echo ""
echo -e "${YELLOW}Creating frontend/.env file...${NC}"

USER_POOL_ID=$(echo "$OUTPUTS" | grep "UserPoolId" | awk '{print $2}')
CLIENT_ID=$(echo "$OUTPUTS" | grep "UserPoolClientId" | awk '{print $2}')
S3_BUCKET=$(echo "$OUTPUTS" | grep "ProductImagesBucketName" | awk '{print $2}')
CLOUDFRONT_DOMAIN=$(echo "$OUTPUTS" | grep "CloudFrontDomainName" | awk '{print $2}')
PRODUCTS_TABLE=$(echo "$OUTPUTS" | grep "ProductsTableName" | awk '{print $2}')
ORDERS_TABLE=$(echo "$OUTPUTS" | grep "OrdersTableName" | awk '{print $2}')
SESSIONS_TABLE=$(echo "$OUTPUTS" | grep "SessionsTableName" | awk '{print $2}')
ANALYTICS_TABLE=$(echo "$OUTPUTS" | grep "AnalyticsTableName" | awk '{print $2}')

cat > frontend/.env << EOF
# AWS Configuration
VITE_AWS_REGION=$REGION

# Cognito
VITE_COGNITO_USER_POOL_ID=$USER_POOL_ID
VITE_COGNITO_CLIENT_ID=$CLIENT_ID

# S3
VITE_S3_BUCKET_NAME=$S3_BUCKET

# CloudFront
VITE_CLOUDFRONT_DOMAIN=$CLOUDFRONT_DOMAIN
VITE_CLOUDFRONT_URL=https://$CLOUDFRONT_DOMAIN

# DynamoDB Tables
VITE_DYNAMODB_PRODUCTS_TABLE=$PRODUCTS_TABLE
VITE_DYNAMODB_ORDERS_TABLE=$ORDERS_TABLE
VITE_DYNAMODB_SESSIONS_TABLE=$SESSIONS_TABLE
VITE_DYNAMODB_ANALYTICS_TABLE=$ANALYTICS_TABLE
EOF

echo -e "${GREEN}✓${NC} Created frontend/.env"

# Verify SES email
echo ""
echo -e "${YELLOW}Verifying SES email address...${NC}"
echo "Please check your email ($SES_EMAIL) and click the verification link"
echo ""

# Instructions for next steps
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Next Steps                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "1. Verify your email address in SES"
echo "   Check your inbox: $SES_EMAIL"
echo ""
echo "2. Create test users:"
echo "   ./scripts/create-test-users.sh"
echo ""
echo "3. Build and deploy frontend:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run build"
echo ""
echo "4. Test the application:"
echo "   npm run dev"
echo ""
echo -e "${GREEN}Deployment complete! 🎉${NC}"
