// Authentication & Authorization Helper for Lambda Functions

const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const REGION = process.env.AWS_REGION || "us-east-1";
const USER_POOL_ID = process.env.USER_POOL_ID;
const COGNITO_ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

// JWKS client to verify Cognito JWT tokens
const client = jwksClient({
  jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`,
});

/**
 * Get signing key from JWKS
 */
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify and decode JWT token from Cognito
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<Object>} Decoded token with user info
 */
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: COGNITO_ISSUER,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

/**
 * Extract user info from decoded token
 * @param {Object} decoded - Decoded JWT token
 * @returns {Object} User info (sub, email, role, etc.)
 */
function getUserInfo(decoded) {
  return {
    userId: decoded.sub,
    email: decoded.email,
    username: decoded["cognito:username"],
    role: decoded["custom:role"] || "customer", // Get role from custom attribute
    groups: decoded["cognito:groups"] || [],
  };
}

/**
 * Check if user has required role
 * @param {string} userRole - User's role from custom:role attribute
 * @param {Array} userGroups - User's Cognito groups
 * @param {Array} requiredRoles - Required roles (e.g., ['admin', 'vendor'])
 * @returns {boolean}
 */
function hasRole(userRole, userGroups, requiredRoles) {
  // Check both custom:role attribute and cognito:groups
  return (
    requiredRoles.includes(userRole) ||
    requiredRoles.some((role) => userGroups.includes(role))
  );
}

/**
 * Parse Authorization header and get token
 * @param {Object} headers - Lambda event headers
 * @returns {string|null} JWT token or null
 */
function getTokenFromHeaders(headers) {
  const authHeader = headers.Authorization || headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to authenticate and authorize Lambda requests
 * @param {Object} event - Lambda event
 * @param {Array} requiredRoles - Required roles (optional)
 * @returns {Object} { success, user, error }
 */
async function authenticate(event, requiredRoles = []) {
  try {
    // Get token from headers
    const token = getTokenFromHeaders(event.headers);

    if (!token) {
      return {
        success: false,
        error: "No authorization token provided",
        statusCode: 401,
      };
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = getUserInfo(decoded);

    // Check role if required
    if (
      requiredRoles.length > 0 &&
      !hasRole(user.role, user.groups, requiredRoles)
    ) {
      return {
        success: false,
        error: "Insufficient permissions",
        statusCode: 403,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Invalid or expired token",
      statusCode: 401,
    };
  }
}

/**
 * Create Lambda response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @param {Object} headers - Additional headers
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

module.exports = {
  verifyToken,
  getUserInfo,
  hasRole,
  getTokenFromHeaders,
  authenticate,
  createResponse,
};
