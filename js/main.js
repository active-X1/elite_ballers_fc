// =========================================================
// ELITE BALLERS FC
// Main JavaScript
// =========================================================


// =========================
// MOBILE NAVIGATION
// Robust menu toggle that works across pages
// =========================

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const expanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', String(expanded));
    });

    // Close nav when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth <= 768) {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

}


// =========================
// CLOSE MOBILE MENU
// WHEN A LINK IS CLICKED
// =========================

const navigationLinks = document.querySelectorAll(".nav-links a");

navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (navLinks) navLinks.classList.remove("active");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    });
});


// =========================
// REVEAL ANIMATIONS
// =========================

const revealItems = document.querySelectorAll('.section-heading, .match-card, .result-card, .stat-card, .news-card, .club-cta, .footer-content, .intro-content');

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 }) : null;

revealItems.forEach((item) => {
    item.classList.add('reveal');
    if (revealObserver) revealObserver.observe(item); else item.classList.add('visible');
});


// =========================
// CURRENT YEAR
// =========================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

