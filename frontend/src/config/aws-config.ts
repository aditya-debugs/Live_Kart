// AWS Configuration for LiveKart
// This file contains AWS service configurations
// Update these values after deploying the CloudFormation stack

export const awsConfig = {
  // AWS Region
  region: process.env.VITE_AWS_REGION || "us-east-1",

  // Cognito Configuration
  cognito: {
    userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || "",
    userPoolClientId: process.env.VITE_COGNITO_CLIENT_ID || "",
    identityPoolId: process.env.VITE_COGNITO_IDENTITY_POOL_ID || "",
  },

  // S3 Configuration
  s3: {
    bucketName: process.env.VITE_S3_BUCKET_NAME || "",
    region: process.env.VITE_AWS_REGION || "us-east-1",
  },

  // CloudFront Configuration
  cloudFront: {
    domain: process.env.VITE_CLOUDFRONT_DOMAIN || "",
    url: process.env.VITE_CLOUDFRONT_URL || "",
  },

  // API Configuration (Lambda Functions via API Gateway)
  api: {
    endpoint: process.env.VITE_API_ENDPOINT || "",
    region: process.env.VITE_AWS_REGION || "us-east-1",
  },

  // DynamoDB Tables
  dynamodb: {
    productsTable: process.env.VITE_DYNAMODB_PRODUCTS_TABLE || "",
    ordersTable: process.env.VITE_DYNAMODB_ORDERS_TABLE || "",
    sessionsTable: process.env.VITE_DYNAMODB_SESSIONS_TABLE || "",
    analyticsTable: process.env.VITE_DYNAMODB_ANALYTICS_TABLE || "",
  },
};

// Amplify Configuration
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: awsConfig.cognito.userPoolId,
      userPoolClientId: awsConfig.cognito.userPoolClientId,
      identityPoolId: awsConfig.cognito.identityPoolId,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  Storage: {
    S3: {
      bucket: awsConfig.s3.bucketName,
      region: awsConfig.s3.region,
    },
  },
};

export default awsConfig;
