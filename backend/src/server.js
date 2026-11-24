
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const githubRoutes = require("./routes/githubRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitSummarizer Backend is running!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "GitSummarizer API"
  });
});

// GitHub API routes
app.use("/api/github", githubRoutes);

// Gemini AI routes
app.use("/api/ai", aiRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `GitSummarizer server running on port ${PORT}`
  );
});
