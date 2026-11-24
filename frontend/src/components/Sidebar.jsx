import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  History,
  Settings,
  GitBranch,
  Sparkles,
  GitCommit,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Repository Search", path: "/search", icon: Search },
  { name: "History", path: "/history", icon: History },
  { name: "Commit Analyzer", path: "/commit-analyzer", icon: GitCommit },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GitBranch size={22} />
        </div>

        <div>
          <h2>RepoRadar</h2>
          <span>AI Repository Explorer</span>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Sparkles size={18} />
          </div>

          <h3>AI-powered insights</h3>
          <p>Understand any repository in seconds.</p>
        </div>

        <NavLink to="/settings" className="nav-link">
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        {user ? (
          <div className="sidebar-footer">
            <div className="user-avatar">{initial}</div>

            <div className="user-details">
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </div>

            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="sidebar-footer">
            <Link to="/login" className="sidebar-login-link">
              <LogIn size={16} />
              <span>Sign in to workspace</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
