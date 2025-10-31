import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AdminInitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

type User = {
  username: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  accessToken?: string;
  idToken?: string;
} | null;

interface AuthContextType {
  user: User;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    username: string,
    role?: string
  ) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Cognito configuration
const REGION = (import.meta as any).env.VITE_AWS_REGION || "us-east-1";
const USER_POOL_ID = (import.meta as any).env.VITE_USER_POOL_ID;
const CLIENT_ID = (import.meta as any).env.VITE_USER_POOL_CLIENT_ID;

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem("livekart_user");
    const savedTokens = localStorage.getItem("livekart_tokens");

    if (savedUser && savedTokens) {
      try {
        const userData = JSON.parse(savedUser);
        const tokens = JSON.parse(savedTokens);

        // Verify token is still valid
        if (isTokenValid(tokens.idToken)) {
          setUser({ ...userData, ...tokens });
        } else {
          // Token expired, clear storage
          localStorage.removeItem("livekart_user");
          localStorage.removeItem("livekart_tokens");
        }
      } catch (e) {
        localStorage.removeItem("livekart_user");
        localStorage.removeItem("livekart_tokens");
      }
    }
    setLoading(false);
  }, []);

  // Check if JWT token is valid (not expired)
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error("Authentication failed");
      }

      const { AccessToken, IdToken, RefreshToken } =
        response.AuthenticationResult;

      // Decode ID token to get user info
      const idTokenPayload = JSON.parse(atob(IdToken!.split(".")[1]));

      // Get role from Cognito Groups (cognito:groups in token)
      // Or from custom attribute or default to customer
      const cognitoGroups = idTokenPayload["cognito:groups"] || [];
      let userRole: "customer" | "vendor" | "admin" = "customer";

      if (cognitoGroups.includes("Vendors")) {
        userRole = "vendor";
      } else if (cognitoGroups.includes("Admins")) {
        userRole = "admin";
      } else if (cognitoGroups.includes("Customers")) {
        userRole = "customer";
      }

      const userData = {
        username: idTokenPayload["cognito:username"] || email,
        email: idTokenPayload.email || email,
        role: userRole,
        accessToken: AccessToken,
        idToken: IdToken,
      };

      setUser(userData);
      localStorage.setItem(
        "livekart_user",
        JSON.stringify({
          username: userData.username,
          email: userData.email,
          role: userData.role,
        })
      );
      localStorage.setItem(
        "livekart_tokens",
        JSON.stringify({
          accessToken: AccessToken,
          idToken: IdToken,
          refreshToken: RefreshToken,
        })
      );

      setLoading(false);
      return userData;
    } catch (error: any) {
      setLoading(false);
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    role: string = "customer"
  ) => {
    setLoading(true);
    try {
      // Generate a username from email (remove @ and domain)
      // Or use the provided username, but ensure it's not in email format
      const cognitoUsername = username.includes("@")
        ? email.split("@")[0] + Math.random().toString(36).substring(2, 6)
        : username.replace(/[^a-zA-Z0-9]/g, "");

      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: cognitoUsername, // Use non-email username
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          {
            Name: "name",
            Value: username,
          },
          // Note: custom:role removed - attribute doesn't exist in User Pool
          // Role will be managed separately or added after User Pool configuration
        ],
      });

      const response = await cognitoClient.send(command);

      setLoading(false);
      return {
        success: true,
        message:
          "Account created! Please check your email for verification code.",
        userSub: response.UserSub,
        username: cognitoUsername, // Return the generated username
        role: role, // Store role locally for now
        needsConfirmation: true,
      };
    } catch (error: any) {
      setLoading(false);
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to sign up");
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error("Confirmation error:", error);
      throw new Error(error.message || "Failed to confirm sign up");
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("livekart_user");
    localStorage.removeItem("livekart_tokens");
  };

  const getAccessToken = () => {
    const tokens = localStorage.getItem("livekart_tokens");
    if (tokens) {
      try {
        const { idToken } = JSON.parse(tokens);
        return idToken;
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        loading,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
