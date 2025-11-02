# Test Lambda Functions Script
# This script tests both createOrder and getOrders Lambda functions

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Lambda Functions Test Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for Function URLs
Write-Host "Please enter your Lambda Function URLs:" -ForegroundColor Yellow
Write-Host ""
$createOrderUrl = Read-Host "Enter createOrder Function URL"
$getOrdersUrl = Read-Host "Enter getOrders Function URL"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing createOrder Function" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "URL: $createOrderUrl" -ForegroundColor Gray
Write-Host ""

# Test createOrder
$createOrderBody = @{
    userId = "test-user-123"
    userEmail = "test@example.com"
    items = @(
        @{
            productId = "prod-1"
            title = "Test Product"
            price = 29.99
            quantity = 2
        },
        @{
            productId = "prod-2"
            title = "Another Product"
            price = 49.99
            quantity = 1
        }
    )
    shippingAddress = @{
        street = "123 Main St"
        city = "New York"
        state = "NY"
        zipCode = "10001"
        country = "USA"
    }
    paymentMethod = "credit_card"
    totalAmount = 109.97
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Sending POST request..." -ForegroundColor Yellow
    $createResponse = Invoke-WebRequest -Uri $createOrderUrl -Method POST -Body $createOrderBody -ContentType "application/json" -UseBasicParsing
    
    Write-Host "✅ SUCCESS! Status Code: $($createResponse.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $responseObj = $createResponse.Content | ConvertFrom-Json
    $responseObj | ConvertTo-Json -Depth 10
    Write-Host ""
    
    # Extract orderId for getOrders test
    $orderId = $responseObj.order.orderId
    Write-Host "Order ID created: $orderId" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing getOrders Function" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "URL: $getOrdersUrl" -ForegroundColor Gray
Write-Host ""

# Test getOrders - All orders
try {
    Write-Host "Test 1: Getting all orders..." -ForegroundColor Yellow
    $getAllResponse = Invoke-WebRequest -Uri $getOrdersUrl -Method GET -UseBasicParsing
    
    Write-Host "✅ SUCCESS! Status Code: $($getAllResponse.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $getAllResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
}

# Test getOrders - Filter by userId
try {
    Write-Host "Test 2: Getting orders for userId=test-user-123..." -ForegroundColor Yellow
    $getUserOrdersUrl = "$getOrdersUrl`?userId=test-user-123"
    $getUserResponse = Invoke-WebRequest -Uri $getUserOrdersUrl -Method GET -UseBasicParsing
    
    Write-Host "✅ SUCCESS! Status Code: $($getUserResponse.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $getUserResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If tests passed, update your .env file with these URLs" -ForegroundColor White
Write-Host "2. Restart your frontend: npm run dev" -ForegroundColor White
Write-Host "3. Test creating orders from your app" -ForegroundColor White
Write-Host ""
