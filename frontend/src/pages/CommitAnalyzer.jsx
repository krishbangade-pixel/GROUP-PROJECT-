import { useState, useRef } from "react";

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

import { analyzeCommit } from "../services/api";
import { normalizeRepositoryInput } from "../utils/repository";

function safeList(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

function SummarySection({ title, description, items }) {
  const values = safeList(items);

  return (
    <section className="commit-result-section">
      <div className="commit-result-section-heading">
        <div className="commit-section-icon">
          <Code2 size={20} />
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="commit-changes-list">
        {values.length ? (
          values.map((item, index) => (
            <div className="commit-change-item" key={index}>
              <CheckCircle2 size={17} />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p>Information not available.</p>
        )}
      </div>
    </section>
  );
}

export default function CommitAnalyzer() {
  const [repository, setRepository] = useState("");
  const [commitHash, setCommitHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  const busyRef = useRef(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (busyRef.current) return;

    setError("");
    setResult(null);
    setCopyMessage("");

    const hash = commitHash.trim();

    let normalized;

    try {
      normalized = normalizeRepositoryInput(repository);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    if (!/^[a-fA-F0-9]{7,40}$/.test(hash)) {
      setError(
        "Enter a valid commit hash containing 7 to 40 hexadecimal characters."
      );
      return;
    }

    busyRef.current = true;
    setLoading(true);

    try {
      const response = await analyzeCommit(
        normalized.repositoryUrl,
        hash
      );

      if (!response?.success || !response?.data?.commit) {
        throw new Error(
          response?.message || "Commit analysis failed."
        );
      }

      setResult(response.data);

    } catch (failure) {
      setError(
        failure.status === 404
          ? "Repository or commit not found."
          : failure.message || "Unable to analyze this commit."
      );

    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Commit summary copied successfully!");
      setError("");
    } catch {
      setCopyMessage("");
      setError("Unable to copy text. Please try again.");
    }
  };

  const commit = result?.commit;
  const summary = result?.summary;

  const files = Array.isArray(commit?.files)
    ? commit.files
    : [];

  const keyChanges = safeList(summary?.keyChanges);

  const limitations = [
    ...new Set([
      ...safeList(commit?.limitations),
      ...safeList(summary?.limitations),
    ]),
  ];

  const summaryText = summary
    ? [
        `Repository: ${commit.repository}`,
        `Commit: ${commit.sha}`,
        "",
        `Overview: ${summary.overview || "Not available"}`,
        "",
        `Purpose: ${summary.purpose || "Not available"}`,
        "",
        "Key Changes:",
        ...keyChanges.map((item) => `- ${item}`),
        "",
        `Impact: ${summary.impact || "Not available"}`,
        "",
        "Limitations:",
        ...limitations.map((item) => `- ${item}`),
      ].join("\n")
    : "";

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
            Understand GitHub commits with real change
            statistics and AI-generated explanations.
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
                placeholder="e.g. facebook/react or GitHub URL"
                value={repository}
                disabled={loading}
                onChange={(e) =>
                  setRepository(e.target.value)
                }
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
                placeholder="e.g. 3f22d19"
                value={commitHash}
                disabled={loading}
                onChange={(e) =>
                  setCommitHash(e.target.value)
                }
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
          Live GitHub metadata and Gemini AI analysis.
          Full code differences are not inspected.
        </p>
      </section>

      {commit && (
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
              {summary ? "Live Analysis" : "GitHub Data"}
            </span>
          </div>

          <section className="commit-info-card">
            <div className="commit-info-top">
              <div className="commit-info-icon">
                <GitCommit size={22} />
              </div>

              <div>
                <h3>{commit.message}</h3>
                <p>{commit.repository}</p>
              </div>
            </div>

            <div className="commit-meta-grid">
              <div>
                <span>Commit Hash</span>
                <strong title={commit.sha}>
                  {commit.sha?.slice(0, 12)}
                </strong>
              </div>

              <div>
                <span>Author</span>
                <strong>{commit.author}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{formatDate(commit.date)}</strong>
              </div>
            </div>

            {commit.url?.startsWith("https://github.com/") && (
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View commit on GitHub
              </a>
            )}
          </section>

          <section className="commit-info-card">
            <div className="commit-result-section-heading">
              <div className="commit-section-icon">
                <Code2 size={20} />
              </div>

              <div>
                <h3>Change Statistics</h3>
                <p>Actual statistics retrieved from GitHub.</p>
              </div>
            </div>

            <div className="commit-meta-grid">
              <div>
                <span>Files Retrieved</span>
                <strong>{files.length}</strong>
              </div>

              <div>
                <span>Additions</span>
                <strong>
                  {commit.stats?.additions != null
                    ? `+${commit.stats.additions}`
                    : "N/A"}
                </strong>
              </div>

              <div>
                <span>Deletions</span>
                <strong>
                  {commit.stats?.deletions != null
                    ? `-${commit.stats.deletions}`
                    : "N/A"}
                </strong>
              </div>
            </div>
          </section>

          <section className="commit-result-section">
            <div className="commit-result-section-heading">
              <div className="commit-section-icon">
                <FileText size={20} />
              </div>

              <div>
                <h3>Changed Files</h3>
                <p>Up to 30 changed file records.</p>
              </div>
            </div>

            <div className="commit-changes-list">
              {files.length ? (
                files.map((file, index) => (
                  <div
                    className="commit-change-item"
                    key={`${file.filename}-${index}`}
                  >
                    <FileText size={17} />

                    <div style={{ overflowWrap: "anywhere" }}>
                      <strong>{file.filename}</strong>

                      <p>
                        {file.status} | +{file.additions}
                        {" / "}-{file.deletions}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No changed file records available.</p>
              )}
            </div>
          </section>

          {!summary && (
            <section className="commit-info-card">
              <div className="commit-error-message">
                <AlertCircle size={17} />
                <span>
                  {result.summaryError ||
                    "AI summary is unavailable."}
                  {" GitHub commit details are still available."}
                </span>
              </div>

              <button
                type="button"
                className="commit-analyze-button"
                disabled={loading}
                onClick={handleAnalyze}
              >
                Retry Analysis
              </button>
            </section>
          )}

          {summary && (
            <>
              <SummarySection
                title="AI Overview"
                description="Gemini-generated commit overview."
                items={[summary.overview]}
              />

              <SummarySection
                title="Purpose"
                description="Likely reason for the commit."
                items={[summary.purpose]}
              />

              <SummarySection
                title="Commit Digest"
                description="Key changes identified by Gemini."
                items={summary.keyChanges}
              />

              <SummarySection
                title="Affected Areas"
                description="Project areas associated with the commit."
                items={summary.affectedAreas}
              />

              <SummarySection
                title="Potential Issues"
                description="Possible risks, not confirmed bugs."
                items={summary.potentialIssues}
              />

              <SummarySection
                title="Impact Analysis"
                description="Estimated impact of the changes."
                items={[summary.impact]}
              />

              <SummarySection
                title="Recommendations"
                description="Suggested review and testing actions."
                items={summary.recommendations}
              />

              <section className="commit-result-section release-notes-card">
                <div className="commit-result-section-heading">
                  <div className="commit-section-icon release-icon">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h3>Commit Summary</h3>
                    <p>Copyable AI-generated change summary.</p>
                  </div>
                </div>

                <ul className="commit-release-list">
                  {keyChanges.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="commit-copy-button"
                  onClick={() => copyText(summaryText)}
                >
                  <Copy size={16} />
                  Copy Commit Summary
                </button>

                {copyMessage && (
                  <p className="commit-copy-success">
                    <CheckCircle2 size={15} />
                    {copyMessage}
                  </p>
                )}
              </section>
            </>
          )}

          <SummarySection
            title="Analysis Limitations"
            description="Important constraints of this analysis."
            items={limitations}
          />
        </div>
      )}

      {!result && !loading && (
        <div className="commit-empty-state">
          <div className="commit-empty-icon">
            <GitCommit size={30} />
          </div>

          <h3>Ready to explore a commit?</h3>

          <p>
            Enter a repository and commit hash above
            to see real GitHub commit analysis.
          </p>
        </div>
      )}
    </div>
  );
}