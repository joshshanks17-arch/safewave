// SafeWave Aurora 4.1 — Catalog Manager
const SafeWaveCatalog = {
  artists: [], albums: [], tracks: [], genres: [], collections: [], loaded: false,
  async load() {
    const files = ["artists", "albums", "tracks", "genres", "collections"];
    await Promise.all(files.map(async (file) => {
      try {
        const response = await fetch(`data/${file}.json`, { cache: "no-store" });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const value = await response.json();
        this[file] = Array.isArray(value) ? value : [];
      } catch (error) {
        console.warn(`SafeWave: unable to load data/${file}.json`, error);
        this[file] = [];
      }
    }));
    this.loaded = true;
    window.dispatchEvent(new CustomEvent("safewave:catalog-ready", { detail: this }));
    return this;
  },
  getTrack(id) { return this.tracks.find((track) => track.id === id); },
  getAlbum(id) { return this.albums.find((album) => album.id === id); },
  getArtist(id) { return this.artists.find((artist) => artist.id === id); },
  getGenre(id) { return this.genres.find((genre) => genre.id === id); },
  getTracksForAlbum(albumId) { return this.tracks.filter((track) => track.album === albumId); },
  getAlbumsForArtist(artistId) { return this.albums.filter((album) => album.artist === artistId); }
};
window.SafeWaveCatalog = SafeWaveCatalog;
