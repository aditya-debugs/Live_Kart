# Complete CORS Fix - One Command Solution

Write-Host "🚀 Complete Lambda Function URL CORS Fix" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$REGION = "us-east-1"
$CREATE_ORDER_URL = "https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/"

# Step 1: Check current configuration
Write-Host "📋 Step 1: Checking current configuration..." -ForegroundColor Yellow
Write-Host ""

$functions = @("createOrder", "getOrders")
$needsFix = $false

foreach ($func in $functions) {
    try {
        $config = aws lambda get-function-url-config --function-name $func --region $REGION 2>&1 | ConvertFrom-Json
        
        if ($config.Cors) {
            Write-Host "  $func : ✅ CORS configured" -ForegroundColor Green
        } else {
            Write-Host "  $func : ❌ CORS NOT configured" -ForegroundColor Red
            $needsFix = $true
        }
    } catch {
        Write-Host "  $func : ❌ Error or no Function URL" -ForegroundColor Red
        $needsFix = $true
    }
}

Write-Host ""

# Step 2: Apply fix if needed
if ($needsFix) {
    Write-Host "🔧 Step 2: Applying CORS configuration..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($func in $functions) {
        try {
            Write-Host "  Configuring $func..." -NoNewline
            
            $result = aws lambda update-function-url-config `
                --function-name $func `
                --region $REGION `
                --cors '{\"AllowOrigins\":[\"*\"],\"AllowMethods\":[\"GET\",\"POST\",\"PUT\",\"DELETE\",\"OPTIONS\"],\"AllowHeaders\":[\"Content-Type\",\"Authorization\",\"X-Requested-With\",\"Accept\"],\"MaxAge\":86400,\"AllowCredentials\":false}' 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " ✅" -ForegroundColor Green
            } else {
                Write-Host " ❌" -ForegroundColor Red
                Write-Host "    Error: $result" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌" -ForegroundColor Red
            Write-Host "    Error: $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "⏳ Waiting 10 seconds for AWS to propagate changes..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host ""
} else {
    Write-Host "✅ All functions already have CORS configured!" -ForegroundColor Green
    Write-Host ""
}

# Step 3: Test OPTIONS request
Write-Host "🧪 Step 3: Testing OPTIONS request..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = curl.exe -X OPTIONS $CREATE_ORDER_URL `
        -H "Origin: http://localhost:5173" `
        -H "Access-Control-Request-Method: POST" `
        -H "Access-Control-Request-Headers: Content-Type, Authorization" `
        -i -s

    $hasOrigin = $response -match "access-control-allow-origin"
    $hasMethods = $response -match "access-control-allow-methods"
    $hasHeaders = $response -match "access-control-allow-headers"

    if ($hasOrigin -and $hasMethods -and $hasHeaders) {
        Write-Host "  ✅ OPTIONS request successful!" -ForegroundColor Green
        Write-Host "  ✅ All CORS headers present" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  OPTIONS request returned, but missing some headers" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Gray
        Write-Host $response -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Failed to test OPTIONS request: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✨ CORS Configuration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open your browser" -ForegroundColor White
Write-Host "  2. Clear cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  3. Hard refresh (Ctrl+F5)" -ForegroundColor White
Write-Host "  4. Try placing an order" -ForegroundColor White
Write-Host ""
Write-Host "🔍 If still not working:" -ForegroundColor Yellow
Write-Host "  • Wait another 30 seconds and try again" -ForegroundColor White
Write-Host "  • Check browser DevTools Network tab" -ForegroundColor White
Write-Host "  • Verify you're signed in" -ForegroundColor White
Write-Host "  • Check CloudWatch Logs for errors" -ForegroundColor White
Write-Host ""
Write-Host "📚 Read: LAMBDA_URL_CORS_FIX.md for detailed troubleshooting" -ForegroundColor Cyan
Write-Host ""
