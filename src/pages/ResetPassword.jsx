import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { resetPassword } from "../utils/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center">
          <h1 className="text-xl font-semibold text-[#B11C20] mb-2">
            Invalid Link
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-[#2360BB] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-[#B11C200A] to-[#2360BB0D] border-b border-gray-100 px-8 pt-10 pb-6 text-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-auto mx-auto object-contain"
            />
            <h1 className="text-xl font-semibold text-[#B11C20] mt-4">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                New Password
              </label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:border-[#2360BB] focus-within:ring-2 focus-within:ring-[#2360BB]/20">
                <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
                  <Lock size={20} strokeWidth={1.8} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="flex-1 min-w-0 bg-transparent border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:border-[#2360BB] focus-within:ring-2 focus-within:ring-[#2360BB]/20">
                <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
                  <Lock size={20} strokeWidth={1.8} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="flex-1 min-w-0 bg-transparent border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="form-btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-[#2360BB] hover:text-[#B11C20] hover:underline w-full text-center"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
