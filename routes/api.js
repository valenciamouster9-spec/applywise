const express = require('express');
const { computeStats } = require('../services/analytics');
const { analyzeJobAd } = require('../services/jobMatcher');
const { buildCoverLetter } = require('../services/coverLetter');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dashboard numbers for the applications sent in the request.
router.post('/analytics', (req, res) => {
  const { applications } = req.body;

  if (!Array.isArray(applications)) {
    return res.status(400).json({ error: 'applications must be an array' });
  }

  res.json(computeStats(applications));
});

// Matched and missing skills between a job ad and a CV.
router.post('/analyze', (req, res) => {
  const { jobAd, cv } = req.body;

  if (!jobAd || !cv) {
    return res.status(400).json({ error: 'jobAd and cv are required' });
  }

  res.json(analyzeJobAd(jobAd, cv));
});

// A cover letter draft built from a template.
router.post('/cover-letter', (req, res) => {
  const { name, company, role, matchedSkills, summary } = req.body;

  if (!name || !company || !role) {
    return res.status(400).json({ error: 'name, company and role are required' });
  }

  res.json({ letter: buildCoverLetter({ name, company, role, matchedSkills, summary }) });
});

module.exports = router;