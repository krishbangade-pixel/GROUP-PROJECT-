
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  RotateCcw,
  Target,
  Gauge,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Layers,
  Wrench,
  Users,
} from "lucide-react";

import RepoCard from "../components/RepoCard";
import {
  analyzeRepository,
  summarizeRepository,
  ApiError,
} from "../services/api";
import {
  normalizeRepositoryInput,
  formatCount,
  formatDate,
  primaryLanguage,
  languageList,
  safeText,
  asStringArray,
  asTechnologyList,
  sanitizeMarkdownUrl,
} from "../utils/repository";
import {
  recordSearchHistory,
  isSummarySaved,
  saveSummary,
} from "../utils/storage";
import { useAuth } from "../context/AuthContext";

const UNAVAILABLE = "Not available from this analysis.";

const markdownComponents = {
  a({ href, children }) {
    const safeHref = sanitizeMarkdownUrl(href);

    if (!safeHref) {
      return <span>{children}</span>;
    }

    return (
      <a href={safeHref} target="_blank" rel="noopener noreferrer nofollow">
        {children}
      </a>
    );
  },
  img() {
    return null;
  },
};

function UnavailableNote({ label = UNAVAILABLE }) {
  return <p className="unavailable-note">{label}</p>;
}

function DetailList({ items }) {
  if (!items.length) {
    return <UnavailableNote />;
  }

  return (
    <ul className="detail-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <CheckCircle2 size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SafeMarkdown({ content }) {
  const text = typeof content === "string" ? content.trim() : "";

  if (!text) {
    return <UnavailableNote label="README content was not available for this repository." />;
  }

  return (
    <div className="readme-summary-text markdown-content">
      <ReactMarkdown skipHtml urlTransform={sanitizeMarkdownUrl} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function buildHistoryEntry(repositoryUrl, analysis, summary) {
  const repo = analysis?.repository || {};
  const languages = analysis?.languages || {};
  const commits = Array.isArray(analysis?.commits) ? analysis.commits : [];
  const latestCommit = commits[0]?.date;
  const overview = typeof summary?.projectOverview === "string"
    ? summary.projectOverview.trim()
    : "";

  return {
    id: repo.fullName || repositoryUrl,
    name: repo.fullName || repositoryUrl,
    description: repo.description || UNAVAILABLE,
    language: primaryLanguage(languages),
    stars: formatCount(repo.stars),
    forks: formatCount(repo.forks),
    updated: latestCommit ? formatDate(latestCommit) : UNAVAILABLE,
    analyzed: new Date().toLocaleString(),
    summary: overview || repo.description || UNAVAILABLE,
    url: repo.url || repositoryUrl,
    source: "live",
  };
}

export default function RepositorySearch() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const repoFromUrl = searchParams.get("repo");

  const [searchQuery, setSearchQuery] = useState(repoFromUrl || "");
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [saved, setSaved] = useState(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const lastAnalyzedRef = useRef("");

  const runAnalysis = useCallback(async (rawQuery) => {
    if (!rawQuery || !rawQuery.trim()) return;

    let normalized;

    try {
      normalized = normalizeRepositoryInput(rawQuery);
    } catch (validationError) {
      setError(validationError.message);
      setRepository(null);
      setSummaryError("");
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setLoadingStage("Fetching repository data...");
    setError("");
    setSummaryError("");
    setRepository(null);
    setSaved(isSummarySaved(normalized.fullName));

    try {
      const analysisResponse = await analyzeRepository(
        normalized.repositoryUrl,
        controller.signal
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      const analysis = analysisResponse?.data;

      if (!analysis?.repository) {
        throw new ApiError("Repository analysis returned incomplete data.", 500);
      }

      const historyEntry = buildHistoryEntry(normalized.repositoryUrl, analysis, null);
      recordSearchHistory(historyEntry, user?.id);

      setRepository({
        analysis,
        summary: null,
        repositoryUrl: normalized.repositoryUrl,
        historyEntry,
      });
      setLoadingStage("Generating AI summary...");

      try {
        const summaryResponse = await summarizeRepository(
          normalized.repositoryUrl,
          controller.signal
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        const summary = summaryResponse?.data?.summary || null;
        const updatedEntry = buildHistoryEntry(
          normalized.repositoryUrl,
          analysis,
          summary
        );
        recordSearchHistory(updatedEntry, user?.id);
        setSaved(isSummarySaved(updatedEntry.id));

        setRepository({
          analysis,
          summary,
          repositoryUrl: normalized.repositoryUrl,
          historyEntry: updatedEntry,
        });
      } catch (summaryFailure) {
        if (summaryFailure.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        const message = summaryFailure instanceof ApiError
          ? summaryFailure.message
          : "Unable to generate the AI project summary.";
        setSummaryError(message);
      }
    } catch (failure) {
      if (failure.name === "AbortError") {
        return;
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      const message = failure instanceof ApiError
        ? failure.message
        : "Unable to analyze this repository.";
      setError(message);
      setRepository(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingStage("");
      }
    }
  }, [user]);

  // Automatically trigger analysis when URL has ?repo= parameter
  useEffect(() => {
    if (repoFromUrl && repoFromUrl.trim()) {
      const target = repoFromUrl.trim();
      if (lastAnalyzedRef.current !== target) {
        lastAnalyzedRef.current = target;
        setSearchQuery(target);
        runAnalysis(target);
      }
    }
  }, [repoFromUrl, runAnalysis]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    lastAnalyzedRef.current = trimmed;
    setSearchParams({ repo: trimmed });
    runAnalysis(trimmed);
  };

  const handleSuggestion = (targetRepo) => {
    if (loading) return;
    setSearchQuery(targetRepo);
    setSearchParams({ repo: targetRepo });
    lastAnalyzedRef.current = targetRepo;
    runAnalysis(targetRepo);
  };

  const handleRetry = () => {
    if (loading) {
      return;
    }

    const target = searchQuery.trim() || repoFromUrl || repository?.repositoryUrl;
    if (target) {
      lastAnalyzedRef.current = target;
      runAnalysis(target);
    }
  };

  const handleRetrySummary = () => {
    if (loading || !repository?.repositoryUrl) {
      return;
    }

    runAnalysis(repository.repositoryUrl);
  };

  const handleSave = () => {
    if (!repository?.historyEntry) {
      return;
    }

    saveSummary(repository.historyEntry, user?.id);
    setSaved(true);
  };

  const analysis = repository?.analysis;
  const summary = repository?.summary;
  const repo = analysis?.repository;
  const languages = languageList(analysis?.languages);
  const commits = Array.isArray(analysis?.commits) ? analysis.commits : [];
  const features = asStringArray(summary?.mainFeatures);
  const prerequisites = asStringArray(summary?.prerequisites);
  const setupSteps = asStringArray(summary?.setupSteps);
  const limitations = asStringArray(summary?.limitations);
  const technologies = asTechnologyList(summary?.technologies);
  const latestUpdate = commits[0]?.date ? formatDate(commits[0].date) : UNAVAILABLE;

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
          Enter a public repository URL or owner/repository name to explore
          technologies, features and an AI project overview.
        </p>

        <form className="repository-search-form" onSubmit={handleSearch}>
          <GitBranch size={20} />

          <input
            type="text"
            placeholder="e.g. facebook/react or https://github.com/facebook/react"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={loading}
            aria-label="GitHub repository URL or owner/repository"
          />

          <button type="submit" disabled={loading}>
            <Search size={17} />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        <div className="search-examples">
          <span>Try:</span>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSuggestion("facebook/react")}
          >
            facebook/react
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSuggestion("vercel/next.js")}
          >
            vercel/next.js
          </button>
        </div>
      </section>

      {loading && (
        <div className="search-message">
          <Sparkles size={22} />
          <p>{loadingStage || "Exploring repository..."}</p>
        </div>
      )}

      {error && (
        <div className="search-error">
          <p>{error}</p>
          <button type="button" className="retry-button" onClick={handleRetry}>
            <RotateCcw size={15} />
            Retry
          </button>
        </div>
      )}

      {repository && analysis && repo && (
        <section className="search-results">
          <div className="section-heading">
            <div>
              <h2>Repository Found</h2>
              <p>Live analysis from GitHub and Gemini</p>
            </div>

            <span className="result-badge">
              <Sparkles size={14} />
              Live analysis
            </span>
          </div>

          <RepoCard
            name={repo.fullName || repo.name}
            description={repo.description || UNAVAILABLE}
            language={primaryLanguage(analysis.languages)}
            stars={formatCount(repo.stars)}
            forks={formatCount(repo.forks)}
            updated={latestUpdate}
            url={repo.url}
          />

          <div className="repository-insights">
            <div className="insight-card">
              <div className="insight-icon"><Code2 size={20} /></div>
              <h3>Technology</h3>
              <p>{primaryLanguage(analysis.languages)}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><Star size={20} /></div>
              <h3>Stars</h3>
              <p>{formatCount(repo.stars)}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><GitFork size={20} /></div>
              <h3>Forks</h3>
              <p>{formatCount(repo.forks)}</p>
            </div>

            <div className="insight-card">
              <div className="insight-icon"><Clock3 size={20} /></div>
              <h3>Last Updated</h3>
              <p>{latestUpdate}</p>
            </div>
          </div>

          <div className="repository-info-panel">
            <div className="info-panel-icon"><BookOpen size={20} /></div>
            <div>
              <h3>Languages</h3>
              {languages.length ? (
                <p>{languages.join(", ")}</p>
              ) : (
                <p>{UNAVAILABLE}</p>
              )}
            </div>
            <ArrowUpRight size={18} />
          </div>

          <div className="repository-info-panel">
            <div className="info-panel-icon"><Sparkles size={20} /></div>
            <div>
              <h3>Project Overview</h3>
              <p>{safeText(summary?.projectOverview, summaryError ? "AI summary is unavailable for this request." : UNAVAILABLE)}</p>
            </div>
            <ArrowUpRight size={18} />
          </div>

          {summaryError && (
            <div className="search-warning">
              <AlertTriangle size={16} />
              <p>{summaryError} GitHub metadata below is still from the live repository.</p>
              <button type="button" className="retry-button" onClick={handleRetrySummary}>
                <RotateCcw size={15} />
                Retry summary
              </button>
            </div>
          )}

          <div className="repository-detail-grid">
            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><Target size={20} /></div>
                <div>
                  <h3>Project Purpose</h3>
                  <p>Why this project exists</p>
                </div>
              </div>
              <p className="detail-paragraph">
                {safeText(summary?.projectPurpose)}
              </p>
            </section>

            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><Users size={20} /></div>
                <div>
                  <h3>Target Audience</h3>
                  <p>Who this project is for</p>
                </div>
              </div>
              <p className="detail-paragraph">
                {safeText(summary?.targetAudience)}
              </p>
            </section>
          </div>

          <div className="repository-detail-grid">
            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><ListChecks size={20} /></div>
                <div>
                  <h3>Main Features</h3>
                  <p>Gemini-identified capabilities</p>
                </div>
              </div>
              <DetailList items={features} />
            </section>

            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><PackageCheck size={20} /></div>
                <div>
                  <h3>Prerequisites</h3>
                  <p>Knowledge and tools required</p>
                </div>
              </div>
              <DetailList items={prerequisites} />
            </section>
          </div>

          <div className="repository-detail-grid">
            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><Layers size={20} /></div>
                <div>
                  <h3>Technologies</h3>
                  <p>Tools and their purposes</p>
                </div>
              </div>
              {technologies.length ? (
                <ul className="detail-list">
                  {technologies.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <CheckCircle2 size={17} />
                      <span>
                        <strong>{item.name}</strong>
                        {" — "}
                        {item.purpose}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <UnavailableNote />
              )}
            </section>

            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><Gauge size={20} /></div>
                <div>
                  <h3>Difficulty Level</h3>
                  <p>Estimated complexity</p>
                </div>
              </div>
              <p className="detail-paragraph">
                {safeText(summary?.difficultyLevel)}
              </p>
            </section>
          </div>

          <div className="repository-detail-grid">
            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><Wrench size={20} /></div>
                <div>
                  <h3>Setup Steps</h3>
                  <p>Getting started guidance</p>
                </div>
              </div>
              <DetailList items={setupSteps} />
            </section>

            <section className="repository-detail-card">
              <div className="detail-card-heading">
                <div className="detail-icon"><AlertTriangle size={20} /></div>
                <div>
                  <h3>Limitations</h3>
                  <p>Known constraints from the analysis</p>
                </div>
              </div>
              <DetailList items={limitations} />
            </section>
          </div>

          <section className="readme-summary-card">
            <div className="detail-card-heading">
              <div className="detail-icon"><FileText size={20} /></div>
              <div>
                <h3>README</h3>
                <p>Live repository documentation</p>
              </div>
            </div>

            <SafeMarkdown content={analysis.readme} />

            <span className="readme-summary-label">
              <Sparkles size={14} />
              Retrieved from GitHub — treated as untrusted content
            </span>
          </section>

          <section className="readme-summary-card">
            <div className="detail-card-heading">
              <div className="detail-icon"><Clock3 size={20} /></div>
              <div>
                <h3>Recent Commits</h3>
                <p>Latest activity from the default branch</p>
              </div>
            </div>

            {commits.length ? (
              <ul className="repo-commit-list">
                {commits.map((commit) => (
                  <li key={commit.sha || commit.message}>
                    <strong>{commit.sha ? String(commit.sha).slice(0, 7) : "commit"}</strong>
                    <span>{safeText(commit.message, "No commit message available.")}</span>
                    <small>
                      {safeText(commit.author, "Unknown author")}
                      {" · "}
                      {formatDate(commit.date)}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <UnavailableNote label="Recent commit history was not available." />
            )}
          </section>

          <div className="search-save-row">
            <button
              type="button"
              className={`save-summary-button ${saved ? "saved" : ""}`}
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? (
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
          </div>
        </section>
      )}

      {!repository && !loading && !error && (
        <section className="search-empty-state">
          <div className="empty-icon"><GitBranch size={30} /></div>
          <h2>Ready to explore?</h2>
          <p>Search a public GitHub repository to see live analysis here.</p>
        </section>
      )}
    </div>
  );
}
