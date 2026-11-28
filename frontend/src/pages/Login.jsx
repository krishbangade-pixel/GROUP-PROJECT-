import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, Eye, EyeOff, AlertCircle, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your username or email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login({ identifier, password });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.message ||
        "Invalid username or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo" aria-label="RepoRadar Home">
            <div className="auth-brand-icon">
              <GitBranch size={26} />
            </div>
          </Link>
          <h1>Sign in to RepoRadar</h1>
          <p>Connected to Supabase Authentication & Database</p>
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
              <label htmlFor="login-identifier">
                Username or email address
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or username"
                required
                autoFocus
              />
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <a
                  href="#forgot"
                  className="auth-link-subtle"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("To reset password, enter your email and contact the Supabase administrator.");
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="auth-input-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in with Supabase..." : "Sign in"}
            </button>
          </form>

          <div className="auth-supabase-badge">
            <Database size={13} />
            <span>Powered by Supabase Auth</span>
          </div>
        </div>

        <div className="auth-switch-card">
          <span>New to RepoRadar? </span>
          <Link to="/signup" className="auth-link">
            Create an account
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
