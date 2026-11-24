const DEFAULT_PRODUCTION_API = "http://127.0.0.1:5000";

export class ApiError extends Error {
  constructor(message, status = 500, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;

  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "";
  }

  return DEFAULT_PRODUCTION_API;
}

function messageForStatus(status, fallback) {
  if (status === 404) {
    return "Repository not found or not publicly accessible.";
  }

  if (status === 429) {
    return "GitHub API rate limit reached. Please wait a few minutes and try again.";
  }

  if (status === 400) {
    return fallback || "Please provide a valid public GitHub repository URL.";
  }

  if (status >= 500) {
    return fallback || "The analysis service is temporarily unavailable.";
  }

  return fallback || "Unable to complete the request.";
}

async function requestJson(path, { method = "GET", body, signal } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "Unable to reach the GitSummarizer backend. Confirm it is running on http://127.0.0.1:5000.",
      0,
      "NETWORK"
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const serverMessage = payload?.message || payload?.error;
    const code = response.status === 429
      ? "RATE_LIMIT"
      : response.status === 404
        ? "NOT_FOUND"
        : "API_ERROR";

    throw new ApiError(
      messageForStatus(response.status, serverMessage),
      response.status,
      code
    );
  }

  return payload;
}

export function checkHealth(signal) {
  return requestJson("/api/health", { signal });
}

export function analyzeRepository(repositoryUrl, signal) {
  return requestJson("/api/github/analyze", {
    method: "POST",
    body: { repositoryUrl },
    signal
  });
}

export function summarizeRepository(repositoryUrl, signal) {
  return requestJson("/api/ai/summarize", {
    method: "POST",
    body: { repositoryUrl },
    signal
  });
}
export function analyzeCommit(repositoryUrl, commitHash, signal) {
  return requestJson("/api/ai/analyze-commit", {
    method: "POST",
    body: { repositoryUrl, commitHash },
    signal
  });
}