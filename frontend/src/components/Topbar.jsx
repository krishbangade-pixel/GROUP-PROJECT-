
import { Bell, Search, Command, Users } from "lucide-react";

export default function Topbar() {
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
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        <div className="topbar-profile">
          <div className="profile-avatar">
            <Users size={19} />
          </div>

          <div className="profile-info">
            <strong>Team Workspace</strong>
            <span>Shared Project</span>
          </div>
        </div>
      </div>
    </header>
  );
}
