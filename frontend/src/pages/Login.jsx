import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      login({ identifier, password });
      setLoading(false);
      navigate("/");
    }, 400);
  };

  const handleDemoFill = () => {
    setIdentifier("krishbangade-pixel");
    setPassword("password123");
    setError("");
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
          <p>Enter your credentials to access your workspace</p>
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
                placeholder="name@example.com"
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
                    alert("Demo mode: Any password with 6+ characters will sign you in.");
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoFill}
          >
            <Sparkles size={15} />
            <span>Use Demo Account (krishbangade-pixel)</span>
          </button>
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
