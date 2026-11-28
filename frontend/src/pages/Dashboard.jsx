import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { getDashboardStats, getRecentRepositories } from "../services/db";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    repositoriesAnalyzed: 0,
    totalSearches: 0,
    aiSummaries: 0,
    commitsReviewed: 0,
  });
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [stats, repos] = await Promise.all([
          getDashboardStats(user?.id),
          getRecentRepositories(4, user?.id),
        ]);

        if (mounted) {
          setStatsData(stats);
          setRepositories(repos);
        }
      } catch (err) {
        console.warn("Could not load dashboard data:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const stats = [
    {
      title: "Repositories Analyzed",
      value: String(statsData.repositoriesAnalyzed),
      change: statsData.repositoriesAnalyzed > 0 ? "Active" : "Ready",
      description: "Explored projects",
      icon: FolderGit2,
      color: "purple",
    },
    {
      title: "Total Searches",
      value: String(statsData.totalSearches),
      change: statsData.totalSearches > 0 ? "Synced" : "Ready",
      description: "Search history",
      icon: Search,
      color: "blue",
    },
    {
      title: "AI Summaries",
      value: String(statsData.aiSummaries),
      change: statsData.aiSummaries > 0 ? "Saved" : "Ready",
      description: "Saved in database",
      icon: Sparkles,
      color: "pink",
    },
    {
      title: "Commits Reviewed",
      value: String(statsData.commitsReviewed),
      change: statsData.commitsReviewed > 0 ? "Analyzed" : "Ready",
      description: "Commit analyses",
      icon: Activity,
      color: "orange",
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
            beginner-friendly insights with AI-powered summaries backed by Supabase.
          </p>

          <Link
            to="/search"
            className="primary-button"
            style={{ textDecoration: "none" }}
          >
            <Search size={18} />
            Explore Repository
            <ArrowUpRight size={17} />
          </Link>
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
              <div><span>04</span> &nbsp; database: <b>"Supabase"</b></div>
              <div><span>05</span> {"}"};</div>
            </div>

            <div className="visual-ai">
              <Sparkles size={17} />
              <span>Supabase Database Connected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>Your live repository activity in Supabase.</p>
          </div>

          <span className="period-label">
            <TrendingUp size={15} />
            Live Database
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
            <p>Continue exploring your recently analyzed projects.</p>
          </div>

          <Link to="/history" className="view-all-link">
            View history
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="search-empty-state" style={{ margin: "10px 0", padding: "28px" }}>
            <p>Loading your activity from Supabase...</p>
          </div>
        ) : repositories.length > 0 ? (
          <div className="repositories-grid">
            {repositories.map((repo) => (
              <RepoCard key={repo.name} {...repo} />
            ))}
          </div>
        ) : (
          <div className="search-empty-state" style={{ margin: "10px 0" }}>
            <div className="empty-icon">
              <FolderGit2 size={24} />
            </div>
            <h2>No repositories analyzed yet</h2>
            <p>Search any public GitHub repository to view AI summaries, dependencies, and metrics here.</p>
            <Link
              to="/search"
              className="primary-button"
              style={{ marginTop: "16px", textDecoration: "none" }}
            >
              <Search size={16} />
              Search First Repository
            </Link>
          </div>
        )}
      </section>

      <section className="dashboard-tip">
        <div className="tip-icon">
          <Zap size={20} />
        </div>

        <div>
          <h3>Make sense of any codebase</h3>
          <p>
            Search a public repository to explore its features,
            technologies, prerequisites and recent commit activity.
          </p>
        </div>

        <Star size={20} className="tip-star" />
      </section>
    </div>
  );
}
