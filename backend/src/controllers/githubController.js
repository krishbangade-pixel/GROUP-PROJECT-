
const { getRepositoryData } = require("../services/github/githubService");

async function analyzeRepository(req, res) {
  try {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a GitHub repository URL."
      });
    }

    const data = await getRepositoryData(repositoryUrl);

    return res.status(200).json({
      success: true,
      message: "Repository data retrieved successfully.",
      data
    });

  } catch (error) {
    console.error("GitHub API Error:", error.message);

    const status = error.response?.status || error.statusCode;

    return res.status(
      status === 404 ? 404 :
      status === 403 || status === 429 ? 429 :
      400
    ).json({
      success: false,
      message:
        status === 404
          ? "Repository not found or not publicly accessible."
          : status === 403 || status === 429
          ? error.message || "GitHub API rate limit or access restriction reached."
          : error.message
    });
  }
}

module.exports = { analyzeRepository };
