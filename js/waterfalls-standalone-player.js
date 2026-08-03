// SafeWave Waterfalls Standalone Player
// Load this file LAST. It does not depend on the broken Aurora album functions.

(() => {
  "use strict";

  const WATERFALLS = [
    { id: "streets", title: "Streets", src: "assets/audio/waterfalls/streets.wav" },
    { id: "for-a-moment", title: "For a Moment", src: "assets/audio/waterfalls/for-a-moment.wav" },
    { id: "take-a-chance", title: "Take a Chance", src: "assets/audio/waterfalls/take-a-chance.wav" },
    { id: "baby-steps", title: "Baby Steps", src: "assets/audio/waterfalls/baby-steps.wav" },
    { id: "starry-skies", title: "Starry Skies", src: "assets/audio/waterfalls/starry-skies.wav" },
    { id: "promises", title: "Promises", src: "assets/audio/waterfalls/promises.wav" },
    { id: "lost", title: "Lost", src: "assets/audio/waterfalls/lost.wav" },
    { id: "waterfalls", title: "Waterfalls", src: "assets/audio/waterfalls/waterfalls.wav" }
  ];

  const COVER = "assets/covers/waterfalls.png";
  const ARTIST = "Joshua Shanks";

  function isWaterfallsPage() {
    const hash = location.hash.toLowerCase();
    const title = document.querySelector("#albumDetailTitle")?.textContent?.toLowerCase() || "";
    return hash.includes("waterfalls") || title === "waterfalls";
  }

  function toast(message) {
    const element = document.querySelector("#toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(window.__waterfallsToast);
    window.__waterfallsToast = setTimeout(() => element.classList.remove("show"), 1800);
  }

  function setArtwork(element) {
    if (!element) return;
    if (element.tagName === "IMG") {
      element.src = COVER;
    } else {
      element.style.backgroundImage = `url("${COVER}")`;
    }
  }

  function playTrack(track) {
    const audio = document.querySelector("#audio");
    if (!audio) {
      toast("Audio player could not be found");
      return;
    }

    audio.pause();
    audio.src = track.src;
    audio.dataset.waterfallsTrack = track.id;

    const titleIds = ["#playerTitle", "#fullscreenTitle"];
    const artistIds = ["#playerArtist", "#fullscreenArtist"];

    titleIds.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) element.textContent = track.title;
    });

    artistIds.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) element.textContent = ARTIST;
    });

    ["#playerCover", "#fullscreenArt", "#fullscreenBg"].forEach(selector => {
      setArtwork(document.querySelector(selector));
    });

    audio.load();
    audio.play().catch(error => {
      console.error("Waterfalls playback failed:", error);
      toast("Could not start this audio file");
    });
  }

  function playAlbum(shuffle = false) {
    const list = shuffle
      ? [...WATERFALLS].sort(() => Math.random() - 0.5)
      : [...WATERFALLS];

    window.__waterfallsQueue = list.slice(1);
    playTrack(list[0]);
    toast(shuffle ? "Waterfalls shuffled" : "Waterfalls started");
  }

  function rebuildRows() {
    if (!isWaterfallsPage()) return;

    const list = document.querySelector("#albumTrackList");
    if (!list) return;

    const cover = document.querySelector("#albumDetailCover");
    if (cover) cover.src = COVER;

    list.innerHTML = WATERFALLS.map((track, index) => `
      <article class="album-track-row" data-waterfalls-row="${track.id}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <img src="${COVER}" alt="">
        <div>
          <strong>${track.title}</strong>
          <small>${ARTIST} • Ambient</small>
        </div>
        <span>—</span>
        <span>—</span>
        <button type="button" data-waterfalls-play="${track.id}" aria-label="Play ${track.title}">▶</button>
      </article>
    `).join("");
  }

  function bindAlbumButtons() {
    if (!isWaterfallsPage()) return;

    const play = document.querySelector("#albumPlayAll");
    const shuffle = document.querySelector("#albumShuffle");

    if (play) play.dataset.waterfallsAlbumAction = "play";
    if (shuffle) shuffle.dataset.waterfallsAlbumAction = "shuffle";

    rebuildRows();
  }

  // Capture phase prevents the old broken album handler from showing its toast.
  document.addEventListener("click", event => {
    const trackButton = event.target.closest("[data-waterfalls-play]");
    if (trackButton) {
      const track = WATERFALLS.find(item => item.id === trackButton.dataset.waterfallsPlay);
      if (!track) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      playTrack(track);
      return;
    }

    const albumButton = event.target.closest("[data-waterfalls-album-action]");
    if (albumButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      playAlbum(albumButton.dataset.waterfallsAlbumAction === "shuffle");
    }
  }, true);

  const audio = document.querySelector("#audio");
  audio?.addEventListener("ended", event => {
    const queue = window.__waterfallsQueue;
    if (!Array.isArray(queue) || !queue.length) return;

    event.stopImmediatePropagation();
    playTrack(queue.shift());
  }, true);

  window.addEventListener("hashchange", () => {
    setTimeout(bindAlbumButtons, 50);
    setTimeout(bindAlbumButtons, 250);
  });

const observer = new MutationObserver(() => {
  if (isWaterfallsPage())
    requestAnimationFrame(bindAlbumButtons);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

  document.addEventListener("DOMContentLoaded", () => {
  setTimeout(bindAlbumButtons, 100);
  setTimeout(bindAlbumButtons, 500);
});

bindAlbumButtons();

console.log("SafeWave Waterfalls Standalone Player loaded");
})();
