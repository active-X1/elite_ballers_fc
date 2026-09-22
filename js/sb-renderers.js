// Supabase renderers — lightweight helpers to fetch and render site data
(function(){
  async function renderPlayers(containerSelector){
    const el = document.querySelector(containerSelector);
    if(!el || !window.SB) return;
    const { data, error } = await window.SB.fetchAll('players');
    if (error) { console.error('players fetch error', error); return; }
    if (!data || data.length === 0) {
      el.innerHTML = '<p class="muted">No players yet.</p>';
      return;
    }
    el.innerHTML = data.map(p=>{
      const img = p.image || 'assets/images/players/placeholder.png';
      const number = p.number || '';
      const position = p.position || '';
      const name = p.name || 'Player';
      return `
        <article class="player-card">
          <div class="player-image"><img src="${img}" alt="${name}"><span class="player-position">${position}</span></div>
          <div class="player-info"><span class="player-number">${number}</span><h3>${name}</h3><p>${position}</p></div>
        </article>`;
    }).join('\n');
  }

  async function renderFixtures(containerSelector, limit=5){
    const el = document.querySelector(containerSelector);
    if(!el || !window.SB) return;
    const { data, error } = await window.SB.fetchAll('fixtures');
    if (error) { console.error('fixtures fetch error', error); return; }
    if (!data || data.length === 0) { el.innerHTML = '<p class="muted">No fixtures yet.</p>'; return; }
    const items = data.slice(0, limit).map(f=>{
      const date = f.date ? new Date(f.date).toLocaleDateString() : '';
      return `
      <div class="fixture-item">
        <div class="fixture-meta"><strong>${f.opponent || 'Opponent'}</strong><span>${f.location||''}</span></div>
        <div class="fixture-time">${date} ${f.time||''}</div>
      </div>`;
    }).join('\n');
    el.innerHTML = items;
  }

  async function renderNews(containerSelector, limit=3){
    const el = document.querySelector(containerSelector);
    if(!el || !window.SB) return;
    const { data, error } = await window.SB.fetchAll('news');
    if (error) { console.error('news fetch error', error); return; }
    if (!data || data.length === 0) { el.innerHTML = '<p class="muted">No news yet.</p>'; return; }
    el.innerHTML = data.slice(0,limit).map(n=>{
      const img = n.image || '';
      const date = n.created_at ? new Date(n.created_at).toLocaleDateString() : '';
      return `
      <article class="news-card">
        <div class="news-image">${ img ? `<img src="${img}" alt="${n.title||''}">` : '<span>NEWS</span>' }</div>
        <div class="news-content"><span class="news-date">${date}</span><h3>${n.title||'Untitled'}</h3><p>${(n.body||'').slice(0,140)}</p><a href="news.html">Read More →</a></div>
      </article>`;
    }).join('\n');
  }

  async function renderGallery(containerSelector, limit=12){
    const el = document.querySelector(containerSelector);
    if(!el || !window.SB) return;
    const { data, error } = await window.SB.fetchAll('gallery');
    if (error) { console.error('gallery fetch error', error); return; }
    if (!data || data.length === 0) { el.innerHTML = '<p class="muted">No gallery items yet.</p>'; return; }
    el.innerHTML = data.slice(0,limit).map(g=>{
      const img = g.image || 'assets/images/gallery/placeholder.jpg';
      return `
      <figure class="gallery-item"><img src="${img}" alt="${g.title||''}"><figcaption>${g.title||''}</figcaption></figure>`;
    }).join('\n');
  }

  async function renderResults(containerSelector, limit=6){
    const el = document.querySelector(containerSelector);
    if(!el || !window.SB) return;
    const { data, error } = await window.SB.fetchAll('results');
    if (error) { console.error('results fetch error', error); return; }
    if (!data || data.length === 0) { el.innerHTML = '<p class="muted">No results yet.</p>'; return; }
    el.innerHTML = data.slice(0,limit).map(r=>{
      const date = r.date ? new Date(r.date).toLocaleDateString() : '';
      return `
      <div class="result-row"><div class="result-meta"><strong>${r.opponent||'Opponent'}</strong><span>${date}</span></div><div class="score">${r.for_goals||0} - ${r.against_goals||0}</div></div>`;
    }).join('\n');
  }

  window.SBRenderers = { renderPlayers, renderFixtures, renderNews, renderGallery, renderResults };
})();
