
// SafeWave v4.1 Launch Candidate — non-invasive production UX.
(() => {
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";

  if (main && !document.querySelector(".v41-skip")) {
    const skip = document.createElement("a");
    skip.className = "v41-skip";
    skip.href = "#main-content";
    skip.textContent = "Skip to content";
    document.body.prepend(skip);
  }

  // Close mobile menu after selecting an internal route.
  document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => document.querySelector("#mobileMenu")?.classList.remove("open"));
  });

  // Give images a safe default where explicit alt text was omitted.
  document.querySelectorAll("img:not([alt])").forEach(img => img.setAttribute("alt", ""));

  // Lightweight connection state; no analytics or network tracking.
  const notice = document.createElement("div");
  notice.className = "v41-offline";
  notice.setAttribute("role", "status");
  notice.textContent = "You’re offline. Already-loaded music may keep playing.";
  document.body.appendChild(notice);
  const syncNetwork = () => notice.classList.toggle("show", !navigator.onLine);
  addEventListener("online", syncNetwork);
  addEventListener("offline", syncNetwork);
  syncNetwork();
})();
