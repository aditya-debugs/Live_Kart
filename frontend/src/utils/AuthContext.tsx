import React, { createContext, useContext, useState, useEffect } from "react";
// import { Auth } from "aws-amplify"; // Commented out for local development

type User = {
  username: string;
  email: string;
  role: "customer" | "vendor" | "admin";
} | null;

interface AuthContextType {
  user: User;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, role?: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users database (for development only)
const mockUsers = [
  {
    email: "admin@livekart.com",
    password: "admin123",
    username: "admin",
    role: "admin" as const,
  },
  {
    email: "vendor@livekart.com",
    password: "vendor123",
    username: "vendor1",
    role: "vendor" as const,
  },
  {
    email: "customer@livekart.com",
    password: "customer123",
    username: "customer1",
    role: "customer" as const,
  },
];

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem("livekart_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("livekart_user");
      }
    }
    setLoading(false);

    // ===== AWS COGNITO CODE (COMMENTED OUT) =====
    // (async () => {
    //   try {
    //     const u = await Auth.currentAuthenticatedUser();
    //     setUser(u);
    //   } catch (e) {
    //     setUser(null);
    //   }
    // })();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      const userData = {
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
      };

      setUser(userData);
      localStorage.setItem("livekart_user", JSON.stringify(userData));
      setLoading(false);
      return userData;

      // ===== AWS COGNITO CODE (COMMENTED OUT) =====
      // const u = await Auth.signIn(email, password);
      // setUser(u);
      // return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: string = "customer"
  ) => {
    setLoading(true);
    try {
      // Mock sign up
      const newUser = {
        username: email.split("@")[0],
        email,
        role: role as "customer" | "vendor" | "admin",
      };

      // In a real app, you'd send this to your backend
      mockUsers.push({ ...newUser, password });

      setLoading(false);
      return {
        success: true,
        message: "Account created successfully! Please sign in.",
        user: newUser,
      };

      // ===== AWS COGNITO CODE (COMMENTED OUT) =====
      // return Auth.signUp({ username: email, password, attributes: { email } });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("livekart_user");

    // ===== AWS COGNITO CODE (COMMENTED OUT) =====
    // await Auth.signOut();
    // setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
