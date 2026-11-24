const OWNER_PATTERN = /^[a-zA-Z0-9-]+$/;
const REPO_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function normalizeRepositoryInput(input) {
  const value = String(input || "").trim();

  if (!value) {
    throw new Error("Please enter a GitHub repository URL or owner/repository.");
  }

  let owner;
  let repo;

  const looksLikeUrl =
    /^https?:\/\//i.test(value) ||
    value.startsWith("github.com/") ||
    value.startsWith("www.github.com/");

  if (looksLikeUrl) {
    const withProtocol = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    let parsed;

    try {
      parsed = new URL(withProtocol);
    } catch {
      throw new Error("Please enter a valid GitHub repository URL.");
    }

    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      throw new Error("Only public GitHub repository URLs are supported.");
    }

    if (parsed.username || parsed.password) {
      throw new Error("Repository URLs must not include credentials.");
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Use the format owner/repository or a full GitHub URL.");
    }

    owner = parts[0];
    repo = parts[1].replace(/\.git$/i, "");
  } else {
    const parts = value.replace(/^\/+/, "").split("/").filter(Boolean);

    if (parts.length !== 2) {
      throw new Error("Use the format owner/repository or a full GitHub URL.");
    }

    owner = parts[0];
    repo = parts[1].replace(/\.git$/i, "");
  }

  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) {
    throw new Error("Invalid repository name or owner.");
  }

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    repositoryUrl: `https://github.com/${owner}/${repo}`
  };
}

export function formatCount(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Not available";
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(number);
}

export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

export function primaryLanguage(languages) {
  if (!languages || typeof languages !== "object") {
    return "Not available";
  }

  const entries = Object.entries(languages);

  if (!entries.length) {
    return "Not available";
  }

  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return entries[0][0];
}

export function languageList(languages) {
  if (!languages || typeof languages !== "object") {
    return [];
  }

  return Object.keys(languages);
}

export function safeText(value, fallback = "Not available from this analysis.") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

export function asStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function asTechnologyList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const name = typeof item.name === "string" ? item.name.trim() : "";
      const purpose = typeof item.purpose === "string" ? item.purpose.trim() : "";

      if (!name && !purpose) {
        return null;
      }

      return {
        name: name || "Unnamed technology",
        purpose: purpose || "Purpose not provided."
      };
    })
    .filter(Boolean);
}

export function sanitizeMarkdownUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, "https://github.com");

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return "";
  }

  return "";
}
