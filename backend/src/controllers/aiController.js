
const { generateProjectSummary } = require("../services/ai/geminiService");
const { getRepositoryData } = require("../services/github/githubService");

async function summarizeRepository(req, res) {
  try {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a GitHub repository URL."
      });
    }

    const repositoryData = await getRepositoryData(repositoryUrl);

    const summary = await generateProjectSummary(repositoryData);

    return res.status(200).json({
      success: true,
      message: "AI project summary generated successfully.",
      data: {
        repository: repositoryData.repository,
        summary
      }
    });

  } catch (error) {
    console.error("AI Summary Error:", error.message);

    const status = error.response?.status || error.statusCode;
    const isRateLimit = status === 403 || status === 429;

    return res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? error.message || "GitHub API rate limit or access restriction reached."
        : "Unable to generate project summary.",
      error: error.message
    });
  }
}

module.exports = { summarizeRepository };

