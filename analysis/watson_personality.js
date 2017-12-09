const fs = require('fs');
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
/* read credentials and create a personality insights object to work with */
const config = JSON.parse(fs.readFileSync('./analysis/credentials.json'));
const personalityInsights = new PersonalityInsightsV3({ username: config.username, password: config.password, version_date: '2016-10-19' });


function saveInsightsToFile(results, artistName, albumTitle) {
    const albumTitleCompress = albumTitle.toLowerCase().split(' ').join('').replace('/', '-');
    const artistNameCompress = artistName.toLowerCase().split(' ').join('');
    const albumDir = `./analysis/artists_results/${artistNameCompress}`;
    if (!fs.existsSync(albumDir)) {
        fs.mkdirSync(albumDir);
    }
    const fileName = `./analysis/artists_results/${artistNameCompress}/${albumTitleCompress}.json`;
    fs.writeFile(fileName, JSON.stringify(results, null, 4), (error) => {
      if (error) throw error;
      console.log(`File completed: ${fileName}`);
    });
}

function getAlbumInsights(artistLyrics, artistName, albumTitle) {
    personalityInsights.profile({
        text: artistLyrics,
        consumption_preferences: true
    }, (err, response) => {
        if (err) throw err;
        saveInsightsToFile(response, artistName, albumTitle);
    });
}

function parseLyricsJSON(lyricsJSON) {
    const albumsAndLyrics = [];
    for (let i = 0; i < lyricsJSON.albums.length; i++) {
        let albumLyricsBuilder = '';
        for (let x = 0; x < lyricsJSON.albums[i].songs.length; x++) {
            albumLyricsBuilder += lyricsJSON.albums[i].songs[x].lyrics;
        }
        albumsAndLyrics.push({
            albumLyrics: albumLyricsBuilder,
            artistName: lyricsJSON.artist,
            albumTitle: lyricsJSON.albums[i].album,
        });
    }
    return albumsAndLyrics;
}

exports.getArtistPeronalityInsights = async (lyricsFileJSON) => {
    try {
        const contents = fs.readFileSync(lyricsFileJSON);
        // Define to JSON type
        const lyricsJSON = JSON.parse(contents);
        const albumsAndLyrics = parseLyricsJSON(lyricsJSON);

        console.log(`Getting analysis on Artist: ${lyricsJSON.artist}`);
        for (const info of albumsAndLyrics) {
            console.log(`Getting analysis on album: ${info.albumTitle}`);
            getAlbumInsights(info.albumLyrics, info.artistName, info.albumTitle);
        }
    } catch (rejectionError) {
        throw rejectionError;
    }
};

exports.getArtistPeronalityInsights('./scraper/text/justintimberlake.json');
