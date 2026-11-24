
const axios = require("axios");
const path = require("path");

const GITHUB_API = "https://api.github.com";

const MAX_SOURCE_FILES = 20;
const MAX_FILE_BYTES = 30 * 1024;
const MAX_CONTENT_CHARS = 6000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;

const repositoryCache = new Map();
const inflightRequests = new Map();

const EXCLUDED_DIRECTORY_NAMES = new Set([
  "node_modules",
  "vendor",
  "dist",
  "build",
  "out",
  ".next",
  "coverage",
  ".git",
  ".svn",
  "__pycache__",
  ".cache",
  "target",
  ".turbo",
  ".venv",
  "venv",
  "bower_components",
  "tmp",
  "temp"
]);

const EXCLUDED_FILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "npm-shrinkwrap.json",
  "composer.lock",
  "cargo.lock",
  "poetry.lock",
  "gemfile.lock",
  "bun.lockb",
  "go.sum"
]);

const SENSITIVE_FILE_PATTERN =
  /(^|\/)(\.env($|\.)|\.envrc|\.npmrc|\.netrc|\.pypirc|credentials|secrets?|id_rsa|id_dsa|id_ed25519|serviceaccount|google-services\.json|.*\.(pem|key|p12|pfx|keystore|jks|kdbx))$/i;

const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".java",
  ".rb",
  ".php",
  ".cs",
  ".rs",
  ".kt",
  ".kts",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".html",
  ".css",
  ".scss",
  ".vue",
  ".svelte",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".xml",
  ".md",
  ".mdx",
  ".sql",
  ".sh",
  ".bash"
]);

const PRIORITY_CONFIG_NAMES = new Set([
  "package.json",
  "composer.json",
  "pyproject.toml",
  "requirements.txt",
  "cargo.toml",
  "go.mod",
  "pom.xml",
  "gemfile",
  "dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "tsconfig.json",
  "jsconfig.json"
]);

const ENTRY_POINT_NAMES = new Set([
  "index.js",
  "index.ts",
  "index.jsx",
  "index.tsx",
  "main.js",
  "main.ts",
  "main.py",
  "main.go",
  "app.js",
  "app.ts",
  "app.py",
  "server.js",
  "server.ts",
  "manage.py"
]);

function parseGitHubUrl(repositoryUrl) {
  try {
    const url = new URL(repositoryUrl);

    if (url.protocol !== "https:") {
      throw new Error("Please provide a valid HTTPS GitHub URL.");
    }

    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      throw new Error("Please provide a valid GitHub URL.");
    }

    if (url.username || url.password) {
      throw new Error("Repository URLs must not include credentials.");
    }

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length !== 2) {
      throw new Error("Invalid GitHub repository URL.");
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");

    if (!/^[a-zA-Z0-9-]+$/.test(owner) ||
        !/^[a-zA-Z0-9._-]+$/.test(repo)) {
      throw new Error("Invalid repository name or owner.");
    }

    return { owner, repo };
  } catch (error) {
    throw new Error(
      error.message || "Invalid GitHub repository URL."
    );
  }
}

function getGitHubToken() {
  const value = process.env.GITHUB_TOKEN;

  if (typeof value !== "string") {
    return "";
  }

  const token = value.trim();

  if (!token || /\s/.test(token)) {
    return "";
  }

  return token;
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitSummarizer"
  };

  const token = getGitHubToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function redactRequestSecrets(error) {
  if (error?.config?.headers?.Authorization) {
    error.config.headers.Authorization = "[redacted]";
  }

  return error;
}

function isRateLimitError(error) {
  const status = error.response?.status;

  if (status === 429) {
    return true;
  }

  if (status !== 403) {
    return false;
  }

  const remaining = error.response?.headers?.["x-ratelimit-remaining"];

  if (remaining === "0") {
    return true;
  }

  const message = String(
    error.response?.data?.message || error.message || ""
  ).toLowerCase();

  return (
    message.includes("rate limit") ||
    message.includes("secondary rate")
  );
}

function createRateLimitError(error) {
  const retryAfter = error.response?.headers?.["retry-after"];
  const resetHeader = error.response?.headers?.["x-ratelimit-reset"];
  let rateLimitMessage = "GitHub API rate limit or access restriction reached.";

  if (retryAfter) {
    rateLimitMessage =
      `GitHub API rate limit reached. Retry after ${retryAfter} seconds.`;
  } else if (resetHeader) {
    const resetMs = Number(resetHeader) * 1000;
    const waitSeconds = Number.isFinite(resetMs)
      ? Math.max(1, Math.ceil((resetMs - Date.now()) / 1000))
      : null;

    if (waitSeconds) {
      rateLimitMessage =
        `GitHub API rate limit reached. Retry after ${waitSeconds} seconds.`;
    }
  }

  const rateLimitError = new Error(rateLimitMessage);
  rateLimitError.response = { status: 429 };
  rateLimitError.statusCode = 429;
  rateLimitError.incomplete = true;
  return rateLimitError;
}

function cacheKey(owner, repo) {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function cloneRepositoryData(data) {
  return JSON.parse(JSON.stringify(data));
}

function isCompleteRepositoryData(data) {
  return Boolean(
    data &&
    data.repository &&
    data.repository.name &&
    data.repository.fullName &&
    data.repository.owner &&
    data.languages &&
    typeof data.languages === "object" &&
    Array.isArray(data.files) &&
    Array.isArray(data.commits) &&
    Array.isArray(data.sourceFiles)
  );
}

function getCachedRepository(key) {
  const entry = repositoryCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    repositoryCache.delete(key);
    return null;
  }

  repositoryCache.delete(key);
  repositoryCache.set(key, entry);

  return cloneRepositoryData(entry.data);
}

function setCachedRepository(key, data) {
  if (!isCompleteRepositoryData(data)) {
    return;
  }

  if (repositoryCache.has(key)) {
    repositoryCache.delete(key);
  }

  while (repositoryCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = repositoryCache.keys().next().value;
    repositoryCache.delete(oldestKey);
  }

  repositoryCache.set(key, {
    data: cloneRepositoryData(data),
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

function isNetworkError(error) {
  return (
    error.code === "ECONNABORTED" ||
    error.code === "ENOTFOUND" ||
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT" ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("timeout")
  );
}

async function githubRequest(endpoint) {
  try {
    const response = await axios.get(
      `${GITHUB_API}${endpoint}`,
      {
        headers: githubHeaders(),
        timeout: 15000
      }
    );

    return response.data;
  } catch (error) {
    redactRequestSecrets(error);

    if (isRateLimitError(error)) {
      throw createRateLimitError(error);
    }

    if (isNetworkError(error)) {
      const networkError = new Error(
        "Unable to reach GitHub. Please try again later."
      );
      networkError.response = error.response;
      throw redactRequestSecrets(networkError);
    }

    throw error;
  }
}

function sanitizeUntrustedContent(value, maxChars) {
  if (typeof value !== "string") {
    return "";
  }

  const sanitized = value
    .replace(/\0/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  if (typeof maxChars === "number") {
    return sanitized.slice(0, maxChars);
  }

  return sanitized;
}

function pathSegments(filePath) {
  return filePath.split("/").filter(Boolean);
}

function isExcludedPath(filePath) {
  const segments = pathSegments(filePath);
  const fileName = segments[segments.length - 1] || "";
  const lowerName = fileName.toLowerCase();

  if (segments.some((segment) => EXCLUDED_DIRECTORY_NAMES.has(segment))) {
    return true;
  }

  if (EXCLUDED_FILE_NAMES.has(lowerName)) {
    return true;
  }

  if (SENSITIVE_FILE_PATTERN.test(filePath) || SENSITIVE_FILE_PATTERN.test(fileName)) {
    return true;
  }

  return false;
}

function isAllowedSourceFile(filePath) {
  const fileName = path.posix.basename(filePath);
  const lowerName = fileName.toLowerCase();
  const extension = path.posix.extname(filePath).toLowerCase();

  if (/^readme(\.|$)/i.test(fileName)) {
    return true;
  }

  if (PRIORITY_CONFIG_NAMES.has(lowerName)) {
    return true;
  }

  if (lowerName === "makefile" || lowerName.startsWith("dockerfile")) {
    return true;
  }

  return SOURCE_EXTENSIONS.has(extension);
}

function scoreSourceFile(filePath) {
  const fileName = path.posix.basename(filePath);
  const lowerPath = filePath.toLowerCase();
  const lowerName = fileName.toLowerCase();
  const depth = pathSegments(filePath).length;
  let score = 0;

  if (/^readme(\.|$)/i.test(fileName)) {
    score += 1000;
  }

  if (lowerName === "package.json") {
    score += depth === 1 ? 950 : 800;
  }

  if (PRIORITY_CONFIG_NAMES.has(lowerName)) {
    score += 850;
  }

  if (ENTRY_POINT_NAMES.has(lowerName)) {
    score += depth <= 2 ? 750 : 650;
  }

  if (/(^|\/)(pages|app)(\/|$)/.test(lowerPath)) {
    score += 220;
  }

  if (/(^|\/)routes(\/|$)/.test(lowerPath)) {
    score += 200;
  }

  if (/(^|\/)controllers(\/|$)/.test(lowerPath)) {
    score += 180;
  }

  if (/(^|\/)services(\/|$)/.test(lowerPath)) {
    score += 160;
  }

  if (/(^|\/)(src|lib|api)(\/|$)/.test(lowerPath)) {
    score += 80;
  }

  score -= depth * 10;

  return score;
}

function selectRelevantBlobs(treeItems) {
  const candidates = treeItems.filter((item) => {
    if (!item || item.type !== "blob" || !item.path) {
      return false;
    }

    if (typeof item.size === "number" && item.size > MAX_FILE_BYTES) {
      return false;
    }

    if (isExcludedPath(item.path)) {
      return false;
    }

    return isAllowedSourceFile(item.path);
  });

  candidates.sort((a, b) => {
    const scoreDifference = scoreSourceFile(b.path) - scoreSourceFile(a.path);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return a.path.localeCompare(b.path);
  });

  return candidates.slice(0, MAX_SOURCE_FILES);
}

async function fetchBlobContent(owner, repo, sha) {
  try {
    const blob = await githubRequest(
      `/repos/${owner}/${repo}/git/blobs/${sha}`
    );

    if (!blob || blob.encoding !== "base64" || typeof blob.content !== "string") {
      return null;
    }

    const decoded = Buffer.from(
      blob.content.replace(/\n/g, ""),
      "base64"
    ).toString("utf8");

    return sanitizeUntrustedContent(decoded, MAX_CONTENT_CHARS);
  } catch (error) {
    if (error.statusCode === 429 || isRateLimitError(error)) {
      throw error;
    }

    if (error.response?.status === 404 || isNetworkError(error)) {
      return null;
    }

    return null;
  }
}

async function getSourceFiles(owner, repo, defaultBranch) {
  try {
    const treeResponse = await githubRequest(
      `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
    );

    const treeItems = Array.isArray(treeResponse.tree)
      ? treeResponse.tree
      : [];

    const selectedBlobs = selectRelevantBlobs(treeItems);
    const sourceFiles = [];

    for (const blob of selectedBlobs) {
      try {
        const content = await fetchBlobContent(owner, repo, blob.sha);

        if (!content) {
          continue;
        }

        sourceFiles.push({
          path: String(blob.path),
          content
        });
      } catch (error) {
        if (error.statusCode === 429 || isRateLimitError(error)) {
          error.partialSourceFiles = sourceFiles;
          error.incomplete = true;
          throw error;
        }
      }
    }

    return {
      sourceFiles,
      complete: true
    };
  } catch (error) {
    if (error.incomplete || error.statusCode === 429 || isRateLimitError(error)) {
      return {
        sourceFiles: Array.isArray(error.partialSourceFiles)
          ? error.partialSourceFiles
          : [],
        complete: false
      };
    }

    if (error.response?.status === 404 || isNetworkError(error)) {
      return {
        sourceFiles: [],
        complete: error.response?.status === 404
      };
    }

    return {
      sourceFiles: [],
      complete: false
    };
  }
}

async function loadRepositoryData(owner, repo) {
  const base = `/repos/${owner}/${repo}`;

  const [repository, readme, contents, commits, languages] =
    await Promise.all([
      githubRequest(base),
      githubRequest(`${base}/readme`).catch(() => null),
      githubRequest(`${base}/contents`),
      githubRequest(`${base}/commits?per_page=5`),
      githubRequest(`${base}/languages`)
    ]);

  const readmeContent = readme?.content
    ? sanitizeUntrustedContent(
        Buffer.from(readme.content, "base64").toString("utf8")
      )
    : null;

  const defaultBranch = repository.default_branch || "main";
  const extracted = await getSourceFiles(owner, repo, defaultBranch);
  const sourceFiles = extracted.sourceFiles;

  const payload = {
    repository: {
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      owner: repository.owner.login,
      url: repository.html_url,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      defaultBranch: repository.default_branch
    },

    languages,

    readme: readmeContent,

    files: contents.map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type
    })),

    commits: commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || "Unknown",
      date: commit.commit.author?.date || null
    })),

    sourceFiles
  };

  return {
    payload,
    complete: extracted.complete === true && isCompleteRepositoryData(payload)
  };
}

async function getRepositoryData(repositoryUrl) {
  const { owner, repo } = parseGitHubUrl(repositoryUrl);
  const key = cacheKey(owner, repo);
  const cached = getCachedRepository(key);

  if (cached) {
    return cached;
  }

  if (inflightRequests.has(key)) {
    return cloneRepositoryData(await inflightRequests.get(key));
  }

  const pending = loadRepositoryData(owner, repo)
    .then((result) => {
      if (result.complete) {
        setCachedRepository(key, result.payload);
      }

      return result.payload;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, pending);

  return cloneRepositoryData(await pending);
}

module.exports = {
  parseGitHubUrl,
  getRepositoryData
};
