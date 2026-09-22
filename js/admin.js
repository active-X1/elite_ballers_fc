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
    logoutButton.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

