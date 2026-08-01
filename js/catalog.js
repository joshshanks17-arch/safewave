// SafeWave Aurora 4.0.3
// Central Catalog Manager

const SafeWaveCatalog = {
    artists: [],
    albums: [],
    tracks: [],
    genres: [],
    collections: [],

    async load() {
        const files = [
            "artists",
            "albums",
            "tracks",
            "genres",
            "collections"
        ];

        for (const file of files) {
            try {
                const response = await fetch(`data/${file}.json`);

                if (!response.ok) {
                    throw new Error(`Unable to load ${file}.json`);
                }

                this[file] = await response.json();
            } catch (error) {
                console.warn(`SafeWave: ${file}.json not loaded`, error);
                this[file] = [];
            }
        }

        console.log("SafeWave Catalog Loaded", this);

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
        return this.tracks.filter(track => track.album === albumId);
    },

    getAlbumsForArtist(artistId) {
        return this.albums.filter(album => album.artist === artistId);
    }
};

window.SafeWaveCatalog = SafeWaveCatalog;