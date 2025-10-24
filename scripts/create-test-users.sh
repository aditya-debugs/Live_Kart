#!/bin/bash

# Script to create test users in Cognito User Pool

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
STACK_NAME="livekart-production"
REGION="us-east-1"

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Create LiveKart Test Users             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Get User Pool ID from CloudFormation stack
echo -e "${YELLOW}Getting User Pool ID...${NC}"
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

if [ -z "$USER_POOL_ID" ]; then
    echo -e "${RED}Error: Could not find User Pool ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} User Pool ID: $USER_POOL_ID"
echo ""

# Function to create user
create_user() {
    local EMAIL=$1
    local NAME=$2
    local GROUP=$3
    local PASSWORD=$4
    
    echo -e "${YELLOW}Creating user: $EMAIL${NC}"
    
    # Check if user already exists
    if aws cognito-idp admin-get-user \
        --user-pool-id $USER_POOL_ID \
        --username $EMAIL \
        --region $REGION > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} User $EMAIL already exists. Skipping..."
        return
    fi
    
    # Create user
    aws cognito-idp admin-create-user \
        --user-pool-id $USER_POOL_ID \
        --username $EMAIL \
        --user-attributes \
            Name=email,Value=$EMAIL \
            Name=name,Value="$NAME" \
            Name=email_verified,Value=true \
        --temporary-password "TempPass123!" \
        --message-action SUPPRESS \
        --region $REGION > /dev/null
    
    # Set permanent password
    aws cognito-idp admin-set-user-password \
        --user-pool-id $USER_POOL_ID \
        --username $EMAIL \
        --password "$PASSWORD" \
        --permanent \
        --region $REGION > /dev/null
    
    # Add user to group
    aws cognito-idp admin-add-user-to-group \
        --user-pool-id $USER_POOL_ID \
        --username $EMAIL \
        --group-name $GROUP \
        --region $REGION > /dev/null
    
    echo -e "${GREEN}✓${NC} Created $EMAIL (Group: $GROUP, Password: $PASSWORD)"
}

# Create test users
echo "Creating test users..."
echo ""

create_user "admin@livekart.com" "Admin User" "admins" "Admin123!"
create_user "vendor@livekart.com" "Vendor User" "vendors" "Vendor123!"
create_user "customer@livekart.com" "Customer User" "customers" "Customer123!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Test Users Created               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "You can now log in with:"
echo ""
echo "Admin:"
echo "  Email: admin@livekart.com"
echo "  Password: Admin123!"
echo ""
echo "Vendor:"
echo "  Email: vendor@livekart.com"
echo "  Password: Vendor123!"
echo ""
echo "Customer:"
echo "  Email: customer@livekart.com"
echo "  Password: Customer123!"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
