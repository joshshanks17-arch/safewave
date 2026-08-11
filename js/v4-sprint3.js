
// SafeWave 4.0 Sprint 3 — album metadata/presentation enhancement.
// Playback, queue, shuffle and track routing remain owned by script.js.
(() => {
  function prettyGenre(value){
    return value || "Original";
  }

  async function enhanceAlbum(){
    if(!location.hash.startsWith("#album")) return;
    const params = new URLSearchParams((location.hash.split("?")[1] || ""));
    const albumId = params.get("id");
    if(!albumId) return;

    // Catalog may still be loading on a fresh route.
    if(window.SafeWaveCatalog?.load) {
      try { await window.SafeWaveCatalog.load(); } catch {}
    }
    const album = window.SafeWaveCatalog?.getAlbum?.(albumId);
    if(!album) return;

    const count = album.tracks?.length || 0;
    const primaryGenre = album.genres?.[0] || "Original";

    const countEl = document.querySelector("#v4AlbumTrackCount");
    const yearEl = document.querySelector("#v4AlbumYear");
    const genreEl = document.querySelector("#v4AlbumPrimaryGenre");
    const labelEl = document.querySelector("#v4AlbumTrackLabel");

    if(countEl) countEl.textContent = count;
    if(yearEl) yearEl.textContent = album.year || "—";
    if(genreEl) genreEl.textContent = prettyGenre(primaryGenre);
    if(labelEl) labelEl.textContent = `${count} track${count === 1 ? "" : "s"}`;

    // Use the album art itself to create a subtle page atmosphere.
    const art = document.querySelector("#albumDetailCover");
    const glow = document.querySelector(".v4-album-art-glow");
    if(art && glow && album.cover) {
      glow.style.backgroundImage = `url("${album.cover}")`;
      glow.style.backgroundSize = "cover";
      glow.style.backgroundPosition = "center";
    }
  }

  window.addEventListener("hashchange", () => setTimeout(enhanceAlbum, 60));
  document.addEventListener("DOMContentLoaded", () => setTimeout(enhanceAlbum, 120));
  setTimeout(enhanceAlbum, 160);
})();
