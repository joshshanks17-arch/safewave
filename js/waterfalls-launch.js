// SafeWave Aurora 5.0 — Waterfalls Integration
document.addEventListener("DOMContentLoaded", async () => {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  if (window.SafeWaveCatalog?.load) {
    try { await window.SafeWaveCatalog.load(); } catch (error) { console.warn(error); }
  }

  await sleep(50);

  const catalog = window.SafeWaveCatalog || {};
  const album = (catalog.albums || []).find(item => item.id === "waterfalls");
  const tracks = (catalog.tracks || []).filter(item => item.album === "waterfalls");

  const oldSpotlight = document.querySelector(".featured-spotlight");
  const hero = document.querySelector(".hero, .aurora-home-hero");

  let spotlight = oldSpotlight;
  if (!spotlight && hero) {
    spotlight = document.createElement("section");
    hero.insertAdjacentElement("afterend", spotlight);
  }
  if (!spotlight) return;

  spotlight.className = "featured-spotlight waterfalls-spotlight";
  spotlight.innerHTML = `
    <div class="waterfalls-copy">
      <span class="featured-pill">FEATURED RELEASE</span>
      <p class="waterfalls-artist">JOSHUA SHANKS</p>
      <h2>Waterfalls</h2>
      <p class="waterfalls-description">${album?.description || "Peaceful piano and ambient soundscapes for creators, study sessions, relaxation, and reflective storytelling."}</p>
      <div class="waterfalls-meta">
        <span>${tracks.length || 8} tracks</span>
        <span>Ambient Piano</span>
        <span>WAV</span>
      </div>
      <div class="waterfalls-actions">
        <button type="button" class="waterfalls-play">▶ Play album</button>
        <button type="button" class="waterfalls-view">View album</button>
      </div>
      <ol class="waterfalls-preview">
        ${tracks.slice(0, 4).map((track, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${track.title}</strong><small>${track.duration}</small></li>`).join("")}
      </ol>
    </div>
    <div class="waterfalls-art-wrap">
      <img src="assets/covers/waterfalls.png" alt="Waterfalls by Joshua Shanks">
      <div class="waterfalls-art-glow"></div>
    </div>
  `;

  const firstTrack = tracks[0];
  spotlight.querySelector(".waterfalls-play")?.addEventListener("click", () => {
    if (!firstTrack) return;

    // Prefer the existing catalog/album controls.
    const knownTarget =
      document.querySelector('[data-album="waterfalls"]') ||
      document.querySelector('[data-album-id="waterfalls"]') ||
      document.querySelector(`[data-track-id="${firstTrack.id}"]`);

    if (knownTarget) {
      knownTarget.click();
      return;
    }

    // Fallback to the existing audio player.
    const audio = document.querySelector("#audio");
    if (!audio) return;
    audio.src = firstTrack.src;
    const title = document.querySelector("#playerTitle");
    const artist = document.querySelector("#playerArtist");
    const cover = document.querySelector("#playerCover");
    if (title) title.textContent = firstTrack.title;
    if (artist) artist.textContent = "Joshua Shanks";
    if (cover) cover.style.backgroundImage = `url("${firstTrack.cover}")`;
    audio.play().catch(() => {});
  });

  spotlight.querySelector(".waterfalls-view")?.addEventListener("click", () => {
    const possibleRoutes = ["#album/waterfalls", "#albums/waterfalls", "#album-waterfalls", "#albums"];
    const albumCard =
      document.querySelector('[data-album="waterfalls"]') ||
      document.querySelector('[data-album-id="waterfalls"]');

    if (albumCard) {
      albumCard.click();
    } else {
      location.hash = possibleRoutes[0];
    }
  });

  document.documentElement.classList.add("waterfalls-featured");
});
