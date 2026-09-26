/* Elite Ballers FC — admin shell */
(function () {
  const path = location.pathname.toLowerCase();
  const links = [
    ['dashboard.html','Dashboard','▣'],['players.html','Players','♟'],['fixtures.html','Fixtures','◷'],['results.html','Results','✓'],['dues.html','Dues','₦'],['news.html','News','◈'],['gallery.html','Gallery','▧'],['settings.html','Settings','⚙']
  ];
  const active = file => path.endsWith(file);
  function inject() {
    if (document.body.dataset.adminPublic === 'true' || document.querySelector('.eb-admin-shell')) return;
    document.body.classList.add('eb-admin-page');
    const app = document.querySelector('[data-admin-page]');
    if (!app) return;
    const current = document.body.dataset.page || 'dashboard.html';
    const sidebarLinks = links.map(([href,label,icon]) => `<a href="${href}" class="eb-admin-link ${active(href)?'active':''}"><span>${icon}</span><strong>${label}</strong></a>`).join('');
    const shell = document.createElement('div'); shell.className='eb-admin-shell';
    shell.innerHTML = `<aside class="eb-admin-sidebar"><a class="eb-admin-logo" href="../index.html"><span><img src="../assets/images/logo.png" alt="" width="40" height="40"></span><div><strong>ELITE BALLERS</strong><small>FC ADMIN</small></div></a><nav class="eb-admin-nav">${sidebarLinks}</nav><div class="eb-admin-side-footer"><a href="../index.html">↗ View website</a><button type="button" id="ebAdminLogout">⇥ Logout</button></div></aside><div class="eb-admin-main"><header class="eb-admin-header"><button class="eb-admin-menu" id="ebAdminMenu" aria-label="Open menu">☰</button><div><span class="eb-admin-kicker">CLUB MANAGEMENT</span><h1>${document.body.dataset.title || 'Dashboard'}</h1></div><div class="eb-admin-header-actions"><button class="eb-admin-icon" type="button" data-theme-toggle>☾</button><span class="eb-admin-avatar">A</span></div></header><nav class="eb-admin-mobile-nav" aria-label="Admin navigation">${links.slice(0,4).map(([href,label,icon])=>`<a href="${href}" class="${active(href)?'active':''}"><span>${icon}</span><small>${label}</small></a>`).join('')}<button type="button" id="ebAdminMore">☰<small>More</small></button></nav><div class="eb-admin-more" id="ebAdminMorePanel"><div class="eb-admin-more-grid">${links.slice(4).map(([href,label,icon])=>`<a href="${href}"><span>${icon}</span>${label}</a>`).join('')}</div><a href="../index.html">↗ View website</a><button type="button" id="ebAdminMoreLogout">⇥ Logout</button></div><main class="eb-admin-content"></main></div>`;
    // Move the real, already-wired-up nodes into the new shell instead of
    // re-parsing app.innerHTML as a string — a string round-trip would drop
    // every onclick/addEventListener the page's own script just attached.
    const main = shell.querySelector('.eb-admin-content');
    while (app.firstChild) main.appendChild(app.firstChild);
    app.replaceWith(shell);
    const menu = shell.querySelector('#ebAdminMenu'); const sidebar = shell.querySelector('.eb-admin-sidebar');
    menu.onclick = () => sidebar.classList.toggle('open');
    document.addEventListener('click', e => { if (!sidebar.contains(e.target) && e.target !== menu && innerWidth < 900) sidebar.classList.remove('open'); });
    shell.querySelectorAll('.eb-admin-link').forEach(a => a.onclick=()=>sidebar.classList.remove('open'));
    const moreBtn=shell.querySelector('#ebAdminMore'), morePanel=shell.querySelector('#ebAdminMorePanel'); moreBtn.onclick=()=>morePanel.classList.toggle('open');
    shell.querySelector('#ebAdminLogout').onclick = shell.querySelector('#ebAdminMoreLogout').onclick = async () => { try { await window.SB?.signOut(); } finally { location.href='../admin/login.html'; } };
    const theme=shell.querySelector('[data-theme-toggle]'); theme.onclick=()=>{const c=window.EBTheme.stored();window.EBTheme.apply(c==='system'?'dark':c==='dark'?'light':'system');};
    window.EBTheme?.apply(window.EBTheme.stored());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject, {once:true}); else inject();
})();
