const test = require('node:test');
const assert = require('node:assert');
const { computeStats } = require('../services/analytics');
const { analyzeJobAd } = require('../services/jobMatcher');
const { buildCoverLetter } = require('../services/coverLetter');

test('computeStats counts statuses, rates and weeks', () => {
  const stats = computeStats([
    { company: 'A', role: 'Support', dateApplied: '2026-10-12', status: 'applied' },
    { company: 'B', role: 'Support', dateApplied: '2026-10-14', status: 'interview' },
    { company: 'C', role: 'Support', dateApplied: '2026-10-20', status: 'rejected' },
    { company: 'D', role: 'Support', dateApplied: '2026-10-21', status: 'offer' },
  ]);

  assert.strictEqual(stats.total, 4);
  assert.strictEqual(stats.byStatus.interview, 1);
  assert.strictEqual(stats.responseRate, 75);
  assert.strictEqual(stats.interviewRate, 50);
  assert.deepStrictEqual(stats.perWeek, [
    { week: '2026-10-12', count: 2 },
    { week: '2026-10-19', count: 2 },
  ]);
});

test('computeStats handles an empty list', () => {
  const stats = computeStats([]);

  assert.strictEqual(stats.total, 0);
  assert.strictEqual(stats.responseRate, 0);
  assert.deepStrictEqual(stats.perWeek, []);
});

test('computeStats ignores invalid dates', () => {
  const stats = computeStats([{ company: 'A', role: 'X', dateApplied: 'not a date', status: 'applied' }]);

  assert.strictEqual(stats.total, 1);
  assert.deepStrictEqual(stats.perWeek, []);
});

test('analyzeJobAd separates matched and missing skills', () => {
  const result = analyzeJobAd(
    'We need Zendesk, troubleshooting and SQL skills',
    'I know Zendesk and troubleshooting'
  );

  assert.deepStrictEqual([...result.matched].sort(), ['troubleshooting', 'zendesk']);
  assert.deepStrictEqual(result.missing, ['sql']);
  assert.strictEqual(result.score, 67);
});

test('analyzeJobAd matches whole words only', () => {
  const result = analyzeJobAd('We use Slack every day', '');

  assert.ok(!result.required.includes('sla'));
});

test('buildCoverLetter uses the company, role and at most four skills', () => {
  const letter = buildCoverLetter({
    name: 'Valencia',
    company: 'Acme',
    role: 'Support Agent',
    matchedSkills: ['zendesk', 'sql', 'jira', 'git', 'python'],
  });

  assert.ok(letter.includes('Acme'));
  assert.ok(letter.includes('Support Agent'));
  assert.ok(letter.includes('zendesk, sql, jira and git'));
  assert.ok(!letter.includes('python'));
});