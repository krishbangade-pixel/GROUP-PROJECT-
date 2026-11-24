const express = require("express");
const router = express.Router();

const {
  summarizeRepository
} = require("../controllers/aiController");

const {
  analyzeCommit
} = require("../controllers/commitController");

router.post("/summarize", summarizeRepository);

router.post("/analyze-commit", analyzeCommit);

module.exports = router;