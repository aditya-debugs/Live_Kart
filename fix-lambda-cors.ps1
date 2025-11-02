# Fix Lambda Function URL CORS Configuration

Write-Host "🔧 Configuring CORS for Lambda Function URLs..." -ForegroundColor Cyan

$REGION = "us-east-1"
$FUNCTIONS = @("createOrder", "getOrders")

foreach ($FUNCTION in $FUNCTIONS) {
    Write-Host "`n📝 Configuring CORS for: $FUNCTION" -ForegroundColor Yellow
    
    try {
        # Update Function URL CORS configuration
        aws lambda update-function-url-config `
            --function-name $FUNCTION `
            --region $REGION `
            --cors '{
                "AllowOrigins": ["*"],
                "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
                "MaxAge": 86400,
                "AllowCredentials": false
            }'
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ CORS configured for $FUNCTION" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to configure CORS for $FUNCTION" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✨ CORS configuration complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 10-15 seconds for changes to propagate"
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)"
Write-Host "3. Hard refresh (Ctrl+F5)"
Write-Host "4. Try placing an order again"
Write-Host "`n🧪 Test with curl:" -ForegroundColor Yellow
Write-Host "curl -X OPTIONS https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/ -v"
