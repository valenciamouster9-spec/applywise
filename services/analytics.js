const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

// Returns the Monday of the week for a date like "2026-10-14", or null if invalid.
function weekStart(dateString) {
  if (typeof dateString !== 'string') return null;

  const date = new Date(dateString + 'T00:00:00Z');
  if (isNaN(date)) return null;

  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

function percentage(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

// Turns a list of applications into the numbers the dashboard needs.
function computeStats(applications) {
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  const countsPerWeek = {};

  for (const application of applications) {
    if (!application) continue;

    if (byStatus[application.status] !== undefined) {
      byStatus[application.status] += 1;
    }

    const week = weekStart(application.dateApplied);
    if (week) {
      countsPerWeek[week] = (countsPerWeek[week] || 0) + 1;
    }
  }

  const total = applications.length;
  const responded = byStatus.interview + byStatus.offer + byStatus.rejected;
  const interviewed = byStatus.interview + byStatus.offer;

  return {
    total,
    byStatus,
    responseRate: percentage(responded, total),
    interviewRate: percentage(interviewed, total),
    perWeek: Object.entries(countsPerWeek)
      .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
      .map(([week, count]) => ({ week, count })),
  };
}

module.exports = { computeStats };