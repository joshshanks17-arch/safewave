// SafeWave v3.2 -- Unified Catalog Manager
const SafeWaveCatalog = {
  artists: [],
  albums: [],
  tracks: [],
  genres: [],
  collections: [],
  loaded: false,

  async load() {
    if (this.loaded) return this;

    const files = ["artists", "albums", "tracks", "genres", "collections"];

    await Promise.all(
      files.map(async file => {
        try {
          const response = await fetch(`data/${file}.json`, {
            cache: "no-store"
          });

          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          this[file] = Array.isArray(data) ? data : [];
        } catch (error) {
          console.error(`SafeWave: failed to load data/${file}.json`, error);
          this[file] = [];
        }
      })
    );

    this.loaded = true;

    console.log("SafeWave catalog loaded", {
      artists: this.artists.length,
      albums: this.albums.length,
      tracks: this.tracks.length,
      genres: this.genres.length,
      collections: this.collections.length
    });

    window.dispatchEvent(
      new CustomEvent("safewave:catalog-ready", {
        detail: this
      })
    );

    return this;
  },

  getTrack(id) {
    return this.tracks.find(track => track.id === id);
  },

  getAlbum(id) {
    return this.albums.find(album => album.id === id);
  },

  getArtist(id) {
    return this.artists.find(artist => artist.id === id);
  },

  getGenre(id) {
    return this.genres.find(genre => genre.id === id);
  },

  getTracksForAlbum(albumId) {
    const album = this.getAlbum(albumId);

    // Use an explicit album track list when one exists.
    if (Array.isArray(album?.tracks) && album.tracks.length) {
      return album.tracks
        .map(trackId => this.getTrack(trackId))
        .filter(Boolean);
    }

    // Automatic fallback: build the album from each track's album field.
    return this.tracks.filter(track => track.album === albumId);
  },

  getAlbumsForArtist(artistId) {
    return this.albums.filter(album => album.artist === artistId);
  }
};

window.SafeWaveCatalog = SafeWaveCatalog;
window.loadCatalog = () => SafeWaveCatalog.load();
window.getTracks = () => SafeWaveCatalog.tracks;