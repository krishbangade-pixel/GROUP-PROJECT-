import { supabase } from "./supabase";

const HISTORY_KEY = "reporadar_search_history";
const SAVED_KEY = "reporadar_saved_summaries";
const COMMITS_KEY = "reporadar_commit_history";

function readLocal(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/**
 * Record a searched/analyzed repository in Supabase & local storage
 */
export async function recordSearchHistory(entry, userId = null) {
  if (!entry?.name) return readLocal(HISTORY_KEY, []);

  // Update local storage
  const localList = readLocal(HISTORY_KEY, []).filter((i) => i.name !== entry.name);
  const updatedLocal = [entry, ...localList].slice(0, 50);
  writeLocal(HISTORY_KEY, updatedLocal);

  // Sync to Supabase
  try {
    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    await supabase.from("search_history").insert({
      user_id: userToUse,
      repo_name: entry.name,
      repo_owner: entry.name.split("/")[0] || "",
      description: entry.description || "",
      language: entry.language || "",
      stars: String(entry.stars || "0"),
      forks: String(entry.forks || "0"),
      summary: entry.summary || entry.overview || "",
      features: entry.features || [],
      technologies: entry.technologies || [],
      prerequisites: entry.prerequisites || [],
      raw_data: entry,
    });
  } catch (err) {
    console.warn("Could not sync search history to Supabase:", err);
  }

  return updatedLocal;
}

/**
 * Get search history from Supabase with local fallback
 */
export async function getSearchHistory(userId = null) {
  try {
    let query = supabase
      .from("search_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    if (userToUse) {
      query = query.or(`user_id.eq.${userToUse},user_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.repo_name,
        description: row.description,
        language: row.language,
        stars: row.stars,
        forks: row.forks,
        summary: row.summary,
        features: row.features,
        technologies: row.technologies,
        prerequisites: row.prerequisites,
        analyzed: new Date(row.created_at).toLocaleDateString(),
        ...(row.raw_data || {}),
      }));
    }
  } catch (err) {
    console.warn("Error fetching search history from Supabase:", err);
  }

  return readLocal(HISTORY_KEY, []);
}

/**
 * Save a summary to Supabase & local storage
 */
export async function saveSummary(item, userId = null) {
  if (!item?.name && !item?.id) return readLocal(SAVED_KEY, []);

  const savedAtDate = new Date().toLocaleDateString();
  const savedItem = { ...item, savedAt: savedAtDate };

  const currentLocal = readLocal(SAVED_KEY, []);
  const nextLocal = [
    ...currentLocal.filter((entry) => entry.name !== item.name && entry.id !== item.id),
    savedItem,
  ];
  writeLocal(SAVED_KEY, nextLocal);

  try {
    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    await supabase.from("saved_summaries").insert({
      user_id: userToUse,
      repo_name: item.name || item.id,
      summary: item.summary || item.readmeSummary || "",
      description: item.description || "",
      language: item.language || "",
      stars: String(item.stars || "0"),
      forks: String(item.forks || "0"),
      saved_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not save summary to Supabase:", err);
  }

  return nextLocal;
}

/**
 * Remove a saved summary from Supabase & local storage
 */
export async function removeSavedSummary(idOrName) {
  const nextLocal = readLocal(SAVED_KEY, []).filter(
    (item) => item.id !== idOrName && item.name !== idOrName
  );
  writeLocal(SAVED_KEY, nextLocal);

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrName);
    let query = supabase.from("saved_summaries").delete();
    if (isUuid) {
      query = query.eq("id", idOrName);
    } else {
      query = query.eq("repo_name", idOrName);
    }
    await query;
  } catch (err) {
    console.warn("Could not remove saved summary from Supabase:", err);
  }

  return nextLocal;
}

/**
 * Check if a summary is saved
 */
export function isSummarySaved(idOrName) {
  const local = readLocal(SAVED_KEY, []);
  return local.some((item) => item.id === idOrName || item.name === idOrName);
}

/**
 * Get all saved summaries from Supabase with local fallback
 */
export async function getSavedSummaries(userId = null) {
  try {
    let query = supabase
      .from("saved_summaries")
      .select("*")
      .order("created_at", { ascending: false });

    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    if (userToUse) {
      query = query.or(`user_id.eq.${userToUse},user_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        name: row.repo_name,
        summary: row.summary,
        description: row.description,
        language: row.language,
        stars: row.stars,
        forks: row.forks,
        savedAt: new Date(row.saved_at || row.created_at).toLocaleDateString(),
      }));
    }
  } catch (err) {
    console.warn("Error fetching saved summaries from Supabase:", err);
  }

  return readLocal(SAVED_KEY, []);
}

/**
 * Record a commit analysis in Supabase & local storage
 */
export async function recordCommitAnalysis(analysis, userId = null) {
  if (!analysis?.commitHash) return;

  const currentLocal = readLocal(COMMITS_KEY, []);
  const updatedLocal = [
    analysis,
    ...currentLocal.filter((c) => c.commitHash !== analysis.commitHash),
  ].slice(0, 50);
  writeLocal(COMMITS_KEY, updatedLocal);

  try {
    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    await supabase.from("commit_analyses").insert({
      user_id: userToUse,
      repo_name: analysis.repository || "",
      commit_hash: analysis.commitHash,
      commit_message: analysis.message || "",
      author: analysis.author || "",
      date: analysis.date || "",
      summary: analysis.summary || "",
      breaking_changes: analysis.breakingChanges || [],
      improvements: analysis.improvements || [],
    });
  } catch (err) {
    console.warn("Could not save commit analysis to Supabase:", err);
  }
}

/**
 * Fetch live activity stats for the dashboard
 */
export async function getDashboardStats(userId = null) {
  try {
    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    let searchCountQuery = supabase.from("search_history").select("id", { count: "exact", head: true });
    let savedCountQuery = supabase.from("saved_summaries").select("id", { count: "exact", head: true });
    let commitCountQuery = supabase.from("commit_analyses").select("id", { count: "exact", head: true });

    if (userToUse) {
      searchCountQuery = searchCountQuery.or(`user_id.eq.${userToUse},user_id.is.null`);
      savedCountQuery = savedCountQuery.or(`user_id.eq.${userToUse},user_id.is.null`);
      commitCountQuery = commitCountQuery.or(`user_id.eq.${userToUse},user_id.is.null`);
    }

    const [searchesRes, savedRes, commitsRes] = await Promise.all([
      searchCountQuery,
      savedCountQuery,
      commitCountQuery,
    ]);

    const totalSearches = searchesRes.count ?? 0;
    const savedSummaries = savedRes.count ?? 0;
    const commitsReviewed = commitsRes.count ?? 0;

    return {
      repositoriesAnalyzed: totalSearches,
      totalSearches,
      aiSummaries: savedSummaries,
      commitsReviewed,
    };
  } catch (err) {
    console.warn("Could not load dashboard stats from Supabase:", err);
    const searches = readLocal(HISTORY_KEY, []);
    const saved = readLocal(SAVED_KEY, []);
    const commits = readLocal(COMMITS_KEY, []);
    return {
      repositoriesAnalyzed: searches.length,
      totalSearches: searches.length,
      aiSummaries: saved.length,
      commitsReviewed: commits.length,
    };
  }
}

/**
 * Fetch recent repositories for the dashboard
 */
export async function getRecentRepositories(limit = 4, userId = null) {
  try {
    let query = supabase
      .from("search_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit * 2);

    let userToUse = userId;
    if (!userToUse) {
      const { data } = await supabase.auth.getUser();
      userToUse = data?.user?.id || null;
    }

    if (userToUse) {
      query = query.or(`user_id.eq.${userToUse},user_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      const seen = new Set();
      const deduped = [];
      for (const row of data) {
        if (!seen.has(row.repo_name)) {
          seen.add(row.repo_name);
          deduped.push({
            name: row.repo_name,
            description: row.description || "No description provided.",
            language: row.language || "Not specified",
            stars: row.stars || "0",
            forks: row.forks || "0",
            updated: new Date(row.created_at).toLocaleDateString(),
          });
          if (deduped.length >= limit) break;
        }
      }
      return deduped;
    }
  } catch (err) {
    console.warn("Could not load recent repositories from Supabase:", err);
  }

  const local = readLocal(HISTORY_KEY, []);
  return local.slice(0, limit).map((r) => ({
    name: r.name,
    description: r.description || "No description provided.",
    language: r.language || "Not specified",
    stars: r.stars || "0",
    forks: r.forks || "0",
    updated: r.analyzed || "Recently",
  }));
}
