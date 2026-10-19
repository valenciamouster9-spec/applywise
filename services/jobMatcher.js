// Skills the matcher looks for. Add more here to widen what it can detect.
const SKILLS = [
  'customer service', 'customer support', 'technical support', 'troubleshooting',
  'ticketing', 'zendesk', 'freshdesk', 'jira', 'servicenow', 'crm', 'salesforce',
  'sla', 'windows', 'networking', 'active directory', 'microsoft 365', 'office 365',
  'html', 'css', 'javascript', 'node.js', 'python', 'sql', 'git', 'api',
  'excel', 'communication', 'problem solving', 'documentation', 'remote',
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// True if the skill appears as a whole word or phrase (so "sla" does not match "slack").
function containsSkill(text, skill) {
  const pattern = new RegExp('\\b' + escapeRegex(skill) + '\\b', 'i');
  return pattern.test(text);
}

// Compares a job ad with a CV and reports which skills match or are missing.
function analyzeJobAd(jobAd, cv) {
  const required = SKILLS.filter((skill) => containsSkill(jobAd, skill));
  const matched = required.filter((skill) => containsSkill(cv, skill));
  const missing = required.filter((skill) => !matched.includes(skill));
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100);

  return { required, matched, missing, score };
}

module.exports = { analyzeJobAd };