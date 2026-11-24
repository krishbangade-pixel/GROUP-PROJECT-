import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Command, LogOut, LogIn, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />
        <span>Search repositories, projects...</span>
        <kbd>
          <Command size={12} /> K
        </kbd>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        {user ? (
          <div className="topbar-profile-container" ref={dropdownRef}>
            <button
              className="topbar-profile"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-label="User menu"
            >
              <div className="profile-avatar">
                {initial}
              </div>

              <div className="profile-info">
                <strong>{user.name}</strong>
                <span>@{user.username}</span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <span>Signed in as</span>
                  <strong>{user.username}</strong>
                  <small>{user.email}</small>
                </div>

                <div className="dropdown-divider"></div>

                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-item dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar-auth-buttons">
            <Link to="/login" className="topbar-login-btn">
              <LogIn size={15} />
              <span>Sign in</span>
            </Link>
            <Link to="/signup" className="topbar-signup-btn">
              <span>Sign up</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
