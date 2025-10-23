LiveKart backend (Express -> serverless)

Environment variables expected:

- AWS_REGION
- S3_BUCKET (default livekart-product-images)
- DDB_TABLE (default LiveKartProducts)
- SES_SENDER

Deploy options:

- Package as zip and upload to Lambda
- Use Serverless Framework or AWS SAM to deploy

Endpoints:

- POST /sign-s3
- POST /addProduct
- GET /getProducts
- POST /placeOrder
- GET /getTrending
