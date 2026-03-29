import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import { adminLogin, forgotPassword } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await adminLogin(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setForgotLoading(true);
    try {
      const data = await forgotPassword(forgotEmail.trim());
      setForgotSuccess(
        data.message ||
          "If an account with that email exists, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-linear-to-r from-indigo-500/10 to-indigo-400/5 border-b border-gray-100 px-8 pt-10 pb-6 text-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-14 w-auto mx-auto object-contain"
              />
              <h1 className="text-xl font-semibold text-indigo-600 mt-4">
                Reset Password
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email to receive a reset link
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="p-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {forgotSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                  {forgotSuccess}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Email
                </label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:border-[#2360BB] focus-within:ring-2 focus-within:ring-[#2360BB]/20">
                  <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
                    <Mail size={20} strokeWidth={1.8} />
                  </span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="flex-1 min-w-0 bg-transparent border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    disabled={forgotLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="form-btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                {forgotLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setError("");
                  setForgotSuccess("");
                }}
                className="text-sm text-[#2360BB] hover:text-indigo-600 hover:underline w-full text-center"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-indigo-500/10 to-indigo-400/5 border-b border-gray-100 px-8 pt-10 pb-6 text-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-auto mx-auto object-contain"
            />
            <h1 className="text-xl font-semibold text-indigo-600 mt-4">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in with your admin email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Email</label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:border-[#2360BB] focus-within:ring-2 focus-within:ring-[#2360BB]/20">
                <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
                  <Mail size={20} strokeWidth={1.8} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="flex-1 min-w-0 bg-transparent border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:border-[#2360BB] focus-within:ring-2 focus-within:ring-[#2360BB]/20">
                <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
                  <Lock size={20} strokeWidth={1.8} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 min-w-0 bg-transparent border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setError("");
                }}
                className="text-sm text-[#2360BB] hover:text-indigo-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="form-btn-primary w-full mt-4 inline-flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
