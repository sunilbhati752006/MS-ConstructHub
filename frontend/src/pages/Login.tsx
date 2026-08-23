import { useState } from "react";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

type AuthMode = "login" | "forgot" | "reset";

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Reset Password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =====================================
  // Login
  // =====================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      onLoginSuccess(data.token);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Send OTP
  // =====================================
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setSuccess("OTP has been sent to your registered email.");
      setMode("reset");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Reset Password
  // =====================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and contain uppercase, lowercase, and a number"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setSuccess(
        "Password reset successfully. You can now login with your new password."
      );

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Back to Login
  // =====================================
  const handleBackToLogin = () => {
    clearMessages();
    setMode("login");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* =====================================
            LOGIN
        ===================================== */}
        {mode === "login" && (
          <>
            <h1>MS ConstructHub</h1>
            <p>Construction Management Portal</p>

            <form onSubmit={handleLogin}>
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div
                style={{
                  textAlign: "right",
                  marginBottom: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode("forgot");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#2563eb",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </>
        )}

        {/* =====================================
            FORGOT PASSWORD
        ===================================== */}
        {mode === "forgot" && (
          <>
            <h1>Forgot Password?</h1>

            <p>
              Enter your registered email address and we'll
              send you a verification OTP.
            </p>

            <form onSubmit={handleSendOTP}>
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                style={{
                  marginTop: "10px",
                  background: "transparent",
                  color: "#2563eb",
                  border: "1px solid #2563eb",
                }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}

        {/* =====================================
            RESET PASSWORD
        ===================================== */}
        {mode === "reset" && (
          <>
            <h1>Reset Password</h1>

            <p>
              Enter the 6-digit OTP sent to your registered
              email and create a new password.
            </p>

            <form onSubmit={handleResetPassword}>
              <label>Email</label>

              <input
                type="email"
                value={email}
                disabled
              />

              <label>OTP</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                required
              />

              <label>New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />

              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

              <small
                style={{
                  display: "block",
                  marginBottom: "15px",
                  color: "#64748b",
                }}
              >
                Password must contain uppercase, lowercase,
                a number and be at least 8 characters.
              </small>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                style={{
                  marginTop: "10px",
                  background: "transparent",
                  color: "#2563eb",
                  border: "1px solid #2563eb",
                }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}