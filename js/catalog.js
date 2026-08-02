let tracks = [];

async function loadCatalog() {
    try {
        const response = await fetch("data/tracks.json");
        tracks = await response.json();

        console.log(`Loaded ${tracks.length} tracks`);

        if (typeof renderHome === "function") renderHome();
        if (typeof renderDiscover === "function") renderDiscover();
        if (typeof renderAlbums === "function") renderAlbums();

    } catch (err) {
        console.error("Failed to load catalog", err);
    }
}

loadCatalog();
window.loadCatalog = loadCatalog;
window.getTracks = () => tracks;