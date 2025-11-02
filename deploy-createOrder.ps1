# Deploy Updated createOrder Lambda Function

Write-Host "🚀 Deploying createOrder Lambda with CORS fix..." -ForegroundColor Cyan

# Set variables
$FUNCTION_NAME = "createOrder"
$HANDLER_FILE = "backend/lambda/orders/createOrder.js"
$ZIP_FILE = "createOrder-deployment.zip"
$REGION = "us-east-1"

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if handler file exists
if (!(Test-Path $HANDLER_FILE)) {
    Write-Host "❌ Handler file not found: $HANDLER_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Create a temporary directory for deployment
$TEMP_DIR = "temp-deploy-createOrder"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

# Copy Lambda function files
Copy-Item -Path "backend/lambda/orders/createOrder.js" -Destination "$TEMP_DIR/"
Copy-Item -Path "backend/lambda/utils" -Destination "$TEMP_DIR/" -Recurse

# Copy node_modules (uuid)
if (Test-Path "backend/lambda/node_modules") {
    Copy-Item -Path "backend/lambda/node_modules" -Destination "$TEMP_DIR/" -Recurse
} else {
    Write-Host "⚠️ node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Push-Location backend/lambda
    npm install
    Pop-Location
    Copy-Item -Path "backend/lambda/node_modules" -Destination "$TEMP_DIR/" -Recurse
}

# Create ZIP file
Write-Host "📦 Creating ZIP archive..." -ForegroundColor Yellow
Push-Location $TEMP_DIR
Compress-Archive -Path * -DestinationPath "../$ZIP_FILE" -Force
Pop-Location

# Clean up temp directory
Remove-Item -Recurse -Force $TEMP_DIR

Write-Host "☁️ Uploading to AWS Lambda..." -ForegroundColor Yellow

# Update Lambda function code
try {
    $result = aws lambda update-function-code `
        --function-name $FUNCTION_NAME `
        --zip-file "fileb://$ZIP_FILE" `
        --region $REGION `
        --output json

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lambda function updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Function Details:" -ForegroundColor Cyan
        $result | ConvertFrom-Json | Select-Object FunctionName, LastModified, CodeSize, Runtime | Format-List
        
        Write-Host ""
        Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Test the order placement from your frontend"
        Write-Host "2. Check CloudWatch Logs if there are any issues"
        Write-Host "3. Verify CORS headers are present in responses"
        Write-Host ""
        Write-Host "📊 View Logs:" -ForegroundColor Cyan
        Write-Host "aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $REGION"
    } else {
        Write-Host "❌ Failed to update Lambda function" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying Lambda: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up ZIP file
    if (Test-Path $ZIP_FILE) {
        Remove-Item $ZIP_FILE
        Write-Host "🧹 Cleaned up deployment package" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✨ Deployment complete!" -ForegroundColor Green
