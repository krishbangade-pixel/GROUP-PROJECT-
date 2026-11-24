import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, Eye, EyeOff, AlertCircle, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeUpdates, setAgreeUpdates] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!username.trim()) {
      setError("Please choose a username.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup({ name, username, email, password });
      navigate("/");
    } catch (err) {
      setError(
        err?.message || "Failed to create Supabase account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: "Too short", color: "#f85149" };
    if (password.length < 10) return { label: "Good", color: "#d29922" };
    return { label: "Strong", color: "#3fb950" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo" aria-label="RepoRadar Home">
            <div className="auth-brand-icon">
              <GitBranch size={26} />
            </div>
          </Link>
          <h1>Join RepoRadar</h1>
          <p>Create your account backed by Supabase</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Krish Bangade"
                required
                autoFocus
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
                  )
                }
                placeholder="e.g. krishbangade-pixel"
                required
              />
              <span className="auth-hint">
                Only lowercase letters, numbers, hyphens and underscores.
              </span>
            </div>

            <div className="auth-form-group">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
              />
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label htmlFor="signup-password">Password</label>
                {strength && (
                  <span
                    className="auth-password-strength"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                )}
              </div>
              <div className="auth-input-password-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-checkbox-group">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeUpdates}
                  onChange={(e) => setAgreeUpdates(e.target.checked)}
                />
                <span>
                  Send me periodic updates about new repository analyzers and AI features.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating Supabase account..." : "Create account"}
            </button>
          </form>

          <div className="auth-supabase-badge">
            <Database size={13} />
            <span>Powered by Supabase Auth & PostgreSQL</span>
          </div>

          <div className="auth-terms-note">
            By creating an account, you agree to the{" "}
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>{" "}
            and acknowledge the{" "}
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
          </div>
        </div>

        <div className="auth-switch-card">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
          .
        </div>

        <footer className="auth-footer">
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
          <a href="#docs" onClick={(e) => e.preventDefault()}>Docs</a>
          <a href="#contact" onClick={(e) => e.preventDefault()}>Contact Support</a>
        </footer>
      </div>
    </div>
  );
}
