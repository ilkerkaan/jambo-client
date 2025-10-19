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
      setUser({
        email,
        role: "owner",
      });
    }
    
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    try {
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
        throw new Error("Password must be at least 6 characters");
      }
    } catch (error) {
      throw error;
    }
  }

  async function googleLogin(token: string) {
    try {
      throw new Error("Google login not yet implemented");
    } catch (error) {
      throw error;
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

