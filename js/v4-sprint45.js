
// SafeWave 4.0 Sprint 4/5 — Player + Mobile UX enhancement.
// This file does not load tracks or alter queue/audio logic.
(() => {
  const player = document.querySelector("#player");
  const full = document.querySelector("#fullscreenPlayer");
  const expand = document.querySelector("#expandPlayer");
  const cover = document.querySelector("#playerCover");
  if (!player) return;

  // Make the compact mobile track area an obvious route to Now Playing.
  function openNowPlayingFromTrack(event) {
    if (window.innerWidth > 760) return;
    if (event.target.closest("button")) return;
    expand?.click();
  }
  document.querySelector(".v4-playing-track")?.addEventListener("click", openNowPlayingFromTrack);

  // Escape closes Now Playing on keyboard-capable devices.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && full?.classList.contains("open")) {
      document.querySelector("#fullscreenClose")?.click();
    }
  });

  // Keep ARIA state useful without replacing existing button handlers.
  const audio = document.querySelector("#audio");
  const play = document.querySelector("#playBtn");
  const fullPlay = document.querySelector("#fullPlay");
  function syncLabels() {
    const paused = audio?.paused !== false;
    play?.setAttribute("aria-label", paused ? "Play" : "Pause");
    fullPlay?.setAttribute("aria-label", paused ? "Play" : "Pause");
    player.classList.toggle("v4-is-playing", !paused);
  }
  audio?.addEventListener("play", syncLabels);
  audio?.addEventListener("pause", syncLabels);
  audio?.addEventListener("ended", syncLabels);
  syncLabels();

  // On orientation changes, allow layout to settle before browser paints controls.
  window.addEventListener("orientationchange", () => {
    document.documentElement.classList.add("v4-orienting");
    setTimeout(() => document.documentElement.classList.remove("v4-orienting"), 250);
  });
})();
