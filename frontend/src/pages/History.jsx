import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  History as HistoryIcon,
  GitBranch,
  Search,
  Sparkles,
  ArrowUpRight,
  BookmarkCheck,
  Trash2,
  Bookmark,
} from "lucide-react";

import {
  getSearchHistory,
  getSavedSummaries,
  saveSummary,
  removeSavedSummary,
} from "../services/db";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHistoryData() {
      try {
        const [history, saved] = await Promise.all([
          getSearchHistory(user?.id),
          getSavedSummaries(user?.id),
        ]);

        if (mounted) {
          setHistoryItems(history);
          setSavedSummaries(saved);
        }
      } catch (err) {
        console.warn("Could not load history from Supabase:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistoryData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSave = async (item) => {
    const updated = await saveSummary(item, user?.id);
    setSavedSummaries(updated);
  };

  const handleRemove = async (idOrName) => {
    const updated = await removeSavedSummary(idOrName, user?.id);
    setSavedSummaries(updated);
  };

  const isSaved = (item) => {
    return savedSummaries.some((s) => s.id === item.id || s.name === item.name);
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
            Revisit repositories and AI summaries stored in your Supabase database.
          </p>
        </div>
      </section>

      <section className="history-summary">
        <div className="history-summary-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <h3>Supabase Database Storage</h3>
          <p>
            Searches and bookmarks are synchronized with your Supabase account.
          </p>
        </div>

        <div className="history-count">
          {historyItems.length} explored · {savedSummaries.length} saved
        </div>
      </section>

      {/* SAVED SUMMARIES SECTION */}
      <section className="saved-summaries-section">
        <div className="section-heading">
          <h2>
            <BookmarkCheck size={20} />
            Saved Summaries ({savedSummaries.length})
          </h2>
          <p>Bookmarks saved to Supabase</p>
        </div>

        {loading ? (
          <div className="search-empty-state" style={{ padding: "26px" }}>
            <p>Loading saved summaries...</p>
          </div>
        ) : savedSummaries.length > 0 ? (
          <div className="saved-summaries-grid">
            {savedSummaries.map((item) => (
              <article className="saved-summary-card" key={item.id || item.name}>
                <div className="saved-summary-top">
                  <div className="saved-summary-icon">
                    <BookmarkCheck size={20} />
                  </div>

                  <span className="saved-status">
                    <BookmarkCheck size={14} />
                    Saved in Supabase
                  </span>
                </div>

                <Link
                  to={`/search?repo=${encodeURIComponent(item.name)}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3 style={{ cursor: "pointer" }}>{item.name}</h3>
                </Link>

                <p className="saved-summary-description">
                  {item.summary || item.description || "No summary text provided."}
                </p>

                <div className="saved-summary-meta">
                  <span>{item.language || "Not specified"}</span>
                  <span>Saved: {item.savedAt}</span>
                </div>

                <div className="saved-summary-footer">
                  <Link
                    to={`/search?repo=${encodeURIComponent(item.name)}`}
                    className="view-all-link"
                    style={{ fontSize: "12px" }}
                  >
                    View analysis
                    <ArrowUpRight size={14} />
                  </Link>

                  <button
                    type="button"
                    className="remove-summary-button"
                    onClick={() => handleRemove(item.id || item.name)}
                    title="Remove saved summary"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state">
            <div className="empty-icon">
              <Bookmark size={22} />
            </div>
            <h3>No saved summaries yet</h3>
            <p>
              When exploring repositories, click "Save summary" to store reference insights in your Supabase database.
            </p>
          </div>
        )}
      </section>

      {/* SEARCH HISTORY SECTION */}
      <section className="history-list-section">
        <div className="section-heading">
          <h2>Recent Activity ({historyItems.length})</h2>
          <p>All repositories you have searched</p>
        </div>

        {loading ? (
          <div className="search-empty-state" style={{ padding: "26px" }}>
            <p>Loading search history...</p>
          </div>
        ) : historyItems.length > 0 ? (
          <div className="history-list">
            {historyItems.map((item) => {
              const saved = isSaved(item);

              return (
                <article className="history-item" key={item.id || item.name}>
                  <div className="history-repo-icon">
                    <GitBranch size={22} />
                  </div>

                  <div className="history-item-content">
                    <Link
                      to={`/search?repo=${encodeURIComponent(item.name)}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3 style={{ cursor: "pointer" }}>{item.name}</h3>
                    </Link>

                    <p>
                      {item.summary || item.description || "Explored repository"}
                    </p>

                    <div className="history-meta">
                      {item.language && <span>{item.language}</span>}
                      {item.stars && <span>★ {item.stars}</span>}
                      {item.forks && <span>⑂ {item.forks}</span>}
                    </div>
                  </div>

                  <div className="history-item-right">
                    <span className="history-date">
                      {item.analyzed || "Recently"}
                    </span>

                    <button
                      type="button"
                      className={`save-summary-button ${saved ? "saved" : ""}`}
                      onClick={() => handleSave(item)}
                      disabled={saved}
                    >
                      <BookmarkCheck size={14} />
                      {saved ? "Saved" : "Save"}
                    </button>

                    <Link
                      to={`/search?repo=${encodeURIComponent(item.name)}`}
                      className="view-all-link"
                      style={{ fontSize: "12px", marginLeft: "6px" }}
                      title="View analysis"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="history-empty-tip">
            <div className="empty-icon">
              <Search size={22} />
            </div>
            <h3>No search history found</h3>
            <p>Repositories you analyze will automatically be cataloged here.</p>
            <Link to="/search" className="primary-button" style={{ display: "inline-flex" }}>
              <Search size={16} /> Search a Repository
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
