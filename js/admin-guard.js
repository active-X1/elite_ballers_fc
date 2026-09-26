/*
 * Elite Ballers FC — shared admin guard.
 */
(async function () {
  if (document.body?.dataset?.adminPublic === "true") return;
  document.documentElement.classList.add("eb-admin-checking");
  window.EBAdminReady = (async () => {
    if (!window.SB) {
      location.href = `login.html?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`;
      return false;
    }
    const ok = await SB.requireAdmin("login.html");
    if (!ok) return false;
    document.documentElement.classList.remove("eb-admin-checking");
    document.documentElement.classList.add("eb-admin-authorized");
    return true;
  })();
})();
