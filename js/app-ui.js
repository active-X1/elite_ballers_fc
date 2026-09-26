/* Elite Ballers FC — polished public app shell */
(function () {
  const path = location.pathname.toLowerCase();
  const routes = [
    { key:'home', label:'Home', icon:'⌂', url:'index.html', match:/\/(?:index\.html)?$/ },
    { key:'team', label:'Team', icon:'⚽', url:'team.html', match:/team\.html$/ },
    { key:'fixtures', label:'Fixtures', icon:'◷', url:'fixtures.html', match:/fixtures\.html$/ },
    { key:'results', label:'Results', icon:'✓', url:'results.html', match:/results\.html$/ },
    { key:'more', label:'More', icon:'☰', url:'#' }
  ];
  const more = [
    ['News','📰','news.html'],['Gallery','▧','gallery.html'],['About','ⓘ','about.html'],['Contact','☎','contact.html'],['Admin Login','🔐','admin/login.html']
  ];
  const active = r => r.key === 'home' ? (path.endsWith('/') || path.endsWith('/index.html')) : !!r.match && r.match.test(path);

  function inject() {
    if (document.body.classList.contains('eb-no-app-shell') || document.querySelector('.eb-topbar')) return;
    document.body.classList.add('eb-app');
    const top = document.createElement('header');
    top.className = 'eb-topbar';
    top.innerHTML = `<a class="eb-brand" href="index.html" aria-label="Elite Ballers FC home"><span class="eb-brand-badge"><img src="assets/images/logo.png" alt="" width="34" height="34"></span><span class="eb-brand-name">Elite Ballers FC</span></a><div class="eb-top-actions"><button class="eb-icon-btn" type="button" data-theme-toggle>☾</button><button class="eb-install-btn" type="button" id="ebInstallBtn" hidden>Install</button></div>`;
    const nav = document.createElement('nav');
    nav.className = 'eb-bottom-nav'; nav.setAttribute('aria-label','Primary navigation');
    routes.forEach(r => {
      const b = document.createElement('button');
      b.className = 'eb-nav-btn' + (active(r) ? ' active' : ''); b.type='button';
      b.innerHTML = `<span class="eb-nav-icon">${r.icon}</span><span>${r.label}</span>`;
      b.onclick = () => r.key === 'more' ? document.getElementById('ebMoreSheet')?.classList.toggle('open') : (location.href = r.url);
      nav.appendChild(b);
    });
    const sheet = document.createElement('aside');
    sheet.className = 'eb-more-sheet'; sheet.id = 'ebMoreSheet'; sheet.setAttribute('aria-label','More options');
    sheet.innerHTML = `<div class="eb-more-head"><div><span class="eb-eyebrow">CLUB HUB</span><strong>More</strong></div><button type="button" class="eb-close-more" aria-label="Close">×</button></div><div class="eb-more-grid">${more.map(([l,i,u]) => `<a class="eb-more-item" href="${u}"><span>${i}</span>${l}</a>`).join('')}</div><div class="eb-theme-box"><div><strong>Appearance</strong><small>Choose how the app looks</small></div><div class="eb-theme-options"><button type="button" data-theme-choice="system">System</button><button type="button" data-theme-choice="light">Light</button><button type="button" data-theme-choice="dark">Dark</button></div></div>`;
    document.body.prepend(top); document.body.appendChild(sheet); document.body.appendChild(nav);

    const themeButton = top.querySelector('[data-theme-toggle]');
    themeButton.onclick = () => {
      const current = window.EBTheme?.stored?.() || 'system';
      const next = current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system';
      window.EBTheme?.apply(next);
    };
    sheet.querySelector('.eb-close-more').onclick = () => sheet.classList.remove('open');
    sheet.querySelectorAll('[data-theme-choice]').forEach(btn => btn.onclick = () => window.EBTheme?.apply(btn.dataset.themeChoice));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') sheet.classList.remove('open'); });
    document.addEventListener('click', e => { if (!sheet.contains(e.target) && !nav.contains(e.target) && !e.target.closest('[data-theme-toggle]')) sheet.classList.remove('open'); });

    let deferredInstall;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; const btn=document.getElementById('ebInstallBtn'); if(btn) btn.hidden=false; });
    window.addEventListener('appinstalled', () => { deferredInstall=null; const btn=document.getElementById('ebInstallBtn'); if(btn) btn.hidden=true; });
    document.getElementById('ebInstallBtn').onclick = async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall=null; document.getElementById('ebInstallBtn').hidden=true; };
    window.EBTheme?.apply(window.EBTheme.stored());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject, {once:true}); else inject();
})();
