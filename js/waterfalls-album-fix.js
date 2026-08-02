// SafeWave Aurora 5.0.4 — Waterfalls Album Fix
// Load this AFTER script.js and all existing Aurora scripts.

(() => {
  "use strict";

  function artistName(artistId) {
    return (
      window.SafeWaveCatalog?.getArtist?.(artistId)?.name ||
      artistId ||
      "SafeWave"
    );
  }

  function ensureTrackIndex(trackId) {
    const catalogTrack = window.SafeWaveCatalog?.getTrack?.(trackId);

    if (!catalogTrack || !catalogTrack.src || !Array.isArray(window.tracks || tracks)) {
      return -1;
    }

    const list = window.tracks || tracks;

    let index = list.findIndex(track =>
      track.id === catalogTrack.id ||
      track.src === catalogTrack.src
    );

    if (index >= 0) return index;

    list.push({
      ...catalogTrack,
      id: catalogTrack.id,
      artistId: catalogTrack.artist,
      artist: artistName(catalogTrack.artist),
      tags: Array.isArray(catalogTrack.tags) ? catalogTrack.tags : [],
      description: catalogTrack.description || ""
    });

    return list.length - 1;
  }

  function playAlbum(album, doShuffle = false) {
    let indices = (album?.tracks || [])
      .map(trackId => ensureTrackIndex(trackId))
      .filter(index => index >= 0);

    if (doShuffle) {
      indices = indices.sort(() => Math.random() - 0.5);
    }

    if (!indices.length) {
      window.toast?.("No playable tracks in this album");
      return;
    }

    if (Array.isArray(window.queue || queue)) {
      const q = window.queue || queue;
      q.unshift(...indices.slice(1));
      window.saveQueue?.();
    }

    window.loadTrack?.(indices[0], true);
    window.toast?.(doShuffle ? "Album shuffled" : "Album started");
  }

  // Replace the broken global functions used by the album page.
  window.auroraTrackIndex = ensureTrackIndex;
  window.auroraArtistName = artistName;
  window.auroraPlayAlbum = playAlbum;

  function bindAlbumButtons() {
    const params = new URLSearchParams((location.hash.split("?")[1] || ""));
    const albumId = params.get("id");
    if (!albumId) return;

    const album = window.SafeWaveCatalog?.getAlbum?.(albumId);
    if (!album) return;

    const play = document.querySelector("#albumPlayAll");
    const shuffle = document.querySelector("#albumShuffle");

    if (play) play.onclick = () => playAlbum(album, false);
    if (shuffle) shuffle.onclick = () => playAlbum(album, true);

    // Rebuild track rows with valid player indexes.
    const list = document.querySelector("#albumTrackList");
    if (!list) return;

    const catalogTracks = (album.tracks || [])
      .map(id => window.SafeWaveCatalog?.getTrack?.(id))
      .filter(Boolean);

    list.innerHTML = catalogTracks.map((track, position) => {
      const index = ensureTrackIndex(track.id);
      const bpm = track.bpm ? `${track.bpm} BPM` : "—";
      return `
        <article class="album-track-row">
          <span>${String(position + 1).padStart(2, "0")}</span>
          <img src="${track.cover}" alt="">
          <div>
            <strong>${track.title}</strong>
            <small>${artistName(track.artist)} • ${track.genre || "Instrumental"}</small>
          </div>
          <span>${bpm}</span>
          <span>${track.duration || "—"}</span>
          <button data-track="${index}" aria-label="Play ${track.title}">▶</button>
        </article>
      `;
    }).join("");

    if (typeof window.bindDynamicTrackButtons === "function") {
      window.bindDynamicTrackButtons(list);
    } else {
      list.querySelectorAll("[data-track]").forEach(button => {
        button.onclick = () => window.loadTrack?.(Number(button.dataset.track), true);
      });
    }
  }

  async function initialize() {
    if (window.SafeWaveCatalog?.load && !window.SafeWaveCatalog.loaded) {
      try {
        await window.SafeWaveCatalog.load();
      } catch (error) {
        console.warn("Waterfalls album fix: catalog load failed.", error);
      }
    }

    bindAlbumButtons();
  }

  window.addEventListener("hashchange", () => {
    window.setTimeout(bindAlbumButtons, 80);
  });

  window.addEventListener("safewave:catalog-ready", () => {
    window.setTimeout(bindAlbumButtons, 30);
  });

  document.addEventListener("DOMContentLoaded", initialize);
  initialize();
})();
