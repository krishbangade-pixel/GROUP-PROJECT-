const {
  getCommitData
} = require("../services/github/commitService");

const {
  generateCommitSummary
} = require("../services/ai/commitAIService");

async function analyzeCommit(req, res) {
  try {
    const { repositoryUrl, commitHash } = req.body || {};

    if (!repositoryUrl || !commitHash) {
      return res.status(400).json({
        success: false,
        message: "Repository URL and commit hash are required."
      });
    }

    const commit = await getCommitData(
      repositoryUrl,
      commitHash
    );

    let summary = null;
    let summaryError = null;

    try {
      summary = await generateCommitSummary(commit);

      console.log("Commit AI summary generated successfully.");

    } catch (error) {
      console.error(
        "Commit AI Error:",
        error.status || error.code || "Unknown",
        String(error.message)
          .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED]")
          .replace(/github_pat_[A-Za-z0-9_]+/g, "[REDACTED]")
          .replace(/ghp_[A-Za-z0-9]+/g, "[REDACTED]")
      );

      summaryError = "AI summary is temporarily unavailable.";
    }

    return res.status(200).json({
      success: true,
      message: "Commit retrieved successfully.",
      data: {
        commit,
        summary,
        summaryError
      }
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to analyze commit."
    });
  }
}

module.exports = { analyzeCommit };