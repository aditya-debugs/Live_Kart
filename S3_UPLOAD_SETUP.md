# ✅ S3 Direct Upload Configuration

## 🎯 What Was Implemented

Your vendor product form now **uploads images directly to S3** and uses the public S3 URL for display!

### **Changes Made:**

1. ✅ **File Upload Field** - Required field with image validation
2. ✅ **AWS SDK Integration** - Direct upload to S3 bucket
3. ✅ **Image Compression** - Auto-resize to 800x800px (85% quality)
4. ✅ **Live Preview** - See image before uploading
5. ✅ **Progress Tracking** - Visual upload progress bar
6. ✅ **S3 Public URLs** - Products display from S3 bucket

---

## ⚙️ REQUIRED: Configure S3 Bucket

**You MUST configure your S3 bucket to allow uploads from the frontend.**

### **Option 1: AWS Console (Recommended - 2 minutes)**

#### **Step 1: Enable CORS**

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/live-kart-product-images
2. Click **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click **"Save changes"**

#### **Step 2: Update Bucket Policy**

1. Scroll to **"Bucket policy"** section
2. Click **"Edit"**
3. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::live-kart-product-images/*"
    },
    {
      "Sid": "AllowPublicUploadToProductImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::live-kart-product-images/product-images/*"
    }
  ]
}
```

4. Click **"Save changes"**

#### **Step 3: Disable Block Public Access (for uploads)**

1. Scroll to **"Block Public Access (bucket settings)"**
2. Click **"Edit"**
3. **Uncheck** these options:
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
4. Click **"Save changes"**
5. Type `confirm` and click **"Confirm"**

---

### **Option 2: AWS CLI (If installed)**

Run this script:

```powershell
cd scripts
.\configure-s3-for-upload.ps1
```

---

## 🧪 How to Test

### **1. Open Vendor Dashboard**

- Go to: http://localhost:5176/vendor
- Sign in as vendor

### **2. Fill Product Form**

- **Title**: `S3 Upload Test Product`
- **Description**: `Testing S3 direct upload`
- **Price**: `99.99`
- **Category**: `Electronics`
- **Image**: Click "Choose File" and select an image

### **3. Watch the Magic!**

✅ **Image preview** appears  
✅ **Progress bar** shows upload status  
✅ **Success alert** confirms upload  
✅ **Product card** shows your image from S3

### **4. Verify S3 Upload**

1. Go to AWS S3 Console
2. Open bucket: `live-kart-product-images`
3. Navigate to folder: `product-images/`
4. You should see: `product_1730476800123_abc123.jpg`
5. Click on the file → Copy **Object URL**
6. Open URL in browser → Image loads! ✅

---

## 🎨 How It Works

### **Upload Flow:**

```
User selects image
   ↓
validateImage() → Check type & size
   ↓
previewImage() → Show preview in browser
   ↓
User clicks "Add Product"
   ↓
compressImage() → Resize to 800x800px (saves bandwidth)
   ↓
uploadImageToS3() → Direct upload via AWS SDK
   ↓
Progress: 0% → 30% → 50% → 100%
   ↓
Get S3 URL: https://live-kart-product-images.s3.us-east-1.amazonaws.com/product-images/product_123.jpg
   ↓
lambdaAPI.createProduct() → Save to DynamoDB with S3 URL
   ↓
Product appears in "My Products" with S3 image
```

### **Image Processing:**

- **Original**: 3.5MB (4000x3000px)
- **Compressed**: 180KB (800x800px, 85% quality)
- **Upload time**: ~2-3 seconds
- **Storage**: Product images folder in S3

---

## 📊 File Structure

```
S3 Bucket: live-kart-product-images
├── frontend-assets/           # Static images (navbar, categories, banners)
│   ├── banner1.jpg
│   ├── category-electronics.jpg
│   └── ...
└── product-images/            # Vendor uploaded product images ✨ NEW
    ├── product_1730476800123_abc123.jpg
    ├── product_1730476801456_def456.png
    └── ...
```

### **URL Format:**

```
https://live-kart-product-images.s3.us-east-1.amazonaws.com/product-images/{filename}
```

**Example:**

```
https://live-kart-product-images.s3.us-east-1.amazonaws.com/product-images/product_1730476800123_abc123.jpg
```

---

## 🔍 Troubleshooting

### **Problem: "Access denied. Please configure S3 bucket policy to allow uploads."**

**Solution:**

1. Check bucket policy includes `s3:PutObject` permission
2. Check CORS configuration allows `PUT` method
3. Verify Block Public Access is disabled for uploads

### **Problem: "Upload failed with status 403"**

**Solution:**

1. Bucket policy missing or incorrect
2. Block Public Access enabled
3. Resource path in bucket policy doesn't match `product-images/*`

### **Problem: Image preview shows but upload fails**

**Solution:**

1. Check browser console for exact error
2. Verify `.env` has correct bucket name: `VITE_S3_BUCKET=live-kart-product-images`
3. Check S3 bucket exists and is in `us-east-1` region

### **Problem: "S3 bucket not found"**

**Solution:**

1. Verify bucket name in `.env`: `VITE_S3_BUCKET=live-kart-product-images`
2. Verify bucket region in `.env`: `VITE_S3_REGION=us-east-1`
3. Check bucket exists in AWS Console

---

## ✅ Validation Features

### **Client-Side Validation:**

- ✅ **File type**: Only images (JPEG, PNG, WebP, GIF)
- ✅ **File size**: Max 5MB
- ✅ **Preview**: Live preview before upload
- ✅ **Compression**: Auto-resize to reduce file size

### **Error Messages:**

- `❌ File must be an image`
- `❌ Image size must be less than 5MB`
- `❌ Only JPEG, PNG, WebP, and GIF images are allowed`
- `❌ Access denied. Please configure S3 bucket policy to allow uploads.`

---

## 🎓 Technical Details

### **Libraries Used:**

- `@aws-sdk/client-s3` - AWS S3 SDK for browser
- `@aws-sdk/client-cognito-identity` - Cognito credentials (for future enhancement)

### **Upload Method:**

- Uses **AWS SDK** `PutObjectCommand`
- **Anonymous credentials** (bucket policy allows public upload to `product-images/*`)
- **Direct upload** from browser to S3 (no Lambda proxy)

### **Security:**

⚠️ **Current Setup (For College Project):**

- Public upload allowed to `product-images/` folder only
- Public read access to all bucket objects
- No authentication required for upload

✅ **Production Recommendations:**

- Use **Cognito Identity Pool** for authenticated uploads
- Use **Lambda pre-signed URLs** instead of public bucket policy
- Implement **CloudFront** for CDN and better security
- Add **file scanning** for malware/inappropriate content
- Implement **usage quotas** per vendor

---

## 📝 Summary

### **Before:**

- ❌ Image URL input (optional)
- ❌ Manual URL entry
- ❌ No validation
- ❌ Placeholder images

### **After:**

- ✅ File upload (required)
- ✅ Direct S3 upload
- ✅ Image validation & compression
- ✅ Live preview
- ✅ Progress tracking
- ✅ Real S3 URLs in DynamoDB
- ✅ Images display from S3

---

## 🚀 Next Steps

1. **Configure S3 bucket** (CORS + Bucket Policy) ← **DO THIS FIRST!**
2. Test image upload
3. Verify image appears in S3
4. Check product displays correctly
5. Test customer view shows S3 images

---

**Frontend running on:** Check terminal (likely http://localhost:5176/)

**Ready to upload!** Configure S3 bucket and start uploading product images! 📸✨
