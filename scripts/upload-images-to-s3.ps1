# Upload Images to S3 Bucket for LiveKart
# This script uploads all frontend images to S3 and returns the URLs

param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "live-kart-product-images",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "🚀 LiveKart Image Upload to S3" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green

# Define image paths
$frontendPath = "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\frontend\src\assets"
$outputFile = "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\frontend\src\config\s3-image-urls.ts"

# Check if bucket exists, if not create it
Write-Host ""
Write-Host "📦 Checking S3 bucket: $BucketName" -ForegroundColor Yellow
$bucketExists = aws s3 ls "s3://$BucketName" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating bucket: $BucketName" -ForegroundColor Yellow
    aws s3 mb "s3://$BucketName" --region $Region
    
    # Set bucket policy for public read
    $policy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
    
    $policy | Out-File -FilePath "bucket-policy.json" -Encoding utf8
    aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json
    Remove-Item "bucket-policy.json"
    
    # Disable block public access
    aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    
    Write-Host "✅ Bucket created and configured for public access" -ForegroundColor Green
} else {
    Write-Host "✅ Bucket already exists" -ForegroundColor Green
}

# Upload images
Write-Host ""
Write-Host "📤 Uploading images..." -ForegroundColor Yellow

$imageUrls = @{}
$categories = @("bannerimg", "categoryimg", "productimg")

foreach ($category in $categories) {
    $files = Get-ChildItem -Path $frontendPath -Filter "$category*.jpg"
    
    foreach ($file in $files) {
        $fileName = $file.Name
        $s3Key = "images/$fileName"
        
        Write-Host "  Uploading: $fileName" -ForegroundColor Cyan
        aws s3 cp "$frontendPath\$fileName" "s3://$BucketName/$s3Key" --acl public-read --content-type "image/jpeg"
        
        if ($LASTEXITCODE -eq 0) {
            $url = "https://$BucketName.s3.$Region.amazonaws.com/$s3Key"
            $imageUrls[$fileName] = $url
            Write-Host "    ✅ $url" -ForegroundColor Green
        } else {
            Write-Host "    ❌ Failed to upload $fileName" -ForegroundColor Red
        }
    }
}

# Generate TypeScript configuration file
Write-Host ""
Write-Host "📝 Generating TypeScript config..." -ForegroundColor Yellow

$tsContent = @"
// Auto-generated S3 Image URLs
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export const S3_IMAGES = {
  // Banner Images
  banners: [
    "$($imageUrls['bannerimg.jpg'])",
    "$($imageUrls['bannerimg2.jpg'])",
    "$($imageUrls['bannerimg3.jpg'])",
    "$($imageUrls['bannerimg4.jpg'])"
  ],
  
  // Category Images
  categories: [
    "$($imageUrls['categoryimg1.jpg'])",
    "$($imageUrls['categoryimg2.jpg'])",
    "$($imageUrls['categoryimg3.jpg'])",
    "$($imageUrls['categoryimg4.jpg'])"
  ],
  
  // Product Images
  products: [
    "$($imageUrls['productimg1.jpg'])",
    "$($imageUrls['productimg2.jpg'])",
    "$($imageUrls['productimg3.jpg'])",
    "$($imageUrls['productimg4.jpg'])"
  ]
};

export const S3_BUCKET = "$BucketName";
export const S3_REGION = "$Region";
export const S3_BASE_URL = "https://$BucketName.s3.$Region.amazonaws.com/images";
"@

New-Item -Path (Split-Path $outputFile -Parent) -ItemType Directory -Force | Out-Null
$tsContent | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "✅ Config file created: $outputFile" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Upload Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Uploaded $($imageUrls.Count) images to S3" -ForegroundColor White
Write-Host "Bucket: s3://$BucketName" -ForegroundColor White
Write-Host "Config file: $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend components to use S3_IMAGES from the config file" -ForegroundColor White
Write-Host "2. Test the application to ensure images load from S3" -ForegroundColor White
Write-Host ""
