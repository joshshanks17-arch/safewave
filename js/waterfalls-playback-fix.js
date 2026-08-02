// SafeWave Aurora 5.0.1 — Waterfalls Playback Fix
// Prevents Waterfalls track rows from triggering the old six-demo index handlers.

(() => {
  "use strict";

  const WATERFALLS = {
    "streets": "streets",
    "for a moment": "for-a-moment",
    "take a chance": "take-a-chance",
    "baby steps": "baby-steps",
    "starry skies": "starry-skies",
    "promises": "promises",
    "lost": "lost",
    "waterfalls": "waterfalls"
  };

  const normalize = value =>
    String(value || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  async function ensureCatalog() {
    if (window.SafeWaveCatalog?.tracks?.length) return window.SafeWaveCatalog;

    if (window.SafeWaveCatalog?.load) {
      try {
        await window.SafeWaveCatalog.load();
      } catch (error) {
        console.warn("Waterfalls playback fix: catalog load failed.", error);
      }
    }

    return window.SafeWaveCatalog || { tracks: [], artists: [] };
  }

  function findTrackId(target) {
    const container = target.closest(
      '[data-track-id], [data-track], [data-track-row], .album-track, .album-track-row, .track-row, .premium-track, li, button'
    );

    if (!container) return null;

    const explicit =
      container.dataset.trackId ||
      container.dataset.trackSlug ||
      target.dataset?.trackId ||
      target.dataset?.trackSlug;

    if (explicit && Object.values(WATERFALLS).includes(explicit)) {
      return explicit;
    }

    const text = normalize(container.textContent);
    for (const [title, id] of Object.entries(WATERFALLS)) {
      if (text === title || text.startsWith(`${title} `) || text.includes(` ${title} `)) {
        return id;
      }
    }

    return null;
  }

  function setImage(element, path) {
    if (!element) return;

    if (element.tagName === "IMG") {
      element.src = path;
    } else {
      element.style.backgroundImage = `url("${path}")`;
    }
  }

  function updatePlayer(track) {
    const audio = document.querySelector("#audio");
    if (!audio) {
      console.warn("Waterfalls playback fix: #audio was not found.");
      return;
    }

    const artist =
      (window.SafeWaveCatalog?.artists || []).find(item => item.id === track.artist)?.name ||
      "Joshua Shanks";

    audio.src = track.src;
    audio.dataset.trackId = track.id;

    const titleElements = [
      document.querySelector("#playerTitle"),
      document.querySelector("#fullTitle"),
      document.querySelector("[data-now-playing-title]")
    ].filter(Boolean);

    const artistElements = [
      document.querySelector("#playerArtist"),
      document.querySelector("#fullArtist"),
      document.querySelector("[data-now-playing-artist]")
    ].filter(Boolean);

    titleElements.forEach(element => {
      element.textContent = track.title;
    });

    artistElements.forEach(element => {
      element.textContent = artist;
    });

    [
      document.querySelector("#playerCover"),
      document.querySelector("#fullCover"),
      document.querySelector("[data-now-playing-cover]")
    ].filter(Boolean).forEach(element => setImage(element, track.cover));

    const player = document.querySelector("#player");
    player?.classList.add("visible", "active");
    player?.setAttribute("data-current-track", track.id);

    audio.play().catch(error => {
      console.warn("Waterfalls playback could not begin automatically.", error);
    });
  }

  async function playWaterfallsTrack(trackId) {
    const catalog = await ensureCatalog();
    const track = (catalog.tracks || []).find(
      item => item.id === trackId && item.album === "waterfalls"
    );

    if (!track) {
      console.warn(`Waterfalls playback fix: ${trackId} was not found in tracks.json.`);
      return;
    }

    updatePlayer(track);
  }

  // Capture phase is intentional: it stops old numeric demo handlers first.
  document.addEventListener(
    "click",
    event => {
      const trackId = findTrackId(event.target);
      if (!trackId) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      playWaterfallsTrack(trackId);
    },
    true
  );

  // Repair Waterfalls artwork references if an older renderer created a broken image.
  function repairArtwork() {
    document.querySelectorAll('img').forEach(img => {
      const context = normalize(
        `${img.alt || ""} ${img.closest("article, section, div")?.textContent || ""}`
      );

      if (context.includes("waterfalls") && !img.src.endsWith("/assets/covers/waterfalls.png")) {
        img.src = "assets/covers/waterfalls.png";
      }
    });
  }

  const observer = new MutationObserver(repairArtwork);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("DOMContentLoaded", repairArtwork);
  repairArtwork();
})();
