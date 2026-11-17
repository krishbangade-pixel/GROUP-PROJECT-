
import { useEffect, useState } from "react";

import {
  History as HistoryIcon,
  GitBranch,
  Search,
  Sparkles,
  ArrowUpRight,
  Clock3,
  Star,
  GitFork,
  Bookmark,
  BookmarkCheck,
  Trash2,
  FileText,
  CheckCircle2,
} from "lucide-react";

const historyItems = [
  {
    id: 1,
    name: "facebook/react",
    description: "The library for web and native user interfaces.",
    language: "JavaScript",
    stars: "238k",
    forks: "48.9k",
    updated: "2 hours ago",
    analyzed: "Today",
    summary:
      "React is a JavaScript library for building user interfaces. It supports reusable components and interactive web applications.",
  },
  {
    id: 2,
    name: "vercel/next.js",
    description: "The React framework for production applications.",
    language: "TypeScript",
    stars: "132k",
    forks: "28.1k",
    updated: "5 hours ago",
    analyzed: "Yesterday",
    summary:
      "Next.js is a React framework for building full-stack web applications with routing, rendering strategies and performance optimization.",
  },
];

const STORAGE_KEY = "reporadar_saved_summaries";

export default function History() {
  const [savedSummaries, setSavedSummaries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedSummaries)
      );
    } catch (error) {
      console.error("Unable to save summaries:", error);
    }
  }, [savedSummaries]);

  const isSaved = (id) =>
    savedSummaries.some((item) => item.id === id);

  const handleSave = (item) => {
    if (isSaved(item.id)) return;

    setSavedSummaries((previous) => [
      ...previous,
      {
        ...item,
        savedAt: new Date().toLocaleDateString(),
      },
    ]);
  };

  const handleRemove = (id) => {
    setSavedSummaries((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="history-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div className="heading-icon">
          <HistoryIcon size={23} />
        </div>

        <div>
          <h1>Search History</h1>
          <p>
            Revisit repositories you have recently explored.
          </p>
        </div>
      </section>

      {/* SUMMARY OVERVIEW */}
      <section className="history-summary">
        <div className="history-summary-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <h3>Your exploration journey</h3>
          <p>
            You have explored {historyItems.length} demo repositories
            and saved {savedSummaries.length} summaries.
          </p>
        </div>

        <span className="history-count">
          {historyItems.length} Repositories
        </span>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="history-list-section">
        <div className="section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Your recently analyzed repositories.</p>
          </div>
        </div>

        <div className="history-list">
          {historyItems.map((item) => (
            <div className="history-item" key={item.id}>
              <div className="history-repo-icon">
                <GitBranch size={22} />
              </div>

              <div className="history-item-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="history-meta">
                  <span>{item.language}</span>

                  <span>
                    <Star size={14} />
                    {item.stars}
                  </span>

                  <span>
                    <GitFork size={14} />
                    {item.forks}
                  </span>

                  <span>
                    <Clock3 size={14} />
                    Updated {item.updated}
                  </span>
                </div>
              </div>

              <div className="history-item-right">
                <span className="history-date">
                  {item.analyzed}
                </span>

                <span className="history-demo-badge">
                  Demo
                </span>

                <button
                  type="button"
                  className={`save-summary-button ${
                    isSaved(item.id) ? "saved" : ""
                  }`}
                  onClick={() => handleSave(item)}
                  disabled={isSaved(item.id)}
                  title={
                    isSaved(item.id)
                      ? "Already saved"
                      : "Save summary"
                  }
                >
                  {isSaved(item.id) ? (
                    <>
                      <BookmarkCheck size={16} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      Save Summary
                    </>
                  )}
                </button>

                <ArrowUpRight size={19} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAVED SUMMARIES */}
      <section className="saved-summaries-section">
        <div className="section-heading">
          <div>
            <h2>
              <Bookmark size={20} />
              Saved Summaries
            </h2>

            <p>
              Repository summaries you have bookmarked.
            </p>
          </div>

          <span className="saved-count">
            {savedSummaries.length} Saved
          </span>
        </div>

        {savedSummaries.length > 0 ? (
          <div className="saved-summaries-grid">
            {savedSummaries.map((item) => (
              <article
                className="saved-summary-card"
                key={item.id}
              >
                <div className="saved-summary-top">
                  <div className="saved-summary-icon">
                    <FileText size={21} />
                  </div>

                  <span className="saved-status">
                    <CheckCircle2 size={13} />
                    Saved
                  </span>
                </div>

                <h3>{item.name}</h3>

                <p className="saved-summary-description">
                  {item.summary}
                </p>

                <div className="saved-summary-meta">
                  <span>{item.language}</span>
                  <span>Saved: {item.savedAt}</span>
                </div>

                <div className="saved-summary-footer">
                  <span className="history-demo-badge">
                    Demo Summary
                  </span>

                  <button
                    type="button"
                    className="remove-summary-button"
                    onClick={() => handleRemove(item.id)}
                    title="Remove saved summary"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state">
            <div className="empty-icon">
              <Bookmark size={27} />
            </div>

            <h3>No saved summaries yet</h3>

            <p>
              Save a repository summary from Recent Activity.
              Your saved summaries will appear here.
            </p>
          </div>
        )}
      </section>

      {/* SEARCH ANOTHER REPOSITORY */}
      <section className="history-empty-tip">
        <div className="empty-icon">
          <Search size={25} />
        </div>

        <h3>Want to explore another repository?</h3>

        <p>
          Head to Repository Search and discover another project.
        </p>

        <a href="/search" className="primary-button">
          <Search size={17} />
          Search Repository
        </a>
      </section>
    </div>
  );
}
