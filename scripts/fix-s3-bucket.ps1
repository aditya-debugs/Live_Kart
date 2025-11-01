# Quick S3 Bucket Configuration Fix
# This script configures your S3 bucket to allow direct uploads from the frontend

$BucketName = "live-kart-product-images"
$Region = "us-east-1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  S3 Bucket Quick Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create CORS configuration JSON file
$corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@

$corsFile = "cors-config.json"
$corsConfig | Out-File -FilePath $corsFile -Encoding UTF8

Write-Host "Step 1: Configuring CORS..." -ForegroundColor Yellow

try {
    aws s3api put-bucket-cors --bucket $BucketName --cors-configuration file://$corsFile --region $Region
    Write-Host "✅ CORS configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set CORS via CLI" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL FIX - Copy this CORS configuration:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $corsConfig -ForegroundColor White
    Write-Host ""
    Write-Host "And paste it here:" -ForegroundColor Yellow
    Write-Host "https://s3.console.aws.amazon.com/s3/buckets/$BucketName`?region=$Region&tab=permissions" -ForegroundColor Cyan
    Write-Host "Go to: Permissions → Cross-origin resource sharing (CORS) → Edit" -ForegroundColor Yellow
}

# Create bucket policy JSON file
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

Write-Host ""
Write-Host "Step 2: Configuring Bucket Policy..." -ForegroundColor Yellow

try {
    aws s3api put-bucket-policy --bucket $BucketName --policy file://$policyFile --region $Region
    Write-Host "✅ Bucket policy configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set bucket policy via CLI" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL FIX - Copy this bucket policy:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $bucketPolicy -ForegroundColor White
    Write-Host ""
    Write-Host "And paste it here:" -ForegroundColor Yellow
    Write-Host "https://s3.console.aws.amazon.com/s3/buckets/$BucketName`?region=$Region&tab=permissions" -ForegroundColor Cyan
    Write-Host "Go to: Permissions → Bucket policy → Edit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Checking Block Public Access..." -ForegroundColor Yellow

try {
    $blockConfig = aws s3api get-public-access-block --bucket $BucketName --region $Region | ConvertFrom-Json
    
    if ($blockConfig.PublicAccessBlockConfiguration.BlockPublicAcls -eq $true -or 
        $blockConfig.PublicAccessBlockConfiguration.IgnorePublicAcls -eq $true) {
        
        Write-Host "⚠️  Block Public Access is enabled. Disabling for uploads..." -ForegroundColor Yellow
        
        aws s3api put-public-access-block --bucket $BucketName --region $Region --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
        
        Write-Host "✅ Block Public Access disabled!" -ForegroundColor Green
    } else {
        Write-Host "✅ Block Public Access already configured!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Could not check Block Public Access settings" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL FIX:" -ForegroundColor Yellow
    Write-Host "https://s3.console.aws.amazon.com/s3/buckets/$BucketName`?region=$Region&tab=permissions" -ForegroundColor Cyan
    Write-Host "Go to: Permissions → Block public access (bucket settings) → Edit" -ForegroundColor Yellow
    Write-Host "Uncheck all 4 boxes and save" -ForegroundColor Yellow
}

# Clean up temp files
Remove-Item -Path $corsFile -ErrorAction SilentlyContinue
Remove-Item -Path $policyFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your S3 bucket is now configured for uploads!" -ForegroundColor Green
Write-Host ""
Write-Host "Try uploading an image again in your app!" -ForegroundColor Yellow
Write-Host ""

# Open AWS Console for manual verification
Write-Host "Opening AWS Console for verification..." -ForegroundColor Cyan
Start-Process "https://s3.console.aws.amazon.com/s3/buckets/$BucketName`?region=$Region&tab=permissions"

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
