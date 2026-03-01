const WEEK_TITLES: Record<number, string> = {
  1: "The Automation Imperative",
  2: "The Talent Pipeline Crisis",
  3: "Union Storm Brewing",
  4: "The First Displacement",
  5: "The Manager Exodus",
  6: "Debt Day of Reckoning",
  7: "The Competitive Response",
  8: "Strategic Direction",
};

const SURVEY_QUESTIONS = [
  { key: "realism", label: "Realism", description: "How realistic did this week's scenario feel?" },
  { key: "fairness", label: "Fairness", description: "How fair were the decision options and scoring?" },
  { key: "difficulty", label: "Difficulty", description: "How challenging was this week's decision?" },
  { key: "learningValue", label: "Learning Value", description: "How much did you learn from this week?" },
  { key: "engagement", label: "Engagement", description: "How engaging was the content and experience?" },
  { key: "clarity", label: "Clarity", description: "How clear were the instructions and materials?" },
];

function escapeHtml(text: string | number | unknown): string {
  const str = String(text ?? "");
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function renderSurveyPage(): string {
  const weekOptions = Object.entries(WEEK_TITLES).map(([num, title]) =>
    `<option value="${num}">Week ${num}: ${escapeHtml(title)}</option>`
  ).join("\n");

  const questionRows = SURVEY_QUESTIONS.map(q => `
    <div class="question-row" data-testid="question-${q.key}">
      <div class="question-label">
        <strong>${escapeHtml(q.label)}</strong>
        <span class="question-desc">${escapeHtml(q.description)}</span>
      </div>
      <div class="star-group" data-field="${q.key}">
        ${[1,2,3,4,5].map(n => `<button type="button" class="star-btn" data-value="${n}" data-testid="star-${q.key}-${n}" aria-label="${n} star">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
        </button>`).join("")}
        <span class="star-value" data-testid="value-${q.key}"></span>
      </div>
    </div>
  `).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Feedback Survey | Future Work Academy</title>
  <meta name="description" content="Share your feedback on this week's simulation experience.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --navy: #1e3a5f;
      --navy-light: #2a4a73;
      --green: #22c55e;
      --green-dark: #16a34a;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --star-empty: #cbd5e1;
      --star-filled: #f59e0b;
      --star-hover: #fbbf24;
      --radius: 12px;
      --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-lg: 0 4px 12px rgba(0,0,0,0.1);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }

    .header { background: var(--navy); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
    .header-brand { color: #fff; font-weight: 700; font-size: 1.1rem; }
    .header-sub { color: rgba(255,255,255,0.7); font-size: 0.85rem; }
    .header-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
    .header-link:hover { color: #fff; }

    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }

    .badge { display: inline-block; background: rgba(30,58,95,0.08); color: var(--navy); font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
    h1 { font-size: 1.75rem; font-weight: 700; color: var(--navy); margin-bottom: 0.25rem; }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; }

    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem; }
    .tab-btn { background: none; border: none; padding: 0.75rem 1.25rem; font-size: 0.9rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; font-family: inherit; }
    .tab-btn:hover { color: var(--navy); }
    .tab-btn.active { color: var(--navy); border-bottom-color: var(--navy); font-weight: 600; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); margin-bottom: 1.5rem; }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: var(--text); margin-bottom: 0.4rem; }
    .label-hint { font-weight: 400; color: var(--text-light); font-size: 0.8rem; }
    select, textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 0.9rem; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; }
    select:focus, textarea:focus { outline: none; border-color: var(--navy); box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }
    textarea { resize: vertical; min-height: 80px; }
    input[type="text"] { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 0.9rem; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; }
    input[type="text"]:focus { outline: none; border-color: var(--navy); box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }

    .question-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .question-row:last-child { border-bottom: none; }
    .question-label { flex: 1; }
    .question-label strong { display: block; font-size: 0.9rem; }
    .question-desc { font-size: 0.8rem; color: var(--text-muted); }
    .star-group { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; }
    .star-btn { background: none; border: none; cursor: pointer; color: var(--star-empty); transition: color 0.15s, transform 0.15s; padding: 2px; }
    .star-btn:hover { transform: scale(1.15); }
    .star-btn.filled { color: var(--star-filled); }
    .star-btn:hover, .star-btn.hover-fill { color: var(--star-hover); }
    .star-value { font-family: 'Roboto Mono', monospace; font-size: 0.8rem; color: var(--text-muted); width: 2rem; text-align: center; }

    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.5rem; border: none; border-radius: 8px; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--navy); color: #fff; }
    .btn-primary:hover { background: var(--navy-light); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-green { background: var(--green); color: #fff; }
    .btn-green:hover { background: var(--green-dark); }

    .status-msg { margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted); min-height: 1.25rem; }
    .status-msg.success { color: var(--green-dark); font-weight: 600; }
    .status-msg.error { color: #dc2626; }

    .success-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius); padding: 1.5rem; text-align: center; display: none; }
    .success-card h3 { color: var(--green-dark); margin-bottom: 0.5rem; }

    .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; text-align: center; box-shadow: var(--shadow); }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--navy); font-family: 'Roboto Mono', monospace; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }
    .stat-sub { font-size: 0.75rem; color: var(--text-light); }

    .week-filter { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .week-filter label { font-weight: 600; font-size: 0.85rem; white-space: nowrap; }
    .week-filter select { width: auto; min-width: 200px; }

    .chart-container { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow); margin-bottom: 1.5rem; }
    .chart-container h3 { font-size: 1rem; color: var(--navy); margin-bottom: 0.75rem; }
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    @media (max-width: 700px) { .chart-row { grid-template-columns: 1fr; } }

    .comments-section { margin-top: 1.5rem; }
    .comments-section h3 { font-size: 1rem; color: var(--navy); margin-bottom: 0.75rem; }
    .comment-card { background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; }
    .comment-meta { font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.25rem; }
    .comment-text { font-size: 0.85rem; color: var(--text); }

    .no-data { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .no-data svg { margin-bottom: 1rem; color: var(--text-light); }

    .trend-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .trend-table th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 0.8rem; }
    .trend-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); }
    .trend-table tr:last-child td { border-bottom: none; }
    .avg-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; font-family: 'Roboto Mono', monospace; }
    .avg-high { background: #dcfce7; color: #15803d; }
    .avg-mid { background: #fef3c7; color: #92400e; }
    .avg-low { background: #fef2f2; color: #991b1b; }

    .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.8rem; color: #92400e; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 0.5rem; }
    .disclaimer svg { flex-shrink: 0; margin-top: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-brand">Future Work Academy</div>
      <div class="header-sub">Student Feedback Survey</div>
    </div>
    <a href="/week-0" class="header-link" data-testid="link-orientation">Orientation</a>
  </div>

  <div class="container">
    <span class="badge">Student Feedback</span>
    <h1 data-testid="page-title">Weekly Simulation Survey</h1>
    <p class="subtitle">Share your thoughts on this week's simulation. Your feedback helps improve the experience.</p>

    <div class="disclaimer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      Responses are anonymous and used to improve the simulation. One submission per student per week.
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="submit" data-testid="btn-tab-submit">Submit Feedback</button>
      <button class="tab-btn" data-tab="results" data-testid="btn-tab-results">Results Dashboard</button>
    </div>

    <div class="tab-panel active" id="panel-submit" data-testid="panel-submit">
      <div class="card">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label for="student-id">Student ID <span class="label-hint">(your class identifier)</span></label>
            <input type="text" id="student-id" placeholder="e.g., 001" data-testid="input-student-id">
          </div>
          <div class="form-group">
            <label for="survey-week">Week</label>
            <select id="survey-week" data-testid="select-survey-week">
              <option value="">Select a week...</option>
              ${weekOptions}
            </select>
          </div>
        </div>

        <div style="margin-top: 0.5rem;">
          <label style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.75rem; display: block;">Rate your experience <span class="label-hint">(1 = Poor, 5 = Excellent)</span></label>
          ${questionRows}
        </div>

        <div class="form-group" style="margin-top: 1.25rem;">
          <label for="survey-comments">Additional Comments <span class="label-hint">(optional)</span></label>
          <textarea id="survey-comments" rows="3" placeholder="Any other thoughts about this week's simulation..." data-testid="textarea-comments"></textarea>
        </div>

        <button class="btn btn-primary" onclick="submitSurvey()" data-testid="btn-submit-survey">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Submit Feedback
        </button>
        <div class="status-msg" id="submit-status" data-testid="submit-status"></div>
      </div>

      <div class="success-card" id="success-card" data-testid="success-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Thank you for your feedback!</h3>
        <p style="color: #64748b; font-size: 0.9rem;">Your response has been recorded. You can view aggregated results in the Results Dashboard tab.</p>
        <button class="btn btn-green" onclick="resetForm()" style="margin-top: 1rem;" data-testid="btn-submit-another">Submit Another</button>
      </div>
    </div>

    <div class="tab-panel" id="panel-results" data-testid="panel-results">
      <div id="results-container" data-testid="results-container">
        <div class="no-data" id="results-loading">
          <p>Loading results...</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    var QUESTIONS = ${JSON.stringify(SURVEY_QUESTIONS)};
    var WEEK_TITLES = ${JSON.stringify(WEEK_TITLES)};
    var ratings = {};
    var resultsLoaded = false;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'results' && !resultsLoaded) { loadResults(); }
      });
    });

    document.querySelectorAll('.star-group').forEach(function(group) {
      var field = group.dataset.field;
      var btns = group.querySelectorAll('.star-btn');
      btns.forEach(function(btn) {
        btn.addEventListener('mouseenter', function() {
          var v = parseInt(btn.dataset.value);
          btns.forEach(function(b) {
            b.classList.toggle('hover-fill', parseInt(b.dataset.value) <= v);
          });
        });
        btn.addEventListener('mouseleave', function() {
          btns.forEach(function(b) { b.classList.remove('hover-fill'); });
        });
        btn.addEventListener('click', function() {
          var v = parseInt(btn.dataset.value);
          ratings[field] = v;
          btns.forEach(function(b) {
            b.classList.toggle('filled', parseInt(b.dataset.value) <= v);
          });
          group.querySelector('.star-value').textContent = v + '/5';
        });
      });
    });

    window.submitSurvey = async function() {
      var statusEl = document.getElementById('submit-status');
      var studentId = document.getElementById('student-id').value.trim();
      var weekNumber = parseInt(document.getElementById('survey-week').value);
      var comments = document.getElementById('survey-comments').value.trim();

      if (!studentId) { statusEl.textContent = 'Please enter your Student ID.'; statusEl.className = 'status-msg error'; return; }
      if (!weekNumber) { statusEl.textContent = 'Please select a week.'; statusEl.className = 'status-msg error'; return; }
      var missing = QUESTIONS.filter(function(q) { return !ratings[q.key]; });
      if (missing.length > 0) { statusEl.textContent = 'Please rate all categories (' + missing.map(function(q){return q.label}).join(', ') + ').'; statusEl.className = 'status-msg error'; return; }

      statusEl.textContent = 'Submitting...';
      statusEl.className = 'status-msg';

      try {
        var res = await fetch('/api/survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId,
            weekNumber: weekNumber,
            realism: ratings.realism,
            fairness: ratings.fairness,
            difficulty: ratings.difficulty,
            learningValue: ratings.learningValue,
            engagement: ratings.engagement,
            clarity: ratings.clarity,
            comments: comments || null
          })
        });
        var data = await res.json();
        if (!res.ok) { statusEl.textContent = data.error || 'Failed to submit.'; statusEl.className = 'status-msg error'; return; }
        document.querySelector('.card').style.display = 'none';
        document.getElementById('success-card').style.display = 'block';
        statusEl.textContent = '';
        resultsLoaded = false;
      } catch (e) {
        statusEl.textContent = 'Network error. Please try again.';
        statusEl.className = 'status-msg error';
      }
    };

    window.resetForm = function() {
      document.querySelector('.card').style.display = 'block';
      document.getElementById('success-card').style.display = 'none';
      document.getElementById('student-id').value = '';
      document.getElementById('survey-week').value = '';
      document.getElementById('survey-comments').value = '';
      ratings = {};
      document.querySelectorAll('.star-btn').forEach(function(b) { b.classList.remove('filled'); });
      document.querySelectorAll('.star-value').forEach(function(v) { v.textContent = ''; });
      document.getElementById('submit-status').textContent = '';
    };

    async function loadResults() {
      var container = document.getElementById('results-container');
      try {
        var res = await fetch('/api/survey/results');
        var data = await res.json();
        resultsLoaded = true;
        if (!data.responses || data.responses.length === 0) {
          container.innerHTML = '<div class="no-data"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg><h3 style="margin-bottom:0.5rem;color:var(--text)">No responses yet</h3><p>Feedback will appear here once students start submitting.</p></div>';
          return;
        }
        renderResults(data.responses);
      } catch (e) {
        container.innerHTML = '<div class="no-data"><p style="color:#dc2626">Failed to load results. Please try again.</p></div>';
      }
    }

    function renderResults(responses) {
      var container = document.getElementById('results-container');
      var html = '';

      var weekGroups = {};
      responses.forEach(function(r) {
        if (!weekGroups[r.weekNumber]) weekGroups[r.weekNumber] = [];
        weekGroups[r.weekNumber].push(r);
      });
      var weeks = Object.keys(weekGroups).map(Number).sort(function(a,b){return a-b;});

      html += '<div class="results-grid" data-testid="overview-stats">';
      html += '<div class="stat-card"><div class="stat-value" data-testid="stat-total">' + responses.length + '</div><div class="stat-label">Total Responses</div></div>';
      html += '<div class="stat-card"><div class="stat-value" data-testid="stat-weeks">' + weeks.length + '</div><div class="stat-label">Weeks Covered</div></div>';
      var overallAvg = responses.reduce(function(s,r){ return s + (r.realism+r.fairness+r.difficulty+r.learningValue+r.engagement+r.clarity)/6; }, 0) / responses.length;
      html += '<div class="stat-card"><div class="stat-value" data-testid="stat-avg">' + overallAvg.toFixed(1) + '</div><div class="stat-label">Overall Average</div><div class="stat-sub">across all categories</div></div>';
      var uniqueStudents = new Set(responses.map(function(r){return r.studentId})).size;
      html += '<div class="stat-card"><div class="stat-value" data-testid="stat-students">' + uniqueStudents + '</div><div class="stat-label">Unique Students</div></div>';
      html += '</div>';

      html += '<div class="chart-container" data-testid="chart-trends"><h3>Rating Trends Across Weeks</h3><canvas id="chart-trends" height="300"></canvas></div>';

      html += '<div class="chart-row">';
      html += '<div class="chart-container" data-testid="chart-radar"><h3>Category Averages (All Weeks)</h3><canvas id="chart-radar" height="280"></canvas></div>';
      html += '<div class="chart-container" data-testid="chart-distribution"><h3>Response Distribution</h3><canvas id="chart-distribution" height="280"></canvas></div>';
      html += '</div>';

      html += '<div class="card" data-testid="trend-table"><h3 style="font-size:1rem;color:var(--navy);margin-bottom:0.75rem;">Week-by-Week Breakdown</h3>';
      html += '<div style="overflow-x:auto;"><table class="trend-table"><thead><tr><th>Week</th>';
      QUESTIONS.forEach(function(q) { html += '<th>' + q.label + '</th>'; });
      html += '<th>Avg</th><th>N</th></tr></thead><tbody>';
      weeks.forEach(function(w) {
        var wrs = weekGroups[w];
        html += '<tr><td><strong>W' + w + '</strong><br><span style="font-size:0.75rem;color:var(--text-light)">' + (WEEK_TITLES[w]||'') + '</span></td>';
        var rowTotal = 0;
        QUESTIONS.forEach(function(q) {
          var avg = wrs.reduce(function(s,r){return s+r[q.key];},0) / wrs.length;
          rowTotal += avg;
          var cls = avg >= 4 ? 'avg-high' : avg >= 3 ? 'avg-mid' : 'avg-low';
          html += '<td><span class="avg-badge ' + cls + '">' + avg.toFixed(1) + '</span></td>';
        });
        var rowAvg = rowTotal / QUESTIONS.length;
        var rowCls = rowAvg >= 4 ? 'avg-high' : rowAvg >= 3 ? 'avg-mid' : 'avg-low';
        html += '<td><span class="avg-badge ' + rowCls + '">' + rowAvg.toFixed(1) + '</span></td>';
        html += '<td>' + wrs.length + '</td></tr>';
      });
      html += '</tbody></table></div></div>';

      var allComments = responses.filter(function(r) { return r.comments && r.comments.trim(); });
      if (allComments.length > 0) {
        html += '<div class="comments-section" data-testid="comments-section"><h3>Student Comments (' + allComments.length + ')</h3>';
        allComments.sort(function(a,b){ return a.weekNumber - b.weekNumber; });
        allComments.forEach(function(r, idx) {
          html += '<div class="comment-card" data-testid="comment-' + idx + '"><div class="comment-meta">Week ' + r.weekNumber + ': ' + (WEEK_TITLES[r.weekNumber]||'') + ' &mdash; Student ' + r.studentId + '</div><div class="comment-text">' + escapeHtmlClient(r.comments) + '</div></div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;

      setTimeout(function() { buildCharts(responses, weekGroups, weeks); }, 100);
    }

    function escapeHtmlClient(text) {
      var d = document.createElement('div');
      d.textContent = text || '';
      return d.innerHTML;
    }

    function buildCharts(responses, weekGroups, weeks) {
      if (typeof Chart === 'undefined') return;

      var colors = ['#1e3a5f','#22c55e','#f59e0b','#3b82f6','#ef4444','#8b5cf6'];

      var trendCanvas = document.getElementById('chart-trends');
      if (trendCanvas) {
        var trendDatasets = QUESTIONS.map(function(q, qi) {
          return {
            label: q.label,
            data: weeks.map(function(w) {
              var wrs = weekGroups[w];
              return Math.round((wrs.reduce(function(s,r){return s+r[q.key];},0) / wrs.length) * 100) / 100;
            }),
            borderColor: colors[qi],
            backgroundColor: colors[qi] + '20',
            tension: 0.3,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
          };
        });
        new Chart(trendCanvas, {
          type: 'line',
          data: { labels: weeks.map(function(w){return 'Week ' + w;}), datasets: trendDatasets },
          options: {
            responsive: true,
            scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
          }
        });
      }

      var radarCanvas = document.getElementById('chart-radar');
      if (radarCanvas) {
        var radarData = QUESTIONS.map(function(q) {
          return Math.round((responses.reduce(function(s,r){return s+r[q.key];},0) / responses.length) * 100) / 100;
        });
        new Chart(radarCanvas, {
          type: 'radar',
          data: {
            labels: QUESTIONS.map(function(q){return q.label;}),
            datasets: [{
              label: 'Average Rating',
              data: radarData,
              backgroundColor: 'rgba(30,58,95,0.15)',
              borderColor: '#1e3a5f',
              pointBackgroundColor: '#1e3a5f',
              pointRadius: 4,
            }]
          },
          options: {
            responsive: true,
            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: false } }
          }
        });
      }

      var distCanvas = document.getElementById('chart-distribution');
      if (distCanvas) {
        var distData = [0,0,0,0,0];
        responses.forEach(function(r) {
          QUESTIONS.forEach(function(q) {
            distData[r[q.key] - 1]++;
          });
        });
        new Chart(distCanvas, {
          type: 'bar',
          data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
              label: 'Count',
              data: distData,
              backgroundColor: ['#ef4444','#f59e0b','#fbbf24','#3b82f6','#22c55e'],
              borderRadius: 6,
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  </script>
</body>
</html>`;
}
