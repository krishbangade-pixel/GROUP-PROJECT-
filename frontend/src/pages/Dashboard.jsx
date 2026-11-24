
import {
  GitBranch,
  Search,
  Sparkles,
  FolderGit2,
  Activity,
  Star,
  ArrowUpRight,
  Zap,
  TrendingUp,
} from "lucide-react";

import StatCard from "../components/StatCard";
import RepoCard from "../components/RepoCard";

export default function Dashboard() {
  const stats = [
    {
      title: "Repositories Analyzed",
      value: "24",
      change: "+12.5%",
      description: "Compared to last month",
      icon: FolderGit2,
      color: "purple",
    },
    {
      title: "Total Searches",
      value: "86",
      change: "+8.2%",
      description: "Repository searches",
      icon: Search,
      color: "blue",
    },
    {
      title: "AI Summaries",
      value: "42",
      change: "+18.4%",
      description: "Generated summaries",
      icon: Sparkles,
      color: "pink",
    },
    {
      title: "Commits Reviewed",
      value: "318",
      change: "+24.6%",
      description: "Across all repositories",
      icon: Activity,
      color: "orange",
    },
  ];

  const repositories = [
    {
      name: "facebook/react",
      description:
        "The library for web and native user interfaces.",
      language: "JavaScript",
      stars: "238k",
      forks: "48.9k",
      updated: "2 hours ago",
    },
    {
      name: "vercel/next.js",
      description:
        "The React framework for production applications.",
      language: "TypeScript",
      stars: "132k",
      forks: "28.1k",
      updated: "5 hours ago",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-badge">
            <Sparkles size={14} />
            AI REPOSITORY INTELLIGENCE
          </span>

          <h1>
            Explore repositories.
            <br />
            <span>Understand code faster.</span>
          </h1>

          <p>
            Turn complex GitHub repositories into clear,
            beginner-friendly insights with AI-powered summaries.
          </p>

          <button
            className="primary-button"
            onClick={() => {
              window.location.href = "/search";
            }}
          >
            <Search size={18} />
            Explore Repository
            <ArrowUpRight size={17} />
          </button>
        </div>

        <div className="welcome-visual">
          <div className="visual-glow"></div>

          <div className="visual-card">
            <div className="visual-card-header">
              <GitBranch size={21} />
              <span>Repository Insights</span>
              <span className="live-dot"></span>
            </div>

            <div className="visual-code">
              <div><span>01</span> const repository = {"{"}</div>
              <div><span>02</span> &nbsp; name: <b>"awesome-project"</b>,</div>
              <div><span>03</span> &nbsp; insights: <b>AI.analyze()</b>,</div>
              <div><span>04</span> &nbsp; commits: <b>128</b></div>
              <div><span>05</span> {"}"};</div>
            </div>

            <div className="visual-ai">
              <Sparkles size={17} />
              <span>AI analysis completed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>Your repository activity at a glance.</p>
          </div>

          <span className="period-label">
            <TrendingUp size={15} />
            All time
          </span>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <section className="repositories-section">
        <div className="section-heading">
          <div>
            <h2>Recent Repositories</h2>
            <p>Continue exploring your recently viewed projects.</p>
          </div>

          <a href="/history" className="view-all-link">
            View history
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="repositories-grid">
          {repositories.map((repo) => (
            <RepoCard key={repo.name} {...repo} />
          ))}
        </div>
      </section>

      <section className="dashboard-tip">
        <div className="tip-icon">
          <Zap size={20} />
        </div>

        <div>
          <h3>Make sense of any codebase</h3>
          <p>
            Search a public repository to explore its features,
            technologies, prerequisites and recent activity.
          </p>
        </div>

        <Star size={20} className="tip-star" />
      </section>
    </div>
  );
}
