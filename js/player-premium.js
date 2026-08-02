// SafeWave Aurora 4.2 — Premium Player Add-on
// Loads after script.js and enhances the existing player without replacing it.

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const audio = $("#audio");
  const player = $("#player");

  if (!audio || !player) {
    console.warn("Aurora Premium Player: existing SafeWave player was not found.");
    return;
  }

  const playButton = $("#playBtn");
  const volume = $("#volume");
  const volumeButton = $("#volumeBtn");
  const title = $("#playerTitle");
  const artist = $("#playerArtist");
  const cover = $("#playerCover");
  const currentTime = $("#currentTime");
  const duration = $("#duration");
  const fullCurrent = $("#fullCurrent");
  const fullDuration = $("#fullDuration");

  let lastVolume = Number(localStorage.getItem("swLastAudibleVolume") || audio.volume || 0.75);
  let showRemaining = localStorage.getItem("swShowRemaining") === "true";

  // Add premium metadata area without changing index.html.
  const trackInfo = $(".playing-track > div:nth-child(2)");
  if (trackInfo && !$("#premiumTrackMeta")) {
    const meta = document.createElement("span");
    meta.id = "premiumTrackMeta";
    meta.className = "premium-track-meta";
    meta.textContent = "READY TO PLAY";
    trackInfo.appendChild(meta);
  }

  // Add a compact keyboard-help control.
  const playerTools = $(".player-tools");
  if (playerTools && !$("#playerHelp")) {
    const help = document.createElement("button");
    help.id = "playerHelp";
    help.className = "player-help";
    help.type = "button";
    help.setAttribute("aria-label", "Show player keyboard shortcuts");
    help.textContent = "?";
    playerTools.appendChild(help);
  }

  // Add a remaining-time toggle by making the duration clickable.
  if (duration) {
    duration.classList.add("time-toggle");
    duration.title = "Tap to switch between duration and remaining time";
  }
  if (fullDuration) {
    fullDuration.classList.add("time-toggle");
    fullDuration.title = "Tap to switch between duration and remaining time";
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function updateTimeDisplay() {
    const elapsed = audio.currentTime || 0;
    const total = audio.duration || 0;
    const secondary = showRemaining && total
      ? `-${formatTime(Math.max(0, total - elapsed))}`
      : formatTime(total);

    if (currentTime) currentTime.textContent = formatTime(elapsed);
    if (fullCurrent) fullCurrent.textContent = formatTime(elapsed);
    if (duration) duration.textContent = secondary;
    if (fullDuration) fullDuration.textContent = secondary;
  }

  function toggleRemainingTime() {
    showRemaining = !showRemaining;
    localStorage.setItem("swShowRemaining", String(showRemaining));
    updateTimeDisplay();
  }

  duration?.addEventListener("click", toggleRemainingTime);
  fullDuration?.addEventListener("click", toggleRemainingTime);

  function updateLoadingState() {
    const loading = audio.readyState < 3 && !audio.paused;
    player.classList.toggle("is-loading", loading);
  }

  function updatePlaybackState() {
    player.classList.toggle("is-playing", !audio.paused);
    player.classList.toggle("is-paused", audio.paused);
    updateLoadingState();

    const meta = $("#premiumTrackMeta");
    if (meta) {
      if (!audio.src) meta.textContent = "READY TO PLAY";
      else if (audio.error) meta.textContent = "PLAYBACK ERROR";
      else if (audio.readyState < 3 && !audio.paused) meta.textContent = "BUFFERING";
      else meta.textContent = audio.paused ? "PAUSED" : "NOW PLAYING";
    }
  }

  function updateMuteButton() {
    if (!volumeButton) return;
    const muted = audio.muted || audio.volume === 0;
    volumeButton.textContent = muted ? "×" : audio.volume < 0.45 ? "◔" : "◖";
    volumeButton.classList.toggle("muted", muted);
    volumeButton.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  }

  volumeButton?.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = Math.max(lastVolume, 0.15);
      if (volume) volume.value = String(audio.volume);
    } else {
      lastVolume = audio.volume;
      localStorage.setItem("swLastAudibleVolume", String(lastVolume));
      audio.muted = true;
    }
    updateMuteButton();
  });

  volume?.addEventListener("input", () => {
    audio.muted = false;
    const value = Number(volume.value);
    if (value > 0) {
      lastVolume = value;
      localStorage.setItem("swLastAudibleVolume", String(lastVolume));
    }
    updateMuteButton();
  });

  // Make artwork clickable to open full-screen Now Playing.
  cover?.addEventListener("click", () => $("#expandPlayer")?.click());
  cover?.setAttribute("role", "button");
  cover?.setAttribute("tabindex", "0");
  cover?.setAttribute("aria-label", "Open full-screen player");
  cover?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      $("#expandPlayer")?.click();
    }
  });

  // Desktop keyboard controls.
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.code === "Space") {
      event.preventDefault();
      playButton?.click();
    } else if (event.code === "ArrowRight") {
      event.preventDefault();
      audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10);
    } else if (event.code === "ArrowLeft") {
      event.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    } else if (event.key.toLowerCase() === "m") {
      volumeButton?.click();
    } else if (event.key.toLowerCase() === "f") {
      $("#expandPlayer")?.click();
    }
  });

  $("#playerHelp")?.addEventListener("click", () => {
    const existing = $("#playerShortcutPanel");
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement("div");
    panel.id = "playerShortcutPanel";
    panel.className = "player-shortcut-panel";
    panel.innerHTML = `
      <strong>Player shortcuts</strong>
      <span><kbd>Space</kbd> Play / pause</span>
      <span><kbd>←</kbd><kbd>→</kbd> Seek 10 seconds</span>
      <span><kbd>M</kbd> Mute</span>
      <span><kbd>F</kbd> Full-screen player</span>
    `;
    player.appendChild(panel);

    window.setTimeout(() => {
      document.addEventListener("click", function dismiss(event) {
        if (!panel.contains(event.target) && event.target?.id !== "playerHelp") {
          panel.remove();
          document.removeEventListener("click", dismiss);
        }
      });
    }, 0);
  });

  // Better resilience and visible states.
  ["play", "pause", "waiting", "playing", "canplay", "loadedmetadata", "error"]
    .forEach((name) => audio.addEventListener(name, updatePlaybackState));

  audio.addEventListener("timeupdate", updateTimeDisplay);
  audio.addEventListener("durationchange", updateTimeDisplay);

  // Keep document title useful during playback.
  audio.addEventListener("play", () => {
    const trackTitle = title?.textContent?.trim();
    const trackArtist = artist?.textContent?.trim();
    if (trackTitle) document.title = `${trackTitle}${trackArtist ? ` — ${trackArtist}` : ""} | SafeWave`;
  });
  audio.addEventListener("pause", () => {
    document.title = "SafeWave — Music for Creators";
  });

  updateMuteButton();
  updatePlaybackState();
  updateTimeDisplay();
})();
