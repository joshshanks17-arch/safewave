
const tracks = [{"title": "Midnight Horizon", "artist": "Nova Coast", "genre": "Synthwave", "mood": "Energetic", "duration": "3:24", "emoji": "\ud83c\udf0c", "accent": "linear-gradient(135deg,#4f46e5,#06b6d4)"}, {"title": "Golden Hour", "artist": "Harbor Lights", "genre": "Lo-Fi", "mood": "Chill", "duration": "2:58", "emoji": "\ud83c\udf05", "accent": "linear-gradient(135deg,#f59e0b,#ec4899)"}, {"title": "Ocean Drive", "artist": "Blue Current", "genre": "Electronic", "mood": "Upbeat", "duration": "3:40", "emoji": "\ud83c\udf0a", "accent": "linear-gradient(135deg,#0ea5e9,#14b8a6)"}, {"title": "Ember Sky", "artist": "Atlas North", "genre": "Cinematic", "mood": "Epic", "duration": "4:12", "emoji": "\ud83d\udd25", "accent": "linear-gradient(135deg,#f97316,#7c3aed)"}, {"title": "Quiet Signals", "artist": "Luna Static", "genre": "Ambient", "mood": "Calm", "duration": "3:08", "emoji": "\ud83c\udf19", "accent": "linear-gradient(135deg,#334155,#6366f1)"}, {"title": "Victory Lane", "artist": "Peak Motion", "genre": "Rock", "mood": "Workout", "duration": "3:16", "emoji": "\u26a1", "accent": "linear-gradient(135deg,#ef4444,#f59e0b)"}, {"title": "Paper Planes", "artist": "Sunday Bloom", "genre": "Acoustic", "mood": "Happy", "duration": "2:47", "emoji": "\ud83d\udd4a\ufe0f", "accent": "linear-gradient(135deg,#22c55e,#eab308)"}, {"title": "Night Circuit", "artist": "Neon Harbor", "genre": "Gaming", "mood": "Focused", "duration": "3:52", "emoji": "\ud83c\udfae", "accent": "linear-gradient(135deg,#8b5cf6,#ec4899)"}];
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

document.querySelectorAll('.heart').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
  });
});

const player = document.getElementById('player');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerToggle = document.getElementById('playerToggle');
const progressBar = document.getElementById('progressBar');
const playerTime = document.getElementById('playerTime');
let timer = null;
let elapsed = 0;
let playing = false;

function updatePlayer() {
  elapsed += 1;
  const pct = Math.min((elapsed / 30) * 100, 100);
  if (progressBar) progressBar.style.width = pct + '%';
  if (playerTime) playerTime.textContent = '0:' + String(elapsed).padStart(2,'0');
  if (elapsed >= 30) togglePlay(false);
}

function togglePlay(force) {
  playing = typeof force === 'boolean' ? force : !playing;
  if (playerToggle) playerToggle.textContent = playing ? '❚❚' : '▶';
  clearInterval(timer);
  if (playing) timer = setInterval(updatePlayer, 1000);
}

document.querySelectorAll('[data-track]').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = tracks[Number(btn.dataset.track)] || tracks[0];
    if (playerTitle) playerTitle.textContent = t.title;
    if (playerArtist) playerArtist.textContent = t.artist;
    if (player) player.classList.add('visible');
    elapsed = 0;
    if (progressBar) progressBar.style.width = '0%';
    togglePlay(true);
  });
});
if (playerToggle) playerToggle.addEventListener('click', () => togglePlay());

const search = document.getElementById('searchInput');
const genre = document.getElementById('genreFilter');
const mood = document.getElementById('moodFilter');
const cards = [...document.querySelectorAll('#trackGrid .track-card')];
const count = document.getElementById('resultCount');
const empty = document.getElementById('emptyState');

function filterTracks() {
  const q = (search?.value || '').toLowerCase().trim();
  const g = (genre?.value || 'all').toLowerCase();
  const m = (mood?.value || 'all').toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const matchesQ = !q || card.textContent.toLowerCase().includes(q);
    const matchesG = g === 'all' || card.dataset.genre === g;
    const matchesM = m === 'all' || card.dataset.mood === m;
    const show = matchesQ && matchesG && matchesM;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  if (count) count.textContent = visible;
  if (empty) empty.style.display = visible ? 'none' : 'block';
}
[search, genre, mood].forEach(el => el?.addEventListener('input', filterTracks));

const params = new URLSearchParams(location.search);
if (mood && params.get('mood')) {
  const val = params.get('mood').toLowerCase();
  [...mood.options].forEach(o => { if (o.value.toLowerCase() === val || o.text.toLowerCase() === val) mood.value = o.value; });
  filterTracks();
}
