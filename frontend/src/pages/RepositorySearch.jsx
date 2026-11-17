
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  GitBranch,
  Sparkles,
  ArrowUpRight,
  Code2,
  Star,
  GitFork,
  BookOpen,
  Clock3,
  CheckCircle2,
  ListChecks,
  FileText,
  PackageCheck,
} from "lucide-react";

import RepoCard from "../components/RepoCard";

const demoRepositories = {
  "facebook/react": {
    name: "facebook/react",
    description: "The library for web and native user interfaces.",
    language: "JavaScript",
    stars: "238k",
    forks: "48.9k",
    updated: "2 hours ago",
    features: [
      "Component-based user interface development",
      "Reusable UI components",
      "Virtual DOM for efficient updates",
      "Declarative UI programming",
    ],
    prerequisites: [
      "Basic knowledge of JavaScript",
      "Understanding of HTML and CSS",
      "Node.js and npm installed",
      "Basic knowledge of React concepts",
    ],
    readmeSummary: `## React Overview

React is a JavaScript library for building user interfaces.

### Key Concepts
- Reusable components
- Virtual DOM
- Declarative UI programming
- Interactive applications

**Purpose:** Build modern web and native user interfaces.`,
  },

  "vercel/next.js": {
    name: "vercel/next.js",
    description: "The React framework for production applications.",
    language: "TypeScript",
    stars: "132k",
    forks: "28.1k",
    updated: "5 hours ago",
    features: [
      "Server-side rendering",
      "Static site generation",
      "File-based routing",
      "API route support",
      "Optimized image handling",
    ],
    prerequisites: [
      "Basic knowledge of JavaScript",
      "Understanding of React",
      "Node.js and npm installed",
      "Basic knowledge of TypeScript",
    ],
    readmeSummary: `## Next.js Overview

Next.js is a React framework for building full-stack web applications.

### Key Concepts
- Server-side rendering
- Static site generation
- File-based routing
- Performance optimization

**Purpose:** Build production-ready web applications.`,
  },
};

export default function RepositorySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      setError("Please enter a GitHub repository name.");
      setRepository(null);
      return;
    }

    setLoading(true);
    setError("");
    setRepository(null);

    setTimeout(() => {
      const result = demoRepositories[query];

      if (result) {
        setRepository(result);
      } else {
        setError(
          "Demo repository not found. Try facebook/react or vercel/next.js."
        );
      }

      setLoading(false);
    }, 700);
  };

  return (
    <div className="search-page">
      <section className="search-hero">
        <span className="welcome-badge">
          <Sparkles size={14} />
          REPOSITORY EXPLORER
        </span>

        <h1>
          Discover any
          <br />
          <span>GitHub repository.</span>
        </h1>

        <p>
          Enter a public repository name and explore its
          technologies, features and project overview.
        </p>

        <form className="repository-search-form" onSubmit={handleSearch}>
          <GitBranch size={20} />

          <input
            type="text"
            placeholder="e.g. facebook/react"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            <Search size={17} />
            {loading ? "Searching..." : "Analyze"}
          </button>
        </form>

        <div className="search-examples">
          <span>Try:</span>

          <button
            type="button"
            onClick={() => setSearchQuery("facebook/react")}
          >
            facebook/react
          </button>

          <button
            type="button"
            onClick={() => setSearchQuery("vercel/next.js")}
          >
            vercel/next.js
          </button>
        </div>
      </section>

      {loading && (
        <div className="search-message">
          <Sparkles size={22} />
          <p>Exploring repository...</p>
        </div>
      )}

      {error && <div className="search-error">{error}</div>}

      {repository && (
        <section className="search-results">
          <div className="section-heading">
            <div>
              <h2>Repository Found</h2>
              <p>Demo repository information</p>
            </div>

            <span className="result-badge">
              <Sparkles size={14} />
              Demo data
            </span>
          </div>

          <RepoCard {...repository} />

          <div className="repository-insights">
            <div className="insight-card">
              <div className="insight-icon"><Code2 size={20} /></div>
              <h3>Technology</h3>
              <p>{repository.language}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><Star size={20} /></div>
              <h3>Stars</h3>
              <p>{repository.stars}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><GitFork size={20} /></div>
              <h3>Forks</h3>
              <p>{repository.forks}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><Clock3 size={20} /></div>
              <h3>Last Updated</h3>
              <p>{repository.updated}</p>
            </div>
          </div>

          <div className="repository-info-panel">
            <div className="info-panel-icon"><BookOpen size={20} /></div>
            <div>
              <h3>Project Overview</h3>
              <p>{repository.description}</p>
            </div>
            <ArrowUpRight size={18} />
          </div>

          <div className="repository-detail-grid">
            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><ListChecks size={20} /></div>
                <div>
                  <h3>Key Features</h3>
                  <p>Main project capabilities</p>
                </div>
              </div>

              <ul className="detail-list">
                {repository.features.map((feature, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><PackageCheck size={20} /></div>
                <div>
                  <h3>Prerequisites</h3>
                  <p>Knowledge and tools required</p>
                </div>
              </div>

              <ul className="detail-list">
                {repository.prerequisites.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="readme-summary-card">
            <div className="detail-card-heading">
              <div className="detail-icon"><FileText size={20} /></div>
              <div>
                <h3>README Summary</h3>
                <p>Simplified project documentation overview</p>
              </div>
            </div>

            <div className="readme-summary-text markdown-content">
              <ReactMarkdown>{repository.readmeSummary}</ReactMarkdown>
            </div>

            <span className="demo-summary-label">
              <Sparkles size={14} />
              Sample Markdown - not generated from live README
            </span>
          </section>
        </section>
      )}

      {!repository && !loading && !error && (
        <section className="search-empty-state">
          <div className="empty-icon"><GitBranch size={30} /></div>
          <h2>Ready to explore?</h2>
          <p>Search a demo repository to see its information here.</p>
        </section>
      )}
    </div>
  );
}
