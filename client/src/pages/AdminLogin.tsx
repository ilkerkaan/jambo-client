import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "google">("password");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // TODO: Replace with actual API call to SaaS backend
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // Demo: Accept any email/password for development
      if (email && password.length >= 6) {
        // Store auth token in localStorage
        localStorage.setItem("adminToken", "demo_token_" + Date.now());
        localStorage.setItem("adminEmail", email);
        setLocation("/admin");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    try {
      setLoading(true);
      setError("");

      // TODO: Implement Google OAuth flow
      // This would typically redirect to Google's OAuth endpoint
      // and then back to a callback URL that exchanges the code for a token

      // For now, show a placeholder
      setError("Google login coming soon. Please use password login for now.");
      setLoading(false);
    } catch (err) {
      setError("Google login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Inkless Is More" 
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-2xl font-bold">Inkless Is More</h1>
          </div>
          <p className="text-muted-foreground">Admin Dashboard Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your business dashboard to manage bookings and settings
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Method Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setLoginMethod("password")}
                className={`pb-2 px-4 font-medium transition-colors ${
                  loginMethod === "password"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setLoginMethod("google")}
                className={`pb-2 px-4 font-medium transition-colors ${
                  loginMethod === "google"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Google
              </button>
            </div>

            {/* Password Login Form */}
            {loginMethod === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@inklessismore.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Google Login */}
            {loginMethod === "google" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Sign in with your Google account to access the admin dashboard
                </p>

                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  onClick={() => setLoginMethod("password")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Use Password Instead
                </Button>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <p className="text-blue-800">
                Email: <code className="font-mono">admin@inklessismore.ke</code>
              </p>
              <p className="text-blue-800">
                Password: <code className="font-mono">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Inkless Is More. All rights reserved.
        </p>
      </div>
    </div>
  );
}

