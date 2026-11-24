const HISTORY_KEY = "reporadar_search_history";
const SAVED_KEY = "reporadar_saved_summaries";
const MAX_HISTORY = 50;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error("Unable to save data locally.");
  }
}

export function getSearchHistory() {
  const items = readJson(HISTORY_KEY, []);
  return Array.isArray(items) ? items : [];
}

export function recordSearchHistory(entry) {
  if (!entry?.id) {
    return getSearchHistory();
  }

  const items = getSearchHistory().filter((item) => item.id !== entry.id);
  const next = [entry, ...items].slice(0, MAX_HISTORY);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function getSavedSummaries() {
  const items = readJson(SAVED_KEY, []);
  return Array.isArray(items) ? items : [];
}

export function isSummarySaved(id) {
  return getSavedSummaries().some((item) => item.id === id);
}

export function saveSummary(item) {
  const saved = getSavedSummaries();

  if (!item?.id || saved.some((entry) => entry.id === item.id)) {
    return saved;
  }

  const next = [
    ...saved,
    {
      ...item,
      savedAt: new Date().toLocaleDateString()
    }
  ];

  writeJson(SAVED_KEY, next);
  return next;
}

export function removeSavedSummary(id) {
  const next = getSavedSummaries().filter((item) => item.id !== id);
  writeJson(SAVED_KEY, next);
  return next;
}
