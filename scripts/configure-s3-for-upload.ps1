# Configure S3 Bucket for Direct Upload from Frontend
# This script sets up CORS and bucket policy for public uploads

$BucketName = "live-kart-product-images"
$Region = "us-east-1"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  S3 Bucket Configuration for Direct Uploads" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# CORS Configuration for S3 Bucket
$corsConfig = @'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "POST", "PUT", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
'@

# Save CORS config to temporary file
$corsFile = "cors-config.json"
$corsConfig | Out-File -FilePath $corsFile -Encoding UTF8

Write-Host "Step 1: Setting CORS configuration..." -ForegroundColor Yellow
try {
    aws s3api put-bucket-cors --bucket $BucketName --cors-configuration file://$corsFile --region $Region
    Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set CORS. Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEPS (AWS Console):" -ForegroundColor Cyan
    Write-Host "1. Go to: https://s3.console.aws.amazon.com/s3/buckets/$BucketName" -ForegroundColor White
    Write-Host "2. Click 'Permissions' tab" -ForegroundColor White
    Write-Host "3. Scroll to 'Cross-origin resource sharing (CORS)'" -ForegroundColor White
    Write-Host "4. Click 'Edit'" -ForegroundColor White
    Write-Host "5. Paste this configuration:" -ForegroundColor White
    Write-Host ""
    Write-Host $corsConfig -ForegroundColor Gray
}

# Clean up temp file
if (Test-Path $corsFile) {
    Remove-Item $corsFile
}

Write-Host ""
Write-Host "Step 2: Checking Block Public Access settings..." -ForegroundColor Yellow
try {
    $blockConfig = aws s3api get-public-access-block --bucket $BucketName --region $Region | ConvertFrom-Json
    
    if ($blockConfig.PublicAccessBlockConfiguration.BlockPublicAcls -or 
        $blockConfig.PublicAccessBlockConfiguration.IgnorePublicAcls -or
        $blockConfig.PublicAccessBlockConfiguration.BlockPublicPolicy -or
        $blockConfig.PublicAccessBlockConfiguration.RestrictPublicBuckets) {
        
        Write-Host "⚠️  Some public access is blocked. This may prevent uploads." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To fix this (MANUAL - AWS Console):" -ForegroundColor Cyan
        Write-Host "1. Go to: https://s3.console.aws.amazon.com/s3/buckets/$BucketName" -ForegroundColor White
        Write-Host "2. Click 'Permissions' tab" -ForegroundColor White
        Write-Host "3. Edit 'Block public access'" -ForegroundColor White
        Write-Host "4. Uncheck all 4 options (for development)" -ForegroundColor White
        Write-Host "5. Click 'Save changes'" -ForegroundColor White
    } else {
        Write-Host "✅ Block Public Access is disabled" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check Block Public Access settings" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Setting Bucket Policy for uploads..." -ForegroundColor Yellow

# Bucket Policy (allows public read and uploads to product-images folder)
$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        },
        {
            "Sid": "AllowPublicUploadToProductImages",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::$BucketName/product-images/*"
        }
    ]
}
"@

$policyFile = "bucket-policy.json"
$bucketPolicy | Out-File -FilePath $policyFile -Encoding UTF8

try {
    aws s3api put-bucket-policy --bucket $BucketName --policy file://$policyFile --region $Region
    Write-Host "✅ Bucket policy applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set bucket policy. Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEPS (AWS Console):" -ForegroundColor Cyan
    Write-Host "1. Go to: https://s3.console.aws.amazon.com/s3/buckets/$BucketName" -ForegroundColor White
    Write-Host "2. Click 'Permissions' tab" -ForegroundColor White
    Write-Host "3. Scroll to 'Bucket policy'" -ForegroundColor White
    Write-Host "4. Click 'Edit'" -ForegroundColor White
    Write-Host "5. Paste this policy:" -ForegroundColor White
    Write-Host ""
    Write-Host $bucketPolicy -ForegroundColor Gray
}

# Clean up temp file
if (Test-Path $policyFile) {
    Remove-Item $policyFile
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your S3 bucket is now configured for:" -ForegroundColor White
Write-Host "  ✅ Direct uploads from frontend" -ForegroundColor Green
Write-Host "  ✅ Public read access for product images" -ForegroundColor Green
Write-Host "  ✅ CORS enabled for web uploads" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: For production, consider using:" -ForegroundColor Yellow
Write-Host "  - Cognito Identity Pool for authenticated uploads" -ForegroundColor White
Write-Host "  - Lambda pre-signed URLs instead of public upload" -ForegroundColor White
Write-Host "  - CloudFront for better performance" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
