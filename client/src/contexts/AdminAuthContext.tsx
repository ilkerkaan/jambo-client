import { createContext, useContext, useState, useEffect } from "react";

interface AdminUser {
  email: string;
  name?: string;
  role: "owner" | "manager" | "staff";
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    
    if (token && email) {
      // Verify token is still valid
      setUser({
        email,
        role: "owner", // Default role
      });
    }
    
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to SaaS backend
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      // Demo: Accept any email/password for development
      if (email && password.length >= 6) {
        const token = "demo_token_" + Date.now();
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminEmail", email);
        
        setUser({
          email,
          role: "owner",
        });
      } else {
        throw new Error("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function googleLogin(token: string) {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth token verification
      // const response = await fetch('/api/admin/google-login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      throw new Error("Google login not yet implemented");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setUser(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

