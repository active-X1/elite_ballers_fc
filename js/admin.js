// Admin interactions (menu toggle, logout)
const adminMenuButton = document.getElementById('adminMenuButton');
const adminSidebar = document.getElementById('adminSidebar');
const logoutButton = document.getElementById('logoutButton');

if (adminMenuButton && adminSidebar) {
  adminMenuButton.addEventListener('click', () => {
    adminSidebar.classList.toggle('is-open');
  });

  document.addEventListener('click', (event) => {
    const clickedInsideSidebar = adminSidebar.contains(event.target);
    const clickedMenuButton = adminMenuButton.contains(event.target);
    if (!clickedInsideSidebar && !clickedMenuButton && window.innerWidth <= 900) {
      adminSidebar.classList.remove('is-open');
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    if (window.SB && window.SB.client) await window.SB.client.auth.signOut();
    window.location.href = 'login.html';
  });
}

// Close sidebar on navigation click (progressive enhancement)
document.querySelectorAll('.admin-nav-link').forEach(link => link.addEventListener('click', ()=>{
  if (adminSidebar) adminSidebar.classList.remove('is-open');
}));

// Top icon bar: highlight active and support keyboard focus
document.addEventListener('DOMContentLoaded', () => {
  const topIcons = document.querySelectorAll('.admin-top-icons a');
  if (!topIcons) return;
  topIcons.forEach(icon => {
    // mark active by href matching current path
    try {
      const href = icon.getAttribute('href');
      if (href && location.pathname.endsWith(href)) icon.classList.add('active');
    } catch (e) {}
    icon.addEventListener('click', () => {
      topIcons.forEach(i => i.classList.remove('active'));
      icon.classList.add('active');
      // close sidebar on mobile
      if (window.innerWidth <= 900 && adminSidebar) adminSidebar.classList.remove('is-open');
    });
  });
});

