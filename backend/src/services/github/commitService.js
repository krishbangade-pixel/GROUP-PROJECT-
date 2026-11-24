const axios = require("axios");
const { parseGitHubUrl } = require("./githubService");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getCommitData(repositoryUrl, commitHash) {
  let parsed;

  try {
    parsed = parseGitHubUrl(repositoryUrl);
  } catch {
    throw createError("Invalid GitHub repository URL.", 400);
  }

  const { owner, repo } = parsed;

  if (
    typeof commitHash !== "string" ||
    !/^[a-f0-9]{7,40}$/i.test(commitHash.trim())
  ) {
    throw createError("Invalid commit hash.", 400);
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitSummarizer"
  };

  const token = process.env.GITHUB_TOKEN?.trim();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const repositoryResponse = await axios.get(base, {
      headers,
      timeout: 15000
    });

    if (repositoryResponse.data.private !== false) {
      throw createError("Only public repositories are supported.", 403);
    }

    const response = await axios.get(
      `${base}/commits/${commitHash.trim()}`,
      { headers, timeout: 15000 }
    );

    const data = response.data;
    const files = data.files || [];

    return {
      repository: repositoryResponse.data.full_name,
      sha: data.sha,
      message: data.commit.message,
      author: data.commit.author?.name || "Unknown",
      date: data.commit.author?.date || null,
      url: data.html_url,
      stats: {
        additions: data.stats?.additions ?? null,
        deletions: data.stats?.deletions ?? null,
        total: data.stats?.total ?? null
      },
      files: files.slice(0, 30).map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes
      })),
      limitations: [
        "Analysis uses commit metadata and up to 30 changed file records.",
        "Full code differences are not inspected."
      ]
    };
  } catch (error) {
    if (error.statusCode) throw error;

    const status = error.response?.status;

    if (status === 404) {
      throw createError("Repository or commit not found.", 404);
    }

    if (
      status === 429 ||
      (status === 403 &&
        /rate limit/i.test(error.response?.data?.message || ""))
    ) {
      throw createError("GitHub API rate limit reached.", 429);
    }

    throw createError("Unable to retrieve commit details.", 502);
  }
}

module.exports = { getCommitData };