// =========================================================
// ELITE BALLERS FC
// Main JavaScript
// =========================================================


// =========================
// MOBILE NAVIGATION
// =========================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });

}


// =========================
// CLOSE MOBILE MENU
// WHEN A LINK IS CLICKED
// =========================

const navigationLinks = document.querySelectorAll(".nav-links a");

navigationLinks.forEach((link) => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

    });

});


// =========================
// CURRENT YEAR
// =========================

const currentYear = document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}
