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
        <p style="color: #64748b; font-size: 0.9rem;">Your response has been recorded. Thank you for helping us improve the simulation.</p>
        <button class="btn btn-green" onclick="resetForm()" style="margin-top: 1rem;" data-testid="btn-submit-another">Submit Another</button>
      </div>
    </div>

  </div>

  <script>
    var QUESTIONS = ${JSON.stringify(SURVEY_QUESTIONS)};
    var WEEK_TITLES = ${JSON.stringify(WEEK_TITLES)};
    var ratings = {};
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
  </script>
</body>
</html>`;
}
