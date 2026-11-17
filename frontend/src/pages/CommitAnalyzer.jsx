
import { useState } from "react";
import {
  GitCommit,
  Search,
  Sparkles,
  FileText,
  GitBranch,
  Code2,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Copy,
} from "lucide-react";

export default function CommitAnalyzer() {
  const [repository, setRepository] = useState("");
  const [commitHash, setCommitHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  const handleAnalyze = (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setCopyMessage("");

    const repo = repository.trim();
    const hash = commitHash.trim();

    if (!repo || !hash) {
      setError("Please enter both repository name and commit hash.");
      return;
    }

    // Validate owner/repository format.
    const repoPattern =
      /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

    // Git commit hashes contain 7–40 hexadecimal characters.
    const hashPattern = /^[a-fA-F0-9]{7,40}$/;

    if (!repoPattern.test(repo)) {
      setError(
        "Enter a valid repository name, e.g. facebook/react."
      );
      return;
    }

    if (!hashPattern.test(hash)) {
      setError(
        "Enter a valid commit hash (7–40 hexadecimal characters)."
      );
      return;
    }

    setLoading(true);

    // Frontend demo only. Actual GitHub analysis will be
    // connected through the backend team's API.
    setTimeout(() => {
      setResult({
        repository: repo,
        hash,
        message: "Demo commit analysis",
        author: "Demo Contributor",
        date: "Demo preview",
        filesChanged: 3,
        additions: 45,
        deletions: 12,
        changes: [
          "Project components updated.",
          "Application functionality improved.",
          "Code structure and maintainability enhanced.",
        ],
        releaseNotes: [
          "Improved overall project functionality.",
          "Updated existing application components.",
          "Enhanced code organization and maintainability.",
        ],
      });

      setLoading(false);
    }, 900);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Release notes copied successfully!");
      setError("");
    } catch {
      setCopyMessage("");
      setError("Unable to copy text. Please try again.");
    }
  };

  return (
    <div className="commit-analyzer-page">
      <div className="commit-page-heading">
        <div className="commit-heading-icon">
          <GitCommit size={24} />
        </div>

        <div>
          <span className="commit-eyebrow">
            GIT INTELLIGENCE
          </span>

          <h1>Commit Analyzer</h1>

          <p>
            Understand code changes and turn technical commits
            into clear, meaningful explanations.
          </p>
        </div>
      </div>

      <section className="commit-search-card">
        <div className="commit-card-heading">
          <div className="commit-card-icon">
            <Search size={20} />
          </div>

          <div>
            <h2>Analyze a Git Commit</h2>
            <p>
              Enter a public repository and its commit hash.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze}>
          <div className="commit-form-group">
            <label htmlFor="commit-repository">
              GitHub Repository
            </label>

            <div className="commit-input-wrapper">
              <GitBranch size={18} />

              <input
                id="commit-repository"
                type="text"
                placeholder="e.g. facebook/react"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
              />
            </div>
          </div>

          <div className="commit-form-group">
            <label htmlFor="commit-hash">
              Commit Hash
            </label>

            <div className="commit-input-wrapper">
              <GitCommit size={18} />

              <input
                id="commit-hash"
                type="text"
                placeholder="e.g. a1b2c3d"
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="commit-error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="commit-analyze-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="commit-spinner"
                />
                Analyzing Commit...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze Commit
              </>
            )}
          </button>
        </form>

        <p className="commit-demo-note">
          <AlertCircle size={15} />
          Demo preview: results are sample data, not actual
          GitHub commit analysis.
        </p>
      </section>

      {result && (
        <div className="commit-results">
          <div className="commit-result-header">
            <div>
              <span className="commit-eyebrow">
                ANALYSIS RESULT
              </span>

              <h2>Commit Analysis</h2>
            </div>

            <span className="commit-success-badge">
              <CheckCircle2 size={15} />
              Demo Preview
            </span>
          </div>

          <section className="commit-info-card">
            <div className="commit-info-top">
              <div className="commit-info-icon">
                <GitCommit size={22} />
              </div>

              <div>
                <h3>{result.message}</h3>
                <p>{result.repository}</p>
              </div>
            </div>

            <div className="commit-meta-grid">
              <div>
                <span>Commit Hash</span>
                <strong>{result.hash}</strong>
              </div>

              <div>
                <span>Author</span>
                <strong>{result.author}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{result.date}</strong>
              </div>
            </div>
          </section>

          <section className="commit-info-card">
            <div className="commit-result-section-heading">
              <div className="commit-section-icon">
                <Code2 size={20} />
              </div>

              <div>
                <h3>Change Statistics</h3>
                <p>Sample change statistics for this demo.</p>
              </div>
            </div>

            <div className="commit-meta-grid">
              <div>
                <span>Files Changed</span>
                <strong>{result.filesChanged}</strong>
              </div>

              <div>
                <span>Additions</span>
                <strong>+{result.additions}</strong>
              </div>

              <div>
                <span>Deletions</span>
                <strong>-{result.deletions}</strong>
              </div>
            </div>
          </section>

          <section className="commit-result-section">
            <div className="commit-result-section-heading">
              <div className="commit-section-icon">
                <Code2 size={20} />
              </div>

              <div>
                <h3>Commit Digest</h3>
                <p>
                  Understand what changed in this commit.
                </p>
              </div>
            </div>

            <div className="commit-changes-list">
              {result.changes.map((change, index) => (
                <div
                  className="commit-change-item"
                  key={index}
                >
                  <CheckCircle2 size={17} />
                  <span>{change}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="commit-result-section release-notes-card">
            <div className="commit-result-section-heading">
              <div className="commit-section-icon release-icon">
                <FileText size={20} />
              </div>

              <div>
                <h3>Release Notes</h3>
                <p>
                  Clear and easy-to-understand change summary.
                </p>
              </div>
            </div>

            <ul className="commit-release-list">
              {result.releaseNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>

            <button
              type="button"
              className="commit-copy-button"
              onClick={() =>
                copyText(result.releaseNotes.join("\n"))
              }
            >
              <Copy size={16} />
              Copy Release Notes
            </button>

            {copyMessage && (
              <p className="commit-copy-success">
                <CheckCircle2 size={15} />
                {copyMessage}
              </p>
            )}
          </section>
        </div>
      )}

      {!result && !loading && (
        <div className="commit-empty-state">
          <div className="commit-empty-icon">
            <GitCommit size={30} />
          </div>

          <h3>Ready to explore a commit?</h3>

          <p>
            Enter a repository and commit hash above to see
            a structured commit analysis preview.
          </p>
        </div>
      )}
    </div>
  );
}
