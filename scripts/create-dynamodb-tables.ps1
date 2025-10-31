# PowerShell Script to Create DynamoDB Tables
# Run this in PowerShell with AWS CLI configured

Write-Host "Creating DynamoDB Tables for LiveKart..." -ForegroundColor Green

# 1. Products Table
Write-Host "`n1. Creating Products table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name livekart-products `
    --attribute-definitions `
        AttributeName=product_id,AttributeType=S `
        AttributeName=category,AttributeType=S `
    --key-schema `
        AttributeName=product_id,KeyType=HASH `
    --global-secondary-indexes `
        "[{
            \`"IndexName\`": \`"category-index\`",
            \`"KeySchema\`": [{
                \`"AttributeName\`": \`"category\`",
                \`"KeyType\`": \`"HASH\`"
            }],
            \`"Projection\`": {
                \`"ProjectionType\`": \`"ALL\`"
            },
            \`"ProvisionedThroughput\`": {
                \`"ReadCapacityUnits\`": 5,
                \`"WriteCapacityUnits\`": 5
            }
        }]" `
    --provisioned-throughput `
        ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

Write-Host "✅ Products table created" -ForegroundColor Green

# 2. Orders Table
Write-Host "`n2. Creating Orders table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name livekart-orders `
    --attribute-definitions `
        AttributeName=order_id,AttributeType=S `
        AttributeName=user_id,AttributeType=S `
    --key-schema `
        AttributeName=order_id,KeyType=HASH `
    --global-secondary-indexes `
        "[{
            \`"IndexName\`": \`"user_id-index\`",
            \`"KeySchema\`": [{
                \`"AttributeName\`": \`"user_id\`",
                \`"KeyType\`": \`"HASH\`"
            }],
            \`"Projection\`": {
                \`"ProjectionType\`": \`"ALL\`"
            },
            \`"ProvisionedThroughput\`": {
                \`"ReadCapacityUnits\`": 5,
                \`"WriteCapacityUnits\`": 5
            }
        }]" `
    --provisioned-throughput `
        ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

Write-Host "✅ Orders table created" -ForegroundColor Green

# 3. Users Table
Write-Host "`n3. Creating Users table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name livekart-users `
    --attribute-definitions `
        AttributeName=user_id,AttributeType=S `
    --key-schema `
        AttributeName=user_id,KeyType=HASH `
    --provisioned-throughput `
        ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

Write-Host "✅ Users table created" -ForegroundColor Green

# 4. Sessions Table
Write-Host "`n4. Creating Sessions table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name livekart-sessions `
    --attribute-definitions `
        AttributeName=session_id,AttributeType=S `
    --key-schema `
        AttributeName=session_id,KeyType=HASH `
    --provisioned-throughput `
        ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

# Enable TTL on Sessions table
Write-Host "`n   Enabling TTL on Sessions table..." -ForegroundColor Yellow
aws dynamodb update-time-to-live `
    --table-name livekart-sessions `
    --time-to-live-specification "Enabled=true,AttributeName=expiresAt" `
    --region us-east-1

Write-Host "✅ Sessions table created with TTL" -ForegroundColor Green

Write-Host "`n🎉 All tables created successfully!" -ForegroundColor Green
Write-Host "Wait 30 seconds for tables to become ACTIVE before using them." -ForegroundColor Cyan
