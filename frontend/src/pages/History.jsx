
import { useState } from "react";

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

import {
  getSearchHistory,
  getSavedSummaries,
  isSummarySaved,
  saveSummary,
  removeSavedSummary,
} from "../utils/storage";

export default function History() {
  const [historyItems] = useState(() => getSearchHistory());
  const [savedSummaries, setSavedSummaries] = useState(() => getSavedSummaries());

  const handleSave = (item) => {
    if (isSummarySaved(item.id)) return;

    setSavedSummaries(saveSummary(item));
  };

  const handleRemove = (id) => {
    setSavedSummaries(removeSavedSummary(id));
  };

  return (
    <div className="history-page">
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

      <section className="history-summary">
        <div className="history-summary-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <h3>Your exploration journey</h3>
          <p>
            You have explored {historyItems.length} {historyItems.length === 1 ? "repository" : "repositories"}{" "}
            and saved {savedSummaries.length} {savedSummaries.length === 1 ? "summary" : "summaries"}.
          </p>
        </div>

        <span className="history-count">
          {historyItems.length} Repositories
        </span>
      </section>

      <section className="history-list-section">
        <div className="section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Your recently analyzed repositories.</p>
          </div>
        </div>

        {historyItems.length > 0 ? (
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

                  <button
                    type="button"
                    className={`save-summary-button ${
                      isSummarySaved(item.id) ? "saved" : ""
                    }`}
                    onClick={() => handleSave(item)}
                    disabled={isSummarySaved(item.id)}
                    title={
                      isSummarySaved(item.id)
                        ? "Already saved"
                        : "Save summary"
                    }
                  >
                    {isSummarySaved(item.id) ? (
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

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${item.name}`}
                    >
                      <ArrowUpRight size={19} />
                    </a>
                  ) : (
                    <ArrowUpRight size={19} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state">
            <div className="empty-icon">
              <Search size={27} />
            </div>
            <h3>No repositories analyzed yet</h3>
            <p>
              Analyze a public GitHub repository to see it appear in your history.
            </p>
          </div>
        )}
      </section>

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
                  {item.source === "demo" ? (
                    <span className="history-demo-badge">
                      Demo Summary
                    </span>
                  ) : (
                    <span className="history-live-badge">
                      Saved summary
                    </span>
                  )}

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
