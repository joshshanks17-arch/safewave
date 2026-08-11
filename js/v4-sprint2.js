
// SafeWave 4.0 Sprint 2 — Browse & Discovery.
// This module only filters/sorts catalog DOM. It never changes audio or player state.
(() => {
  const grid = document.querySelector("#v4DiscoveryGrid");
  if (!grid) return;

  const cards = [...grid.querySelectorAll(".v4-discovery-card")];
  const search = document.querySelector("#trackSearch");
  const count = document.querySelector("#resultCount");
  const empty = document.querySelector("#v4NoResults");
  const sort = document.querySelector("#catalogSort");
  const genreButtons = [...document.querySelectorAll(".v4-filter-scroll .filter")];
  const moodButtons = [...document.querySelectorAll(".v4-mood")];
  const reset = document.querySelector("#v4ResetDiscovery");
  let genre = "all";
  let mood = "all";

  function words(value){
    return String(value || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  }
  function apply(){
    const q = words(search?.value);
    let visible = 0;
    cards.forEach(card => {
      const haystack = card.dataset.name || "";
      const matchesQuery = q.every(word => haystack.includes(word));
      const matchesGenre = genre === "all" || card.dataset.genre === genre;
      const matchesMood = mood === "all" || card.dataset.mood === mood;
      const show = matchesQuery && matchesGenre && matchesMood;
      card.style.display = show ? "block" : "none";
      if (show) visible++;
    });
    if (count) count.textContent = `${visible} track${visible === 1 ? "" : "s"}`;
    if (empty) empty.hidden = visible !== 0;
  }
  function setGenre(value){
    genre = value;
    genreButtons.forEach(b => b.classList.toggle("active", b.dataset.filter === genre));
    apply();
  }
  function setMood(value){
    mood = value;
    moodButtons.forEach(b => b.classList.toggle("active", b.dataset.mood === mood));
    apply();
  }
  function sortCards(){
    const mode = sort?.value || "recommended";
    const ordered = [...cards];
    if(mode === "title") ordered.sort((a,b)=>a.dataset.title.localeCompare(b.dataset.title));
    if(mode === "bpm-high") ordered.sort((a,b)=>Number(b.dataset.bpm)-Number(a.dataset.bpm));
    if(mode === "bpm-low") ordered.sort((a,b)=>Number(a.dataset.bpm)-Number(b.dataset.bpm));
    ordered.forEach(card => grid.appendChild(card));
  }

  search?.addEventListener("input", apply);
  genreButtons.forEach(b => b.addEventListener("click", () => setGenre(b.dataset.filter)));
  moodButtons.forEach(b => b.addEventListener("click", () => setMood(b.dataset.mood)));
  sort?.addEventListener("change", sortCards);
  reset?.addEventListener("click", () => {
    if(search) search.value = "";
    setMood("all"); setGenre("all");
  });

  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      location.hash = "#discover";
      setTimeout(() => search?.focus(), 50);
    }
  });

  // Honor home-page genre links while preserving the existing router.
  window.addEventListener("hashchange", () => {
    if (!location.hash.startsWith("#discover")) return;
    const query = location.hash.split("?")[1] || "";
    const requested = new URLSearchParams(query).get("genre");
    if (requested && genreButtons.some(b => b.dataset.filter === requested)) setGenre(requested);
  });

  apply();
})();
