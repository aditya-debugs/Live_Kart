# Check Current Lambda Function URL Configuration

Write-Host "🔍 Checking Lambda Function URL Configurations..." -ForegroundColor Cyan
Write-Host ""

$REGION = "us-east-1"
$FUNCTIONS = @("createOrder", "getOrders", "createProduct", "getProducts")

foreach ($FUNCTION in $FUNCTIONS) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📦 Function: $FUNCTION" -ForegroundColor Yellow
    
    try {
        $config = aws lambda get-function-url-config --function-name $FUNCTION --region $REGION 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host $config | ConvertFrom-Json | ConvertTo-Json -Depth 10
        } else {
            Write-Host "⚠️  No Function URL found for $FUNCTION" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error checking $FUNCTION : $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
