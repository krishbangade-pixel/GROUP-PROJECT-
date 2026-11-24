
import {
  Settings,
  Users,
  Palette,
  ShieldCheck,
  Info,
  GitBranch,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-heading">
        <div className="heading-icon">
          <Settings size={22} />
        </div>
        <div>
          <h1>Settings</h1>
          <p>Manage your RepoRadar workspace preferences.</p>
        </div>
      </div>

      <section className="settings-section">
        <div className="settings-section-heading">
          <Users size={20} />
          <div>
            <h2>Workspace</h2>
            <p>General workspace information.</p>
          </div>
        </div>

        <div className="settings-info-row">
          <span>Workspace name</span>
          <strong>Team Workspace</strong>
        </div>

        <div className="settings-info-row">
          <span>Project</span>
          <strong>RepoRadar AI</strong>
        </div>

        <div className="settings-info-row">
          <span>Workspace type</span>
          <strong>Shared Project</strong>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <Palette size={20} />
          <div>
            <h2>Appearance</h2>
            <p>Current interface appearance.</p>
          </div>
        </div>

        <div className="settings-info-row">
          <span>Theme</span>
          <strong>Dark</strong>
        </div>

        <div className="settings-info-row">
          <span>Accent colors</span>
          <strong>GitHub Dark (Blue & Slate)</strong>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <ShieldCheck size={20} />
          <div>
            <h2>Application</h2>
            <p>Repository explorer information.</p>
          </div>
        </div>

        <div className="settings-info-row">
          <span>Repository access</span>
          <strong>Public repositories</strong>
        </div>

        <div className="settings-info-row">
          <span>Analysis mode</span>
          <strong>Demo Preview</strong>
        </div>
      </section>

      <section className="settings-about">
        <div className="settings-about-icon">
          <GitBranch size={22} />
        </div>
        <div>
          <h3>About RepoRadar AI</h3>
          <p>
            Explore GitHub repositories and understand their technologies,
            features and project structure through a simple interface.
          </p>
          <span><Info size={14} /> RepoRadar AI · 2026</span>
        </div>
      </section>
    </div>
  );
}
