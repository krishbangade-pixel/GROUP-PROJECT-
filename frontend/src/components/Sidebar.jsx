
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  History,
  Settings,
  GitBranch,
  Sparkles,
  Users,
  GitCommit,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Repository Search", path: "/search", icon: Search },
  { name: "History", path: "/history", icon: History },
  { name: "Commit Analyzer", path: "/commit-analyzer", icon: GitCommit },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GitBranch size={23} />
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

        <div className="sidebar-footer">
          <div className="user-avatar">
            <Users size={19} />
          </div>

          <div className="user-details">
            <strong>Team Workspace</strong>
            <span>Shared Project</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
