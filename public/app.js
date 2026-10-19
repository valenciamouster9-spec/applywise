const APPLICATIONS_KEY = 'applywise.applications';
const CV_KEY = 'applywise.cv';
const STATUS_LABELS = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

let applications = loadApplications();
let lastMatchedSkills = [];

// ---------- Helpers ----------

// Creates an element and sets its text safely (never uses innerHTML).
function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}

async function postJson(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function inputValue(id) {
  return document.getElementById(id).value.trim();
}

// ---------- Storage (applications stay in this browser only) ----------

function loadApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveApplications() {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

// ---------- Tabs ----------

function showTab(name) {
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== name);
  });

  if (name === 'dashboard') renderDashboard();
}

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
});

// ---------- Tracker ----------

function statusCell(application) {
  const select = element('select');

  Object.entries(STATUS_LABELS).forEach(([value, label]) => {
    const option = element('option', label);
    option.value = value;
    option.selected = value === application.status;
    select.append(option);
  });

  select.addEventListener('change', () => {
    application.status = select.value;
    saveApplications();
  });

  const cell = element('td');
  cell.append(select);
  return cell;
}

function deleteCell(application) {
  const button = element('button', 'Delete', 'danger');

  button.addEventListener('click', () => {
    applications = applications.filter((item) => item.id !== application.id);
    saveApplications();
    renderApplications();
  });

  const cell = element('td');
  cell.append(button);
  return cell;
}

function renderApplications() {
  const body = document.getElementById('applications-body');
  body.replaceChildren();

  applications.forEach((application) => {
    const row = element('tr');
    row.append(
      element('td', application.company),
      element('td', application.role),
      element('td', application.dateApplied),
      statusCell(application),
      deleteCell(application)
    );
    body.append(row);
  });

  document.getElementById('empty-message').classList.toggle('hidden', applications.length > 0);
}

function setDefaultDate() {
  document.getElementById('date').valueAsDate = new Date();
}

document.getElementById('application-form').addEventListener('submit', (event) => {
  event.preventDefault();

  applications.push({
    id: Date.now(),
    company: inputValue('company'),
    role: inputValue('role'),
    dateApplied: inputValue('date'),
    status: inputValue('status'),
  });

  saveApplications();
  renderApplications();
  event.target.reset();
  setDefaultDate();
});

// ---------- Dashboard ----------

function statCard(label, value) {
  const card = element('div', undefined, 'card');
  card.append(element('strong', String(value)), element('span', label));
  return card;
}

function renderBars(containerId, items) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  if (items.length === 0) {
    container.append(element('p', 'No data yet.'));
    return;
  }

  const max = Math.max(1, ...items.map((item) => item.count));

  items.forEach((item) => {
    const fill = element('div', undefined, 'fill');
    fill.style.width = (item.count / max) * 100 + '%';

    const track = element('div', undefined, 'track');
    track.append(fill);

    const row = element('div', undefined, 'bar-row');
    row.append(
      element('span', item.label, 'bar-label'),
      track,
      element('span', String(item.count), 'bar-count')
    );
    container.append(row);
  });
}

async function renderDashboard() {
  const cards = document.getElementById('stat-cards');

  try {
    const stats = await postJson('/api/analytics', { applications });

    cards.replaceChildren(
      statCard('Total applications', stats.total),
      statCard('Response rate', stats.responseRate + '%'),
      statCard('Interview rate', stats.interviewRate + '%')
    );

    renderBars(
      'status-chart',
      Object.entries(stats.byStatus).map(([status, count]) => ({ label: STATUS_LABELS[status], count }))
    );
    renderBars(
      'week-chart',
      stats.perWeek.map(({ week, count }) => ({ label: 'Week of ' + week, count }))
    );
  } catch (error) {
    cards.replaceChildren(element('p', 'Could not load the dashboard. Is the server running?'));
  }
}

// ---------- Assistant ----------

function skillList(title, skills, className) {
  const wrapper = element('div');
  wrapper.append(element('h3', title));

  if (skills.length === 0) {
    wrapper.append(element('p', 'None'));
    return wrapper;
  }

  const chips = element('div', undefined, 'chips');
  skills.forEach((skill) => chips.append(element('span', skill, 'chip ' + className)));
  wrapper.append(chips);
  return wrapper;
}

const cvInput = document.getElementById('cv');
cvInput.value = localStorage.getItem(CV_KEY) || '';
cvInput.addEventListener('input', () => localStorage.setItem(CV_KEY, cvInput.value));

document.getElementById('analyze-button').addEventListener('click', async () => {
  const result = document.getElementById('match-result');
  const jobAd = inputValue('job-ad');
  const cv = inputValue('cv');

  if (!jobAd || !cv) {
    result.replaceChildren(element('p', 'Paste both your CV and the job ad first.'));
    return;
  }

  try {
    const analysis = await postJson('/api/analyze', { jobAd, cv });
    lastMatchedSkills = analysis.matched;

    result.replaceChildren(
      element('p', 'Match score: ' + analysis.score + '%', 'score'),
      skillList('Matched skills', analysis.matched, 'matched'),
      skillList('Missing skills (only add these to your CV if they are true)', analysis.missing, 'missing')
    );
  } catch (error) {
    result.replaceChildren(element('p', 'Something went wrong. Is the server running?'));
  }
});

document.getElementById('letter-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const output = document.getElementById('letter-output');

  try {
    const data = await postJson('/api/cover-letter', {
      name: inputValue('letter-name'),
      company: inputValue('letter-company'),
      role: inputValue('letter-role'),
      summary: inputValue('letter-summary'),
      matchedSkills: lastMatchedSkills,
    });
    output.value = data.letter;
  } catch (error) {
    output.value = 'Something went wrong. Is the server running?';
  }
});

// ---------- Start ----------

setDefaultDate();
renderApplications();