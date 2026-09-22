// Floating AI helper — uses Supabase data via window.SB
(function(){
  const presets = [
    'Who are our top scorers?',
    'List all players',
    'When is our next match?',
    'Show upcoming fixtures',
    'Latest news',
    'Who is the captain?',
    'List defenders',
    'List midfielders',
    'List forwards',
    'How many players do we have?',
    'Recent match results',
    'What are the club values?',
    'Where do we train?',
    'How to contact the club?',
    'Show gallery highlights',
    'Who scored in the last match?',
    'Team formation suggestions',
    'Club history summary',
    'How much are weekly dues?',
    'How to join the team?'
  ];

  // Create UI
  const wrapper = document.createElement('div');
  wrapper.id = 'aiWrapper';
  wrapper.innerHTML = `
    <style>
      #aiWrapper{position:fixed;right:18px;bottom:18px;z-index:2000}
      #aiButton{width:64px;height:64px;border-radius:999px;background:linear-gradient(135deg,var(--primary),#e6ff7d);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-glow);cursor:pointer;border:none}
      #aiPanel{position:fixed;right:18px;bottom:92px;width:360px;max-width:92vw;background:linear-gradient(180deg,rgba(8,8,8,0.98),#070809);border:1px solid var(--border);border-radius:12px;padding:12px;display:none;box-shadow:var(--shadow-soft)}
      #aiPanel h4{margin:0 0 8px}
      #aiPresets{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .aiPreset{background:rgba(255,255,255,0.02);padding:8px;border-radius:8px;font-size:0.85rem;cursor:pointer}
      #aiOutput{margin-top:10px;color:var(--text-muted);max-height:240px;overflow:auto}
    </style>
    <div id="aiPanel"><h4>Ask about Elite Ballers</h4><div id="aiPresets"></div><div id="aiOutput"></div></div>
    <button id="aiButton" title="Ask the AI">AI</button>
  `;
  document.body.appendChild(wrapper);

  const aiButton = document.getElementById('aiButton');
  const aiPanel = document.getElementById('aiPanel');
  const aiPresets = document.getElementById('aiPresets');
  const aiOutput = document.getElementById('aiOutput');

  presets.forEach(p => {
    const el = document.createElement('div'); el.className='aiPreset'; el.textContent=p; el.addEventListener('click', ()=>handleQuery(p)); aiPresets.appendChild(el);
  });

  aiButton.addEventListener('click', ()=>{ aiPanel.style.display = aiPanel.style.display === 'block' ? 'none' : 'block'; });

  async function handleQuery(q){
    aiOutput.textContent = 'Thinking...';
    try{
      if (!window.SB) { aiOutput.textContent = 'Supabase not loaded'; return; }
      if (/list all players/i.test(q)){
        const { data } = await window.SB.fetchAll('players');
        aiOutput.innerHTML = (data || []).slice(0,30).map(p=>`<div><strong>${p.name}</strong> — #${p.number} • ${p.position||'—'}</div>`).join('') || 'No players found';
        return;
      }
      if (/next match|upcoming fixture|when is our next match/i.test(q)){
        const { data } = await window.SB.fetchAll('fixtures');
        const next = (data||[])[0];
        aiOutput.innerHTML = next ? `<div><strong>${next.date} ${next.time}</strong> — ${next.opponent} @ ${next.location||'TBD'}</div>` : 'No upcoming matches';
        return;
      }
      if (/latest news|news/i.test(q)){
        const { data } = await window.SB.fetchAll('news');
        aiOutput.innerHTML = (data||[]).slice(0,5).map(n=>`<div><strong>${n.title}</strong><div style="color:var(--text-muted)">${n.body}</div></div>`).join('') || 'No news yet';
        return;
      }
      if (/top scorers|who scored/i.test(q)){
        // simplistic: return players list (scorer tracking not implemented)
        const { data } = await window.SB.fetchAll('players');
        aiOutput.innerHTML = (data||[]).slice(0,5).map(p=>`<div>${p.name} — #${p.number}</div>`).join('') || 'No data';
        return;
      }
      // Fallback
      aiOutput.textContent = 'Sorry — I can show players, fixtures, news and dues. Try one of the presets.';
    }catch(err){ console.error(err); aiOutput.textContent='Error fetching data'; }
  }

})();
