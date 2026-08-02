// SafeWave Aurora 4.3 — Premium Album Experience
// Additive enhancement for the existing SafeWave album system.

(() => {
  "use strict";

  const DETAIL_SELECTORS = [
    '[data-view="album"]',
    '[data-album-detail]',
    '.album-detail',
    '.album-page',
    '.album-view'
  ];

  const CARD_SELECTORS = [
    '[data-album]',
    '[data-album-id]',
    '.album-card',
    '.aurora-v2-album',
    '.aurora-release-card'
  ];

  function first(root, selectors) {
    for (const selector of selectors) {
      const match = root.querySelector(selector);
      if (match) return match;
    }
    return null;
  }

  function all(root, selectors) {
    return [...new Set(selectors.flatMap(selector => [...root.querySelectorAll(selector)]))];
  }

  function getAlbumArtwork(root) {
    return first(root, [
      '.album-hero img',
      '.album-cover img',
      '.album-art img',
      '.album-detail img',
      '.album-page img',
      'img'
    ]);
  }

  function getAlbumTitle(root) {
    return first(root, [
      '[data-album-title]',
      '.album-title',
      '.album-hero h1',
      '.album-hero h2',
      'h1',
      'h2'
    ]);
  }

  function getAlbumDescription(root) {
    return first(root, [
      '[data-album-description]',
      '.album-description',
      '.album-hero p',
      '.album-copy p'
    ]);
  }

  function findTrackRows(root) {
    return all(root, [
      '[data-track-row]',
      '.album-track',
      '.track-row',
      '.album-track-row',
      '.premium-track'
    ]);
  }

  function formatAlbumMeta(root) {
    if (root.querySelector('.premium-album-meta-strip')) return;

    const rows = findTrackRows(root);
    const existingText = root.textContent || "";
    const genreMatch = existingText.match(/\b(Lo-Fi|Rock|Cinematic|Electronic|Ambient|Acoustic|Synthwave|Piano|Gaming|Corporate)\b/i);
    const yearMatch = existingText.match(/\b20\d{2}\b/);

    const strip = document.createElement('div');
    strip.className = 'premium-album-meta-strip';
    strip.innerHTML = `
      <span>${rows.length || "—"} ${rows.length === 1 ? "track" : "tracks"}</span>
      ${genreMatch ? `<span>${genreMatch[0]}</span>` : ""}
      ${yearMatch ? `<span>${yearMatch[0]}</span>` : ""}
      <span>SafeWave release</span>
    `;

    const title = getAlbumTitle(root);
    if (title?.parentElement) {
      title.insertAdjacentElement('afterend', strip);
    } else {
      root.prepend(strip);
    }
  }

  function addAlbumUtilities(root) {
    if (root.querySelector('.premium-album-utilities')) return;

    const trackRows = findTrackRows(root);
    if (!trackRows.length) return;

    const utilities = document.createElement('div');
    utilities.className = 'premium-album-utilities';
    utilities.innerHTML = `
      <button type="button" data-premium-album-play>▶ Play album</button>
      <button type="button" data-premium-album-shuffle>⤨ Shuffle</button>
      <button type="button" data-premium-album-save>♡ Save album</button>
    `;

    const firstRow = trackRows[0];
    firstRow.parentElement?.insertAdjacentElement('beforebegin', utilities);

    utilities.querySelector('[data-premium-album-play]')?.addEventListener('click', () => {
      const playTarget = first(root, [
        '[data-album-play]',
        '[data-play-album]',
        '.album-play',
        '.play-album',
        '[data-track]'
      ]);
      playTarget?.click();
    });

    utilities.querySelector('[data-premium-album-shuffle]')?.addEventListener('click', () => {
      const shuffleTarget = first(root, [
        '[data-album-shuffle]',
        '[data-shuffle-album]',
        '.album-shuffle',
        '.shuffle-album'
      ]);

      if (shuffleTarget) {
        shuffleTarget.click();
        return;
      }

      const playable = trackRows
        .map(row => first(row, ['[data-track]', 'button']))
        .filter(Boolean);

      if (playable.length) {
        playable[Math.floor(Math.random() * playable.length)].click();
      }
    });

    const saveButton = utilities.querySelector('[data-premium-album-save]');
    const albumId =
      root.dataset.albumId ||
      location.hash.replace(/^#/, '') ||
      getAlbumTitle(root)?.textContent?.trim() ||
      'current-album';

    const storageKey = `swSavedAlbum:${albumId}`;
    const updateSaveState = () => {
      const saved = localStorage.getItem(storageKey) === 'true';
      saveButton.textContent = saved ? '♥ Saved' : '♡ Save album';
      saveButton.classList.toggle('is-saved', saved);
    };

    saveButton?.addEventListener('click', () => {
      const saved = localStorage.getItem(storageKey) === 'true';
      localStorage.setItem(storageKey, String(!saved));
      updateSaveState();
    });

    updateSaveState();
  }

  function addTrackNumbers(root) {
    findTrackRows(root).forEach((row, index) => {
      if (row.querySelector('.premium-track-number')) return;
      const number = document.createElement('span');
      number.className = 'premium-track-number';
      number.textContent = String(index + 1).padStart(2, '0');
      row.prepend(number);
    });
  }

  function addAlbumAtmosphere(root) {
    const artwork = getAlbumArtwork(root);
    if (!artwork) return;

    root.classList.add('premium-album-ready');

    const source = artwork.currentSrc || artwork.src;
    if (source) root.style.setProperty('--premium-album-art', `url("${source}")`);

    artwork.closest('.album-cover, .album-art, .album-hero-art, .album-detail-art')?.classList.add('premium-album-artwork');
  }

  function enhanceAlbumDetail(root) {
    if (!root || root.dataset.premiumAlbumEnhanced === 'true') return;
    root.dataset.premiumAlbumEnhanced = 'true';

    addAlbumAtmosphere(root);
    formatAlbumMeta(root);
    addAlbumUtilities(root);
    addTrackNumbers(root);

    const description = getAlbumDescription(root);
    description?.classList.add('premium-album-description');
  }

  function enhanceAlbumCards() {
    all(document, CARD_SELECTORS).forEach(card => {
      if (card.dataset.premiumCardEnhanced === 'true') return;
      card.dataset.premiumCardEnhanced = 'true';
      card.classList.add('premium-album-card');

      const artwork = first(card, ['img', '.album-cover', '.album-art', '.aurora-v2-album-visual']);
      artwork?.classList.add('premium-album-card-art');

      if (!card.querySelector('.premium-card-arrow')) {
        const arrow = document.createElement('span');
        arrow.className = 'premium-card-arrow';
        arrow.textContent = '↗';
        card.appendChild(arrow);
      }
    });
  }

  function scan() {
    enhanceAlbumCards();

    DETAIL_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(enhanceAlbumDetail);
    });

    if (/album/i.test(location.hash)) {
      const candidate = first(document, DETAIL_SELECTORS);
      if (candidate) enhanceAlbumDetail(candidate);
    }
  }

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(scan);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('hashchange', () => {
    window.setTimeout(scan, 50);
  });

  scan();
})();
