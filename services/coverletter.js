// "a, b and c" style list.
function joinList(items) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

// Builds a short cover letter from a template. No AI involved.
function buildCoverLetter({ name, company, role, matchedSkills = [], summary = '' }) {
  const skills = matchedSkills.slice(0, 4);

  const skillSentence = skills.length > 0
    ? 'My experience with ' + joinList(skills) + ' aligns well with what you are looking for.'
    : 'I would bring a strong learning mindset and a customer-first approach to the role.';

  const paragraphs = [
    'Dear ' + company + ' Hiring Team,',
    'I am excited to apply for the ' + role + ' position at ' + company + '. ' + skillSentence,
    summary,
    'I would welcome the chance to discuss how I can contribute to your team. Thank you for your time and consideration.',
    'Kind regards,\n' + name,
  ];

  return paragraphs.filter(Boolean).join('\n\n');
}

module.exports = { buildCoverLetter };