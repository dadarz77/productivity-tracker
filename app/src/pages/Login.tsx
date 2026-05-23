import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  LogIn,
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function getOAuthUrl() {
  const appID = import.meta.env.VITE_APP_ID;
  const authUrl = new URL(`${import.meta.env.VITE_KIMI_AUTH_URL}/oauth/authorize`);
  authUrl.searchParams.set("client_id", appID);
  authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/oauth/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", btoa(window.location.pathname));
  return authUrl.toString();
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Login successful!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (err) => {
      setError(err.message || "Invalid credentials");
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Account created successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      registerMutation.mutate({
        username,
        password,
        displayName: displayName || username,
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Card */}
        <div className="glass-elevated rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login"
                ? "Sign in to your DecisionPilot account"
                : "Start making smarter decisions today"}
            </p>
          </div>

          {/* OAuth Button */}
          <a
            href={getOAuthUrl()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm font-medium mb-6"
          >
            <LogIn className="w-4 h-4" />
            Continue with Kimi OAuth
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 focus:ring-1 focus:ring-[#00e5c0]/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 focus:ring-1 focus:ring-[#00e5c0]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 focus:ring-1 focus:ring-[#00e5c0]/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-[#00e5c0] hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-[#00e5c0] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
