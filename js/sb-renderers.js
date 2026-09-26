/* Elite Ballers FC — production public data renderers */
(function () {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  const validDate = v => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const fmtDate = v => {
    const d = validDate(v);
    return d ? d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBA';
  };

  const fmtDay = v => {
    const d = validDate(v);
    return d ? String(d.getDate()).padStart(2, '0') : '—';
  };

  const fmtMonth = v => {
    const d = validDate(v);
    return d ? d.toLocaleDateString([], { month: 'short' }).toUpperCase() : 'TBA';
  };

  const fmtTime = v => {
    const d = validDate(v);
    return d ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Time TBA';
  };

  async function load(table, options = {}) {
    if (!window.SB) return [];
    const { data, error } = await SB.fetchAll(table, options);
    if (error) {
      console.error(`[Elite Ballers] ${table}:`, error);
      return [];
    }
    return data || [];
  }

  const limited = (rows, limit) => {
    const n = Number(limit);
    return Number.isFinite(n) && n > 0 ? rows.slice(0, n) : rows;
  };

  function mount(selector, html, emptyText) {
    const el = document.querySelector(selector);
    if (!el) return null;
    el.innerHTML = html || `<div class="eb-empty">${esc(emptyText)}</div>`;
    return el;
  }

  async function players(selector = '#players-container', limit) {
    const rows = limited(await load('players', {
      filters: { status: 'active' },
      orderBy: 'number',
      ascending: true
    }), limit);

    mount(selector, rows.map(p => `
      <article class="player-card">
        <div class="player-image">
          ${p.image_url
            ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/app-icon.svg'">`
            : '<div class="player-placeholder">⚽</div>'}
          <span class="player-position">${esc(p.position || 'PLAYER')}</span>
        </div>
        <div class="player-info">
          <span class="player-number">${p.number != null ? esc(p.number) : '—'}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.position || 'Player')}</p>
        </div>
      </article>
    `).join(''), 'No players published yet.');
  }

  async function fixtures(selector = '#fixtures-container', limit) {
    let rows = await load('fixtures', { orderBy: 'match_date', ascending: true });
    const now = Date.now();
    rows = rows.filter(f => f.status === 'upcoming' && validDate(f.match_date)?.getTime() >= now);
    rows = limited(rows, limit);

    mount(selector, rows.map(f => `
      <article class="fixture-card">
        <div class="fixture-date">
          <strong>${fmtDay(f.match_date)}</strong>
          <span>${fmtMonth(f.match_date)}</span>
        </div>
        <div class="fixture-details">
          <h3>${esc(f.title || `Elite Ballers FC vs ${f.opponent}`)}</h3>
          <p><strong>Opponent:</strong> ${esc(f.opponent)}<br><strong>Venue:</strong> ${esc(f.venue || 'Venue TBA')}</p>
        </div>
        <div class="fixture-time">
          ${fmtTime(f.match_date)}
          <span>${esc(f.status || 'upcoming')}</span>
        </div>
      </article>
    `).join(''), 'No upcoming fixtures yet.');
  }

  async function results(selector = '#results-container', limit) {
    const rows = limited(await load('results', {
      orderBy: 'played_on',
      ascending: false
    }), limit);

    mount(selector, rows.map(r => {
      const win = Number(r.our_goals) > Number(r.opponent_goals);
      const draw = Number(r.our_goals) === Number(r.opponent_goals);
      const state = win ? 'win' : draw ? 'draw' : 'loss';
      const label = win ? 'WIN' : draw ? 'DRAW' : 'LOSS';
      return `
        <article class="result-card">
          <div class="result-date">
            <strong>${fmtDay(r.played_on)}</strong>
            <span>${fmtMonth(r.played_on)}</span>
          </div>
          <div class="result-match">
            <h3>Elite Ballers FC vs ${esc(r.opponent)}</h3>
            <div class="result-score">
              <span class="our-score">${esc(r.our_goals)}</span>
              <span class="separator">–</span>
              <span>${esc(r.opponent_goals)}</span>
            </div>
          </div>
          <span class="result-status ${state}">${label}</span>
        </article>
      `;
    }).join(''), 'No results recorded yet.');
  }

  async function news(selector = '#news-container', limit) {
    const rows = limited(await load('news', {
      filters: { published: true },
      orderBy: 'published_at',
      ascending: false
    }), limit);

    mount(selector, rows.map(n => `
      <article class="news-card">
        <div class="news-card-image">
          ${n.image_url
            ? `<img src="${esc(n.image_url)}" alt="${esc(n.title)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.closest('.news-card-image').classList.add('image-fallback');">`
            : '<span>NEWS</span>'}
        </div>
        <div class="news-card-content">
          <span class="news-date">${fmtDate(n.published_at)}</span>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.content || '').slice(0, 220)}${(n.content || '').length > 220 ? '…' : ''}</p>
        </div>
      </article>
    `).join(''), 'No news published yet.');
  }

  async function gallery(selector = '#gallery-container', limit) {
    const rows = limited(await load('gallery', {
      orderBy: 'created_at',
      ascending: false
    }), limit);

    mount(selector, rows.map(g => `
      <figure class="gallery-item" tabindex="0" role="button" aria-label="Open ${esc(g.title || 'gallery photo')}">
        <img src="${esc(g.image_url)}" alt="${esc(g.title || 'Elite Ballers FC')}" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.style.opacity='.25';">
        <div class="gallery-overlay">
          <h3>${esc(g.title || 'Club memory')}</h3>
          <span>${esc(g.caption || 'Elite Ballers FC')}</span>
        </div>
      </figure>
    `).join(''), 'No gallery photos published yet.');
  }

  async function homeFixture(selector = '#homeFixtureCard') {
    const rows = await load('fixtures', { orderBy: 'match_date', ascending: true });
    const next = rows.find(f => f.status === 'upcoming' && validDate(f.match_date)?.getTime() >= Date.now());
    const el = document.querySelector(selector);
    if (!el) return;

    if (!next) {
      el.innerHTML = `<div class="eb-empty-card"><span class="match-label">MATCHDAY</span><strong>No upcoming fixture</strong><p>The next match will appear here when club management publishes it.</p></div>`;
      return;
    }

    el.innerHTML = `
      <div class="team">
        <div class="team-logo"><img src="assets/images/logo.png" alt="Elite Ballers FC"></div>
        <h3>Elite Ballers FC</h3>
      </div>
      <div class="match-info">
        <span class="match-label">UPCOMING</span>
        <strong class="match-vs">VS</strong>
        <p class="match-date">${fmtDate(next.match_date)}</p>
        <p class="match-time">${esc(next.venue || 'Venue TBA')}</p>
      </div>
      <div class="team">
        <div class="team-logo opponent-logo"><span>?</span></div>
        <h3>${esc(next.opponent)}</h3>
      </div>
    `;
  }

  async function homeResult(selector = '#homeResultCard') {
    const rows = await load('results', { orderBy: 'played_on', ascending: false, limit: 1 });
    const latest = rows[0];
    const el = document.querySelector(selector);
    if (!el) return;

    if (!latest) {
      el.innerHTML = `<div class="eb-empty-card"><span class="result-status">RESULT</span><strong>No result available yet</strong><p>Published match results will appear here.</p></div>`;
      return;
    }

    const win = Number(latest.our_goals) > Number(latest.opponent_goals);
    const draw = Number(latest.our_goals) === Number(latest.opponent_goals);
    const label = win ? 'WIN' : draw ? 'DRAW' : 'LOSS';
    const state = win ? 'win' : draw ? 'draw' : 'loss';

    el.innerHTML = `
      <div class="team">
        <div class="team-logo"><img src="assets/images/logo.png" alt="Elite Ballers FC"></div>
        <h3>Elite Ballers FC</h3>
      </div>
      <div class="score">
        <span class="result-status ${state}">${label}</span>
        <strong>${esc(latest.our_goals)} : ${esc(latest.opponent_goals)}</strong>
        <p>${esc(latest.opponent)} · ${fmtDate(latest.played_on)}</p>
      </div>
      <div class="team">
        <div class="team-logo opponent-logo"><span>?</span></div>
        <h3>${esc(latest.opponent)}</h3>
      </div>
    `;
  }

  async function homeStats() {
    const [playersRows, resultsRows] = await Promise.all([
      load('players', { filters: { status: 'active' } }),
      load('results', { orderBy: 'played_on', ascending: false })
    ]);
    const matches = resultsRows.length;
    const wins = resultsRows.filter(r => Number(r.our_goals) > Number(r.opponent_goals)).length;
    const goals = resultsRows.reduce((sum, r) => sum + Number(r.our_goals || 0), 0);
    const ids = { statMatches: matches, statWins: wins, statGoals: goals, statPlayers: playersRows.length };
    Object.entries(ids).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  window.SBRenderers = {
    players, fixtures, results, news, gallery,
    homeFixture, homeResult, homeStats,
    renderPlayers: players,
    renderFixtures: fixtures,
    renderResults: results,
    renderNews: news,
    renderGallery: gallery
  };
})();
